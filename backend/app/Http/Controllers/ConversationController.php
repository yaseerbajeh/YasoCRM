<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ConversationController extends Controller
{
    /**
     * Get all conversations
     */
    public function index(Request $request): JsonResponse
    {
        $organizationId = $request->user()->organization_id;

        $query = Conversation::whereHas('contact', function ($q) use ($organizationId) {
            $q->where('organization_id', $organizationId);
        })->with(['contact', 'assignedAgent', 'tags', 'messages' => function ($q) {
            $q->latest()->limit(1);
        }]);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by assigned agent
        if ($request->has('assigned_to')) {
            if ($request->assigned_to === 'unassigned') {
                $query->unassigned();
            } else {
                $query->assignedTo($request->assigned_to);
            }
        }

        // Filter by tags
        if ($request->has('tags')) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->whereIn('tags.id', (array) $request->tags);
            });
        }

        $conversations = $query->orderBy('last_message_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json($conversations);
    }

    /**
     * Get single conversation
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $conversation = Conversation::whereHas('contact', function ($q) use ($request) {
            $q->where('organization_id', $request->user()->organization_id);
        })->with(['contact', 'assignedAgent', 'tags', 'messages.media'])
            ->findOrFail($id);

        return response()->json($conversation);
    }

    /**
     * Assign conversation to agent
     */
    public function assign(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'agent_id' => 'required|exists:users,id',
        ]);

        $conversation = Conversation::whereHas('contact', function ($q) use ($request) {
            $q->where('organization_id', $request->user()->organization_id);
        })->findOrFail($id);

        $conversation->update(['assigned_agent_id' => $request->agent_id]);

        return response()->json($conversation->load('assignedAgent'));
    }

    /**
     * Update conversation status
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:open,pending,closed',
        ]);

        $conversation = Conversation::whereHas('contact', function ($q) use ($request) {
            $q->where('organization_id', $request->user()->organization_id);
        })->findOrFail($id);

        $conversation->update(['status' => $request->status]);

        return response()->json($conversation);
    }

    /**
     * Add tags to conversation
     */
    public function addTags(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'tag_ids' => 'required|array',
            'tag_ids.*' => 'exists:tags,id',
        ]);

        $conversation = Conversation::whereHas('contact', function ($q) use ($request) {
            $q->where('organization_id', $request->user()->organization_id);
        })->findOrFail($id);

        $conversation->tags()->syncWithoutDetaching($request->tag_ids);

        return response()->json($conversation->load('tags'));
    }

    /**
     * Mark conversation as read
     */
    public function markAsRead(Request $request, int $id): JsonResponse
    {
        $conversation = Conversation::whereHas('contact', function ($q) use ($request) {
            $q->where('organization_id', $request->user()->organization_id);
        })->findOrFail($id);

        $conversation->markAsRead();

        return response()->json(['message' => 'Conversation marked as read']);
    }
}
