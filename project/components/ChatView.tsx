'use client';

import {
    Phone,
    MoreVertical,
    Undo,
    Redo,
    Type,
    Link,
    List,
    ListOrdered,
    Smile,
    Paperclip,
    Bold,
    Italic,
    Play,
    SendHorizontal
} from 'lucide-react';

interface Message {
    id: string;
    text: string;
    time: string;
    sent: boolean;
    status?: string;
}

const messages: Message[] = [
    {
        id: '1',
        text: 'مرحباً! أنا مهتم بخدماتكم.',
        time: '2:30 PM',
        sent: false,
    },
    {
        id: '2',
        text: 'أهلاً بك! يسعدنا تواصلك معنا. نحن نقدم مجموعة متكاملة من حلول النقل والخدمات اللوجستية.',
        time: '3:30 PM',
        sent: true,
        status: 'delivered',
    },
    {
        id: '3',
        text: 'هل لديكم خدمات شحن دولي؟',
        time: '2:30 PM',
        sent: false,
    },
    {
        id: '4',
        text: 'نعم، لدينا خدمات شحن لجميع أنحاء العالم.',
        time: '2:30 PM',
        sent: true,
        status: 'delivered',
    },
];

const quickReplies = [
    { id: '1', label: 'ترحيب', active: true },
    { id: '2', label: 'استفسار', active: false },
    { id: '3', label: 'عرض سعر', active: false },
    { id: '4', label: 'موعد', active: false },
];

export default function ChatView() {
    return (
        <div className="flex-1 bg-white flex flex-col h-full shadow-sm mx-1 rounded-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-white px-6 py-3 flex items-center justify-between border-b border-gray-200 shrink-0">
                <div className="flex items-center gap-2">
                    <button className="text-gray-500 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <MoreVertical size={20} />
                    </button>
                    <button className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 shadow-sm transition-colors">
                        <Phone size={18} />
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <h2 className="text-base font-bold text-gray-800">أحمد علي</h2>
                        <span className="text-xs text-green-500 flex items-center gap-1 justify-end">
                            <span className="w-2 h-2 rounded-full bg-green-500 block"></span>
                            متصل الآن
                        </span>
                    </div>
                    <img
                        src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100"
                        alt="أحمد علي"
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50" dir="rtl">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sent ? 'justify-start' : 'justify-end'}`}
                    >
                        <div
                            className={`max-w-md px-5 py-3 rounded-2xl shadow-sm ${msg.sent
                                    ? 'bg-green-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                                }`}
                        >
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                            <div className={`flex items-center justify-end gap-1 mt-1 ${msg.sent ? 'text-green-100' : 'text-gray-400'}`}>
                                <span className="text-[10px]">{msg.time}</span>
                                {msg.sent && msg.status === 'delivered' && (
                                    <span className="text-[10px]">✓✓</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer / Input Area */}
            <div className="px-6 py-4 bg-white border-t border-gray-200" dir="rtl">
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
                    <span className="text-xs text-gray-500 font-medium whitespace-nowrap ml-2">ردود سريعة:</span>
                    {quickReplies.map((reply) => (
                        <button
                            key={reply.id}
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${reply.active
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            {reply.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-end gap-3">
                    <button className="text-gray-400 hover:text-gray-600 p-2">
                        <Paperclip size={20} />
                    </button>

                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all">
                        <textarea
                            placeholder="اكتب رسالتك هنا..."
                            className="w-full px-4 py-3 text-sm text-right bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px]"
                            rows={1}
                        />
                        <div className="flex items-center justify-between px-2 pb-2 border-t border-gray-100 pt-2 mx-2">
                            <div className="flex gap-1">
                                {/* Format buttons */}
                                <button className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"><Bold size={14} /></button>
                                <button className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"><Italic size={14} /></button>
                                <button className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"><Smile size={14} /></button>
                            </div>
                        </div>
                    </div>

                    <button className="w-11 h-11 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 shadow-md transition-transform hover:scale-105 active:scale-95 shrink-0">
                        <SendHorizontal size={20} className="mr-0.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
