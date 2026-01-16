<?php

namespace App\Events;

use App\Models\Conversation;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ConversationUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Conversation $conversation
    ) {
        $this->conversation->load(['contact', 'messages' => function ($query) {
            $query->latest()->limit(1);
        }]);
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('organizations.' . $this->conversation->contact->organization_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'conversation.updated';
    }

    public function broadcastWith(): array
    {
        $lastMessage = $this->conversation->messages->first();

        return [
            'conversation' => [
                'id' => $this->conversation->id,
                'contact_id' => $this->conversation->contact_id,
                'status' => $this->conversation->status,
                'unread_count' => $this->conversation->unread_count,
                'last_message_at' => $this->conversation->last_message_at?->toISOString(),
                'last_message' => $lastMessage ? [
                    'content' => $lastMessage->content,
                    'direction' => $lastMessage->direction,
                    'created_at' => $lastMessage->created_at->toISOString(),
                ] : null,
            ],
            'contact' => [
                'id' => $this->conversation->contact->id,
                'name' => $this->conversation->contact->display_name,
                'phone_number' => $this->conversation->contact->phone_number,
                'avatar_url' => $this->conversation->contact->avatar_url,
            ],
        ];
    }
}
