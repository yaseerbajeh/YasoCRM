'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatList from '@/components/ChatList';
import ConversationPanel from '@/components/ConversationPanel';
import ContactInfoPanel from '@/components/ContactInfoPanel';
import TopNavbar from '@/components/TopNavbar';

export default function Conversations() {
    const [selectedContact, setSelectedContact] = useState({
        id: 1,
        name: 'فاطمة علي',
        phone: '+966 55 123 4567',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima',
        status: 'متصل الآن',
        lastSeen: 'منذ 5 دقائق',
        tags: ['عميل مهم', 'استفسار مبيعات'],
        notes: 'تواصلت بخصوص مشكلة في شحن طلبها الأخير. تميل إلى شراء المنتجات الجديدة عند إطلاقها.',
    });

    return (
        <div className="flex h-screen w-full bg-slate-50">
            <Sidebar />

            <main className="flex h-full flex-1 flex-col">
                <TopNavbar />

                <div className="flex h-full flex-1 overflow-hidden">
                    <ChatList
                        selectedContact={selectedContact}
                        setSelectedContact={setSelectedContact}
                    />

                    <ConversationPanel contact={selectedContact} />

                    <ContactInfoPanel contact={selectedContact} />
                </div>
            </main>
        </div>
    );
}
