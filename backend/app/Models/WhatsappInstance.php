<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WhatsappInstance extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'instance_name',
        'api_key',
        'phone_number',
        'status',
        'webhook_config',
        'settings',
        'last_connected_at',
    ];

    protected $casts = [
        'webhook_config' => 'array',
        'settings' => 'array',
        'last_connected_at' => 'datetime',
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

    public function broadcasts(): HasMany
    {
        return $this->hasMany(Broadcast::class);
    }

    // Helper methods
    public function isConnected(): bool
    {
        return $this->status === 'connected';
    }

    public function markAsConnected(): void
    {
        $this->update([
            'status' => 'connected',
            'last_connected_at' => now(),
        ]);
    }

    public function markAsDisconnected(): void
    {
        $this->update(['status' => 'disconnected']);
    }
}
