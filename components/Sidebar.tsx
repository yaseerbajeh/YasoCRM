'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Radio,
  Bot,
  Settings,
  LogOut
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'لوحة التحكم', path: '/dashboard' },
  { id: 'contacts', icon: Users, label: 'جهات الاتصال', path: '/contacts' },
  { id: 'conversations', icon: MessageSquare, label: 'المحادثات', path: '/conversations' },
  { id: 'broadcasts', icon: Radio, label: 'الرسائل الجماعية', path: '/broadcasts' },
  { id: 'automation', icon: Bot, label: 'الأتمتة', path: '/automation' },
  { id: 'settings', icon: Settings, label: 'الإعدادات', path: '/settings' },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log('Logout clicked');
  };

  return (
    <aside className="flex h-full w-20 flex-col justify-between border-l border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-center px-1">
          <div className="flex size-10 items-center justify-center rounded-full bg-blue-500">
            <span className="text-lg font-bold text-white">A</span>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={`group relative flex items-center justify-center rounded-lg px-1 py-2 transition-colors ${isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <Icon className="size-5" />
                <span className="pointer-events-none absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-1">
        <button
          onClick={handleLogout}
          className="group relative flex items-center justify-center rounded-lg px-1 py-2 text-slate-600 transition-colors hover:bg-slate-100"
        >
          <LogOut className="size-5" />
          <span className="pointer-events-none absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            تسجيل الخروج
          </span>
        </button>
      </div>
    </aside>
  );
}
