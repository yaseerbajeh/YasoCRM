<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\EventLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    /**
     * Get dashboard summary stats
     */
    public function summary(Request $request): JsonResponse
    {
        $organizationId = $request->user()->organization_id;
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

        // Active conversations (open or pending)
        $activeConversations = Conversation::whereHas('contact', function ($query) use ($organizationId) {
            $query->where('organization_id', $organizationId);
        })->whereIn('status', ['open', 'pending'])->count();

        // New contacts this month
        $newContactsThisMonth = Contact::where('organization_id', $organizationId)
            ->where('created_at', '>=', $startOfMonth)
            ->count();

        $newContactsLastMonth = Contact::where('organization_id', $organizationId)
            ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
            ->count();

        $contactsChange = $newContactsLastMonth > 0
            ? round((($newContactsThisMonth - $newContactsLastMonth) / $newContactsLastMonth) * 100)
            : ($newContactsThisMonth > 0 ? 100 : 0);

        // Messages this month
        $messagesThisMonth = Message::whereHas('conversation.contact', function ($query) use ($organizationId) {
            $query->where('organization_id', $organizationId);
        })->where('created_at', '>=', $startOfMonth)->count();

        $messagesLastMonth = Message::whereHas('conversation.contact', function ($query) use ($organizationId) {
            $query->where('organization_id', $organizationId);
        })->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();

        $messagesChange = $messagesLastMonth > 0
            ? round((($messagesThisMonth - $messagesLastMonth) / $messagesLastMonth) * 100)
            : ($messagesThisMonth > 0 ? 100 : 0);

        // Total contacts
        $totalContacts = Contact::where('organization_id', $organizationId)->count();

        return response()->json([
            'active_conversations' => [
                'value' => $activeConversations,
                'label' => 'المحادثات النشطة',
            ],
            'new_contacts' => [
                'value' => $newContactsThisMonth,
                'change' => $contactsChange,
                'label' => 'جهات اتصال جديدة',
            ],
            'messages_this_month' => [
                'value' => $messagesThisMonth,
                'change' => $messagesChange,
                'label' => 'الرسائل هذا الشهر',
            ],
            'total_contacts' => [
                'value' => $totalContacts,
                'label' => 'إجمالي جهات الاتصال',
            ],
        ]);
    }

    /**
     * Get conversation volume data for charts
     */
    public function conversations(Request $request): JsonResponse
    {
        $organizationId = $request->user()->organization_id;
        $days = $request->input('days', 7);
        $startDate = Carbon::now()->subDays($days - 1)->startOfDay();

        $data = Message::whereHas('conversation.contact', function ($query) use ($organizationId) {
            $query->where('organization_id', $organizationId);
        })
            ->where('created_at', '>=', $startDate)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get();

        // Fill in missing dates with zero
        $result = [];
        $current = $startDate->copy();
        $dataMap = $data->keyBy('date');

        while ($current <= Carbon::now()) {
            $dateStr = $current->format('Y-m-d');
            $dayName = $this->getArabicDayName($current->dayOfWeek);

            $result[] = [
                'date' => $dateStr,
                'day' => $dayName,
                'count' => $dataMap->has($dateStr) ? $dataMap->get($dateStr)->count : 0,
            ];

            $current->addDay();
        }

        return response()->json($result);
    }

    /**
     * Get message statistics
     */
    public function messages(Request $request): JsonResponse
    {
        $organizationId = $request->user()->organization_id;

        $totalMessages = Message::whereHas('conversation.contact', function ($query) use ($organizationId) {
            $query->where('organization_id', $organizationId);
        })->count();

        $incomingMessages = Message::whereHas('conversation.contact', function ($query) use ($organizationId) {
            $query->where('organization_id', $organizationId);
        })->where('direction', 'incoming')->count();

        $outgoingMessages = Message::whereHas('conversation.contact', function ($query) use ($organizationId) {
            $query->where('organization_id', $organizationId);
        })->where('direction', 'outgoing')->count();

        return response()->json([
            'total' => $totalMessages,
            'incoming' => $incomingMessages,
            'outgoing' => $outgoingMessages,
            'ratio' => $incomingMessages > 0 ? round($outgoingMessages / $incomingMessages, 2) : 0,
        ]);
    }

    /**
     * Get recent activities for dashboard
     */
    public function activities(Request $request): JsonResponse
    {
        $organizationId = $request->user()->organization_id;
        $limit = $request->input('limit', 5);

        $activities = EventLog::where('organization_id', $organizationId)
            ->with('loggable')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn($log) => [
                'id' => $log->id,
                'type' => $log->event_type,
                'action' => $this->getActivityLabel($log->event_type),
                'metadata' => $log->metadata,
                'time' => $log->created_at->diffForHumans(),
                'created_at' => $log->created_at->toISOString(),
            ]);

        return response()->json($activities);
    }

    private function getArabicDayName(int $dayOfWeek): string
    {
        return match ($dayOfWeek) {
            0 => 'أحد',
            1 => 'إثنين',
            2 => 'ثلاثاء',
            3 => 'أربعاء',
            4 => 'خميس',
            5 => 'جمعة',
            6 => 'سبت',
            default => '',
        };
    }

    private function getActivityLabel(string $eventType): string
    {
        return match ($eventType) {
            'message_received' => 'تم استلام رسالة',
            'message_sent' => 'تم إرسال رسالة',
            'contact_created' => 'تم إنشاء جهة اتصال',
            'conversation_created' => 'بدأت محادثة جديدة',
            'broadcast_sent' => 'تم إرسال حملة',
            default => $eventType,
        };
    }
}
