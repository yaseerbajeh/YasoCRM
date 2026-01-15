<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Client\Response;

class EvolutionApiService
{
    private string $baseUrl;
    private string $globalApiKey;
    private int $timeout;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('evolution.base_url'), '/');
        $this->globalApiKey = config('evolution.global_api_key');
        $this->timeout = config('evolution.timeout', 30);
    }

    /**
     * Create a new WhatsApp instance
     */
    public function createInstance(string $instanceName, array $settings = []): array
    {
        $response = $this->makeRequest('POST', '/instance/create', [
            'instanceName' => $instanceName,
            'qrcode' => true,
            'integration' => $settings['integration'] ?? config('evolution.instance.integration'),
            'reject_call' => $settings['reject_call'] ?? config('evolution.instance.reject_call'),
            'msg_call' => $settings['msg_call'] ?? config('evolution.instance.msg_call'),
            'groups_ignore' => $settings['groups_ignore'] ?? config('evolution.instance.groups_ignore'),
            'always_online' => $settings['always_online'] ?? config('evolution.instance.always_online'),
            'read_messages' => $settings['read_messages'] ?? config('evolution.instance.read_messages'),
            'read_status' => $settings['read_status'] ?? config('evolution.instance.read_status'),
        ]);

        return $response->json();
    }

    /**
     * Get QR code for instance connection
     */
    public function getQRCode(string $instanceName): array
    {
        $response = $this->makeRequest('GET', "/instance/connect/{$instanceName}");
        return $response->json();
    }

    /**
     * Get instance connection status
     */
    public function getInstanceStatus(string $instanceName): array
    {
        $response = $this->makeRequest('GET', "/instance/connectionState/{$instanceName}");
        return $response->json();
    }

    /**
     * Delete an instance
     */
    public function deleteInstance(string $instanceName): array
    {
        $response = $this->makeRequest('DELETE', "/instance/delete/{$instanceName}");
        return $response->json();
    }

    /**
     * Send a text message
     */
    public function sendTextMessage(string $instanceName, string $phoneNumber, string $message): array
    {
        $response = $this->makeRequest('POST', "/message/sendText/{$instanceName}", [
            'number' => $this->formatPhoneNumber($phoneNumber),
            'text' => $message,
        ]);

        return $response->json();
    }

    /**
     * Send a media message (image, video, document, audio)
     */
    public function sendMediaMessage(
        string $instanceName,
        string $phoneNumber,
        string $mediaUrl,
        string $mediaType = 'image',
        ?string $caption = null
    ): array {
        $endpoint = match ($mediaType) {
            'image' => '/message/sendMedia/{instanceName}',
            'video' => '/message/sendMedia/{instanceName}',
            'audio' => '/message/sendWhatsAppAudio/{instanceName}',
            'document' => '/message/sendMedia/{instanceName}',
            default => '/message/sendMedia/{instanceName}',
        };

        $endpoint = str_replace('{instanceName}', $instanceName, $endpoint);

        $payload = [
            'number' => $this->formatPhoneNumber($phoneNumber),
            'mediatype' => $mediaType,
            'media' => $mediaUrl,
        ];

        if ($caption) {
            $payload['caption'] = $caption;
        }

        $response = $this->makeRequest('POST', $endpoint, $payload);
        return $response->json();
    }

    /**
     * Set webhook URL for instance
     */
    public function setWebhook(string $instanceName, string $webhookUrl, array $events = []): array
    {
        if (empty($events)) {
            $events = config('evolution.webhook.events');
        }

        $response = $this->makeRequest('POST', "/webhook/set/{$instanceName}", [
            'url' => $webhookUrl,
            'webhook_by_events' => false,
            'webhook_base64' => false,
            'events' => $events,
        ]);

        return $response->json();
    }

    /**
     * Download media from Evolution API
     */
    public function downloadMedia(string $mediaUrl): ?string
    {
        try {
            $response = Http::timeout($this->timeout)->get($mediaUrl);

            if ($response->successful()) {
                return $response->body();
            }

            Log::error('Failed to download media from Evolution API', [
                'url' => $mediaUrl,
                'status' => $response->status(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Exception downloading media from Evolution API', [
                'url' => $mediaUrl,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Fetch all contacts from WhatsApp
     */
    public function fetchContacts(string $instanceName): array
    {
        $response = $this->makeRequest('GET', "/chat/findContacts/{$instanceName}");
        $data = $response->json();
        
        return $data ?? [];
    }

    /**
     * Make HTTP request to Evolution API
     */
    public function makeRequest(string $method, string $endpoint, array $data = []): Response
    {
        $url = $this->baseUrl . $endpoint;

        Log::info('Evolution API Request', [
            'method' => $method,
            'url' => $url,
            'data' => $data,
        ]);

        $response = Http::timeout($this->timeout)
            ->withoutVerifying()  // Disable SSL verification for development
            ->withHeaders([
                'apikey' => $this->globalApiKey,
                'Content-Type' => 'application/json',
            ])
            ->$method($url, $data);

        if (!$response->successful()) {
            Log::error('Evolution API Error', [
                'method' => $method,
                'url' => $url,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
        }

        return $response;
    }

    /**
     * Format phone number for WhatsApp (remove special characters, add country code if needed)
     */
    private function formatPhoneNumber(string $phoneNumber): string
    {
        // Remove all non-numeric characters
        $cleaned = preg_replace('/[^0-9]/', '', $phoneNumber);

        // Ensure it has country code (this is a simple check, adjust as needed)
        if (strlen($cleaned) < 10) {
            throw new \InvalidArgumentException('Invalid phone number format');
        }

        return $cleaned;
    }
}
