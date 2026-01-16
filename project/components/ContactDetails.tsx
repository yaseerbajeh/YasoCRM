'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Calendar, Phone, Mail, Tag, DollarSign, Briefcase, Save, RefreshCw } from 'lucide-react';
import { api, endpoints } from '@/lib/api';

interface Contact {
    id: number;
    name: string | null;
    phone_number: string;
    email: string | null;
    avatar_url: string | null;
    custom_fields: Record<string, unknown> | null;
    created_at: string;
}

interface Conversation {
    id: number;
    contact: Contact;
    status: string;
}

interface ContactDetailsProps {
    conversation?: Conversation | null;
    onContactUpdated?: () => void;
}

export default function ContactDetails({ conversation, onContactUpdated }: ContactDetailsProps) {
    const [contact, setContact] = useState<Contact | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', email: '' });
    const [notes, setNotes] = useState('العميل مهتم بالباقة الذهبية، طلب عرض سعر محدث يشمل الضرائب.');

    useEffect(() => {
        if (conversation?.contact) {
            setContact(conversation.contact);
            setEditForm({
                name: conversation.contact.name || '',
                email: conversation.contact.email || '',
            });
        } else {
            setContact(null);
        }
    }, [conversation]);

    const handleSaveContact = async () => {
        if (!contact?.id) return;

        setSaving(true);

        const { data, error } = await api.put<Contact>(
            endpoints.contact(contact.id),
            editForm
        );

        if (!error && data) {
            setContact(data);
            setIsEditing(false);
            onContactUpdated?.();
        }

        setSaving(false);
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getAvatarUrl = (): string => {
        return contact?.avatar_url ||
            'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=200';
    };

    if (!conversation || !contact) {
        return (
            <div className="w-80 bg-white border-r border-gray-300 flex flex-col h-full overflow-y-auto items-center justify-center">
                <div className="text-gray-400 text-center p-8">
                    <Phone size={48} className="mx-auto mb-4 opacity-50" />
                    <p>اختر محادثة لعرض التفاصيل</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-80 bg-white border-r border-gray-300 flex flex-col h-full overflow-y-auto">
            <div className="flex flex-col items-center py-8 px-4 border-b border-gray-100 bg-gray-50/50">
                <div className="relative mb-4">
                    <img
                        src={getAvatarUrl()}
                        alt={contact.name || 'Contact'}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                    />
                    <span className={`absolute bottom-1 right-1 w-5 h-5 border-2 border-white rounded-full ${conversation.status === 'open' ? 'bg-green-500' : 'bg-gray-400'
                        }`}></span>
                </div>
                {isEditing ? (
                    <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="text-lg font-bold text-gray-900 text-center bg-white border border-gray-300 rounded px-2 py-1 w-full max-w-[200px]"
                    />
                ) : (
                    <h2 className="text-lg font-bold text-gray-900">{contact.name || 'غير معروف'}</h2>
                )}
                <span className="text-sm text-gray-500 mt-1">عميل</span>
            </div>

            <div className="px-6 py-6 border-b border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 text-right">
                    معلومات الاتصال
                </h3>
                <div className="space-y-4 text-right">
                    <div className="flex items-center gap-3 justify-end group cursor-pointer">
                        <div className="text-right">
                            <p className="text-sm text-gray-900 font-semibold group-hover:text-green-600 transition-colors dir-ltr">
                                {contact.phone_number}
                            </p>
                            <p className="text-[10px] text-gray-400">الجوال</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                            <Phone size={14} />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 justify-end group cursor-pointer">
                        <div className="text-right">
                            {isEditing ? (
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                    className="text-sm text-gray-900 font-semibold bg-white border border-gray-300 rounded px-2 py-1"
                                    placeholder="البريد الإلكتروني"
                                />
                            ) : (
                                <p className="text-sm text-gray-900 font-semibold group-hover:text-green-600 transition-colors">
                                    {contact.email || 'غير متوفر'}
                                </p>
                            )}
                            <p className="text-[10px] text-gray-400">البريد الإلكتروني</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                            <Mail size={14} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                        <DollarSign size={16} />
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">15,000 ر.س</p>
                        <p className="text-[10px] text-gray-500">قيمة الصفقة</p>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Briefcase size={16} />
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <p className="text-sm font-bold text-gray-900">عرض سعر</p>
                        </div>
                        <p className="text-[10px] text-gray-500">المرحلة الحالية</p>
                    </div>
                </div>
            </div>

            <div className="px-6 py-6 border-b border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 text-right">ملاحظات</h3>
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="text-sm text-gray-700 text-right leading-relaxed w-full bg-transparent resize-none outline-none"
                        rows={3}
                    />
                </div>
            </div>

            <div className="px-6 py-6">
                <div className="flex items-center gap-3 justify-end mb-4">
                    <div className="text-right">
                        <p className="text-sm text-gray-900">
                            {contact.created_at ? formatDate(contact.created_at) : 'غير متوفر'}
                        </p>
                        <p className="text-[10px] text-gray-500">تاريخ الإنشاء</p>
                    </div>
                    <Calendar size={16} className="text-gray-400" />
                </div>

                {isEditing ? (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={handleSaveContact}
                            disabled={saving}
                            className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                            حفظ
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="w-full py-2 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                    >
                        تعديل البيانات
                    </button>
                )}
            </div>
        </div>
    );
}
