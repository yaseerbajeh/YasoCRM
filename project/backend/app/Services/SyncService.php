<?php

namespace App\Services;

use App\Models\Contact;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\WhatsappInstance;
use App\Models\EventLog;
use App\Events\MessageReceived;
use App\Events\ConversationUpdated;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class SyncService
{
    private EvolutionApiService $evolutionApi;

    public function __construct(EvolutionApiService $evolutionApi)
    {
        $this->evolutionApi = $evolutionApi;
    }

    /**
     * Perform full sync from Evolution API
     */
    public function fullSync(int $organizationId, string $instanceName): array
    {
        Log::info('Starting full sync', [
            'organization_id' => $organizationId,
            'instance' => $instanceName,
        ]);

        $instance = WhatsappInstance::where('instance_name', $instanceName)->first();
        if (!$instance) {
            throw new \Exception("Instance not found: {$instanceName}");
        }

        $contactsResult = $this->syncContacts($organizationId, $instanceName);
        $chatsResult = $this->syncChats($organizationId, $instance);

        // Update last sync timestamp
        Cache::put("last_sync_{$organizationId}", now()->toISOString(), 86400);

        Log::info('Full sync completed', [
            'organization_id' => $organizationId,
            'contacts_synced' => $contactsResult['synced'],
            'chats_synced' => $chatsResult['synced'],
        ]);

        return [
            'contacts' => $contactsResult,
            'chats' => $chatsResult,
            'synced_at' => now()->toISOString(),
        ];
    }

    /**
     * Sync contacts from Evolution API
     */
    public function syncContacts(int $organizationId, string $instanceName): array
    {
        $contacts = $this->evolutionApi->fetchContacts($instanceName);

        if (empty($contacts)) {
            return ['synced' => 0, 'created' => 0, 'updated' => 0];
        }

        $created = 0;
        $updated = 0;

        foreach ($contacts as $contactData) {
            if (empty($contactData['id'])) {
                continue;
            }

            // Extract phone number from WhatsApp JID
            $phoneNumber = $this->extractPhoneNumber($contactData['id']);
            if (empty($phoneNumber)) {
                continue;
            }

            $existingContact = Contact::where('organization_id', $organizationId)
                ->where('phone_number', $phoneNumber)
                ->first();

            if ($existingContact) {
                // Update if name changed
                if (!empty($contactData['pushName']) && $existingContact->name !== $contactData['pushName']) {
                    $existingContact->update(['name' => $contactData['pushName']]);
                    $updated++;
                }
            } else {
                // Create new contact
                Contact::create([
                    'organization_id' => $organizationId,
                    'phone_number' => $phoneNumber,
                    'name' => $contactData['pushName'] ?? null,
                    'avatar_url' => $contactData['profilePictureUrl'] ?? null,
                ]);
                $created++;
            }
        }

        return [
            'synced' => count($contacts),
            'created' => $created,
            'updated' => $updated,
        ];
    }

    /**
     * Sync chats/conversations from Evolution API
     */
    public function syncChats(int $organizationId, WhatsappInstance $instance): array
    {
        // Evolution API v2 uses POST for findChats
        $response = $this->evolutionApi->makeRequest('POST', "/chat/findChats/{$instance->instance_name}", []);
        $chats = $response->json() ?? [];

        if (empty($chats)) {
            return ['synced' => 0, 'created' => 0];
        }

        $created = 0;

        foreach ($chats as $chatData) {
            if (empty($chatData['id'])) {
                continue;
            }

            // Skip groups for now
            if (str_contains($chatData['id'], '@g.us')) {
                continue;
            }

            $phoneNumber = $this->extractPhoneNumber($chatData['id']);
            if (empty($phoneNumber)) {
                continue;
            }

            // Get or create contact
            $contact = Contact::firstOrCreate(
                ['organization_id' => $organizationId, 'phone_number' => $phoneNumber],
                ['name' => $chatData['name'] ?? null]
            );

            // Get or create conversation
            $conversation = Conversation::firstOrCreate(
                ['contact_id' => $contact->id, 'whatsapp_instance_id' => $instance->id],
                ['status' => 'open', 'unread_count' => $chatData['unreadCount'] ?? 0]
            );

            if ($conversation->wasRecentlyCreated) {
                $created++;
            }

            // Sync messages for this conversation
            $this->syncMessagesForConversation($conversation, $instance->instance_name, $chatData['id']);
        }

        return [
            'synced' => count($chats),
            'created' => $created,
        ];
    }

    /**
     * Sync messages for a specific conversation
     */
    public function syncMessagesForConversation(
        Conversation $conversation,
        string $instanceName,
        string $remoteJid
    ): int {
        $response = $this->evolutionApi->makeRequest('GET', "/chat/findMessages/{$instanceName}", [
            'where' => [
                'key' => ['remoteJid' => $remoteJid],
            ],
            'page' => 1,
            'limit' => 50,
        ]);

        $messages = $response->json() ?? [];
        $synced = 0;

        foreach ($messages as $msgData) {
            if (empty($msgData['key']['id'])) {
                continue;
            }

            $evolutionMessageId = $msgData['key']['id'];

            // Skip if already exists
            if (Message::where('evolution_message_id', $evolutionMessageId)->exists()) {
                continue;
            }

            $direction = !empty($msgData['key']['fromMe']) ? 'outgoing' : 'incoming';
            $content = $this->extractMessageContent($msgData);
            $messageType = $this->determineMessageType($msgData);

            Message::create([
                'conversation_id' => $conversation->id,
                'evolution_message_id' => $evolutionMessageId,
                'direction' => $direction,
                'content' => $content,
                'message_type' => $messageType,
                'is_read' => $direction === 'outgoing',
                'status' => 'delivered',
                'created_at' => isset($msgData['messageTimestamp'])
                    ? Carbon::createFromTimestamp($msgData['messageTimestamp'])
                    : now(),
            ]);

            $synced++;
        }

        // Update conversation last message time
        if ($synced > 0) {
            $conversation->touch();
            $conversation->update([
                'last_message_at' => $conversation->messages()->latest()->first()?->created_at,
            ]);
        }

        return $synced;
    }

    /**
     * Handle incoming webhook message
     */
    public function handleIncomingMessage(array $data, WhatsappInstance $instance): ?Message
    {
        if (empty($data['key']['id']) || empty($data['key']['remoteJid'])) {
            return null;
        }

        $phoneNumber = $this->extractPhoneNumber($data['key']['remoteJid']);
        if (empty($phoneNumber)) {
            return null;
        }

        // Get or create contact
        $contact = Contact::firstOrCreate(
            ['organization_id' => $instance->organization_id, 'phone_number' => $phoneNumber],
            ['name' => $data['pushName'] ?? null]
        );

        // Update contact name if we have a new push name
        if (!empty($data['pushName']) && $contact->name !== $data['pushName']) {
            $contact->update(['name' => $data['pushName']]);
        }

        // Get or create conversation
        $conversation = Conversation::firstOrCreate(
            ['contact_id' => $contact->id, 'whatsapp_instance_id' => $instance->id],
            ['status' => 'open']
        );

        $evolutionMessageId = $data['key']['id'];

        // Skip if message already exists
        if (Message::where('evolution_message_id', $evolutionMessageId)->exists()) {
            return null;
        }

        $direction = !empty($data['key']['fromMe']) ? 'outgoing' : 'incoming';
        $content = $this->extractMessageContent($data);
        $messageType = $this->determineMessageType($data);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'evolution_message_id' => $evolutionMessageId,
            'direction' => $direction,
            'content' => $content,
            'message_type' => $messageType,
            'is_read' => false,
            'status' => 'delivered',
            'metadata' => $data,
        ]);

        // Update conversation
        $conversation->update([
            'last_message_at' => $message->created_at,
            'unread_count' => $conversation->unread_count + ($direction === 'incoming' ? 1 : 0),
        ]);

        // Log event for analytics
        EventLog::log(
            $instance->organization_id,
            $direction === 'incoming' ? 'message_received' : 'message_sent',
            $message,
            ['contact_id' => $contact->id]
        );

        // Broadcast for real-time updates
        if ($direction === 'incoming') {
            event(new MessageReceived($message));
        }

        return $message;
    }

    /**
     * Get last sync timestamp
     */
    public function getLastSyncTime(int $organizationId): ?string
    {
        return Cache::get("last_sync_{$organizationId}");
    }

    /**
     * Extract phone number from WhatsApp JID
     */
    private function extractPhoneNumber(string $jid): ?string
    {
        // Remove @s.whatsapp.net or @c.us suffix
        $phone = preg_replace('/@.*$/', '', $jid);
        return !empty($phone) ? $phone : null;
    }

    /**
     * Extract message content from message data
     */
    private function extractMessageContent(array $data): ?string
    {
        if (isset($data['message']['conversation'])) {
            return $data['message']['conversation'];
        }
        if (isset($data['message']['extendedTextMessage']['text'])) {
            return $data['message']['extendedTextMessage']['text'];
        }
        if (isset($data['message']['imageMessage']['caption'])) {
            return $data['message']['imageMessage']['caption'];
        }
        if (isset($data['message']['videoMessage']['caption'])) {
            return $data['message']['videoMessage']['caption'];
        }
        return null;
    }

    /**
     * Determine message type from message data
     */
    private function determineMessageType(array $data): string
    {
        if (isset($data['message']['imageMessage'])) {
            return 'image';
        }
        if (isset($data['message']['videoMessage'])) {
            return 'video';
        }
        if (isset($data['message']['audioMessage'])) {
            return 'audio';
        }
        if (isset($data['message']['documentMessage'])) {
            return 'document';
        }
        if (isset($data['message']['stickerMessage'])) {
            return 'sticker';
        }
        if (isset($data['message']['locationMessage'])) {
            return 'location';
        }
        if (isset($data['message']['contactMessage'])) {
            return 'contact';
        }
        return 'text';
    }
}
