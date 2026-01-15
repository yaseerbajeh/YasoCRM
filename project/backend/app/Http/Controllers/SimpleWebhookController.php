<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class SimpleWebhookController extends Controller
{
    /**
     * Handle incoming webhook from Evolution API (simplified version)
     */
    public function handleWebhook(Request $request, string $instanceName): JsonResponse
    {
        try {
            $data = $request->all();
            
            Log::info('=== WEBHOOK RECEIVED ===', [
                'instance' => $instanceName,
                'event' => $data['event'] ?? 'unknown',
                'full_data' => $data
            ]);

            // Handle message events
            $event = $data['event'] ?? null;
            
            if ($event === 'messages.upsert' || $event === 'MESSAGES_UPSERT') {
                Log::info('Processing message event');
                $this->handleIncomingMessage($data);
            } else {
                Log::info('Event not handled', ['event' => $event]);
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Webhook error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function handleIncomingMessage(array $data): void
    {
        try {
            Log::info('handleIncomingMessage called', ['data' => $data]);
            
            // Extract message data
            $messageData = $data['data'] ?? [];
            $key = $messageData['key'] ?? [];
            $message = $messageData['message'] ?? [];

            Log::info('Extracted data', [
                'messageData' => $messageData,
                'key' => $key,
                'message' => $message
            ]);

            // Get phone number
            $phoneNumber = $key['remoteJid'] ?? null;
            if (!$phoneNumber) {
                Log::warning('No phone number in webhook');
                return;
            }

            // Clean phone number
            $phoneNumber = str_replace('@s.whatsapp.net', '', $phoneNumber);
            
            Log::info('Creating contact', ['phone' => $phoneNumber]);

            // Get or create contact
            $contact = Contact::firstOrCreate(
                ['phone_number' => $phoneNumber],
                [
                    'organization_id' => 1,
                    'name' => $messageData['pushName'] ?? 'Unknown',
                ]
            );
            
            Log::info('Contact created/found', ['contact_id' => $contact->id]);

            // Get or create conversation
            $conversation = Conversation::firstOrCreate(
                ['contact_id' => $contact->id],
                [
                    'organization_id' => 1,
                    'status' => 'open',
                    'last_message_at' => now(),
                ]
            );
            
            Log::info('Conversation created/found', ['conversation_id' => $conversation->id]);

            // Get message content
            $content = $message['conversation'] 
                ?? $message['extendedTextMessage']['text'] 
                ?? $message['imageMessage']['caption']
                ?? 'Media message';

            // Create message
            $newMessage = Message::create([
                'conversation_id' => $conversation->id,
                'direction' => 'incoming',
                'content' => $content,
                'type' => 'text',
                'status' => 'received',
                'sent_at' => now(),
            ]);

            // Update conversation
            $conversation->update(['last_message_at' => now()]);

            Log::info('=== MESSAGE SAVED SUCCESSFULLY ===', [
                'message_id' => $newMessage->id,
                'contact' => $contact->name,
                'content' => $content
            ]);

        } catch (\Exception $e) {
            Log::error('=== ERROR PROCESSING MESSAGE ===', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}
