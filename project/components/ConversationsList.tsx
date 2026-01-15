'use client';

import { ChevronLeft } from 'lucide-react';

interface Conversation {
    id: string;
    name: string;
    avatar: string;
    message: string;
    time: string;
    status: string;
    statusColor: string;
}

const conversations: Conversation[] = [
    {
        id: '1',
        name: 'أحمد علي',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100',
        message: 'مرحباً! أنا مهتم بخدماتكم.',
        time: '2:30 PM',
        status: 'عمل متواصل',
        statusColor: 'bg-green-600',
    },
    {
        id: '2',
        name: 'سارة محمد',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100',
        message: 'أخبرتنا النتائج',
        time: '2:30 PM',
        status: 'عمل حالي',
        statusColor: 'bg-blue-600',
    },
    {
        id: '3',
        name: 'خالد عمر',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=100',
        message: 'أخبرتنا حالي',
        time: '2:30 PM',
        status: 'متواصلة',
        statusColor: 'bg-orange-500',
    },
    {
        id: '4',
        name: 'خالد عمر',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=100',
        message: 'أخبرتنا حالي',
        time: '2:30 PM',
        status: 'متابعة',
        statusColor: 'bg-orange-500',
    },
    {
        id: '5',
        name: 'أحمد علي',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100',
        message: 'أخبرتنا النجاس، مرحبًا بخدماتكم.',
        time: '2:30 PM',
        status: 'عمل متواصل',
        statusColor: 'bg-green-600',
    },
    {
        id: '6',
        name: 'سارة محمد',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100',
        message: 'أخبرتنا النجاس، علني معلم التفصيل.',
        time: '2:30 PM',
        status: 'عمل حالي',
        statusColor: 'bg-blue-600',
    },
];

export default function ConversationsList() {
    return (
        <div className="w-80 bg-white border-l border-gray-300 flex flex-col h-full">
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200 shrink-0">
                <ChevronLeft size={20} className="text-gray-500 cursor-pointer" />
                <h2 className="text-lg font-bold text-gray-800">الدردشات</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
                {conversations.map((conv) => (
                    <div
                        key={conv.id}
                        className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex items-start gap-3 transition-colors"
                    >
                        <img
                            src={conv.avatar}
                            alt={conv.name}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0 border border-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <h3 className="text-sm font-bold text-gray-800 truncate">
                                    {conv.name}
                                </h3>
                                <span className="text-[10px] text-gray-500 flex-shrink-0 font-medium">{conv.time}</span>
                            </div>
                            <p className="text-sm text-gray-500 truncate mb-2">{conv.message}</p>
                            <span
                                className={`${conv.statusColor} text-white text-[10px] px-2 py-0.5 rounded-full inline-block font-medium shadow-sm`}
                            >
                                {conv.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
