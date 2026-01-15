'use client';

import { Send, Plus, BarChart2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function CampaignsPage() {
    const campaigns = [
        { id: 1, name: 'عروض بداية العام', status: 'completed', sent: 1250, read: 980, date: '2024-01-01' },
        { id: 2, name: 'تحديث سياسة الخصوصية', status: 'completed', sent: 5000, read: 4200, date: '2023-12-25' },
        { id: 3, name: 'خصم الباقة الذهبية', status: 'scheduled', sent: 0, read: 0, date: '2024-01-20' },
        { id: 4, name: 'استبيان رضا العملاء', status: 'draft', sent: 0, read: 0, date: '-' },
    ];

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">الحملات الإعلانية</h1>
                    <p className="text-gray-500 mt-1">إرسال رسائل جماعية وإدارة الحملات</p>
                </div>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                    <Plus size={20} />
                    <span>حملة جديدة</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="font-bold text-gray-800">آخر الحملات</h3>
                    </div>
                    <table className="w-full text-right">
                        <thead className="bg-gray-50 text-gray-500 text-sm">
                            <tr>
                                <th className="px-6 py-3 font-medium">اسم الحملة</th>
                                <th className="px-6 py-3 font-medium">الحالة</th>
                                <th className="px-6 py-3 font-medium">المرسلة</th>
                                <th className="px-6 py-3 font-medium">المقروءة</th>
                                <th className="px-6 py-3 font-medium">التاريخ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {campaigns.map((camp) => (
                                <tr key={camp.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-800">{camp.name}</td>
                                    <td className="px-6 py-4">
                                        {camp.status === 'completed' && <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium border border-green-100"><CheckCircle size={12} /> مكتملة</span>}
                                        {camp.status === 'scheduled' && <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium border border-blue-100"><Clock size={12} /> مجدولة</span>}
                                        {camp.status === 'draft' && <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium border border-gray-200"><AlertCircle size={12} /> مسودة</span>}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{camp.sent > 0 ? camp.sent : '-'}</td>
                                    <td className="px-6 py-4 text-gray-600">{camp.read > 0 ? camp.read : '-'}</td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">{camp.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Send size={20} /></div>
                            <h3 className="font-bold text-gray-800">رصيد الرسائل</h3>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">12,450</div>
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                            <div className="bg-blue-600 h-2 rounded-full w-[70%]"></div>
                        </div>
                        <p className="text-sm text-gray-500">تم استخدام 70% من الباقة الحالية</p>
                        <button className="mt-4 w-full py-2 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 text-sm font-medium transition-colors">
                            شحن الرصيد
                        </button>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                        <h3 className="font-bold text-lg mb-2">تحتاج مساعدة؟</h3>
                        <p className="text-green-100 text-sm mb-4">تعلم كيفية إنشاء حملات تسويقية ناجحة عبر واتساب مع دليلنا الشامل.</p>
                        <button className="bg-white text-green-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-50 transition-colors">
                            اقرأ الدليل
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
