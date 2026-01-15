<?php

namespace App\Http\Controllers;

use App\Models\WhatsappInstance;
use App\Services\EvolutionApiService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class WhatsappInstanceController extends Controller
{
    public function __construct(
        private EvolutionApiService $evolutionApi
    ) {}

    public function index(Request $request): JsonResponse
    {
        $instances = WhatsappInstance::where('organization_id', $request->user()->organization_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($instances);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'instance_name' => 'required|string|max:255|unique:whatsapp_instances,instance_name',
        ]);

        try {
            // Create instance in Evolution API
            $response = $this->evolutionApi->createInstance($request->instance_name);

            // Create instance record in database
            $instance = WhatsappInstance::create([
                'organization_id' => $request->user()->organization_id,
                'instance_name' => $request->instance_name,
                'api_key' => $response['hash'] ?? null,
                'status' => 'connecting',
            ]);

            // Set webhook
            $webhookUrl = config('app.url') . "/api/webhook/evolution/{$request->instance_name}";
            $this->evolutionApi->setWebhook($request->instance_name, $webhookUrl);

            return response()->json($instance, 201);
        } catch (\Exception $e) {
            Log::error('Failed to create WhatsApp instance', [
                'instance_name' => $request->instance_name,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to create WhatsApp instance',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $instance = WhatsappInstance::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        return response()->json($instance);
    }

    public function getQRCode(Request $request, int $id): JsonResponse
    {
        $instance = WhatsappInstance::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        try {
            $qrData = $this->evolutionApi->getQRCode($instance->instance_name);

            return response()->json($qrData);
        } catch (\Exception $e) {
            Log::error('Failed to get QR code', [
                'instance_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to get QR code',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function getStatus(Request $request, int $id): JsonResponse
    {
        $instance = WhatsappInstance::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        try {
            $status = $this->evolutionApi->getInstanceStatus($instance->instance_name);

            return response()->json($status);
        } catch (\Exception $e) {
            Log::error('Failed to get instance status', [
                'instance_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to get instance status',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $instance = WhatsappInstance::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        try {
            // Delete from Evolution API
            $this->evolutionApi->deleteInstance($instance->instance_name);

            // Delete from database
            $instance->delete();

            return response()->json(['message' => 'WhatsApp instance deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Failed to delete WhatsApp instance', [
                'instance_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to delete WhatsApp instance',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
