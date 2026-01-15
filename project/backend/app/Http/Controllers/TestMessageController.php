<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TestMessageController extends Controller
{
    /**
     * Get messages for a contact
     */
    public function index(int $contactId): JsonResponse
    {
        // Get or create conversation for this contact
        $conversation = Conversation::firstOrCreate(
            ['contact_id' => $contactId],
            [
                'organization_id' => 1,
                'status' => 'open',
                'last_message_at' => now(),
            ]
        );

        // Get all messages for this conversation
        $messages = Message::where('conversation_id', $conversation->id)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($message) {
                return [
                    'id' => $message->id,
                    'sender' => $message->direction === 'outgoing' ? 'agent' : 'contact',
                    'text' => $message->content,
                    'time' => $message->created_at->format('h:i A'),
                    'read' => $message->read_at !== null,
                    'created_at' => $message->created_at,
                ];
            });

        return response()->json($messages);
    }

    /**
     * Send a message
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'contact_id' => 'required|integer',
            'message' => 'required|string',
            'sender' => 'required|in:agent,contact',
        ]);

        // Get or create conversation
        $conversation = Conversation::firstOrCreate(
            ['contact_id' => $request->contact_id],
            [
                'organization_id' => 1,
                'status' => 'open',
                'last_message_at' => now(),
            ]
        );

        // Create message
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'direction' => $request->sender === 'agent' ? 'outgoing' : 'incoming',
            'content' => $request->message,
            'type' => 'text',
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        // Update conversation last message time
        $conversation->update([
            'last_message_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => [
                'id' => $message->id,
                'sender' => $request->sender,
                'text' => $message->content,
                'time' => $message->created_at->format('h:i A'),
                'read' => false,
                'created_at' => $message->created_at,
            ],
        ], 201);
    }
}
