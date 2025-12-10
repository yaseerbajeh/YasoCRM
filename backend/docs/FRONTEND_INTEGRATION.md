# Frontend Integration Guide

This guide explains how to integrate your Next.js frontend with the Laravel WhatsApp CRM backend.

## Authentication Setup

### 1. Install Dependencies

```bash
npm install axios laravel-echo pusher-js
```

### 2. Create API Client

Create `lib/api.ts`:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 3. Authentication Functions

Create `lib/auth.ts`:

```typescript
import api from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'agent';
  organization_id: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const auth = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('auth_token', data.token);
    return data;
  },

  async register(
    name: string,
    email: string,
    password: string,
    organizationName: string
  ): Promise<AuthResponse> {
    const { data } = await api.post('/auth/register', {
      name,
      email,
      password,
      password_confirmation: password,
      organization_name: organizationName,
    });
    localStorage.setItem('auth_token', data.token);
    return data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('auth_token');
  },

  async me(): Promise<User> {
    const { data } = await api.get('/auth/me');
    return data.user;
  },
};
```

## WebSocket Setup

### 1. Configure Laravel Echo

Create `lib/echo.ts`:

```typescript
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo;
  }
}

window.Pusher = Pusher;

export const echo = new Echo({
  broadcaster: 'reverb',
  key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
  wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || 'localhost',
  wsPort: process.env.NEXT_PUBLIC_REVERB_PORT || 8080,
  wssPort: process.env.NEXT_PUBLIC_REVERB_PORT || 8080,
  forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === 'https',
  enabledTransports: ['ws', 'wss'],
  authEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/broadcasting/auth`,
  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
    },
  },
});

export default echo;
```

### 2. Listen to Messages

```typescript
import echo from '@/lib/echo';

// Subscribe to conversation
echo.private(`conversations.${conversationId}`)
  .listen('.message.received', (event: any) => {
    console.log('New message received:', event.message);
    // Update your UI with the new message
  })
  .listen('.message.sent', (event: any) => {
    console.log('Message sent:', event.message);
  });

// Unsubscribe when component unmounts
return () => {
  echo.leave(`conversations.${conversationId}`);
};
```

## API Integration Examples

### Contacts

```typescript
import api from '@/lib/api';

export interface Contact {
  id: number;
  phone_number: string;
  name: string | null;
  email: string | null;
  last_interaction_at: string | null;
}

export const contacts = {
  async list(search?: string, page = 1) {
    const { data } = await api.get('/contacts', {
      params: { search, page, per_page: 20 },
    });
    return data;
  },

  async create(contact: Partial<Contact>) {
    const { data } = await api.post('/contacts', contact);
    return data;
  },

  async update(id: number, contact: Partial<Contact>) {
    const { data } = await api.put(`/contacts/${id}`, contact);
    return data;
  },

  async delete(id: number) {
    await api.delete(`/contacts/${id}`);
  },
};
```

### Conversations

```typescript
export interface Conversation {
  id: number;
  contact: Contact;
  status: 'open' | 'pending' | 'closed';
  unread_count: number;
  last_message_at: string;
}

export const conversations = {
  async list(filters?: {
    status?: string;
    assigned_to?: number | 'unassigned';
  }) {
    const { data } = await api.get('/conversations', { params: filters });
    return data;
  },

  async get(id: number) {
    const { data } = await api.get(`/conversations/${id}`);
    return data;
  },

  async assign(id: number, agentId: number) {
    const { data } = await api.put(`/conversations/${id}/assign`, {
      agent_id: agentId,
    });
    return data;
  },

  async updateStatus(id: number, status: string) {
    const { data } = await api.put(`/conversations/${id}/status`, { status });
    return data;
  },

  async markAsRead(id: number) {
    await api.post(`/conversations/${id}/read`);
  },
};
```

### Messages

```typescript
export interface Message {
  id: number;
  conversation_id: number;
  direction: 'incoming' | 'outgoing';
  content: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'document';
  created_at: string;
  media?: Media[];
}

export const messages = {
  async list(conversationId: number, page = 1) {
    const { data } = await api.get(`/messages/${conversationId}`, {
      params: { page, per_page: 50 },
    });
    return data;
  },

  async send(conversationId: number, content: string) {
    const { data } = await api.post('/messages', {
      conversation_id: conversationId,
      content,
    });
    return data;
  },

  async sendMedia(
    conversationId: number,
    file: File,
    mediaType: string,
    caption?: string
  ) {
    const formData = new FormData();
    formData.append('conversation_id', conversationId.toString());
    formData.append('media', file);
    formData.append('media_type', mediaType);
    if (caption) formData.append('content', caption);

    const { data } = await api.post('/messages', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
```

### Broadcasts

```typescript
export const broadcasts = {
  async create(broadcast: {
    whatsapp_instance_id: number;
    name: string;
    message: string;
    contact_ids: number[];
  }) {
    const { data } = await api.post('/broadcasts', broadcast);
    return data;
  },

  async send(id: number) {
    const { data } = await api.post(`/broadcasts/${id}/send`);
    return data;
  },

  async list() {
    const { data } = await api.get('/broadcasts');
    return data;
  },
};
```

## Environment Variables

Create `.env.local` in your Next.js project:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_REVERB_APP_KEY=your-app-key
NEXT_PUBLIC_REVERB_HOST=localhost
NEXT_PUBLIC_REVERB_PORT=8080
NEXT_PUBLIC_REVERB_SCHEME=http
```

## React Hooks Examples

### useAuth Hook

```typescript
import { useState, useEffect } from 'react';
import { auth, User } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auth.me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
```

### useConversation Hook

```typescript
import { useState, useEffect } from 'react';
import { conversations, messages } from '@/lib/api';
import echo from '@/lib/echo';

export function useConversation(conversationId: number) {
  const [conversation, setConversation] = useState(null);
  const [messageList, setMessageList] = useState([]);

  useEffect(() => {
    // Load conversation and messages
    conversations.get(conversationId).then(setConversation);
    messages.list(conversationId).then((data) => setMessageList(data.data));

    // Listen for new messages
    echo.private(`conversations.${conversationId}`)
      .listen('.message.received', (event) => {
        setMessageList((prev) => [event.message, ...prev]);
      })
      .listen('.message.sent', (event) => {
        setMessageList((prev) => [event.message, ...prev]);
      });

    return () => {
      echo.leave(`conversations.${conversationId}`);
    };
  }, [conversationId]);

  return { conversation, messages: messageList };
}
```

## CORS Configuration

The backend is already configured to accept requests from `localhost:3000`. For production, update the backend `.env`:

```env
SANCTUM_STATEFUL_DOMAINS=yourdomain.com
SESSION_DOMAIN=yourdomain.com
```

## Complete Example Component

```typescript
'use client';

import { useState, useEffect } from 'react';
import { conversations, messages } from '@/lib/api';
import echo from '@/lib/echo';

export default function ChatComponent({ conversationId }: { conversationId: number }) {
  const [messageList, setMessageList] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // Load messages
    messages.list(conversationId).then((data) => {
      setMessageList(data.data.reverse());
    });

    // Subscribe to real-time updates
    echo.private(`conversations.${conversationId}`)
      .listen('.message.received', (event) => {
        setMessageList((prev) => [...prev, event.message]);
      })
      .listen('.message.sent', (event) => {
        setMessageList((prev) => [...prev, event.message]);
      });

    return () => {
      echo.leave(`conversations.${conversationId}`);
    };
  }, [conversationId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    await messages.send(conversationId, newMessage);
    setNewMessage('');
  };

  return (
    <div>
      <div className="messages">
        {messageList.map((msg) => (
          <div key={msg.id} className={msg.direction}>
            {msg.content}
          </div>
        ))}
      </div>
      <input
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
```

## Testing

Test your integration:

1. Start Laravel backend: `php artisan serve`
2. Start queue worker: `php artisan queue:work`
3. Start Reverb: `php artisan reverb:start`
4. Start Next.js: `npm run dev`
5. Test authentication, sending messages, and real-time updates

## Troubleshooting

### CORS Errors
- Ensure `SANCTUM_STATEFUL_DOMAINS` includes your frontend domain
- Check that API requests include credentials

### WebSocket Connection Failed
- Verify Reverb is running
- Check `REVERB_*` environment variables match on both sides
- Ensure auth token is included in Echo configuration

### 401 Unauthorized
- Check that token is stored in localStorage
- Verify token is included in Authorization header
- Token may have expired - implement refresh logic
