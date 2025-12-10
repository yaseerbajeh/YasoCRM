'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';

interface Contact {
  id: number;
  name: string;
  phone: string;
  avatar: string;
  status: string;
  lastSeen: string;
  tags: string[];
  notes: string;
}

interface ChatListProps {
  selectedContact: Contact;
  setSelectedContact: (contact: Contact) => void;
}

const contacts = [
  {
    id: 1,
    name: 'فاطمة علي',
    phone: '+966 55 123 4567',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima',
    lastMessage: 'تمام، شكرًا جزيلاً لك على المساعدة!',
    time: '10:42 ص',
    unread: 3,
    isOnline: true,
    status: 'متصل الآن',
    lastSeen: 'منذ 5 دقائق',
    tags: ['عميل مهم', 'استفسار مبيعات'],
    notes: 'تواصلت بخصوص مشكلة في شحن طلبها الأخير.',
  },
  {
    id: 2,
    name: 'خالد الغامدي',
    phone: '+966 50 987 6543',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Khaled',
    lastMessage: 'ممكن تفاصيل أكثر عن باقة الشركات؟',
    time: '9:15 ص',
    unread: 0,
    isOnline: false,
    status: 'غير متصل',
    lastSeen: 'منذ ساعة',
    tags: ['عميل محتمل'],
    notes: 'مهتم بباقة الشركات.',
  },
  {
    id: 3,
    name: 'نورة عبدالله',
    phone: '+966 54 456 7890',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Noura',
    lastMessage: 'لقد أرسلت صورة للمشكلة.',
    time: 'أمس',
    unread: 1,
    isOnline: true,
    status: 'متصل الآن',
    lastSeen: 'منذ دقيقتين',
    tags: ['دعم فني'],
    notes: 'لديها مشكلة تقنية في المنتج.',
  },
];

export default function ChatList({ selectedContact, setSelectedContact }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full w-80 flex-col border-l border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في المحادثات..."
            className="h-12 w-full rounded-lg bg-slate-100 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            onClick={() => setSelectedContact(contact)}
            className={`flex cursor-pointer justify-between gap-3 border-b border-slate-200 px-4 py-3 transition-colors ${
              selectedContact.id === contact.id
                ? 'bg-blue-50'
                : 'hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="size-10 rounded-full"
                />
                {contact.isOnline && (
                  <div className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white bg-green-500"></div>
                )}
              </div>

              <div className="flex flex-1 flex-col">
                <p className="text-sm font-medium text-slate-900">
                  {contact.name}
                </p>
                <p
                  className={`w-40 truncate text-xs ${
                    contact.unread > 0
                      ? 'font-medium text-blue-600'
                      : 'text-slate-500'
                  }`}
                >
                  {contact.lastMessage}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1">
              <p className="text-xs text-slate-400">{contact.time}</p>
              {contact.unread > 0 && (
                <div className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {contact.unread}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
