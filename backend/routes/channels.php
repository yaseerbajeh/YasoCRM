<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
*/

// Conversation channel - only users from the same organization can listen
Broadcast::channel('conversations.{conversationId}', function ($user, $conversationId) {
    $conversation = \App\Models\Conversation::find($conversationId);
    
    if (!$conversation) {
        return false;
    }

    // Check if user belongs to the same organization as the conversation's contact
    return $user->organization_id === $conversation->contact->organization_id;
});

// Organization channel - only users from the organization can listen
Broadcast::channel('organizations.{organizationId}', function ($user, $organizationId) {
    return $user->organization_id === (int) $organizationId;
});
