<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class EventLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'event_type',
        'loggable_type',
        'loggable_id',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function loggable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Log a new event
     */
    public static function log(
        int $organizationId,
        string $eventType,
        ?Model $loggable = null,
        array $metadata = []
    ): self {
        return self::create([
            'organization_id' => $organizationId,
            'event_type' => $eventType,
            'loggable_type' => $loggable ? get_class($loggable) : null,
            'loggable_id' => $loggable?->id,
            'metadata' => $metadata,
        ]);
    }
}
