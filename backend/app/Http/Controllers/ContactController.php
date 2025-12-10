<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ContactController extends Controller
{
    /**
     * Get all contacts
     */
    public function index(Request $request): JsonResponse
    {
        $organizationId = $request->user()->organization_id;

        $query = Contact::where('organization_id', $organizationId)
            ->with(['conversations' => function ($q) {
                $q->latest('last_message_at')->limit(1);
            }]);

        // Search
        if ($request->has('search')) {
            $query->search($request->search);
        }

        // Pagination
        $contacts = $query->orderBy('last_interaction_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json($contacts);
    }

    /**
     * Create new contact
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'phone_number' => 'required|string',
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'custom_fields' => 'nullable|array',
        ]);

        $contact = Contact::create([
            'organization_id' => $request->user()->organization_id,
            'phone_number' => $request->phone_number,
            'name' => $request->name,
            'email' => $request->email,
            'custom_fields' => $request->custom_fields,
        ]);

        return response()->json($contact, 201);
    }

    /**
     * Get single contact
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $contact = Contact::where('organization_id', $request->user()->organization_id)
            ->with(['conversations.messages' => function ($q) {
                $q->latest()->limit(50);
            }])
            ->findOrFail($id);

        return response()->json($contact);
    }

    /**
     * Update contact
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'custom_fields' => 'nullable|array',
        ]);

        $contact = Contact::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $contact->update($request->only(['name', 'email', 'custom_fields']));

        return response()->json($contact);
    }

    /**
     * Delete contact
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $contact = Contact::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $contact->delete();

        return response()->json(['message' => 'Contact deleted successfully']);
    }
}
