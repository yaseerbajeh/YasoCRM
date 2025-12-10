'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Phone, Mail, Tag, CheckCircle, XCircle } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Contacts() {
    const [searchQuery, setSearchQuery] = useState('');
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        phone_number: '',
        email: '',
    });

    // Fetch contacts from database
    const fetchContacts = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/test/contacts`);
            setContacts(response.data);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            showNotification('Failed to load contacts', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Load contacts on mount
    useEffect(() => {
        fetchContacts();
    }, []);

    // Show notification
    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/api/test/contacts`, formData);

            if (response.data.success) {
                showNotification('✅ Contact saved to database!', 'success');
                setFormData({ name: '', phone_number: '', email: '' });
                setShowAddForm(false);
                fetchContacts(); // Reload contacts
            }
        } catch (error: any) {
            console.error('Error creating contact:', error);
            showNotification('❌ Failed to save contact', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-slate-50">
            <Sidebar />

            <main className="flex h-full flex-1 flex-col">
                <TopNavbar />

                <div className="flex-1 overflow-y-auto p-8">
                    {/* Notification */}
                    {notification.show && (
                        <div className={`mb-4 rounded-lg p-4 ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            <div className="flex items-center gap-2">
                                {notification.type === 'success' ? <CheckCircle className="size-5" /> : <XCircle className="size-5" />}
                                <span className="font-medium">{notification.message}</span>
                            </div>
                        </div>
                    )}

                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">جهات الاتصال</h1>
                            <p className="mt-2 text-slate-600">إدارة جميع جهات الاتصال والعملاء ({contacts.length} جهة اتصال)</p>
                        </div>
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            <Plus className="size-5" />
                            إضافة جهة اتصال
                        </button>
                    </div>

                    {/* Add Contact Form */}
                    {showAddForm && (
                        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-bold text-slate-900">إضافة جهة اتصال جديدة</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-700">الاسم *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="مثال: أحمد محمد"
                                            className="h-12 w-full rounded-lg border border-slate-200 px-4 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-700">رقم الهاتف *</label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone_number}
                                            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                            placeholder="+966 50 123 4567"
                                            className="h-12 w-full rounded-lg border border-slate-200 px-4 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-700">البريد الإلكتروني</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="example@email.com"
                                            className="h-12 w-full rounded-lg border border-slate-200 px-4 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-blue-300"
                                    >
                                        {loading ? 'جاري الحفظ...' : 'حفظ في قاعدة البيانات'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddForm(false)}
                                        className="rounded-lg border border-slate-200 bg-white px-6 py-3 font-medium text-slate-900 transition-colors hover:bg-slate-50"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="ابحث عن جهة اتصال..."
                                className="h-12 w-full rounded-lg border border-slate-200 bg-white pr-12 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="rounded-xl bg-white shadow-sm">
                        {loading && contacts.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">جاري التحميل...</div>
                        ) : contacts.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">لا توجد جهات اتصال. أضف جهة اتصال جديدة!</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="border-b border-slate-200 bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">الاسم</th>
                                            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">رقم الهاتف</th>
                                            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">البريد الإلكتروني</th>
                                            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">تاريخ الإضافة</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {contacts
                                            .filter((contact: any) =>
                                                contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                contact.phone_number?.includes(searchQuery)
                                            )
                                            .map((contact: any) => (
                                                <tr key={contact.id} className="transition-colors hover:bg-slate-50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                                <span className="font-bold text-blue-600">{contact.name?.charAt(0) || '?'}</span>
                                                            </div>
                                                            <span className="font-medium text-slate-900">{contact.name || 'بدون اسم'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-slate-600">
                                                            <Phone className="size-4" />
                                                            {contact.phone_number}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-slate-600">
                                                            <Mail className="size-4" />
                                                            {contact.email || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        {new Date(contact.created_at).toLocaleDateString('ar-SA')}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
