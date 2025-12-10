'use client';

import { useState } from 'react';
import { Radio, Users, Send } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';

export default function Broadcasts() {
    const [message, setMessage] = useState('');

    const broadcasts = [
        { id: 1, title: 'عرض نهاية الأسبوع', recipients: 234, sent: '2024-01-15', status: 'مكتمل' },
        { id: 2, title: 'إطلاق منتج جديد', recipients: 567, sent: '2024-01-10', status: 'مكتمل' },
        { id: 3, title: 'تحديث الخدمة', recipients: 123, sent: '2024-01-05', status: 'مكتمل' },
    ];

    return (
        <div className="flex h-screen w-full bg-slate-50">
            <Sidebar />

            <main className="flex h-full flex-1 flex-col">
                <TopNavbar />

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">الرسائل الجماعية</h1>
                        <p className="mt-2 text-slate-600">إرسال رسائل جماعية لعملائك</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <div className="rounded-xl bg-white p-6 shadow-sm">
                                <h3 className="mb-4 text-lg font-bold text-slate-900">إنشاء رسالة جماعية جديدة</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-700">
                                            عنوان الحملة
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="مثال: عرض نهاية الأسبوع"
                                            className="h-12 w-full rounded-lg border border-slate-200 px-4 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-700">
                                            الرسالة
                                        </label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="اكتب رسالتك هنا..."
                                            rows={6}
                                            className="w-full rounded-lg border border-slate-200 p-4 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <p className="mt-2 text-sm text-slate-500">{message.length} / 1000 حرف</p>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-700">
                                            اختر المستلمين
                                        </label>
                                        <select className="h-12 w-full rounded-lg border border-slate-200 px-4 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option>جميع جهات الاتصال</option>
                                            <option>العملاء المهمين</option>
                                            <option>العملاء المحتملين</option>
                                            <option>الدعم الفني</option>
                                        </select>
                                    </div>

                                    <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700">
                                        <Send className="size-5" />
                                        إرسال الرسالة الجماعية
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="rounded-xl bg-white p-6 shadow-sm">
                                <h3 className="mb-4 text-lg font-bold text-slate-900">الإحصائيات</h3>
                                <div className="space-y-4">
                                    <div className="rounded-lg bg-blue-50 p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-600">
                                                <Users className="size-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-600">إجمالي المستلمين</p>
                                                <p className="text-2xl font-bold text-slate-900">1,234</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-lg bg-green-50 p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-10 items-center justify-center rounded-lg bg-green-600">
                                                <Radio className="size-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-600">الحملات المرسلة</p>
                                                <p className="text-2xl font-bold text-slate-900">45</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 rounded-xl bg-white shadow-sm">
                        <div className="border-b border-slate-200 p-6">
                            <h3 className="text-lg font-bold text-slate-900">سجل الرسائل الجماعية</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-slate-200 bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">العنوان</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">المستلمين</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">تاريخ الإرسال</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {broadcasts.map((broadcast) => (
                                        <tr key={broadcast.id} className="transition-colors hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium text-slate-900">{broadcast.title}</td>
                                            <td className="px-6 py-4 text-slate-600">{broadcast.recipients}</td>
                                            <td className="px-6 py-4 text-slate-600">{broadcast.sent}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                                                    {broadcast.status}
                                                </span>
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
