<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AutomationStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'automation_id',
        'step_order',
        'action_type',
        'action_config',
    ];

    protected $casts = [
        'step_order' => 'integer',
        'action_config' => 'array',
    ];

    public function automation(): BelongsTo
    {
        return $this->belongsTo(Automation::class);
    }

    /**
     * Get the message content if this is a send_message action
     */
    public function getMessageContent(): ?string
    {
        if ($this->action_type === 'send_message') {
            return $this->action_config['message'] ?? null;
        }
        return null;
    }

    /**
     * Get the delay in seconds if this is a wait_delay action
     */
    public function getDelaySeconds(): int
    {
        if ($this->action_type === 'wait_delay') {
            return (int) ($this->action_config['delay_seconds'] ?? 0);
        }
        return 0;
    }
}
