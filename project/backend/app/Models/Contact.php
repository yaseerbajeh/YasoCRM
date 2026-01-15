<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contact extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'phone_number',
        'name',
        'email',
        'avatar_url',
        'custom_fields',
        'last_interaction_at',
    ];

    protected $casts = [
        'custom_fields' => 'array',
        'last_interaction_at' => 'datetime',
    ];

    // Relationships
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    public function broadcastMessages(): HasMany
    {
        return $this->hasMany(BroadcastMessage::class);
    }

    // Scopes
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('phone_number', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%");
        });
    }

    // Helper methods
    public function updateLastInteraction(): void
    {
        $this->update(['last_interaction_at' => now()]);
    }

    public function getDisplayNameAttribute(): string
    {
        return $this->name ?? $this->phone_number;
    }
}
