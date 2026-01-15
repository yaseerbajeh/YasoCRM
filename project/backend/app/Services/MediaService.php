<?php

namespace App\Services;

use App\Models\Media;
use App\Models\Message;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MediaService
{
    private EvolutionApiService $evolutionApi;

    public function __construct(EvolutionApiService $evolutionApi)
    {
        $this->evolutionApi = $evolutionApi;
    }

    /**
     * Download and store media from Evolution API
     */
    public function downloadAndStoreMedia(
        Message $message,
        string $mediaUrl,
        string $mimeType,
        ?string $fileName = null
    ): ?Media {
        try {
            // Download media content
            $content = $this->evolutionApi->downloadMedia($mediaUrl);

            if (!$content) {
                Log::error('Failed to download media', ['url' => $mediaUrl]);
                return null;
            }

            // Generate file name if not provided
            if (!$fileName) {
                $extension = $this->getExtensionFromMimeType($mimeType);
                $fileName = Str::random(40) . '.' . $extension;
            }

            // Determine storage path
            $organizationId = $message->conversation->contact->organization_id;
            $conversationId = $message->conversation_id;
            $storagePath = "media/{$organizationId}/{$conversationId}/{$fileName}";

            // Store file
            $disk = config('filesystems.default');
            Storage::disk($disk)->put($storagePath, $content);

            // Create media record
            $media = Media::create([
                'message_id' => $message->id,
                'file_name' => $fileName,
                'mime_type' => $mimeType,
                'storage_path' => $storagePath,
                'storage_disk' => $disk,
                'file_size' => strlen($content),
            ]);

            // Generate thumbnail for images
            if (str_starts_with($mimeType, 'image/')) {
                $this->generateThumbnail($media);
            }

            return $media;
        } catch (\Exception $e) {
            Log::error('Exception storing media', [
                'message_id' => $message->id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Upload media file and get URL for sending
     */
    public function uploadMediaForSending(string $filePath): ?string
    {
        try {
            $disk = config('filesystems.default');

            if (!Storage::disk($disk)->exists($filePath)) {
                Log::error('Media file not found', ['path' => $filePath]);
                return null;
            }

            // For local storage, we need to make it publicly accessible
            if ($disk === 'local') {
                // Create symlink if not exists
                if (!file_exists(public_path('storage'))) {
                    symlink(storage_path('app/public'), public_path('storage'));
                }

                return url('storage/' . $filePath);
            }

            // For S3 or other cloud storage, get temporary URL
            return Storage::disk($disk)->temporaryUrl($filePath, now()->addHours(1));
        } catch (\Exception $e) {
            Log::error('Exception uploading media', [
                'path' => $filePath,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Generate thumbnail for image
     */
    private function generateThumbnail(Media $media): void
    {
        // This is a placeholder - you would implement actual thumbnail generation
        // using libraries like Intervention Image or GD
        // For now, we'll skip thumbnail generation
        Log::info('Thumbnail generation not implemented yet', ['media_id' => $media->id]);
    }

    /**
     * Get file extension from MIME type
     */
    private function getExtensionFromMimeType(string $mimeType): string
    {
        $mimeMap = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
            'video/mp4' => 'mp4',
            'video/mpeg' => 'mpeg',
            'video/quicktime' => 'mov',
            'audio/mpeg' => 'mp3',
            'audio/ogg' => 'ogg',
            'audio/wav' => 'wav',
            'application/pdf' => 'pdf',
            'application/msword' => 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
            'application/vnd.ms-excel' => 'xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'xlsx',
        ];

        return $mimeMap[$mimeType] ?? 'bin';
    }

    /**
     * Delete media files
     */
    public function deleteMedia(Media $media): bool
    {
        try {
            $disk = $media->storage_disk;

            // Delete main file
            if (Storage::disk($disk)->exists($media->storage_path)) {
                Storage::disk($disk)->delete($media->storage_path);
            }

            // Delete thumbnail if exists
            if ($media->thumbnail_path && Storage::disk($disk)->exists($media->thumbnail_path)) {
                Storage::disk($disk)->delete($media->thumbnail_path);
            }

            return true;
        } catch (\Exception $e) {
            Log::error('Exception deleting media', [
                'media_id' => $media->id,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }
}
