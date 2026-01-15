<?php

namespace App\Http\Controllers;

use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TemplateController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Template::where('organization_id', $request->user()->organization_id);

        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        if ($request->has('active')) {
            $query->active();
        }

        $templates = $query->orderBy('name')->get();

        return response()->json($templates);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'content' => 'required|string',
            'category' => 'nullable|string|max:255',
        ]);

        $template = Template::create([
            'organization_id' => $request->user()->organization_id,
            'name' => $request->name,
            'content' => $request->content,
            'category' => $request->category,
        ]);

        return response()->json($template, 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $template = Template::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        return response()->json($template);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'name' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
        ]);

        $template = Template::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $template->update($request->only(['name', 'content', 'category', 'is_active']));

        return response()->json($template);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $template = Template::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $template->delete();

        return response()->json(['message' => 'Template deleted successfully']);
    }
}
