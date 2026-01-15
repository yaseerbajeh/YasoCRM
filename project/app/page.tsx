'use client';

import { Users, MessageCircle, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">لوحة القيادة</h1>
                <p className="text-gray-500 mt-1">نظرة عامة على أداءك اليوم</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'إجمالي المبيعات', value: '54,350 ر.س', change: '+12%', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
                    { label: 'المحادثات النشطة', value: '124', change: '+5%', icon: MessageCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
                    { label: 'جهات اتصال جديدة', value: '45', change: '+18%', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
                    { label: 'معدل التحويل', value: '3.2%', change: '-1%', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                            <div className="flex items-center gap-1 mt-2">
                                {stat.change.startsWith('+') ? <ArrowUpRight size={16} className="text-green-500" /> : <ArrowDownRight size={16} className="text-red-500" />}
                                <span className={`text-xs font-semibold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{stat.change}</span>
                                <span className="text-xs text-gray-400">مقارنة بالشهر الماضي</span>
                            </div>
                        </div>
                        <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-800">نشاط المحادثات</h2>
                        <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-1 outline-none focus:ring-2 focus:ring-green-500">
                            <option>آخر 7 أيام</option>
                            <option>آخر 30 يوم</option>
                        </select>
                    </div>
                    <div className="h-64 flex items-end justify-between px-2 gap-2">
                        {/* Mock Bar Chart */}
                        {[40, 65, 30, 80, 55, 90, 45].map((h, i) => (
                            <div key={i} className="w-full flex flex-col items-center gap-2 group">
                                <div className="relative w-full bg-gray-100 rounded-t-lg overflow-hidden h-full flex items-end">
                                    <div style={{ height: `${h}%` }} className="w-full bg-green-500 opacity-80 group-hover:opacity-100 transition-opacity rounded-t-lg"></div>
                                </div>
                                <span className="text-xs text-gray-400 font-medium">
                                    {['سبت', 'أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'][i]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">أحدث النشاطات</h2>
                    <div className="space-y-6">
                        {[
                            { user: 'أحمد علي', action: 'قام بشراء باقة ذهبية', time: 'منذ 5 د' },
                            { user: 'سارة محمد', action: 'بدأت محادثة جديدة', time: 'منذ 15 د' },
                            { user: 'خالد عمر', action: 'تم تحديث حالة الطلب', time: 'منذ 30 د' },
                            { user: 'منى سالم', action: 'انضمت لقائمة الانتظار', time: 'منذ 1 س' },
                            { user: 'يوسف حسن', action: 'أرسل شكوى جديدة', time: 'منذ 2 س' },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                    <Activity size={18} className="text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-800 font-medium leading-none mb-1">
                                        <span className="font-bold">{item.user}</span> {item.action}
                                    </p>
                                    <p className="text-xs text-gray-400">{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                        عرض كل النشاطات
                    </button>
                </div>
            </div>
        </div>
    );
}
