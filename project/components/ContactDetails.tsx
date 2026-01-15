'use client';

import { ChevronDown, Calendar, Phone, Mail, Tag, DollarSign, Briefcase } from 'lucide-react';

export default function ContactDetails() {
    return (
        <div className="w-80 bg-white border-r border-gray-300 flex flex-col h-full overflow-y-auto">
            <div className="flex flex-col items-center py-8 px-4 border-b border-gray-100 bg-gray-50/50">
                <div className="relative mb-4">
                    <img
                        src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=200"
                        alt="أحمد علي"
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                    />
                    <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <h2 className="text-lg font-bold text-gray-900">أحمد علي</h2>
                <span className="text-sm text-gray-500 mt-1">مدير تسويق</span>
            </div>

            <div className="px-6 py-6 border-b border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 text-right">
                    معلومات الاتصال
                </h3>
                <div className="space-y-4 text-right">
                    <div className="flex items-center gap-3 justify-end group cursor-pointer">
                        <div className="text-right">
                            <p className="text-sm text-gray-900 font-semibold group-hover:text-green-600 transition-colors">+966 50 123 4567</p>
                            <p className="text-[10px] text-gray-400">الجوال</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                            <Phone size={14} />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 justify-end group cursor-pointer">
                        <div className="text-right">
                            <p className="text-sm text-gray-900 font-semibold group-hover:text-green-600 transition-colors">ahmed@example.com</p>
                            <p className="text-[10px] text-gray-400">البريد الإلكتروني</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                            <Mail size={14} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                        <DollarSign size={16} />
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">15,000 ر.س</p>
                        <p className="text-[10px] text-gray-500">قيمة الصفقة</p>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Briefcase size={16} />
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <p className="text-sm font-bold text-gray-900">عرض سعر</p>
                        </div>
                        <p className="text-[10px] text-gray-500">المرحلة الحالية</p>
                    </div>
                </div>
            </div>

            <div className="px-6 py-6 border-b border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 text-right">ملاحظات</h3>
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                    <p className="text-sm text-gray-700 text-right leading-relaxed">
                        العميل مهتم بالباقة الذهبية، طلب عرض سعر محدث يشمل الضرائب.
                    </p>
                </div>
            </div>

            <div className="px-6 py-6">
                <div className="flex items-center gap-3 justify-end mb-4">
                    <div className="text-right">
                        <p className="text-sm text-gray-900">15 يناير 2024</p>
                        <p className="text-[10px] text-gray-500">تاريخ الإنشاء</p>
                    </div>
                    <Calendar size={16} className="text-gray-400" />
                </div>
                <button className="w-full py-2 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors">
                    تعديل البيانات
                </button>
            </div>
        </div>
    );
}
