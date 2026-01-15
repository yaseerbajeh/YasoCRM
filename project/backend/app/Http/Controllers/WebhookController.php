<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessIncomingMessage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    /**
     * Handle incoming webhook from Evolution API
     */
    public function handleEvolutionWebhook(Request $request, string $instanceName): JsonResponse
    {
        try {
            $data = $request->all();

            Log::info('Evolution webhook received', [
                'instance' => $instanceName,
                'event' => $data['event'] ?? 'unknown',
            ]);

            // Handle different webhook events
            $event = $data['event'] ?? null;

            match ($event) {
                'messages.upsert' => $this->handleMessageUpsert($data, $instanceName),
                'messages.update' => $this->handleMessageUpdate($data, $instanceName),
                'connection.update' => $this->handleConnectionUpdate($data, $instanceName),
                default => Log::info('Unhandled webhook event', ['event' => $event]),
            };

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Error handling Evolution webhook', [
                'instance' => $instanceName,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    private function handleMessageUpsert(array $data, string $instanceName): void
    {
        // Dispatch job to process incoming message
        ProcessIncomingMessage::dispatch($data, $instanceName);
    }

    private function handleMessageUpdate(array $data, string $instanceName): void
    {
        // Handle message status updates (delivered, read, etc.)
        Log::info('Message update received', [
            'instance' => $instanceName,
            'data' => $data,
        ]);

        // TODO: Update message status in database
    }

    private function handleConnectionUpdate(array $data, string $instanceName): void
    {
        // Handle instance connection status changes
        $instance = \App\Models\WhatsappInstance::where('instance_name', $instanceName)->first();

        if (!$instance) {
            Log::error('Instance not found for connection update', ['instance' => $instanceName]);
            return;
        }

        $state = $data['data']['state'] ?? null;

        if ($state === 'open') {
            $instance->markAsConnected();
            Log::info('Instance connected', ['instance' => $instanceName]);
        } elseif ($state === 'close') {
            $instance->markAsDisconnected();
            Log::info('Instance disconnected', ['instance' => $instanceName]);
        }
    }
}
