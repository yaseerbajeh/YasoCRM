'use client';

import { BarChart3, TrendingUp, Users, MessageSquare } from 'lucide-react';

export default function AnalyticsPage() {
    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">التحليلات والتقارير</h1>
                    <p className="text-gray-500 mt-1">متابعة أداء فريقك ونمو مبيعاتك</p>
                </div>
                <div className="flex bg-white border border-gray-200 rounded-lg p-1">
                    <button className="px-3 py-1 bg-gray-100 rounded text-sm font-medium text-gray-800 shadow-sm">يومي</button>
                    <button className="px-3 py-1 hover:bg-gray-50 rounded text-sm font-medium text-gray-600">أسبوعي</button>
                    <button className="px-3 py-1 hover:bg-gray-50 rounded text-sm font-medium text-gray-600">شهري</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg"><MessageSquare size={18} /></div>
                        <span className="text-sm text-gray-500 font-medium">إجمالي الرسائل</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">85,240</h3>
                    <p className="text-xs text-green-600 mt-2 font-medium">+12% هذا الشهر</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Users size={18} /></div>
                        <span className="text-sm text-gray-500 font-medium">العملاء النشطين</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">1,245</h3>
                    <p className="text-xs text-green-600 mt-2 font-medium">+5% هذا الشهر</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><TrendingUp size={18} /></div>
                        <span className="text-sm text-gray-500 font-medium">معدل الاستجابة</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">92%</h3>
                    <p className="text-xs text-gray-400 mt-2 font-medium">متوسط 5 دقائق</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[400px]">
                    <h3 className="font-bold text-gray-800 mb-6">حجم المحادثات</h3>
                    <div className="h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                        <div className="text-center">
                            <BarChart3 size={48} className="mx-auto mb-2 opacity-50" />
                            <p>رسم بياني تفاعلي (Mock)</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[400px]">
                    <h3 className="font-bold text-gray-800 mb-6">توزيع وسوم العملاء</h3>
                    <div className="h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                        <div className="text-center">
                            <div className="w-32 h-32 rounded-full border-8 border-gray-200 border-t-green-500 border-r-blue-500 mx-auto mb-4"></div>
                            <p>رسم دائري (Mock)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
