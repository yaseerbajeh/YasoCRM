<?php

namespace App\Jobs;

use App\Models\Broadcast;
use App\Models\BroadcastMessage;
use App\Models\Contact;
use App\Services\EvolutionApiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendBroadcastMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [10, 30, 60]; // Retry after 10s, 30s, 60s

    public function __construct(
        private int $broadcastMessageId
    ) {
        $this->onQueue('broadcasts');
    }

    public function handle(EvolutionApiService $evolutionApi): void
    {
        $broadcastMessage = BroadcastMessage::with(['broadcast.whatsappInstance', 'contact'])
            ->find($this->broadcastMessageId);

        if (!$broadcastMessage) {
            Log::error('Broadcast message not found', ['id' => $this->broadcastMessageId]);
            return;
        }

        $broadcast = $broadcastMessage->broadcast;
        $contact = $broadcastMessage->contact;
        $instance = $broadcast->whatsappInstance;

        try {
            // Rate limiting delay
            $delay = config('evolution.rate_limit.delay_between_messages', 3);
            sleep($delay);

            // Check if instance is connected
            if (!$instance->isConnected()) {
                throw new \Exception('WhatsApp instance is not connected');
            }

            // Send message
            if ($broadcast->media) {
                // Send media message
                $mediaType = $broadcast->media['type'] ?? 'image';
                $mediaUrl = $broadcast->media['url'] ?? null;

                if (!$mediaUrl) {
                    throw new \Exception('Media URL not found in broadcast');
                }

                $response = $evolutionApi->sendMediaMessage(
                    $instance->instance_name,
                    $contact->phone_number,
                    $mediaUrl,
                    $mediaType,
                    $broadcast->message
                );
            } else {
                // Send text message
                $response = $evolutionApi->sendTextMessage(
                    $instance->instance_name,
                    $contact->phone_number,
                    $broadcast->message
                );
            }

            // Mark as sent
            $broadcastMessage->markAsSent();
            $broadcast->incrementSentCount();

            Log::info('Broadcast message sent', [
                'broadcast_id' => $broadcast->id,
                'contact_id' => $contact->id,
                'response' => $response,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send broadcast message', [
                'broadcast_message_id' => $this->broadcastMessageId,
                'error' => $e->getMessage(),
                'attempt' => $this->attempts(),
            ]);

            // If max retries reached, mark as failed
            if ($this->attempts() >= $this->tries) {
                $broadcastMessage->markAsFailed($e->getMessage());
                $broadcast->incrementFailedCount();
            } else {
                // Retry
                throw $e;
            }
        }
    }

    public function failed(\Throwable $exception): void
    {
        $broadcastMessage = BroadcastMessage::find($this->broadcastMessageId);

        if ($broadcastMessage) {
            $broadcastMessage->markAsFailed($exception->getMessage());
            $broadcastMessage->broadcast->incrementFailedCount();
        }

        Log::error('Broadcast message job failed permanently', [
            'broadcast_message_id' => $this->broadcastMessageId,
            'error' => $exception->getMessage(),
        ]);
    }
}
