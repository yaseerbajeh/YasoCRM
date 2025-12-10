'use client';

import { Bell, Waves } from 'lucide-react';

export default function TopNavbar() {
  return (
    <header className="flex w-full items-center justify-between border-b border-slate-200 bg-white px-10 py-3">
      <div className="flex items-center gap-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
          <Waves className="size-5" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">مساحة العمل</h2>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative flex size-10 items-center justify-center rounded-lg bg-slate-100 transition-colors hover:bg-slate-200">
          <Bell className="size-5 text-slate-600" />
          <div className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-white bg-red-500"></div>
        </button>

        <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
          <span className="text-sm font-bold text-white">م</span>
        </div>
      </div>
    </header>
  );
}
