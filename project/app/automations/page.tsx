'use client';

import { Zap, Plus, MoreHorizontal, Power, GitBranch } from 'lucide-react';

export default function AutomationsPage() {
    const automations = [
        { id: 1, name: 'ترحيب العملاء الجدد', trigger: 'رسالة جديدة', steps: 3, status: 'active', runs: 1250 },
        { id: 2, name: 'تذكير السلة المتروكة', trigger: 'مرور 30 دقيقة', steps: 2, status: 'active', runs: 450 },
        { id: 3, name: 'جمع التقييمات', trigger: 'انتهاء المحادثة', steps: 4, status: 'paused', runs: 890 },
        { id: 4, name: 'تحويل للمبيعات', trigger: 'الكلمة المفتاحية "سعر"', steps: 1, status: 'active', runs: 210 },
    ];

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">الأتمتة (Chatbots)</h1>
                    <p className="text-gray-500 mt-1">بناء تدفقات رد آلي ذكية</p>
                </div>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                    <Plus size={20} />
                    <span>أتمتة جديدة</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {automations.map((auto) => (
                    <div key={auto.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                                <Zap size={24} />
                            </div>
                            <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal /></button>
                        </div>

                        <h3 className="font-bold text-gray-900 text-lg mb-2">{auto.name}</h3>

                        <div className="space-y-2 mb-6">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Power size={14} className="text-gray-400" />
                                <span>المشغل: <span className="font-medium text-gray-900">{auto.trigger}</span></span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <GitBranch size={14} className="text-gray-400" />
                                <span>الخطوات: <span className="font-medium text-gray-900">{auto.steps}</span></span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${auto.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                <span className="text-sm text-gray-500 font-medium">{auto.status === 'active' ? 'نشط' : 'متوقف'}</span>
                            </div>
                            <span className="text-sm text-gray-400">{auto.runs} تشغيل</span>
                        </div>
                    </div>
                ))}

                <button className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all min-h-[250px]">
                    <Plus size={48} className="mb-4 opacity-50" />
                    <span className="font-bold text-lg">إنشاء أتمتة جديدة</span>
                </button>
            </div>
        </div>
    );
}
