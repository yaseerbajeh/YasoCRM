'use client';

import { Search, User, Bell } from 'lucide-react';

export default function Header() {
    return (
        <header className="bg-white border-b border-gray-300 px-6 py-3 flex items-center justify-between h-16 shrink-0 z-10">
            <div className="flex items-center gap-4">
                <button className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-colors relative">
                    <Bell size={20} className="text-gray-600" />
                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <div className="flex items-center gap-3 pl-4 border-l border-gray-300">
                    <div className="text-left hidden md:block">
                        <p className="text-sm font-semibold text-gray-800">عبدالله محمد</p>
                        <p className="text-xs text-gray-500">مدير النظام</p>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity">
                        <User size={24} className="text-gray-600" />
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-gray-800 tracking-tight">YasoCRM</h1>
                {/* Search Bar could go here */}
            </div>
        </header>
    );
}
