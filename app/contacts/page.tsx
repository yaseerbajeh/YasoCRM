'use client';

import { useState } from 'react';
import { Search, Plus, Phone, Mail, Tag } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';

export default function Contacts() {
    const [searchQuery, setSearchQuery] = useState('');

    const contacts = [
        { id: 1, name: 'فاطمة علي', phone: '+966 55 123 4567', email: 'fatima@example.com', tags: ['عميل مهم'] },
        { id: 2, name: 'خالد الغامدي', phone: '+966 50 987 6543', email: 'khaled@example.com', tags: ['عميل محتمل'] },
        { id: 3, name: 'نورة عبدالله', phone: '+966 54 456 7890', email: 'noura@example.com', tags: ['دعم فني'] },
    ];

    return (
        <div className="flex h-screen w-full bg-slate-50">
            <Sidebar />

            <main className="flex h-full flex-1 flex-col">
                <TopNavbar />

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">جهات الاتصال</h1>
                            <p className="mt-2 text-slate-600">إدارة جميع جهات الاتصال والعملاء</p>
                        </div>
                        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700">
                            <Plus className="size-5" />
                            إضافة جهة اتصال
                        </button>
                    </div>

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
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-slate-200 bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">الاسم</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">رقم الهاتف</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">البريد الإلكتروني</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">الوسوم</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {contacts.map((contact) => (
                                        <tr key={contact.id} className="transition-colors hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-full bg-blue-100"></div>
                                                    <span className="font-medium text-slate-900">{contact.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <Phone className="size-4" />
                                                    {contact.phone}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <Mail className="size-4" />
                                                    {contact.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    {contact.tags.map((tag, i) => (
                                                        <span
                                                            key={i}
                                                            className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                                                        >
                                                            <Tag className="size-3" />
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                                    عرض التفاصيل
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
