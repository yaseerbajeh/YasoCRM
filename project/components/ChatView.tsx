'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Phone,
    MoreVertical,
    Smile,
    Paperclip,
    Bold,
    Italic,
    SendHorizontal,
    RefreshCw
} from 'lucide-react';
import { api, endpoints } from '@/lib/api';

interface Message {
    id: number;
    content: string | null;
    direction: 'incoming' | 'outgoing';
    message_type: string;
    is_read: boolean;
    status: string;
    created_at: string;
}

interface Contact {
    id: number;
    name: string | null;
    phone_number: string;
    avatar_url: string | null;
}

interface Conversation {
    id: number;
    contact: Contact;
    status: string;
}

interface ChatViewProps {
    conversation?: Conversation | null;
    onMessageSent?: () => void;
}

const quickReplies = [
    { id: '1', label: 'ترحيب' },
    { id: '2', label: 'استفسار' },
    { id: '3', label: 'عرض سعر' },
    { id: '4', label: 'موعد' },
];

export default function ChatView({ conversation, onMessageSent }: ChatViewProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        if (!conversation?.id) return;

        setLoading(true);
        setError(null);

        const { data, error: apiError } = await api.get<Message[]>(
            endpoints.dev.messages(conversation.id)
        );

        if (apiError) {
            setError(apiError);
            setMessages(getMockMessages());
        } else if (data) {
            setMessages(data);
        }

        setLoading(false);

        // Mark as read
        await api.post(endpoints.markAsRead(conversation.id), {});
    };

    useEffect(() => {
        if (conversation?.id) {
            fetchMessages();
        } else {
            setMessages([]);
        }
    }, [conversation?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!messageText.trim() || !conversation?.id) return;

        setSending(true);

        const { data, error: apiError } = await api.post<Message>(endpoints.dev.sendMessage, {
            conversation_id: conversation.id,
            content: messageText,
            message_type: 'text',
        });

        if (apiError) {
            setError(apiError);
        } else if (data) {
            setMessages(prev => [...prev, data]);
            setMessageText('');
            onMessageSent?.();
        }

        setSending(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleQuickReply = (label: string) => {
        const replies: Record<string, string> = {
            'ترحيب': 'مرحباً بك! كيف يمكنني مساعدتك اليوم؟',
            'استفسار': 'شكراً لاستفسارك. سأقوم بالرد عليك في أقرب وقت.',
            'عرض سعر': 'سأقوم بإعداد عرض سعر مفصل وإرساله لك قريباً.',
            'موعد': 'متى يناسبك موعد للمقابلة؟ نحن متاحون في أي وقت.',
        };
        setMessageText(replies[label] || '');
    };

    const formatTime = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    };

    const getDisplayName = (): string => {
        return conversation?.contact?.name || conversation?.contact?.phone_number || 'اختر محادثة';
    };

    const getAvatarUrl = (): string => {
        return conversation?.contact?.avatar_url ||
            'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100';
    };

    if (!conversation) {
        return (
            <div className="flex-1 bg-white flex flex-col h-full shadow-sm mx-1 rounded-lg border border-gray-200 overflow-hidden items-center justify-center">
                <div className="text-gray-400 text-center">
                    <Phone size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg">اختر محادثة للبدء</p>
                </div>
            </div>
        );
    }

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
                        <h2 className="text-base font-bold text-gray-800">{getDisplayName()}</h2>
                        <span className="text-xs text-green-500 flex items-center gap-1 justify-end">
                            <span className="w-2 h-2 rounded-full bg-green-500 block"></span>
                            {conversation.status === 'open' ? 'متصل الآن' : 'غير متصل'}
                        </span>
                    </div>
                    <img
                        src={getAvatarUrl()}
                        alt={getDisplayName()}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div className="px-4 py-2 bg-yellow-50 text-yellow-700 text-xs border-b border-yellow-100">
                    تم عرض بيانات تجريبية - {error}
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50" dir="rtl">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <RefreshCw className="animate-spin text-gray-400" size={24} />
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.direction === 'outgoing' ? 'justify-start' : 'justify-end'}`}
                        >
                            <div
                                className={`max-w-md px-5 py-3 rounded-2xl shadow-sm ${msg.direction === 'outgoing'
                                    ? 'bg-green-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                                    }`}
                            >
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                <div className={`flex items-center justify-end gap-1 mt-1 ${msg.direction === 'outgoing' ? 'text-green-100' : 'text-gray-400'
                                    }`}>
                                    <span className="text-[10px]">{formatTime(msg.created_at)}</span>
                                    {msg.direction === 'outgoing' && (
                                        <span className="text-[10px]">
                                            {msg.status === 'read' ? '✓✓' : msg.status === 'delivered' ? '✓✓' : '✓'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Footer / Input Area */}
            <div className="px-6 py-4 bg-white border-t border-gray-200" dir="rtl">
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
                    <span className="text-xs text-gray-500 font-medium whitespace-nowrap ml-2">ردود سريعة:</span>
                    {quickReplies.map((reply) => (
                        <button
                            key={reply.id}
                            onClick={() => handleQuickReply(reply.label)}
                            className="px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
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
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="اكتب رسالتك هنا..."
                            className="w-full px-4 py-3 text-sm text-right bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] outline-none"
                            rows={1}
                            disabled={sending}
                        />
                        <div className="flex items-center justify-between px-2 pb-2 border-t border-gray-100 pt-2 mx-2">
                            <div className="flex gap-1">
                                <button className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"><Bold size={14} /></button>
                                <button className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"><Italic size={14} /></button>
                                <button className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"><Smile size={14} /></button>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSendMessage}
                        disabled={sending || !messageText.trim()}
                        className="w-11 h-11 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 shadow-md transition-transform hover:scale-105 active:scale-95 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sending ? (
                            <RefreshCw size={20} className="animate-spin" />
                        ) : (
                            <SendHorizontal size={20} className="mr-0.5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Mock data for development/fallback
function getMockMessages(): Message[] {
    return [
        {
            id: 1,
            content: 'مرحباً! أنا مهتم بخدماتكم.',
            direction: 'incoming',
            message_type: 'text',
            is_read: true,
            status: 'delivered',
            created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
            id: 2,
            content: 'أهلاً بك! يسعدنا تواصلك معنا. نحن نقدم مجموعة متكاملة من حلول النقل والخدمات اللوجستية.',
            direction: 'outgoing',
            message_type: 'text',
            is_read: true,
            status: 'delivered',
            created_at: new Date(Date.now() - 3000000).toISOString(),
        },
        {
            id: 3,
            content: 'هل لديكم خدمات شحن دولي؟',
            direction: 'incoming',
            message_type: 'text',
            is_read: true,
            status: 'delivered',
            created_at: new Date(Date.now() - 1800000).toISOString(),
        },
        {
            id: 4,
            content: 'نعم، لدينا خدمات شحن لجميع أنحاء العالم.',
            direction: 'outgoing',
            message_type: 'text',
            is_read: true,
            status: 'delivered',
            created_at: new Date(Date.now() - 900000).toISOString(),
        },
    ];
}
