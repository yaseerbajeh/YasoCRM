<?php

namespace App\Http\Controllers;

use App\Models\Broadcast;
use App\Models\BroadcastMessage;
use App\Models\Contact;
use App\Jobs\SendBroadcastMessage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BroadcastController extends Controller
{
    /**
     * Get all broadcasts
     */
    public function index(Request $request): JsonResponse
    {
        $broadcasts = Broadcast::where('organization_id', $request->user()->organization_id)
            ->with(['createdBy', 'whatsappInstance'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json($broadcasts);
    }

    /**
     * Create new broadcast
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'whatsapp_instance_id' => 'required|exists:whatsapp_instances,id',
            'name' => 'required|string|max:255',
            'message' => 'required|string',
            'contact_ids' => 'required|array|min:1',
            'contact_ids.*' => 'exists:contacts,id',
            'media' => 'nullable|array',
            'scheduled_at' => 'nullable|date|after:now',
        ]);

        $broadcast = Broadcast::create([
            'organization_id' => $request->user()->organization_id,
            'created_by_user_id' => $request->user()->id,
            'whatsapp_instance_id' => $request->whatsapp_instance_id,
            'name' => $request->name,
            'message' => $request->message,
            'media' => $request->media,
            'status' => $request->scheduled_at ? 'scheduled' : 'draft',
            'total_recipients' => count($request->contact_ids),
            'scheduled_at' => $request->scheduled_at,
        ]);

        // Create broadcast messages for each contact
        foreach ($request->contact_ids as $contactId) {
            BroadcastMessage::create([
                'broadcast_id' => $broadcast->id,
                'contact_id' => $contactId,
                'status' => 'pending',
            ]);
        }

        return response()->json($broadcast->load('broadcastMessages'), 201);
    }

    /**
     * Get broadcast details
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $broadcast = Broadcast::where('organization_id', $request->user()->organization_id)
            ->with(['broadcastMessages.contact', 'createdBy', 'whatsappInstance'])
            ->findOrFail($id);

        return response()->json($broadcast);
    }

    /**
     * Send broadcast immediately
     */
    public function send(Request $request, int $id): JsonResponse
    {
        $broadcast = Broadcast::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        if ($broadcast->status === 'processing' || $broadcast->status === 'completed') {
            return response()->json([
                'error' => 'Broadcast is already being processed or completed',
            ], 400);
        }

        // Mark as processing
        $broadcast->markAsProcessing();

        // Dispatch jobs for each broadcast message
        $broadcastMessages = $broadcast->broadcastMessages()->where('status', 'pending')->get();

        foreach ($broadcastMessages as $broadcastMessage) {
            SendBroadcastMessage::dispatch($broadcastMessage->id);
        }

        return response()->json([
            'message' => 'Broadcast sending started',
            'broadcast' => $broadcast,
        ]);
    }
}
