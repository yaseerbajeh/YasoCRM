<?php

namespace App\Events;

use App\Models\Contact;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ContactUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Contact $contact
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('organizations.' . $this->contact->organization_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'contact.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'contact' => [
                'id' => $this->contact->id,
                'name' => $this->contact->name,
                'phone_number' => $this->contact->phone_number,
                'email' => $this->contact->email,
                'avatar_url' => $this->contact->avatar_url,
                'updated_at' => $this->contact->updated_at->toISOString(),
            ],
        ];
    }
}
