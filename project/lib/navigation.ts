export interface NavigationItem {
    id: string;
    label: string;
    icon: string;
    path: string;
}

export const navigationItems: NavigationItem[] = [
    { id: 'home', label: 'لوحة القيادة', icon: 'grid', path: '/' },
    { id: 'inbox', label: 'المحادثات', icon: 'message-circle', path: '/inbox' },
    { id: 'contacts', label: 'جهات الاتصال', icon: 'users', path: '/contacts' },
    { id: 'analytics', label: 'التحليلات', icon: 'bar-chart-3', path: '/analytics' },
    { id: 'automations', label: 'الأتمتة', icon: 'zap', path: '/automations' },
    { id: 'campaigns', label: 'الحملات', icon: 'send', path: '/campaigns' },
    { id: 'settings', label: 'الإعدادات', icon: 'settings', path: '/settings' },
];
