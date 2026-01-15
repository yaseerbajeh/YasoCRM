import { Search, User } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-gray-200 border-b border-gray-300 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 rounded-full bg-white border-2 border-gray-400 flex items-center justify-center hover:bg-gray-50">
          <User size={20} className="text-gray-700" />
        </button>
        <button className="w-10 h-10 rounded-full bg-white border-2 border-gray-400 flex items-center justify-center hover:bg-gray-50">
          <Search size={20} className="text-gray-700" />
        </button>
      </div>
      <h1 className="text-2xl font-semibold text-gray-800">لوحة القيادة CRM</h1>
    </header>
  );
}
