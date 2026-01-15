<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageReceived implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Message $message
    ) {
        $this->message->load(['conversation.contact', 'media']);
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversations.' . $this->message->conversation_id),
            new PrivateChannel('organizations.' . $this->message->conversation->contact->organization_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.received';
    }

    public function broadcastWith(): array
    {
        return [
            'message' => [
                'id' => $this->message->id,
                'conversation_id' => $this->message->conversation_id,
                'direction' => $this->message->direction,
                'content' => $this->message->content,
                'message_type' => $this->message->message_type,
                'is_read' => $this->message->is_read,
                'created_at' => $this->message->created_at->toISOString(),
                'media' => $this->message->media->map(fn($m) => [
                    'id' => $m->id,
                    'file_name' => $m->file_name,
                    'mime_type' => $m->mime_type,
                    'url' => $m->url,
                ]),
            ],
            'contact' => [
                'id' => $this->message->conversation->contact->id,
                'name' => $this->message->conversation->contact->display_name,
                'phone_number' => $this->message->conversation->contact->phone_number,
            ],
        ];
    }
}
