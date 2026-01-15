<?php

namespace App\Http\Controllers;

use App\Services\EvolutionApiService;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EvolutionTestController extends Controller
{
    protected $evolutionApi;

    public function __construct(EvolutionApiService $evolutionApi)
    {
        $this->evolutionApi = $evolutionApi;
    }

    /**
     * Get instance status
     */
    public function getStatus(): JsonResponse
    {
        try {
            $instance = env('EVOLUTION_DEFAULT_INSTANCE', 'ksagamingtv');
            $status = $this->evolutionApi->getInstanceStatus($instance);
            
            return response()->json($status);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get QR code for connection
     */
    public function getQRCode(): JsonResponse
    {
        try {
            $instance = env('EVOLUTION_DEFAULT_INSTANCE', 'ksagamingtv');
            $qr = $this->evolutionApi->getQRCode($instance);
            
            return response()->json($qr);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Create WhatsApp instance
     */
    public function createInstance(): JsonResponse
    {
        try {
            $instance = env('EVOLUTION_DEFAULT_INSTANCE', 'ksagamingtv');
            
            $result = $this->evolutionApi->createInstance($instance, [
                'qrcode' => true,
                'integration' => 'WHATSAPP-BAILEYS',
            ]);
            
            return response()->json([
                'success' => true,
                'instance' => $instance,
                'result' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * List all instances
     */
    public function listInstances(): JsonResponse
    {
        try {
            $response = $this->evolutionApi->makeRequest('GET', '/instance/fetchInstances');
            
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Sync contacts from WhatsApp
     */
    public function syncContacts(): JsonResponse
    {
        try {
            $instance = env('EVOLUTION_DEFAULT_INSTANCE', 'ksagamingtv');
            $contacts = $this->evolutionApi->fetchContacts($instance);
            
            $count = 0;
            foreach ($contacts as $contactData) {
                Contact::updateOrCreate(
                    [
                        'phone_number' => $contactData['id'] ?? $contactData['number'],
                    ],
                    [
                        'organization_id' => 1,
                        'name' => $contactData['pushName'] ?? $contactData['name'] ?? 'Unknown',
                        'profile_picture_url' => $contactData['profilePictureUrl'] ?? null,
                    ]
                );
                $count++;
            }
            
            return response()->json([
                'success' => true,
                'count' => $count,
                'message' => "Synced {$count} contacts from WhatsApp"
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Send message via WhatsApp
     */
    public function sendMessage(Request $request): JsonResponse
    {
        $request->validate([
            'phone_number' => 'required|string',
            'message' => 'required|string',
        ]);

        try {
            $instance = env('EVOLUTION_DEFAULT_INSTANCE', 'ksagamingtv');
            
            $result = $this->evolutionApi->sendTextMessage(
                $instance,
                $request->phone_number,
                $request->message
            );
            
            return response()->json([
                'success' => true,
                'result' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Configure webhook in Evolution API
     */
    public function setWebhook(Request $request): JsonResponse
    {
        try {
            $instance = env('EVOLUTION_DEFAULT_INSTANCE', 'ksagamingtv');
            $webhookUrl = $request->input('webhook_url') ?? env('APP_URL') . "/api/webhook/evolution/{$instance}";
            
            $result = $this->evolutionApi->setWebhook(
                $instance,
                $webhookUrl,
                [
                    'MESSAGES_UPSERT',
                    'MESSAGES_UPDATE', 
                    'CONNECTION_UPDATE',
                    'QRCODE_UPDATED'
                ]
            );
            
            return response()->json([
                'success' => true,
                'webhook_url' => $webhookUrl,
                'result' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
