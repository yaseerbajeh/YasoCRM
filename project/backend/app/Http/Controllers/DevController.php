<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Contact;
use App\Models\Message;
use App\Models\Automation;
use App\Models\Broadcast;
use App\Models\EventLog;
use App\Models\WhatsappInstance;
use App\Services\SyncService;
use App\Services\EvolutionApiService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

/**
 * Development Controller - Returns data without authentication
 * WARNING: Remove or protect this in production!
 */
class DevController extends Controller
{
    /**
     * Quick ping test - no database
     */
    public function ping(): JsonResponse
    {
        return response()->json(['pong' => true, 'time' => now()->toISOString()]);
    }

    /**
     * Quick database test
     */
    public function dbTest(): JsonResponse
    {
        $start = microtime(true);
        $count = Contact::count();
        $duration = round((microtime(true) - $start) * 1000, 2);
        
        return response()->json([
            'contacts_count' => $count,
            'query_time_ms' => $duration,
        ]);
    }

    /**
     * Test fetching chats from Evolution API
     */
    public function testChats(Request $request): JsonResponse
    {
        $instanceName = $request->get('instance') ?? env('EVOLUTION_DEFAULT_INSTANCE');
        
        if (empty($instanceName)) {
            return response()->json(['error' => 'No instance specified'], 400);
        }

        try {
            $evolutionApi = app(EvolutionApiService::class);
            
            // Test findChats with POST method
            $response = $evolutionApi->makeRequest('POST', "/chat/findChats/{$instanceName}", []);
            $chats = $response->json() ?? [];
            
            return response()->json([
                'success' => $response->successful(),
                'status_code' => $response->status(),
                'chats_count' => is_array($chats) ? count($chats) : 0,
                'sample' => is_array($chats) ? array_slice($chats, 0, 3) : $chats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Test fetching messages from Evolution API directly
     */
    public function testMessages(Request $request): JsonResponse
    {
        $instanceName = $request->get('instance') ?? env('EVOLUTION_DEFAULT_INSTANCE');
        
        if (empty($instanceName)) {
            return response()->json(['error' => 'No instance specified'], 400);
        }

        try {
            $evolutionApi = app(EvolutionApiService::class);
            
            // Try fetching messages with POST - Evolution API v2 format
            $response = $evolutionApi->makeRequest('POST', "/chat/findMessages/{$instanceName}", [
                'where' => [],
                'page' => 1,
                'offset' => 20,
            ]);
            
            $messages = $response->json() ?? [];
            
            return response()->json([
                'success' => $response->successful(),
                'status_code' => $response->status(),
                'messages_count' => is_array($messages) ? count($messages) : 0,
                'sample' => is_array($messages) ? array_slice($messages, 0, 2) : $messages,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate sample conversations from existing contacts
     */
    public function generateConversations(Request $request): JsonResponse
    {
        $limit = min((int) $request->get('limit', 10), 50);
        
        // Get the first WhatsApp instance (or create one)
        $instance = WhatsappInstance::first();
        if (!$instance) {
            $organization = \App\Models\Organization::firstOrCreate(
                ['name' => 'Test Organization'],
                ['slug' => 'test-org']
            );
            $instance = WhatsappInstance::create([
                'organization_id' => $organization->id,
                'instance_name' => 'test-instance',
                'instance_token' => 'test-token',
                'status' => 'connected',
            ]);
        }

        // Get random contacts that don't have conversations yet
        $contacts = Contact::whereDoesntHave('conversations')
            ->take($limit)
            ->get();

        $created = 0;
        $sampleMessages = [
            'مرحبا، كيف يمكنني مساعدتك؟',
            'شكرا لتواصلك معنا',
            'هل تحتاج إلى أي مساعدة إضافية؟',
            'تم استلام طلبك وسيتم معالجته قريبا',
            'نحن سعداء بخدمتكم',
        ];

        foreach ($contacts as $contact) {
            $conversation = Conversation::create([
                'contact_id' => $contact->id,
                'whatsapp_instance_id' => $instance->id,
                'status' => collect(['open', 'pending', 'closed'])->random(),
                'unread_count' => rand(0, 5),
                'last_message_at' => now()->subMinutes(rand(1, 1440)),
            ]);

            // Create 2-4 random messages
            $numMessages = rand(2, 4);
            for ($i = 0; $i < $numMessages; $i++) {
                Message::create([
                    'conversation_id' => $conversation->id,
                    'direction' => $i % 2 === 0 ? 'incoming' : 'outgoing',
                    'content' => $sampleMessages[array_rand($sampleMessages)],
                    'message_type' => 'text',
                    'is_read' => rand(0, 1),
                    'status' => 'delivered',
                    'created_at' => now()->subMinutes(rand(1, 60)),
                ]);
            }
            $created++;
        }

        return response()->json([
            'success' => true,
            'conversations_created' => $created,
            'message' => "Created {$created} sample conversations with messages",
        ]);
    }

    /**
     * Setup webhook in Evolution API for real-time message sync
     */
    public function setupWebhook(Request $request): JsonResponse
    {
        $instanceName = $request->get('instance') ?? env('EVOLUTION_DEFAULT_INSTANCE');
        
        if (empty($instanceName)) {
            return response()->json(['error' => 'No instance specified'], 400);
        }

        // The webhook URL must be publicly accessible from Evolution API
        $webhookUrl = $request->get('url') ?? env('APP_URL') . "/api/webhook/evolution/{$instanceName}";

        try {
            $evolutionApi = app(EvolutionApiService::class);
            
            $response = $evolutionApi->makeRequest('POST', "/webhook/set/{$instanceName}", [
                'url' => $webhookUrl,
                'webhook_by_events' => false,
                'webhook_base64' => false,
                'events' => [
                    'MESSAGES_UPSERT',
                    'MESSAGES_UPDATE',
                    'MESSAGES_DELETE',
                    'SEND_MESSAGE',
                    'CONNECTION_UPDATE',
                ],
            ]);
            
            return response()->json([
                'success' => $response->successful(),
                'status_code' => $response->status(),
                'webhook_url' => $webhookUrl,
                'response' => $response->json(),
                'note' => 'Make sure the webhook URL is publicly accessible from your Evolution API server!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Trigger sync with Evolution API
     */
    public function triggerSync(Request $request): JsonResponse
    {
        $instanceName = $request->get('instance') ?? config('evolution.default_instance') ?? env('EVOLUTION_DEFAULT_INSTANCE');
        
        if (empty($instanceName)) {
            return response()->json([
                'error' => 'No instance specified. Set EVOLUTION_DEFAULT_INSTANCE in .env or pass ?instance=<name>',
                'hint' => 'Check your backend .env file for EVOLUTION_DEFAULT_INSTANCE',
            ], 400);
        }

        // Find or create a test organization and instance
        $instance = WhatsappInstance::where('instance_name', $instanceName)->first();
        
        if (!$instance) {
            // Create a default organization and instance for testing
            $organization = \App\Models\Organization::firstOrCreate(
                ['name' => 'Test Organization'],
                ['slug' => 'test-org']
            );
            
            $instance = WhatsappInstance::create([
                'organization_id' => $organization->id,
                'instance_name' => $instanceName,
                'instance_token' => 'auto-created',
                'status' => 'connected',
            ]);
        }

        try {
            $evolutionApi = app(EvolutionApiService::class);
            $syncService = new SyncService($evolutionApi);
            
            $result = $syncService->fullSync($instance->organization_id, $instanceName);
            
            return response()->json([
                'success' => true,
                'message' => 'Sync completed successfully',
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'hint' => 'Make sure Evolution API is running and configured in .env',
            ], 500);
        }
    }

    /**
     * Get Evolution API status
     */
    public function evolutionStatus(): JsonResponse
    {
        $config = [
            'base_url' => config('evolution.base_url'),
            'has_api_key' => !empty(config('evolution.global_api_key')),
            'default_instance' => env('EVOLUTION_DEFAULT_INSTANCE'),
        ];

        try {
            $evolutionApi = app(EvolutionApiService::class);
            $instances = $evolutionApi->fetchInstances();
            
            return response()->json([
                'connected' => true,
                'config' => $config,
                'instances' => $instances,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'connected' => false,
                'config' => $config,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send a message (dev endpoint - no auth)
     */
    public function sendMessage(Request $request): JsonResponse
    {
        $conversationId = $request->input('conversation_id');
        $content = $request->input('content') ?? $request->input('text');
        
        if (!$conversationId || !$content) {
            return response()->json([
                'error' => 'conversation_id and content are required'
            ], 400);
        }

        $conversation = Conversation::find($conversationId);
        if (!$conversation) {
            return response()->json(['error' => 'Conversation not found'], 404);
        }

        $message = Message::create([
            'conversation_id' => $conversationId,
            'direction' => 'outgoing',
            'content' => $content,
            'message_type' => 'text',
            'is_read' => true,
            'status' => 'sent',
            'created_at' => now(),
        ]);

        // Update conversation
        $conversation->update([
            'last_message_at' => now(),
        ]);

        return response()->json($message);
    }

    /**
     * Get all conversations (for dev/testing)
     */
    public function conversations(): JsonResponse
    {
        $conversations = Conversation::with(['contact', 'messages' => function ($q) {
            $q->latest()->limit(1);
        }])
            ->orderBy('last_message_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($conv) {
                return [
                    'id' => $conv->id,
                    'contact_id' => $conv->contact_id,
                    'status' => $conv->status,
                    'unread_count' => $conv->unread_count,
                    'last_message_at' => $conv->last_message_at,
                    'contact' => $conv->contact ? [
                        'id' => $conv->contact->id,
                        'name' => $conv->contact->name,
                        'phone_number' => $conv->contact->phone_number,
                        'avatar_url' => $conv->contact->avatar_url,
                    ] : null,
                    'last_message' => $conv->messages->first() ? [
                        'content' => $conv->messages->first()->content,
                        'direction' => $conv->messages->first()->direction,
                        'created_at' => $conv->messages->first()->created_at,
                    ] : null,
                ];
            });

        return response()->json($conversations);
    }

    /**
     * Get single conversation
     */
    public function conversation(int $id): JsonResponse
    {
        $conversation = Conversation::with(['contact'])->findOrFail($id);
        return response()->json($conversation);
    }

    /**
     * Get messages for a conversation
     */
    public function messages(int $conversationId): JsonResponse
    {
        $messages = Message::where('conversation_id', $conversationId)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($msg) {
                return [
                    'id' => $msg->id,
                    'content' => $msg->content,
                    'direction' => $msg->direction,
                    'message_type' => $msg->message_type,
                    'is_read' => $msg->is_read,
                    'status' => $msg->status ?? 'delivered',
                    'created_at' => $msg->created_at,
                ];
            });

        return response()->json($messages);
    }

    /**
     * Get all contacts (paginated)
     */
    public function contacts(Request $request): JsonResponse
    {
        $perPage = min((int) $request->get('limit', 20), 100); // Max 100 per page
        $page = (int) $request->get('page', 1);
        
        $query = Contact::query();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone_number', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $total = $query->count();
        $contacts = $query->orderBy('created_at', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get()
            ->map(function ($contact) {
                return [
                    'id' => $contact->id,
                    'name' => $contact->name ?? $contact->phone_number,
                    'phone_number' => $contact->phone_number,
                    'email' => $contact->email,
                    'avatar_url' => $contact->avatar_url,
                    'created_at' => $contact->created_at,
                ];
            });

        return response()->json([
            'data' => $contacts,
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage,
        ]);
    }

    /**
     * Get single contact
     */
    public function contact(int $id): JsonResponse
    {
        $contact = Contact::findOrFail($id);
        return response()->json($contact);
    }

    /**
     * Analytics summary
     */
    public function analyticsSummary(): JsonResponse
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $lastMonth = $now->copy()->subMonth();

        $activeConversations = Conversation::where('status', 'open')->count();
        $newContacts = Contact::where('created_at', '>=', $startOfMonth)->count();
        $lastMonthNewContacts = Contact::whereBetween('created_at', [$lastMonth->startOfMonth(), $lastMonth->endOfMonth()])->count();
        $messagesThisMonth = Message::where('created_at', '>=', $startOfMonth)->count();
        $lastMonthMessages = Message::whereBetween('created_at', [$lastMonth->startOfMonth(), $lastMonth->endOfMonth()])->count();
        $totalContacts = Contact::count();

        $newContactsChange = $lastMonthNewContacts > 0 
            ? round((($newContacts - $lastMonthNewContacts) / $lastMonthNewContacts) * 100) 
            : 0;
        $messagesChange = $lastMonthMessages > 0 
            ? round((($messagesThisMonth - $lastMonthMessages) / $lastMonthMessages) * 100) 
            : 0;

        return response()->json([
            'active_conversations' => [
                'value' => $activeConversations,
                'label' => 'المحادثات النشطة',
            ],
            'new_contacts' => [
                'value' => $newContacts,
                'change' => $newContactsChange,
                'label' => 'جهات اتصال جديدة',
            ],
            'messages_this_month' => [
                'value' => $messagesThisMonth,
                'change' => $messagesChange,
                'label' => 'إجمالي الرسائل',
            ],
            'total_contacts' => [
                'value' => $totalContacts,
                'label' => 'إجمالي جهات الاتصال',
            ],
        ]);
    }

    /**
     * Analytics conversations chart
     */
    public function analyticsConversations(): JsonResponse
    {
        $days = [];
        $arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $count = Conversation::whereDate('created_at', $date)->count();
            
            $days[] = [
                'date' => $date->format('Y-m-d'),
                'day' => $arabicDays[$date->dayOfWeek],
                'count' => $count > 0 ? $count : rand(5, 50), // Use mock data if no real data
            ];
        }

        return response()->json($days);
    }

    /**
     * Analytics activities
     */
    public function analyticsActivities(): JsonResponse
    {
        $activities = EventLog::orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'type' => $log->event_type,
                    'action' => $this->getActivityLabel($log),
                    'time' => $log->created_at->diffForHumans(),
                ];
            });

        // If no activities, return mock data
        if ($activities->isEmpty()) {
            $activities = collect([
                ['id' => 1, 'type' => 'message_received', 'action' => 'تم استلام رسالة جديدة', 'time' => 'منذ 5 د'],
                ['id' => 2, 'type' => 'contact_created', 'action' => 'تم إنشاء جهة اتصال جديدة', 'time' => 'منذ 15 د'],
                ['id' => 3, 'type' => 'message_sent', 'action' => 'تم إرسال رسالة', 'time' => 'منذ 30 د'],
            ]);
        }

        return response()->json($activities);
    }

    /**
     * Get all automations
     */
    public function automations(): JsonResponse
    {
        $automations = Automation::withCount('steps')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($auto) {
                return [
                    'id' => $auto->id,
                    'name' => $auto->name,
                    'trigger' => $this->getTriggerLabel($auto->trigger_type),
                    'trigger_type' => $auto->trigger_type,
                    'trigger_value' => $auto->trigger_value,
                    'steps' => $auto->steps_count,
                    'status' => $auto->status,
                    'runs' => $auto->run_count,
                ];
            });

        return response()->json($automations);
    }

    /**
     * Get all broadcasts
     */
    public function broadcasts(): JsonResponse
    {
        $broadcasts = Broadcast::orderBy('created_at', 'desc')
            ->get()
            ->map(function ($bc) {
                return [
                    'id' => $bc->id,
                    'name' => $bc->name,
                    'status' => $bc->status,
                    'total_recipients' => $bc->total_recipients,
                    'sent_count' => $bc->sent_count,
                    'failed_count' => $bc->failed_count,
                    'scheduled_at' => $bc->scheduled_at,
                    'created_at' => $bc->created_at,
                ];
            });

        return response()->json($broadcasts);
    }

    // Helper methods
    private function getTriggerLabel(string $type): string
    {
        return match ($type) {
            'new_message' => 'رسالة جديدة',
            'keyword' => 'كلمة مفتاحية',
            'time_delay' => 'تأخير زمني',
            'conversation_end' => 'انتهاء المحادثة',
            'new_contact' => 'جهة اتصال جديدة',
            default => $type,
        };
    }

    private function getActivityLabel(EventLog $log): string
    {
        return match ($log->event_type) {
            'message_received' => 'تم استلام رسالة',
            'message_sent' => 'تم إرسال رسالة',
            'contact_created' => 'تم إنشاء جهة اتصال',
            'conversation_created' => 'بدأت محادثة جديدة',
            'broadcast_sent' => 'تم إرسال حملة',
            default => $log->event_type,
        };
    }
}
