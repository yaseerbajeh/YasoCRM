<?php

namespace App\Http\Controllers;

use App\Models\Automation;
use App\Models\AutomationStep;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AutomationController extends Controller
{
    /**
     * List all automations for the authenticated user's organization
     */
    public function index(Request $request): JsonResponse
    {
        $automations = Automation::where('organization_id', $request->user()->organization_id)
            ->withCount('steps')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($automation) => [
                'id' => $automation->id,
                'name' => $automation->name,
                'trigger' => $this->getTriggerLabel($automation->trigger_type, $automation->trigger_value),
                'trigger_type' => $automation->trigger_type,
                'trigger_value' => $automation->trigger_value,
                'steps' => $automation->steps_count,
                'status' => $automation->status,
                'runs' => $automation->run_count,
                'created_at' => $automation->created_at->toISOString(),
            ]);

        return response()->json($automations);
    }

    /**
     * Create a new automation
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'trigger_type' => ['required', Rule::in(['new_message', 'keyword', 'time_delay', 'conversation_end', 'new_contact'])],
            'trigger_value' => 'nullable|string|max:255',
            'status' => ['sometimes', Rule::in(['active', 'paused'])],
            'steps' => 'sometimes|array',
            'steps.*.action_type' => ['required_with:steps', Rule::in(['send_message', 'send_media', 'add_tag', 'remove_tag', 'assign_agent', 'wait_delay'])],
            'steps.*.action_config' => 'required_with:steps|array',
        ]);

        $automation = DB::transaction(function () use ($validated, $request) {
            $automation = Automation::create([
                'organization_id' => $request->user()->organization_id,
                'name' => $validated['name'],
                'trigger_type' => $validated['trigger_type'],
                'trigger_value' => $validated['trigger_value'] ?? null,
                'status' => $validated['status'] ?? 'paused',
            ]);

            if (!empty($validated['steps'])) {
                foreach ($validated['steps'] as $index => $step) {
                    AutomationStep::create([
                        'automation_id' => $automation->id,
                        'step_order' => $index + 1,
                        'action_type' => $step['action_type'],
                        'action_config' => $step['action_config'],
                    ]);
                }
            }

            return $automation;
        });

        return response()->json([
            'id' => $automation->id,
            'name' => $automation->name,
            'message' => 'Automation created successfully',
        ], 201);
    }

    /**
     * Get a single automation with its steps
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $automation = Automation::where('organization_id', $request->user()->organization_id)
            ->with('steps')
            ->findOrFail($id);

        return response()->json([
            'id' => $automation->id,
            'name' => $automation->name,
            'trigger_type' => $automation->trigger_type,
            'trigger_value' => $automation->trigger_value,
            'status' => $automation->status,
            'run_count' => $automation->run_count,
            'steps' => $automation->steps->map(fn($step) => [
                'id' => $step->id,
                'step_order' => $step->step_order,
                'action_type' => $step->action_type,
                'action_config' => $step->action_config,
            ]),
            'created_at' => $automation->created_at->toISOString(),
            'updated_at' => $automation->updated_at->toISOString(),
        ]);
    }

    /**
     * Update an automation
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $automation = Automation::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'trigger_type' => ['sometimes', Rule::in(['new_message', 'keyword', 'time_delay', 'conversation_end', 'new_contact'])],
            'trigger_value' => 'nullable|string|max:255',
            'steps' => 'sometimes|array',
            'steps.*.action_type' => ['required_with:steps', Rule::in(['send_message', 'send_media', 'add_tag', 'remove_tag', 'assign_agent', 'wait_delay'])],
            'steps.*.action_config' => 'required_with:steps|array',
        ]);

        DB::transaction(function () use ($automation, $validated) {
            $automation->update([
                'name' => $validated['name'] ?? $automation->name,
                'trigger_type' => $validated['trigger_type'] ?? $automation->trigger_type,
                'trigger_value' => $validated['trigger_value'] ?? $automation->trigger_value,
            ]);

            if (isset($validated['steps'])) {
                // Delete existing steps and recreate
                $automation->steps()->delete();
                foreach ($validated['steps'] as $index => $step) {
                    AutomationStep::create([
                        'automation_id' => $automation->id,
                        'step_order' => $index + 1,
                        'action_type' => $step['action_type'],
                        'action_config' => $step['action_config'],
                    ]);
                }
            }
        });

        return response()->json([
            'id' => $automation->id,
            'message' => 'Automation updated successfully',
        ]);
    }

    /**
     * Toggle automation status (active/paused)
     */
    public function toggle(Request $request, int $id): JsonResponse
    {
        $automation = Automation::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        if ($automation->isActive()) {
            $automation->pause();
        } else {
            $automation->activate();
        }

        return response()->json([
            'id' => $automation->id,
            'status' => $automation->status,
            'message' => $automation->isActive() ? 'Automation activated' : 'Automation paused',
        ]);
    }

    /**
     * Delete an automation (soft delete)
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $automation = Automation::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $automation->delete();

        return response()->json([
            'message' => 'Automation deleted successfully',
        ]);
    }

    /**
     * Get human-readable trigger label
     */
    private function getTriggerLabel(string $triggerType, ?string $triggerValue): string
    {
        return match ($triggerType) {
            'new_message' => 'رسالة جديدة',
            'keyword' => 'الكلمة المفتاحية "' . ($triggerValue ?? '') . '"',
            'time_delay' => 'مرور ' . ($triggerValue ?? '0') . ' دقيقة',
            'conversation_end' => 'انتهاء المحادثة',
            'new_contact' => 'جهة اتصال جديدة',
            default => $triggerType,
        };
    }
}
