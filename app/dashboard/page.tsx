'use client';

import { useEffect, useState } from 'react';
import { Users, MessageSquare, TrendingUp, Clock } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';

export default function Dashboard() {
    const stats = [
        {
            title: 'إجمالي جهات الاتصال',
            value: '1,234',
            icon: Users,
            change: '+12%',
            positive: true,
        },
        {
            title: 'المحادثات النشطة',
            value: '89',
            icon: MessageSquare,
            change: '+5%',
            positive: true,
        },
        {
            title: 'معدل الاستجابة',
            value: '94%',
            icon: TrendingUp,
            change: '+2%',
            positive: true,
        },
        {
            title: 'متوسط وقت الرد',
            value: '2.5 د',
            icon: Clock,
            change: '-8%',
            positive: true,
        },
    ];

    return (
        <div className="flex h-screen w-full bg-slate-50">
            <Sidebar />

            <main className="flex h-full flex-1 flex-col">
                <TopNavbar />

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">لوحة التحكم</h1>
                        <p className="mt-2 text-slate-600">نظرة عامة على أداء نظام إدارة العملاء</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={index}
                                    className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex size-12 items-center justify-center rounded-lg bg-blue-50">
                                            <Icon className="size-6 text-blue-600" />
                                        </div>
                                        <span
                                            className={`text-sm font-medium ${stat.positive ? 'text-green-600' : 'text-red-600'
                                                }`}
                                        >
                                            {stat.change}
                                        </span>
                                    </div>
                                    <h3 className="mt-4 text-sm font-medium text-slate-600">{stat.title}</h3>
                                    <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900">المحادثات الأخيرة</h3>
                            <div className="mt-4 space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-4 rounded-lg border border-slate-200 p-4">
                                        <div className="size-10 rounded-full bg-blue-100"></div>
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-900">عميل {i}</p>
                                            <p className="text-sm text-slate-500">آخر رسالة منذ {i * 5} دقائق</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900">الإجراءات السريعة</h3>
                            <div className="mt-4 space-y-3">
                                <button className="w-full rounded-lg bg-blue-600 px-4 py-3 text-right font-medium text-white transition-colors hover:bg-blue-700">
                                    إرسال رسالة جماعية
                                </button>
                                <button className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-right font-medium text-slate-900 transition-colors hover:bg-slate-50">
                                    إضافة جهة اتصال جديدة
                                </button>
                                <button className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-right font-medium text-slate-900 transition-colors hover:bg-slate-50">
                                    إنشاء قالب رسالة
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
