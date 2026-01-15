'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Grid, MessageCircle, Users, BarChart3, Settings, Zap, Send } from 'lucide-react';
import { navigationItems } from '@/lib/navigation';

const iconMap: Record<string, any> = {
    'grid': Grid,
    'message-circle': MessageCircle,
    'users': Users,
    'bar-chart-3': BarChart3,
    'settings': Settings,
    'zap': Zap,
    'send': Send,
};

export default function VerticalNav() {
    const pathname = usePathname();

    return (
        <div className="w-20 bg-gray-100 border-l border-gray-300 flex flex-col items-center py-4 gap-2 h-full">
            {navigationItems.map((item) => {
                const Icon = iconMap[item.icon];
                const isActive = pathname === item.path;

                return (
                    <Link
                        key={item.id}
                        href={item.path}
                        className={`flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-lg transition-colors ${isActive
                                ? 'bg-green-100 text-green-600'
                                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                            }`}
                    >
                        {Icon && <Icon size={24} />}
                        <span className="text-[10px] text-center font-medium leading-tight">{item.label}</span>
                    </Link>
                );
            })}
        </div>
    );
}
