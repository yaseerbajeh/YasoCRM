const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ApiOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
}

interface ApiResponse<T> {
    data: T;
    error?: string;
}

// Get token from localStorage (would be set during login)
function getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('auth_token');
    }
    return null;
}

export async function apiRequest<T>(
    endpoint: string,
    options: ApiOptions = {}
): Promise<ApiResponse<T>> {
    const { method = 'GET', body, headers = {} } = options;
    const token = getAuthToken();

    const config: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...headers,
        },
    };

    if (body && method !== 'GET') {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            return {
                data: null as T,
                error: data.message || data.error || 'An error occurred',
            };
        }

        return { data };
    } catch (error) {
        return {
            data: null as T,
            error: error instanceof Error ? error.message : 'Network error',
        };
    }
}

// Convenience methods
export const api = {
    get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),
    post: <T>(endpoint: string, body: unknown) => apiRequest<T>(endpoint, { method: 'POST', body }),
    put: <T>(endpoint: string, body: unknown) => apiRequest<T>(endpoint, { method: 'PUT', body }),
    patch: <T>(endpoint: string, body: unknown) => apiRequest<T>(endpoint, { method: 'PATCH', body }),
    delete: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'DELETE' }),
};

// Auth helpers
export function setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
    }
}

export function clearAuthToken(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
    }
}

// API Endpoints
export const endpoints = {
    // Auth
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
    updateProfile: '/users/me',

    // Conversations
    conversations: '/conversations',
    conversation: (id: number) => `/conversations/${id}`,
    markAsRead: (id: number) => `/conversations/${id}/read`,

    // Messages
    messages: (conversationId: number) => `/messages/${conversationId}`,
    sendMessage: '/messages',

    // Contacts
    contacts: '/contacts',
    contact: (id: number) => `/contacts/${id}`,

    // Automations
    automations: '/automations',
    automation: (id: number) => `/automations/${id}`,
    toggleAutomation: (id: number) => `/automations/${id}/toggle`,

    // Campaigns/Broadcasts
    broadcasts: '/broadcasts',
    broadcast: (id: number) => `/broadcasts/${id}`,
    sendBroadcast: (id: number) => `/broadcasts/${id}/send`,

    // Analytics
    analyticsSummary: '/analytics/summary',
    analyticsConversations: '/analytics/conversations',
    analyticsMessages: '/analytics/messages',
    analyticsActivities: '/analytics/activities',

    // Sync
    syncTrigger: '/sync/trigger',
    syncStatus: '/sync/status',

    // Tags
    tags: '/tags',

    // Templates
    templates: '/templates',

    // WhatsApp Instances
    whatsappInstances: '/whatsapp-instances',
    whatsappInstance: (id: number) => `/whatsapp-instances/${id}`,
    whatsappInstanceStatus: (id: number) => `/whatsapp-instances/${id}/status`,
    whatsappInstanceQR: (id: number) => `/whatsapp-instances/${id}/qr`,

    // Development endpoints (no auth required)
    dev: {
        conversations: '/dev/conversations',
        conversation: (id: number) => `/dev/conversations/${id}`,
        messages: (conversationId: number) => `/dev/messages/${conversationId}`,
        sendMessage: '/dev/messages',
        contacts: '/dev/contacts',
        contact: (id: number) => `/dev/contacts/${id}`,
        analyticsSummary: '/dev/analytics/summary',
        analyticsConversations: '/dev/analytics/conversations',
        analyticsActivities: '/dev/analytics/activities',
        automations: '/dev/automations',
        broadcasts: '/dev/broadcasts',
    },
};
