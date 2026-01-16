<?php

namespace App\Http\Controllers;

use App\Services\SyncService;
use App\Models\WhatsappInstance;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SyncController extends Controller
{
    private SyncService $syncService;

    public function __construct(SyncService $syncService)
    {
        $this->syncService = $syncService;
    }

    /**
     * Trigger a full sync from Evolution API
     */
    public function trigger(Request $request): JsonResponse
    {
        $organizationId = $request->user()->organization_id;

        // Get the default instance or first available
        $instanceName = config('app.evolution_default_instance') ??
            env('EVOLUTION_DEFAULT_INSTANCE');

        if (!$instanceName) {
            $instance = WhatsappInstance::where('organization_id', $organizationId)
                ->where('status', 'connected')
                ->first();

            if (!$instance) {
                return response()->json([
                    'error' => 'No connected WhatsApp instance found',
                ], 400);
            }

            $instanceName = $instance->instance_name;
        }

        try {
            $result = $this->syncService->fullSync($organizationId, $instanceName);

            return response()->json([
                'success' => true,
                'message' => 'Sync completed successfully',
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            Log::error('Sync failed', [
                'organization_id' => $organizationId,
                'instance' => $instanceName,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Sync failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get the last sync status
     */
    public function status(Request $request): JsonResponse
    {
        $organizationId = $request->user()->organization_id;
        $lastSync = $this->syncService->getLastSyncTime($organizationId);

        return response()->json([
            'last_sync_at' => $lastSync,
            'synced' => !is_null($lastSync),
        ]);
    }

    /**
     * Sync contacts only
     */
    public function syncContacts(Request $request): JsonResponse
    {
        $organizationId = $request->user()->organization_id;
        $instanceName = $request->input('instance') ?? env('EVOLUTION_DEFAULT_INSTANCE');

        if (!$instanceName) {
            return response()->json(['error' => 'Instance name required'], 400);
        }

        try {
            $result = $this->syncService->syncContacts($organizationId, $instanceName);

            return response()->json([
                'success' => true,
                'message' => 'Contacts synced successfully',
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Contact sync failed: ' . $e->getMessage(),
            ], 500);
        }
    }
}
