'use client';

import { useState, useCallback } from 'react';
import ConversationsList from '@/components/ConversationsList';
import ChatView from '@/components/ChatView';
import ContactDetails from '@/components/ContactDetails';
import { Contact, Conversation } from '@/lib/types';

export default function InboxPage() {
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleSelectConversation = useCallback((conversation: Conversation) => {
        setSelectedConversation(conversation);
    }, []);

    const handleMessageSent = useCallback(() => {
        // Refresh conversations list to show updated last message
        setRefreshKey(prev => prev + 1);
    }, []);

    const handleContactUpdated = useCallback(() => {
        // Refresh after contact update
        setRefreshKey(prev => prev + 1);
    }, []);

    return (
        <div className="flex h-full w-full bg-gray-50 p-4 gap-4">
            <ConversationsList
                key={`conversations-${refreshKey}`}
                onSelectConversation={handleSelectConversation}
                selectedId={selectedConversation?.id}
            />
            <ChatView
                conversation={selectedConversation}
                onMessageSent={handleMessageSent}
            />
            <ContactDetails
                conversation={selectedConversation}
                onContactUpdated={handleContactUpdated}
            />
        </div>
    );
}
