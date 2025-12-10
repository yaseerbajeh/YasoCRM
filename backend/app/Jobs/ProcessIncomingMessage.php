<?php

namespace App\Jobs;

use App\Models\Contact;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\WhatsappInstance;
use App\Services\MediaService;
use App\Events\MessageReceived;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessIncomingMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private array $webhookData,
        private string $instanceName
    ) {
        $this->onQueue('high'); // High priority for real-time messages
    }

    public function handle(MediaService $mediaService): void
    {
        try {
            // Find WhatsApp instance
            $instance = WhatsappInstance::where('instance_name', $this->instanceName)->first();

            if (!$instance) {
                Log::error('WhatsApp instance not found', ['instance' => $this->instanceName]);
                return;
            }

            // Extract message data
            $messageData = $this->webhookData['data'] ?? [];
            $key = $messageData['key'] ?? [];
            $message = $messageData['message'] ?? [];

            // Get or create contact
            $phoneNumber = $key['remoteJid'] ?? null;
            if (!$phoneNumber) {
                Log::error('No phone number in webhook data', ['data' => $this->webhookData]);
                return;
            }

            // Clean phone number (remove @s.whatsapp.net suffix)
            $phoneNumber = str_replace('@s.whatsapp.net', '', $phoneNumber);

            $contact = Contact::firstOrCreate(
                [
                    'organization_id' => $instance->organization_id,
                    'phone_number' => $phoneNumber,
                ],
                [
                    'name' => $messageData['pushName'] ?? null,
                ]
            );

            // Update last interaction
            $contact->updateLastInteraction();

            // Get or create conversation
            $conversation = Conversation::firstOrCreate(
                [
                    'contact_id' => $contact->id,
                    'whatsapp_instance_id' => $instance->id,
                ],
                [
                    'status' => 'open',
                ]
            );

            // Determine message type and content
            $messageType = $this->getMessageType($message);
            $content = $this->getMessageContent($message, $messageType);

            // Create message record
            $newMessage = Message::create([
                'conversation_id' => $conversation->id,
                'evolution_message_id' => $key['id'] ?? null,
                'direction' => 'incoming',
                'content' => $content,
                'message_type' => $messageType,
                'metadata' => $messageData,
                'is_read' => false,
                'status' => 'delivered',
            ]);

            // Handle media if present
            if (in_array($messageType, ['image', 'video', 'audio', 'document'])) {
                $this->handleMedia($newMessage, $message, $messageType, $mediaService);
            }

            // Update conversation
            $conversation->incrementUnreadCount();
            $conversation->updateLastMessageTime();

            // Broadcast real-time event
            broadcast(new MessageReceived($newMessage))->toOthers();

            Log::info('Incoming message processed', [
                'message_id' => $newMessage->id,
                'conversation_id' => $conversation->id,
            ]);
        } catch (\Exception $e) {
            Log::error('Error processing incoming message', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data' => $this->webhookData,
            ]);

            throw $e;
        }
    }

    private function getMessageType(array $message): string
    {
        if (isset($message['imageMessage'])) return 'image';
        if (isset($message['videoMessage'])) return 'video';
        if (isset($message['audioMessage'])) return 'audio';
        if (isset($message['documentMessage'])) return 'document';
        if (isset($message['stickerMessage'])) return 'sticker';
        if (isset($message['locationMessage'])) return 'location';
        if (isset($message['contactMessage'])) return 'contact';

        return 'text';
    }

    private function getMessageContent(array $message, string $type): ?string
    {
        return match ($type) {
            'text' => $message['conversation'] ?? $message['extendedTextMessage']['text'] ?? null,
            'image' => $message['imageMessage']['caption'] ?? null,
            'video' => $message['videoMessage']['caption'] ?? null,
            'document' => $message['documentMessage']['fileName'] ?? null,
            default => null,
        };
    }

    private function handleMedia(
        Message $message,
        array $messageData,
        string $type,
        MediaService $mediaService
    ): void {
        $mediaData = $messageData[$type . 'Message'] ?? null;

        if (!$mediaData) {
            return;
        }

        $mediaUrl = $mediaData['url'] ?? null;
        $mimeType = $mediaData['mimetype'] ?? 'application/octet-stream';

        if ($mediaUrl) {
            $mediaService->downloadAndStoreMedia($message, $mediaUrl, $mimeType);
        }
    }
}
