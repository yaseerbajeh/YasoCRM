'use client';

import { useState, useEffect } from 'react';
import { User, MessageSquare, Bell, Globe, Shield, ChevronLeft, Save, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { api, endpoints } from '@/lib/api';

interface UserProfile {
    id: number;
    name: string;
    email: string;
    job_title?: string;
    avatar_url?: string;
    organization?: {
        id: number;
        name: string;
    };
}

interface WhatsAppInstance {
    id: number;
    instance_name: string;
    status: string;
}

export default function SettingsPage() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', job_title: '' });
    const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
    const [syncing, setSyncing] = useState(false);

    const fetchProfile = async () => {
        setLoading(true);
        const { data, error } = await api.get<{ user: UserProfile }>(endpoints.me);

        if (!error && data?.user) {
            setUser(data.user);
            setFormData({
                name: data.user.name || '',
                email: data.user.email || '',
                job_title: data.user.job_title || '',
            });
        } else {
            // Mock data
            setUser({
                id: 1,
                name: 'محمد أحمد',
                email: 'mohamed@example.com',
                job_title: 'مدير المبيعات',
                organization: { id: 1, name: 'شركتي' },
            });
            setFormData({
                name: 'محمد أحمد',
                email: 'mohamed@example.com',
                job_title: 'مدير المبيعات',
            });
        }
        setLoading(false);
    };

    const fetchInstances = async () => {
        const { data } = await api.get<WhatsAppInstance[]>(endpoints.whatsappInstances);
        if (data) {
            setInstances(data);
        }
    };

    useEffect(() => {
        fetchProfile();
        fetchInstances();
    }, []);

    const handleSaveProfile = async () => {
        setSaving(true);
        setMessage(null);

        const { error } = await api.put<{ user: UserProfile }>(endpoints.updateProfile, formData);

        if (error) {
            setMessage({ type: 'error', text: 'فشل حفظ التغييرات: ' + error });
        } else {
            setMessage({ type: 'success', text: 'تم حفظ التغييرات بنجاح!' });
            await fetchProfile();
        }

        setSaving(false);
    };

    const handleSync = async () => {
        setSyncing(true);
        const { error } = await api.post(endpoints.syncTrigger, {});

        if (error) {
            setMessage({ type: 'error', text: 'فشل المزامنة: ' + error });
        } else {
            setMessage({ type: 'success', text: 'تمت المزامنة بنجاح!' });
        }

        setSyncing(false);
    };

    const navItems = [
        { icon: MessageSquare, label: 'ربط واتساب', active: false },
        { icon: Bell, label: 'الإشعارات', active: false },
        { icon: Globe, label: 'اللغة', active: false },
        { icon: Shield, label: 'الأمان', active: false },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <RefreshCw className="animate-spin text-gray-400" size={32} />
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">الإعدادات</h1>
                    <p className="text-gray-500 mt-1">إدارة حسابك وتفضيلاتك</p>
                </div>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span>{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm p-4 h-fit">
                    <nav className="space-y-2">
                        {navItems.map((item, i) => (
                            <button key={i} className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-600 text-right transition-colors group">
                                <ChevronLeft size={18} className="text-gray-300 group-hover:text-gray-400" />
                                <div className="flex items-center gap-3">
                                    <span className="font-medium">{item.label}</span>
                                    <item.icon size={20} />
                                </div>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-6 text-right">الملف الشخصي</h2>

                        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                            <div className="flex flex-col items-center gap-4">
                                <img
                                    src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=10B981&color=fff&size=128`}
                                    className="w-32 h-32 rounded-full border-4 border-gray-100 shadow-md object-cover"
                                    alt="Profile"
                                />
                                <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                                    تغيير الصورة
                                </button>
                            </div>

                            <div className="flex-1 w-full space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">الاسم الكامل</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-green-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">البريد الإلكتروني</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-green-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 text-right">المسمى الوظيفي</label>
                                    <input
                                        type="text"
                                        value={formData.job_title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-green-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-start mt-8">
                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                                حفظ التغييرات
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-6 text-right">ربط واتساب</h2>

                        <div className="space-y-4">
                            {instances.length > 0 ? (
                                instances.map((instance) => (
                                    <div key={instance.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${instance.status === 'connected'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            <span className={`w-2 h-2 rounded-full ${instance.status === 'connected' ? 'bg-green-500' : 'bg-gray-400'
                                                }`}></span>
                                            {instance.status === 'connected' ? 'متصل' : 'غير متصل'}
                                        </span>
                                        <span className="font-medium text-gray-800">{instance.instance_name}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>لا توجد حسابات واتساب مربوطة</p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleSync}
                                disabled={syncing}
                                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                            >
                                {syncing ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                                مزامنة المحادثات
                            </button>
                            <button className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                                <MessageSquare size={18} />
                                ربط حساب جديد
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
