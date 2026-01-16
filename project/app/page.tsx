'use client';

import { useState, useEffect } from 'react';
import { Users, MessageCircle, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Activity, RefreshCw } from 'lucide-react';
import { api, endpoints } from '@/lib/api';

interface SummaryData {
    active_conversations: { value: number; label: string };
    new_contacts: { value: number; change: number; label: string };
    messages_this_month: { value: number; change: number; label: string };
    total_contacts: { value: number; label: string };
}

interface ChartData {
    date: string;
    day: string;
    count: number;
}

interface ActivityData {
    id: number;
    type: string;
    action: string;
    time: string;
}

export default function DashboardPage() {
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [activities, setActivities] = useState<ActivityData[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        setLoading(true);

        // Fetch summary
        const { data: summaryData, error: summaryError } = await api.get<SummaryData>(endpoints.dev.analyticsSummary);
        if (summaryError) {
            setSummary(getMockSummary());
        } else if (summaryData) {
            setSummary(summaryData);
        }

        // Fetch chart data
        const { data: chartResult, error: chartError } = await api.get<ChartData[]>(endpoints.dev.analyticsConversations);
        if (chartError) {
            setChartData(getMockChartData());
        } else if (chartResult) {
            setChartData(chartResult);
        }

        // Fetch activities
        const { data: activitiesData, error: activitiesError } = await api.get<ActivityData[]>(endpoints.dev.analyticsActivities);
        if (activitiesError) {
            setActivities(getMockActivities());
        } else if (activitiesData) {
            setActivities(activitiesData);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const stats = summary ? [
        { label: summary.messages_this_month.label, value: summary.messages_this_month.value.toLocaleString(), change: `${summary.messages_this_month.change >= 0 ? '+' : ''}${summary.messages_this_month.change}%`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
        { label: summary.active_conversations.label, value: summary.active_conversations.value.toString(), change: '+5%', icon: MessageCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: summary.new_contacts.label, value: summary.new_contacts.value.toString(), change: `${summary.new_contacts.change >= 0 ? '+' : ''}${summary.new_contacts.change}%`, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
        { label: 'إجمالي جهات الاتصال', value: summary.total_contacts.value.toString(), change: '+0%', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100' },
    ] : [];

    const maxChartValue = Math.max(...chartData.map(d => d.count), 1);

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">لوحة القيادة</h1>
                    <p className="text-gray-500 mt-1">نظرة عامة على أداءك اليوم</p>
                </div>
                <button
                    onClick={fetchDashboardData}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin text-gray-400' : 'text-gray-600'} />
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <RefreshCw className="animate-spin text-gray-400" size={32} />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium mb-1">{stat.label}</p>
                                    <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                                    <div className="flex items-center gap-1 mt-2">
                                        {stat.change.startsWith('+') || stat.change.startsWith('-') ? (
                                            stat.change.startsWith('+') ?
                                                <ArrowUpRight size={16} className="text-green-500" /> :
                                                <ArrowDownRight size={16} className="text-red-500" />
                                        ) : null}
                                        <span className={`text-xs font-semibold ${stat.change.startsWith('+') ? 'text-green-600' : stat.change.startsWith('-') ? 'text-red-600' : 'text-gray-600'}`}>
                                            {stat.change}
                                        </span>
                                        <span className="text-xs text-gray-400">مقارنة بالشهر الماضي</span>
                                    </div>
                                </div>
                                <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                                    <stat.icon size={24} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-800">نشاط المحادثات</h2>
                                <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-1 outline-none focus:ring-2 focus:ring-green-500">
                                    <option>آخر 7 أيام</option>
                                    <option>آخر 30 يوم</option>
                                </select>
                            </div>
                            <div className="h-64 flex items-end justify-between px-2 gap-2">
                                {chartData.map((item, i) => (
                                    <div key={i} className="w-full flex flex-col items-center gap-2 group">
                                        <div className="relative w-full bg-gray-100 rounded-t-lg overflow-hidden h-full flex items-end">
                                            <div
                                                style={{ height: `${(item.count / maxChartValue) * 100}%` }}
                                                className="w-full bg-green-500 opacity-80 group-hover:opacity-100 transition-opacity rounded-t-lg min-h-[4px]"
                                            >
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400 font-medium">{item.day}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">أحدث النشاطات</h2>
                            <div className="space-y-6">
                                {activities.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                            <Activity size={18} className="text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-800 font-medium leading-none mb-1">
                                                {item.action}
                                            </p>
                                            <p className="text-xs text-gray-400">{item.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-6 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                                عرض كل النشاطات
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function getMockSummary(): SummaryData {
    return {
        active_conversations: { value: 124, label: 'المحادثات النشطة' },
        new_contacts: { value: 45, change: 18, label: 'جهات اتصال جديدة' },
        messages_this_month: { value: 54350, change: 12, label: 'إجمالي الرسائل' },
        total_contacts: { value: 1245, label: 'إجمالي جهات الاتصال' },
    };
}

function getMockChartData(): ChartData[] {
    return [
        { date: '2024-01-08', day: 'سبت', count: 40 },
        { date: '2024-01-09', day: 'أحد', count: 65 },
        { date: '2024-01-10', day: 'إثنين', count: 30 },
        { date: '2024-01-11', day: 'ثلاثاء', count: 80 },
        { date: '2024-01-12', day: 'أربعاء', count: 55 },
        { date: '2024-01-13', day: 'خميس', count: 90 },
        { date: '2024-01-14', day: 'جمعة', count: 45 },
    ];
}

function getMockActivities(): ActivityData[] {
    return [
        { id: 1, type: 'message_received', action: 'تم استلام رسالة من أحمد علي', time: 'منذ 5 د' },
        { id: 2, type: 'contact_created', action: 'تم إنشاء جهة اتصال جديدة', time: 'منذ 15 د' },
        { id: 3, type: 'message_sent', action: 'تم إرسال رسالة لخالد عمر', time: 'منذ 30 د' },
        { id: 4, type: 'conversation_created', action: 'بدأت محادثة جديدة', time: 'منذ 1 س' },
        { id: 5, type: 'broadcast_sent', action: 'تم إرسال حملة جماعية', time: 'منذ 2 س' },
    ];
}
