<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TestContactController extends Controller
{
    /**
     * Get all contacts (no auth required for testing)
     */
    public function index(): JsonResponse
    {
        $contacts = Contact::latest()->take(50)->get();
        return response()->json($contacts);
    }

    /**
     * Create new contact (no auth required for testing)
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'phone_number' => 'required|string',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
        ]);

        $contact = Contact::create([
            'organization_id' => 1, // Default for testing
            'phone_number' => $request->phone_number,
            'name' => $request->name,
            'email' => $request->email,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Contact created successfully!',
            'contact' => $contact
        ], 201);
    }
}
