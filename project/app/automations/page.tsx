'use client';

import { useState, useEffect } from 'react';
import { Zap, Plus, MoreHorizontal, Power, GitBranch, X, RefreshCw, Play, Pause, Trash2 } from 'lucide-react';
import { api, endpoints } from '@/lib/api';

interface Automation {
    id: number;
    name: string;
    trigger: string;
    trigger_type: string;
    trigger_value: string | null;
    steps: number;
    status: 'active' | 'paused';
    runs: number;
}

export default function AutomationsPage() {
    const [automations, setAutomations] = useState<Automation[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeMenu, setActiveMenu] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [newAutomation, setNewAutomation] = useState({
        name: '',
        trigger_type: 'new_message',
        trigger_value: '',
    });

    const fetchAutomations = async () => {
        setLoading(true);
        const { data, error } = await api.get<Automation[]>(endpoints.dev.automations);

        if (error) {
            setAutomations(getMockAutomations());
        } else if (data) {
            setAutomations(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAutomations();
    }, []);

    const handleToggleStatus = async (id: number) => {
        const { data, error } = await api.patch<{ id: number; status: string }>(
            endpoints.toggleAutomation(id),
            {}
        );

        if (!error && data) {
            setAutomations(prev => prev.map(auto =>
                auto.id === id ? { ...auto, status: data.status as 'active' | 'paused' } : auto
            ));
        }
        setActiveMenu(null);
    };

    const handleDelete = async (id: number) => {
        const { error } = await api.delete(endpoints.automation(id));
        if (!error) {
            setAutomations(prev => prev.filter(auto => auto.id !== id));
        }
        setActiveMenu(null);
    };

    const handleCreateAutomation = async () => {
        if (!newAutomation.name) return;

        setSaving(true);
        const { data, error } = await api.post<{ id: number; name: string }>(endpoints.automations, {
            ...newAutomation,
            steps: [{
                action_type: 'send_message',
                action_config: { message: 'مرحباً! كيف يمكنني مساعدتك؟' }
            }]
        });

        if (!error && data) {
            await fetchAutomations();
            setNewAutomation({ name: '', trigger_type: 'new_message', trigger_value: '' });
            setShowAddModal(false);
        }
        setSaving(false);
    };

    const triggerTypes = [
        { value: 'new_message', label: 'رسالة جديدة' },
        { value: 'keyword', label: 'كلمة مفتاحية' },
        { value: 'time_delay', label: 'تأخير زمني' },
        { value: 'conversation_end', label: 'انتهاء المحادثة' },
        { value: 'new_contact', label: 'جهة اتصال جديدة' },
    ];

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">الأتمتة (Chatbots)</h1>
                    <p className="text-gray-500 mt-1">بناء تدفقات رد آلي ذكية</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchAutomations}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin text-gray-400' : 'text-gray-600'} />
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                        <Plus size={20} />
                        <span>أتمتة جديدة</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <RefreshCw className="animate-spin text-gray-400" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {automations.map((auto) => (
                        <div key={auto.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow group relative">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-lg ${auto.status === 'active' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
                                    <Zap size={24} />
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => setActiveMenu(activeMenu === auto.id ? null : auto.id)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <MoreHorizontal />
                                    </button>
                                    {activeMenu === auto.id && (
                                        <div className="absolute left-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[140px]">
                                            <button
                                                onClick={() => handleToggleStatus(auto.id)}
                                                className="w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                {auto.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                                                {auto.status === 'active' ? 'إيقاف' : 'تفعيل'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(auto.id)}
                                                className="w-full px-4 py-2 text-right text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <Trash2 size={14} />
                                                حذف
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <h3 className="font-bold text-gray-900 text-lg mb-2">{auto.name}</h3>

                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Power size={14} className="text-gray-400" />
                                    <span>المشغل: <span className="font-medium text-gray-900">{auto.trigger}</span></span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <GitBranch size={14} className="text-gray-400" />
                                    <span>الخطوات: <span className="font-medium text-gray-900">{auto.steps}</span></span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2.5 h-2.5 rounded-full ${auto.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                    <span className="text-sm text-gray-500 font-medium">{auto.status === 'active' ? 'نشط' : 'متوقف'}</span>
                                </div>
                                <span className="text-sm text-gray-400">{auto.runs} تشغيل</span>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all min-h-[250px]"
                    >
                        <Plus size={48} className="mb-4 opacity-50" />
                        <span className="font-bold text-lg">إنشاء أتمتة جديدة</span>
                    </button>
                </div>
            )}

            {/* Add Automation Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                            <h2 className="text-xl font-bold text-gray-800">أتمتة جديدة</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">اسم الأتمتة *</label>
                                <input
                                    type="text"
                                    value={newAutomation.name}
                                    onChange={(e) => setNewAutomation(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-green-500 outline-none"
                                    placeholder="مثال: ترحيب العملاء الجدد"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">نوع المشغل</label>
                                <select
                                    value={newAutomation.trigger_type}
                                    onChange={(e) => setNewAutomation(prev => ({ ...prev, trigger_type: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-green-500 outline-none"
                                >
                                    {triggerTypes.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            {newAutomation.trigger_type === 'keyword' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 text-right">الكلمة المفتاحية</label>
                                    <input
                                        type="text"
                                        value={newAutomation.trigger_value}
                                        onChange={(e) => setNewAutomation(prev => ({ ...prev, trigger_value: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-green-500 outline-none"
                                        placeholder="مثال: سعر"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleCreateAutomation}
                                disabled={saving || !newAutomation.name}
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

function getMockAutomations(): Automation[] {
    return [
        { id: 1, name: 'ترحيب العملاء الجدد', trigger: 'رسالة جديدة', trigger_type: 'new_message', trigger_value: null, steps: 3, status: 'active', runs: 1250 },
        { id: 2, name: 'تذكير السلة المتروكة', trigger: 'مرور 30 دقيقة', trigger_type: 'time_delay', trigger_value: '30', steps: 2, status: 'active', runs: 450 },
        { id: 3, name: 'جمع التقييمات', trigger: 'انتهاء المحادثة', trigger_type: 'conversation_end', trigger_value: null, steps: 4, status: 'paused', runs: 890 },
        { id: 4, name: 'تحويل للمبيعات', trigger: 'الكلمة المفتاحية "سعر"', trigger_type: 'keyword', trigger_value: 'سعر', steps: 1, status: 'active', runs: 210 },
    ];
}
