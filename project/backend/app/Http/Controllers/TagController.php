<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TagController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tags = Tag::where('organization_id', $request->user()->organization_id)
            ->orderBy('name')
            ->get();

        return response()->json($tags);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|max:7',
            'description' => 'nullable|string',
        ]);

        $tag = Tag::create([
            'organization_id' => $request->user()->organization_id,
            'name' => $request->name,
            'color' => $request->color ?? '#3B82F6',
            'description' => $request->description,
        ]);

        return response()->json($tag, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'name' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:7',
            'description' => 'nullable|string',
        ]);

        $tag = Tag::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $tag->update($request->only(['name', 'color', 'description']));

        return response()->json($tag);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $tag = Tag::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $tag->delete();

        return response()->json(['message' => 'Tag deleted successfully']);
    }
}
