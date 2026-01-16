'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Plus, MoreHorizontal, X, RefreshCw, Edit2, Trash2 } from 'lucide-react';
import { api, endpoints } from '@/lib/api';

interface Contact {
    id: number;
    name: string | null;
    phone_number: string;
    email: string | null;
    avatar_url: string | null;
    created_at: string;
    tags?: string[];
}

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [newContact, setNewContact] = useState({ name: '', phone_number: '', email: '' });
    const [saving, setSaving] = useState(false);
    const [activeMenu, setActiveMenu] = useState<number | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalContacts, setTotalContacts] = useState(0);
    const perPage = 20;

    const fetchContacts = async (page: number = 1) => {
        setLoading(true);
        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('limit', perPage.toString());
        if (searchQuery) params.set('search', searchQuery);

        const { data: response, error } = await api.get<{ data: Contact[]; total: number; page: number } | Contact[]>(
            `${endpoints.dev.contacts}?${params.toString()}`
        );

        if (error) {
            setContacts(getMockContacts());
            setTotalContacts(0);
        } else if (response) {
            if (Array.isArray(response)) {
                setContacts(response);
                setTotalContacts(response.length);
            } else {
                setContacts(response.data || []);
                setTotalContacts(response.total || 0);
                setCurrentPage(response.page || 1);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchContacts(currentPage);
    }, [searchQuery, currentPage]);

    const handleAddContact = async () => {
        if (!newContact.phone_number) return;

        setSaving(true);
        const { data, error } = await api.post<Contact>(endpoints.contacts, newContact);

        if (!error && data) {
            setContacts(prev => [data, ...prev]);
            setNewContact({ name: '', phone_number: '', email: '' });
            setShowAddModal(false);
        }
        setSaving(false);
    };

    const handleUpdateContact = async () => {
        if (!editingContact) return;

        setSaving(true);
        const { data, error } = await api.put<Contact>(
            endpoints.contact(editingContact.id),
            { name: editingContact.name, email: editingContact.email }
        );

        if (!error && data) {
            setContacts(prev => prev.map(c => c.id === data.id ? data : c));
            setEditingContact(null);
        }
        setSaving(false);
    };

    const handleDeleteContact = async (id: number) => {
        const { error } = await api.delete(endpoints.contact(id));
        if (!error) {
            setContacts(prev => prev.filter(c => c.id !== id));
        }
        setActiveMenu(null);
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('ar-SA');
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">جهات الاتصال</h1>
                    <p className="text-gray-500 mt-1">إدارة قائمة العملاء وجهات الاتصال</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                    <Plus size={20} />
                    <span>جهة اتصال جديدة</span>
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="بحث عن جهة اتصال..."
                            className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                        />
                    </div>
                    <button
                        onClick={() => fetchContacts(currentPage)}
                        className="flex items-center gap-2 text-gray-600 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Filter size={18} />
                        <span className="text-sm">تصفية</span>
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <RefreshCw className="animate-spin text-gray-400" size={32} />
                    </div>
                ) : (
                    <table className="w-full text-right">
                        <thead className="bg-gray-50 text-gray-500 text-sm font-medium">
                            <tr>
                                <th className="px-6 py-3 font-medium">الاسم</th>
                                <th className="px-6 py-3 font-medium">رقم الهاتف</th>
                                <th className="px-6 py-3 font-medium">البريد الإلكتروني</th>
                                <th className="px-6 py-3 font-medium">تاريخ الإضافة</th>
                                <th className="px-6 py-3 font-medium"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {contacts.map((contact) => (
                                <tr key={contact.id} className="hover:bg-gray-50 group transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={contact.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name || contact.phone_number)}&background=10B981&color=fff`}
                                                className="w-10 h-10 rounded-full object-cover"
                                                alt=""
                                            />
                                            <div className="font-semibold text-gray-800">
                                                {contact.name || 'غير معروف'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dir-ltr text-right">{contact.phone_number}</td>
                                    <td className="px-6 py-4 text-gray-600">{contact.email || '-'}</td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">{formatDate(contact.created_at)}</td>
                                    <td className="px-6 py-4 text-left relative">
                                        <button
                                            onClick={() => setActiveMenu(activeMenu === contact.id ? null : contact.id)}
                                            className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"
                                        >
                                            <MoreHorizontal size={20} />
                                        </button>
                                        {activeMenu === contact.id && (
                                            <div className="absolute left-4 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
                                                <button
                                                    onClick={() => { setEditingContact(contact); setActiveMenu(null); }}
                                                    className="w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                    <Edit2 size={14} />
                                                    تعديل
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteContact(contact.id)}
                                                    className="w-full px-4 py-2 text-right text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                >
                                                    <Trash2 size={14} />
                                                    حذف
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                {totalContacts > perPage && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <div className="text-sm text-gray-500">
                            عرض {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, totalContacts)} من {totalContacts} جهة اتصال
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                السابق
                            </button>
                            {Array.from({ length: Math.min(5, Math.ceil(totalContacts / perPage)) }, (_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-1 text-sm rounded ${currentPage === pageNum
                                            ? 'bg-green-600 text-white'
                                            : 'border border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            {Math.ceil(totalContacts / perPage) > 5 && (
                                <span className="text-gray-400">...</span>
                            )}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalContacts / perPage), p + 1))}
                                disabled={currentPage >= Math.ceil(totalContacts / perPage)}
                                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                التالي
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Contact Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                            <h2 className="text-xl font-bold text-gray-800">جهة اتصال جديدة</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">الاسم</label>
                                <input
                                    type="text"
                                    value={newContact.name}
                                    onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">رقم الهاتف *</label>
                                <input
                                    type="tel"
                                    value={newContact.phone_number}
                                    onChange={(e) => setNewContact(prev => ({ ...prev, phone_number: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dir-ltr text-right focus:ring-2 focus:ring-green-500 outline-none"
                                    placeholder="+966..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">البريد الإلكتروني</label>
                                <input
                                    type="email"
                                    value={newContact.email}
                                    onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
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
                                onClick={handleAddContact}
                                disabled={saving || !newContact.phone_number}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving && <RefreshCw size={16} className="animate-spin" />}
                                إضافة
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Contact Modal */}
            {editingContact && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <button onClick={() => setEditingContact(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                            <h2 className="text-xl font-bold text-gray-800">تعديل جهة الاتصال</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">الاسم</label>
                                <input
                                    type="text"
                                    value={editingContact.name || ''}
                                    onChange={(e) => setEditingContact(prev => prev ? { ...prev, name: e.target.value } : null)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">البريد الإلكتروني</label>
                                <input
                                    type="email"
                                    value={editingContact.email || ''}
                                    onChange={(e) => setEditingContact(prev => prev ? { ...prev, email: e.target.value } : null)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setEditingContact(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleUpdateContact}
                                disabled={saving}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving && <RefreshCw size={16} className="animate-spin" />}
                                حفظ التغييرات
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function getMockContacts(): Contact[] {
    return [
        { id: 1, name: 'أحمد علي', phone_number: '+966 50 123 4567', email: 'ahmed@example.com', avatar_url: null, created_at: '2024-01-15', tags: ['عميل جديد'] },
        { id: 2, name: 'سارة محمد', phone_number: '+966 55 987 6543', email: 'sara@example.com', avatar_url: null, created_at: '2024-01-14', tags: ['مهتم'] },
        { id: 3, name: 'شركة التقنية', phone_number: '+966 54 111 2222', email: 'tech@company.com', avatar_url: null, created_at: '2024-01-13', tags: ['شركات'] },
    ];
}
