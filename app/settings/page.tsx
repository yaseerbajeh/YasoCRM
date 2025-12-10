'use client';

import { useState } from 'react';
import { User, Bell, Shield, Smartphone, Save } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';

export default function Settings() {
    const [activeSection, setActiveSection] = useState('profile');

    const sections = [
        { id: 'profile', icon: User, label: 'الملف الشخصي' },
        { id: 'notifications', icon: Bell, label: 'الإشعارات' },
        { id: 'security', icon: Shield, label: 'الأمان' },
        { id: 'whatsapp', icon: Smartphone, label: 'واتساب' },
    ];

    return (
        <div className="flex h-screen w-full bg-slate-50">
            <Sidebar />

            <main className="flex h-full flex-1 flex-col">
                <TopNavbar />

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">الإعدادات</h1>
                        <p className="mt-2 text-slate-600">إدارة إعدادات حسابك والنظام</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                        <div className="lg:col-span-1">
                            <div className="rounded-xl bg-white p-4 shadow-sm">
                                <nav className="space-y-2">
                                    {sections.map((section) => {
                                        const Icon = section.icon;
                                        return (
                                            <button
                                                key={section.id}
                                                onClick={() => setActiveSection(section.id)}
                                                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-right transition-colors ${activeSection === section.id
                                                        ? 'bg-blue-50 text-blue-600'
                                                        : 'text-slate-600 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <Icon className="size-5" />
                                                <span className="font-medium">{section.label}</span>
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        </div>

                        <div className="lg:col-span-3">
                            <div className="rounded-xl bg-white p-6 shadow-sm">
                                {activeSection === 'profile' && (
                                    <div className="space-y-6">
                                        <h2 className="text-xl font-bold text-slate-900">الملف الشخصي</h2>

                                        <div className="flex items-center gap-6">
                                            <div className="size-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
                                            <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50">
                                                تغيير الصورة
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-slate-700">الاسم الأول</label>
                                                <input
                                                    type="text"
                                                    defaultValue="محمد"
                                                    className="h-12 w-full rounded-lg border border-slate-200 px-4 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-slate-700">اسم العائلة</label>
                                                <input
                                                    type="text"
                                                    defaultValue="أحمد"
                                                    className="h-12 w-full rounded-lg border border-slate-200 px-4 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700">البريد الإلكتروني</label>
                                            <input
                                                type="email"
                                                defaultValue="mohamed@example.com"
                                                className="h-12 w-full rounded-lg border border-slate-200 px-4 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700">رقم الهاتف</label>
                                            <input
                                                type="tel"
                                                defaultValue="+966 50 123 4567"
                                                className="h-12 w-full rounded-lg border border-slate-200 px-4 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700">
                                            <Save className="size-5" />
                                            حفظ التغييرات
                                        </button>
                                    </div>
                                )}

                                {activeSection === 'notifications' && (
                                    <div className="space-y-6">
                                        <h2 className="text-xl font-bold text-slate-900">إعدادات الإشعارات</h2>

                                        <div className="space-y-4">
                                            {[
                                                { label: 'رسائل جديدة', description: 'تلقي إشعارات عند وصول رسائل جديدة' },
                                                { label: 'ردود تلقائية', description: 'إشعارات عند تفعيل الردود التلقائية' },
                                                { label: 'تحديثات النظام', description: 'إشعارات حول التحديثات والميزات الجديدة' },
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                                                    <div>
                                                        <p className="font-medium text-slate-900">{item.label}</p>
                                                        <p className="text-sm text-slate-600">{item.description}</p>
                                                    </div>
                                                    <label className="relative inline-flex cursor-pointer items-center">
                                                        <input type="checkbox" className="peer sr-only" defaultChecked />
                                                        <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:right-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeSection === 'security' && (
                                    <div className="space-y-6">
                                        <h2 className="text-xl font-bold text-slate-900">الأمان</h2>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700">كلمة المرور الحالية</label>
                                            <input
                                                type="password"
                                                className="h-12 w-full rounded-lg border border-slate-200 px-4 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700">كلمة المرور الجديدة</label>
                                            <input
                                                type="password"
                                                className="h-12 w-full rounded-lg border border-slate-200 px-4 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700">تأكيد كلمة المرور</label>
                                            <input
                                                type="password"
                                                className="h-12 w-full rounded-lg border border-slate-200 px-4 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700">
                                            <Save className="size-5" />
                                            تحديث كلمة المرور
                                        </button>
                                    </div>
                                )}

                                {activeSection === 'whatsapp' && (
                                    <div className="space-y-6">
                                        <h2 className="text-xl font-bold text-slate-900">إعدادات واتساب</h2>

                                        <div className="rounded-lg border border-slate-200 p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-slate-900">حالة الاتصال</p>
                                                    <p className="text-sm text-green-600">متصل</p>
                                                </div>
                                                <button className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100">
                                                    قطع الاتصال
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700">رقم الهاتف المتصل</label>
                                            <input
                                                type="text"
                                                defaultValue="+966 50 123 4567"
                                                disabled
                                                className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-slate-600"
                                            />
                                        </div>

                                        <button className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700">
                                            إضافة رقم واتساب جديد
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
