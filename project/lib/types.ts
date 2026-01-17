'use client';

export interface Contact {
    id: number;
    name: string | null;
    phone_number: string;
    email?: string | null;
    avatar_url?: string | null;
    custom_fields?: Record<string, unknown> | null;
    created_at?: string;
    tags?: string[];
}

export interface Conversation {
    id: number;
    contact_id?: number;
    status: string;
    unread_count?: number;
    last_message_at?: string | null;
    contact: Contact;
    last_message?: {
        content: string | null;
        direction: string;
        created_at: string;
    };
}

export interface Message {
    id: number;
    content: string | null;
    direction: 'incoming' | 'outgoing';
    message_type: string;
    is_read: boolean;
    status: string;
    created_at: string;
}
