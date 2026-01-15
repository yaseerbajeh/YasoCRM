<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Services\EvolutionApiService;
use App\Services\MediaService;
use App\Events\MessageSent;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller
{
    public function __construct(
        private EvolutionApiService $evolutionApi,
        private MediaService $mediaService
    ) {}

    /**
     * Get messages for a conversation
     */
    public function index(Request $request, int $conversationId): JsonResponse
    {
        $conversation = Conversation::whereHas('contact', function ($q) use ($request) {
            $q->where('organization_id', $request->user()->organization_id);
        })->findOrFail($conversationId);

        $messages = Message::where('conversation_id', $conversationId)
            ->with('media')
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 50));

        return response()->json($messages);
    }

    /**
     * Send a new message
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'content' => 'required_without:media|string',
            'media' => 'nullable|file|max:10240', // 10MB max
            'media_type' => 'nullable|in:image,video,audio,document',
        ]);

        $conversation = Conversation::whereHas('contact', function ($q) use ($request) {
            $q->where('organization_id', $request->user()->organization_id);
        })->findOrFail($request->conversation_id);

        try {
            $instance = $conversation->whatsappInstance;

            if (!$instance->isConnected()) {
                return response()->json([
                    'error' => 'WhatsApp instance is not connected',
                ], 400);
            }

            $message = Message::create([
                'conversation_id' => $conversation->id,
                'direction' => 'outgoing',
                'content' => $request->content,
                'message_type' => $request->has('media') ? $request->media_type : 'text',
                'status' => 'pending',
            ]);

            // Send message via Evolution API
            if ($request->hasFile('media')) {
                // Handle media upload
                $file = $request->file('media');
                $path = $file->store('temp', 'local');
                $mediaUrl = $this->mediaService->uploadMediaForSending($path);

                $response = $this->evolutionApi->sendMediaMessage(
                    $instance->instance_name,
                    $conversation->contact->phone_number,
                    $mediaUrl,
                    $request->media_type,
                    $request->content
                );

                // Store media record
                $this->mediaService->downloadAndStoreMedia(
                    $message,
                    $mediaUrl,
                    $file->getMimeType(),
                    $file->getClientOriginalName()
                );
            } else {
                $response = $this->evolutionApi->sendTextMessage(
                    $instance->instance_name,
                    $conversation->contact->phone_number,
                    $request->content
                );
            }

            // Update message with Evolution message ID
            if (isset($response['key']['id'])) {
                $message->update([
                    'evolution_message_id' => $response['key']['id'],
                    'status' => 'sent',
                ]);
            }

            // Update conversation
            $conversation->updateLastMessageTime();

            // Broadcast event
            broadcast(new MessageSent($message->load('media')))->toOthers();

            return response()->json($message->load('media'), 201);
        } catch (\Exception $e) {
            Log::error('Failed to send message', [
                'conversation_id' => $conversation->id,
                'error' => $e->getMessage(),
            ]);

            $message->markAsFailed($e->getMessage());

            return response()->json([
                'error' => 'Failed to send message',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mark message as read
     */
    public function markAsRead(Request $request, int $id): JsonResponse
    {
        $message = Message::whereHas('conversation.contact', function ($q) use ($request) {
            $q->where('organization_id', $request->user()->organization_id);
        })->findOrFail($id);

        $message->markAsRead();

        return response()->json(['message' => 'Message marked as read']);
    }
}
