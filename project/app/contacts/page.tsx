'use client';

import { Search, Filter, Plus, MoreHorizontal } from 'lucide-react';

export default function ContactsPage() {
    const contacts = [
        { id: 1, name: 'أحمد علي', phone: '+966 50 123 4567', email: 'ahmed@example.com', tags: ['عميل جديد', 'باقة ذهبية'], date: '2024-01-15' },
        { id: 2, name: 'سارة محمد', phone: '+966 55 987 6543', email: 'sara@example.com', tags: ['مهتم'], date: '2024-01-14' },
        { id: 3, name: 'شركة التقنية', phone: '+966 54 111 2222', email: 'tech@company.com', tags: ['شركات', 'عقد سنوي'], date: '2024-01-13' },
        { id: 4, name: 'خالد عمر', phone: '+966 56 333 4444', email: 'khaled@example.com', tags: ['عميل سابق'], date: '2024-01-12' },
        { id: 5, name: 'متجر الزهور', phone: '+966 59 555 6666', email: 'flower@shop.com', tags: ['شركات'], date: '2024-01-10' },
    ];

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">جهات الاتصال</h1>
                    <p className="text-gray-500 mt-1">إدارة قائمة العملاء وجهات الاتصال</p>
                </div>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                    <Plus size={20} />
                    <span>جهة اتصال جديدة</span>
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="بحث عن جهة اتصال..."
                            className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                        />
                    </div>
                    <button className="flex items-center gap-2 text-gray-600 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Filter size={18} />
                        <span className="text-sm">تصفية</span>
                    </button>
                </div>

                <table className="w-full text-right">
                    <thead className="bg-gray-50 text-gray-500 text-sm font-medium">
                        <tr>
                            <th className="px-6 py-3 font-medium">الاسم</th>
                            <th className="px-6 py-3 font-medium">رقم الهاتف</th>
                            <th className="px-6 py-3 font-medium">البريد الإلكتروني</th>
                            <th className="px-6 py-3 font-medium">الوسوم</th>
                            <th className="px-6 py-3 font-medium">تاريخ الإضافة</th>
                            <th className="px-6 py-3 font-medium"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {contacts.map((contact) => (
                            <tr key={contact.id} className="hover:bg-gray-50 group transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-gray-800">{contact.name}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-600 dir-ltr text-right">{contact.phone}</td>
                                <td className="px-6 py-4 text-gray-600">{contact.email}</td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        {contact.tags.map((tag, i) => (
                                            <span key={i} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium border border-blue-100">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-sm">{contact.date}</td>
                                <td className="px-6 py-4 text-left">
                                    <button className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600">
                                        <MoreHorizontal size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
