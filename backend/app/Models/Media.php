<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    use HasFactory;

    protected $fillable = [
        'message_id',
        'file_name',
        'mime_type',
        'storage_path',
        'storage_disk',
        'file_size',
        'thumbnail_path',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    // Relationships
    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }

    // Helper methods
    public function getUrlAttribute(): string
    {
        return Storage::disk($this->storage_disk)->url($this->storage_path);
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        if ($this->thumbnail_path) {
            return Storage::disk($this->storage_disk)->url($this->thumbnail_path);
        }
        return null;
    }

    public function delete(): bool
    {
        // Delete file from storage
        if (Storage::disk($this->storage_disk)->exists($this->storage_path)) {
            Storage::disk($this->storage_disk)->delete($this->storage_path);
        }

        // Delete thumbnail if exists
        if ($this->thumbnail_path && Storage::disk($this->storage_disk)->exists($this->thumbnail_path)) {
            Storage::disk($this->storage_disk)->delete($this->thumbnail_path);
        }

        return parent::delete();
    }

    public function isImage(): bool
    {
        return str_starts_with($this->mime_type, 'image/');
    }

    public function isVideo(): bool
    {
        return str_starts_with($this->mime_type, 'video/');
    }

    public function isAudio(): bool
    {
        return str_starts_with($this->mime_type, 'audio/');
    }

    public function isDocument(): bool
    {
        return !$this->isImage() && !$this->isVideo() && !$this->isAudio();
    }
}
