'use client';

import ConversationsList from '@/components/ConversationsList';
import ChatView from '@/components/ChatView';
import ContactDetails from '@/components/ContactDetails';

export default function InboxPage() {
    return (
        <div className="flex h-full w-full bg-gray-50 p-4 gap-4">
            <ConversationsList />
            <ChatView />
            <ContactDetails />
        </div>
    );
}
