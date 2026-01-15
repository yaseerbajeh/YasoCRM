import { ChevronDown, Calendar } from 'lucide-react';

export default function ContactDetails() {
  return (
    <div className="w-80 bg-gray-100 border-r border-gray-300 flex flex-col overflow-y-auto">
      <div className="flex flex-col items-center py-6 px-4 border-b border-gray-300">
        <img
          src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=200"
          alt="أحمد علي"
          className="w-24 h-24 rounded-full object-cover mb-3"
        />
        <h2 className="text-lg font-semibold text-gray-800">أحمد علي</h2>
      </div>

      <div className="px-4 py-4 border-b border-gray-300">
        <h3 className="text-sm font-semibold text-gray-800 mb-3 text-right">
          تفاصيل جهة الاتصال
        </h3>
        <div className="space-y-2 text-right">
          <div>
            <p className="text-xs text-gray-600">رقم الهاتف:</p>
            <p className="text-sm text-gray-800 font-medium">4567 123 55 966+</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">البريد الإلكتروني:</p>
            <p className="text-sm text-gray-800 font-medium">ahmed@example.com</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 border-b border-gray-300">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-800">15,000 رس</p>
          <p className="text-sm text-gray-600">قيمة الصفقة</p>
        </div>
      </div>

      <div className="px-4 py-4 border-b border-gray-300">
        <div className="flex items-center justify-between">
          <ChevronDown size={20} className="text-gray-600" />
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-800">عرض سعر</p>
            <p className="text-sm text-gray-600">المرحلة</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 border-b border-gray-300">
        <h3 className="text-sm font-semibold text-gray-800 mb-2 text-right">ملاحظات</h3>
        <p className="text-sm text-gray-600 text-right leading-relaxed">
          العميل مهتم بالباقة الذهبية
        </p>
      </div>

      <div className="px-4 py-4 border-b border-gray-300">
        <div className="flex items-center gap-3 mb-3">
          <Calendar size={16} className="text-gray-600" />
          <div className="flex-1 flex items-center justify-between">
            <p className="text-sm text-gray-800">تاريخ الإنشاء</p>
            <p className="text-sm text-gray-800">تاريخ الإنشاء</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 border-b border-gray-300">
        <div className="flex items-center justify-between">
          <ChevronDown size={20} className="text-gray-600" />
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-800">المصدر</p>
            <p className="text-sm text-gray-600">المصدر</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <ChevronDown size={20} className="text-gray-600" />
          <p className="text-sm text-gray-600">الممثل المسؤول</p>
        </div>
      </div>
    </div>
  );
}
