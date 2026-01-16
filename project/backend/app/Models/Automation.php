<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Automation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'name',
        'trigger_type',
        'trigger_value',
        'status',
        'run_count',
    ];

    protected $casts = [
        'run_count' => 'integer',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function steps(): HasMany
    {
        return $this->hasMany(AutomationStep::class)->orderBy('step_order');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function activate(): void
    {
        $this->update(['status' => 'active']);
    }

    public function pause(): void
    {
        $this->update(['status' => 'paused']);
    }

    public function incrementRunCount(): void
    {
        $this->increment('run_count');
    }
}
