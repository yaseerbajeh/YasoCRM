'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import { api, endpoints } from '@/lib/api';
import { Contact, Conversation } from '@/lib/types';

interface ConversationsListProps {
    onSelectConversation?: (conversation: Conversation) => void;
    selectedId?: number;
}

export default function ConversationsList({ onSelectConversation, selectedId }: ConversationsListProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchConversations = async () => {
        setLoading(true);
        setError(null);

        const { data, error: apiError } = await api.get<Conversation[]>(endpoints.dev.conversations);

        if (apiError) {
            setError(apiError);
            // Fallback to mock data for development
            setConversations(getMockConversations());
        } else if (data) {
            setConversations(data);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'open':
                return 'bg-green-600';
            case 'pending':
                return 'bg-blue-600';
            case 'closed':
                return 'bg-gray-400';
            default:
                return 'bg-orange-500';
        }
    };

    const getStatusLabel = (status: string): string => {
        switch (status) {
            case 'open':
                return 'نشط';
            case 'pending':
                return 'قيد الانتظار';
            case 'closed':
                return 'مغلق';
            default:
                return status;
        }
    };

    const formatTime = (dateString: string | null): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    };

    const getDisplayName = (conv: Conversation): string => {
        return conv.contact?.name || conv.contact?.phone_number || 'غير معروف';
    };

    const getAvatarUrl = (conv: Conversation): string => {
        if (conv.contact?.avatar_url) return conv.contact.avatar_url;
        // Generate placeholder based on index
        const placeholders = [
            'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100',
            'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100',
            'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=100',
        ];
        return placeholders[conv.id % placeholders.length];
    };

    return (
        <div className="w-80 bg-white border-l border-gray-300 flex flex-col h-full">
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200 shrink-0">
                <button
                    onClick={fetchConversations}
                    className="text-gray-500 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-full transition-colors"
                    title="تحديث"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
                <h2 className="text-lg font-bold text-gray-800">الدردشات</h2>
                <ChevronLeft size={20} className="text-gray-500 cursor-pointer" />
            </div>

            {error && (
                <div className="px-4 py-2 bg-yellow-50 text-yellow-700 text-xs border-b border-yellow-100">
                    تم عرض بيانات تجريبية - {error}
                </div>
            )}

            <div className="flex-1 overflow-y-auto">
                {loading && conversations.length === 0 ? (
                    <div className="flex items-center justify-center h-32">
                        <RefreshCw className="animate-spin text-gray-400" size={24} />
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <div
                            key={conv.id}
                            onClick={() => onSelectConversation?.(conv)}
                            className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex items-start gap-3 transition-colors ${selectedId === conv.id ? 'bg-green-50 border-r-4 border-r-green-500' : ''
                                }`}
                        >
                            <img
                                src={getAvatarUrl(conv)}
                                alt={getDisplayName(conv)}
                                className="w-12 h-12 rounded-full object-cover flex-shrink-0 border border-gray-200"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <h3 className="text-sm font-bold text-gray-800 truncate">
                                        {getDisplayName(conv)}
                                    </h3>
                                    <span className="text-[10px] text-gray-500 flex-shrink-0 font-medium">
                                        {formatTime(conv.last_message_at ?? null)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 truncate mb-2">
                                    {conv.last_message?.content || 'لا توجد رسائل'}
                                </p>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`${getStatusColor(conv.status)} text-white text-[10px] px-2 py-0.5 rounded-full inline-block font-medium shadow-sm`}
                                    >
                                        {getStatusLabel(conv.status)}
                                    </span>
                                    {(conv.unread_count ?? 0) > 0 && (
                                        <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                            {conv.unread_count}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// Mock data for development/fallback
function getMockConversations(): Conversation[] {
    return [
        {
            id: 1,
            contact_id: 1,
            status: 'open',
            unread_count: 2,
            last_message_at: new Date().toISOString(),
            contact: {
                id: 1,
                name: 'أحمد علي',
                phone_number: '+966501234567',
                avatar_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100',
            },
            last_message: {
                content: 'مرحباً! أنا مهتم بخدماتكم.',
                direction: 'incoming',
                created_at: new Date().toISOString(),
            },
        },
        {
            id: 2,
            contact_id: 2,
            status: 'pending',
            unread_count: 0,
            last_message_at: new Date().toISOString(),
            contact: {
                id: 2,
                name: 'سارة محمد',
                phone_number: '+966559876543',
                avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100',
            },
            last_message: {
                content: 'شكراً لكم على الرد السريع',
                direction: 'incoming',
                created_at: new Date().toISOString(),
            },
        },
    ];
}
