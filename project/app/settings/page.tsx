'use client';

import { User, Bell, Shield, Smartphone, Globe, Save } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">الإعدادات</h1>
                <p className="text-gray-500 mt-1">تخصيص حسابك وإعدادات النظام</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full lg:w-64 shrink-0 space-y-1">
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-white text-green-600 border border-green-200 shadow-sm rounded-lg font-medium">
                        <User size={18} />
                        الملف الشخصي
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                        <Smartphone size={18} />
                        ربط واتساب
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                        <Bell size={18} />
                        الإشعارات
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                        <Globe size={18} />
                        اللغة والمنطقة
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                        <Shield size={18} />
                        الأمان
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">المعلومات الشخصية</h2>

                    <div className="space-y-6">
                        <div className="flex items-center gap-6">
                            <img src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=150" className="w-24 h-24 rounded-full object-cover border-4 border-gray-100" alt="Avatar" />
                            <div>
                                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors">تغيير الصورة</button>
                                <p className="text-xs text-gray-400 mt-2">JPG, GIF or PNG. Max size 800K</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الأول</label>
                                <input type="text" defaultValue="عبدالله" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">اسم العائلة</label>
                                <input type="text" defaultValue="محمد" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                                <input type="email" defaultValue="admin@yasocrm.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 bg-gray-50" readOnly />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">المسمى الوظيفي</label>
                                <input type="text" defaultValue="مدير النظام" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500" />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                            <button className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm">
                                <Save size={18} />
                                حفظ التغييرات
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
