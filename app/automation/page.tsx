'use client';

import { useState } from 'react';
import { Bot, Plus, Zap, Clock } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';

export default function Automation() {
    const automations = [
        {
            id: 1,
            name: 'رد تلقائي للرسائل الواردة',
            trigger: 'رسالة جديدة',
            action: 'إرسال رد تلقائي',
            status: 'نشط',
            executions: 234,
        },
        {
            id: 2,
            name: 'تصنيف العملاء الجدد',
            trigger: 'جهة اتصال جديدة',
            action: 'إضافة وسم',
            status: 'نشط',
            executions: 89,
        },
        {
            id: 3,
            name: 'متابعة العملاء غير النشطين',
            trigger: 'عدم نشاط لمدة 7 أيام',
            action: 'إرسال رسالة متابعة',
            status: 'متوقف',
            executions: 45,
        },
    ];

    return (
        <div className="flex h-screen w-full bg-slate-50">
            <Sidebar />

            <main className="flex h-full flex-1 flex-col">
                <TopNavbar />

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">الأتمتة</h1>
                            <p className="mt-2 text-slate-600">إنشاء وإدارة قواعد الأتمتة</p>
                        </div>
                        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700">
                            <Plus className="size-5" />
                            إنشاء قاعدة جديدة
                        </button>
                    </div>

                    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex size-12 items-center justify-center rounded-lg bg-blue-50">
                                    <Bot className="size-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">القواعد النشطة</p>
                                    <p className="text-2xl font-bold text-slate-900">12</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex size-12 items-center justify-center rounded-lg bg-green-50">
                                    <Zap className="size-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">التنفيذات اليوم</p>
                                    <p className="text-2xl font-bold text-slate-900">368</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex size-12 items-center justify-center rounded-lg bg-purple-50">
                                    <Clock className="size-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">الوقت الموفر</p>
                                    <p className="text-2xl font-bold text-slate-900">24 س</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white shadow-sm">
                        <div className="border-b border-slate-200 p-6">
                            <h3 className="text-lg font-bold text-slate-900">قواعد الأتمتة</h3>
                        </div>
                        <div className="divide-y divide-slate-200">
                            {automations.map((automation) => (
                                <div key={automation.id} className="p-6 transition-colors hover:bg-slate-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50">
                                                    <Bot className="size-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-slate-900">{automation.name}</h4>
                                                    <p className="mt-1 text-sm text-slate-600">
                                                        المحفز: {automation.trigger} → الإجراء: {automation.action}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-left">
                                                <p className="text-sm text-slate-600">التنفيذات</p>
                                                <p className="text-lg font-bold text-slate-900">{automation.executions}</p>
                                            </div>

                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${automation.status === 'نشط'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-slate-100 text-slate-800'
                                                    }`}
                                            >
                                                {automation.status}
                                            </span>

                                            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                                تعديل
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 p-8">
                        <div className="flex items-center gap-4">
                            <div className="flex size-16 items-center justify-center rounded-full bg-white shadow-sm">
                                <Bot className="size-8 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-900">ابدأ بالأتمتة الذكية</h3>
                                <p className="mt-2 text-slate-600">
                                    وفر الوقت وحسّن تجربة العملاء من خلال إنشاء قواعد أتمتة مخصصة
                                </p>
                            </div>
                            <button className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700">
                                تعلم المزيد
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
