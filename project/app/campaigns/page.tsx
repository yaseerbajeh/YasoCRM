'use client';

import { useState, useEffect } from 'react';
import { Send, Plus, BarChart2, CheckCircle, Clock, AlertCircle, X, RefreshCw } from 'lucide-react';
import { api, endpoints } from '@/lib/api';

interface Campaign {
    id: number;
    name: string;
    status: 'draft' | 'scheduled' | 'processing' | 'completed' | 'failed';
    total_recipients: number;
    sent_count: number;
    failed_count: number;
    scheduled_at: string | null;
    created_at: string;
}

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newCampaign, setNewCampaign] = useState({
        name: '',
        message: '',
    });

    const fetchCampaigns = async () => {
        setLoading(true);
        const { data, error } = await api.get<Campaign[]>(endpoints.dev.broadcasts);

        if (error) {
            setCampaigns(getMockCampaigns());
        } else if (data) {
            setCampaigns(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const handleCreateCampaign = async () => {
        if (!newCampaign.name || !newCampaign.message) return;

        setSaving(true);
        const { data, error } = await api.post<{ id: number }>(endpoints.broadcasts, newCampaign);

        if (!error && data) {
            await fetchCampaigns();
            setNewCampaign({ name: '', message: '' });
            setShowAddModal(false);
        }
        setSaving(false);
    };

    const handleSendCampaign = async (id: number) => {
        const { error } = await api.post(endpoints.sendBroadcast(id), {});
        if (!error) {
            await fetchCampaigns();
        }
    };

    const formatDate = (dateString: string | null): string => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('ar-SA');
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium border border-green-100"><CheckCircle size={12} /> مكتملة</span>;
            case 'scheduled':
                return <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium border border-blue-100"><Clock size={12} /> مجدولة</span>;
            case 'processing':
                return <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium border border-yellow-100"><RefreshCw size={12} className="animate-spin" /> جاري الإرسال</span>;
            case 'failed':
                return <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2 py-1 rounded-full text-xs font-medium border border-red-100"><AlertCircle size={12} /> فشلت</span>;
            default:
                return <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium border border-gray-200"><AlertCircle size={12} /> مسودة</span>;
        }
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">الحملات الإعلانية</h1>
                    <p className="text-gray-500 mt-1">إرسال رسائل جماعية وإدارة الحملات</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchCampaigns}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin text-gray-400' : 'text-gray-600'} />
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                        <Plus size={20} />
                        <span>حملة جديدة</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="font-bold text-gray-800">آخر الحملات</h3>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <RefreshCw className="animate-spin text-gray-400" size={32} />
                        </div>
                    ) : (
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 text-gray-500 text-sm">
                                <tr>
                                    <th className="px-6 py-3 font-medium">اسم الحملة</th>
                                    <th className="px-6 py-3 font-medium">الحالة</th>
                                    <th className="px-6 py-3 font-medium">المرسلة</th>
                                    <th className="px-6 py-3 font-medium">التاريخ</th>
                                    <th className="px-6 py-3 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {campaigns.map((camp) => (
                                    <tr key={camp.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-800">{camp.name}</td>
                                        <td className="px-6 py-4">{getStatusBadge(camp.status)}</td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {camp.sent_count > 0 ? `${camp.sent_count}/${camp.total_recipients}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {formatDate(camp.scheduled_at || camp.created_at)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {camp.status === 'draft' && (
                                                <button
                                                    onClick={() => handleSendCampaign(camp.id)}
                                                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                                                >
                                                    إرسال
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Send size={20} /></div>
                            <h3 className="font-bold text-gray-800">رصيد الرسائل</h3>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">12,450</div>
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                            <div className="bg-blue-600 h-2 rounded-full w-[70%]"></div>
                        </div>
                        <p className="text-sm text-gray-500">تم استخدام 70% من الباقة الحالية</p>
                        <button className="mt-4 w-full py-2 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 text-sm font-medium transition-colors">
                            شحن الرصيد
                        </button>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                        <h3 className="font-bold text-lg mb-2">تحتاج مساعدة؟</h3>
                        <p className="text-green-100 text-sm mb-4">تعلم كيفية إنشاء حملات تسويقية ناجحة عبر واتساب مع دليلنا الشامل.</p>
                        <button className="bg-white text-green-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-50 transition-colors">
                            اقرأ الدليل
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Campaign Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                            <h2 className="text-xl font-bold text-gray-800">حملة جديدة</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">اسم الحملة *</label>
                                <input
                                    type="text"
                                    value={newCampaign.name}
                                    onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-green-500 outline-none"
                                    placeholder="مثال: عروض نهاية العام"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">نص الرسالة *</label>
                                <textarea
                                    value={newCampaign.message}
                                    onChange={(e) => setNewCampaign(prev => ({ ...prev, message: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-green-500 outline-none resize-none"
                                    rows={4}
                                    placeholder="اكتب رسالتك هنا..."
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleCreateCampaign}
                                disabled={saving || !newCampaign.name || !newCampaign.message}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving && <RefreshCw size={16} className="animate-spin" />}
                                إنشاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function getMockCampaigns(): Campaign[] {
    return [
        { id: 1, name: 'عروض بداية العام', status: 'completed', total_recipients: 1250, sent_count: 1250, failed_count: 0, scheduled_at: null, created_at: '2024-01-01' },
        { id: 2, name: 'تحديث سياسة الخصوصية', status: 'completed', total_recipients: 5000, sent_count: 4800, failed_count: 200, scheduled_at: null, created_at: '2023-12-25' },
        { id: 3, name: 'خصم الباقة الذهبية', status: 'scheduled', total_recipients: 2000, sent_count: 0, failed_count: 0, scheduled_at: '2024-01-20', created_at: '2024-01-10' },
        { id: 4, name: 'استبيان رضا العملاء', status: 'draft', total_recipients: 0, sent_count: 0, failed_count: 0, scheduled_at: null, created_at: '2024-01-15' },
    ];
}
