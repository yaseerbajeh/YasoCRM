import axios, { AxiosInstance } from 'axios';

// API base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true, // For Laravel Sanctum
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized - clear token and redirect to login
            localStorage.removeItem('auth_token');
            // You can add redirect logic here
        }
        return Promise.reject(error);
    }
);

// API methods
export const api = {
    // Contacts
    contacts: {
        getAll: () => apiClient.get('/contacts'),
        getById: (id: number) => apiClient.get(`/contacts/${id}`),
        create: (data: any) => apiClient.post('/contacts', data),
        update: (id: number, data: any) => apiClient.put(`/contacts/${id}`, data),
        delete: (id: number) => apiClient.delete(`/contacts/${id}`),
    },

    // Conversations
    conversations: {
        getAll: () => apiClient.get('/conversations'),
        getById: (id: number) => apiClient.get(`/conversations/${id}`),
        getMessages: (id: number) => apiClient.get(`/conversations/${id}/messages`),
    },

    // Messages
    messages: {
        send: (data: { contact_id: number; message: string; type?: string }) =>
            apiClient.post('/messages', data),
        getById: (id: number) => apiClient.get(`/messages/${id}`),
    },

    // Broadcasts
    broadcasts: {
        getAll: () => apiClient.get('/broadcasts'),
        create: (data: any) => apiClient.post('/broadcasts', data),
        getById: (id: number) => apiClient.get(`/broadcasts/${id}`),
    },

    // Templates
    templates: {
        getAll: () => apiClient.get('/templates'),
        create: (data: any) => apiClient.post('/templates', data),
        update: (id: number, data: any) => apiClient.put(`/templates/${id}`, data),
        delete: (id: number) => apiClient.delete(`/templates/${id}`),
    },

    // Tags
    tags: {
        getAll: () => apiClient.get('/tags'),
        create: (data: any) => apiClient.post('/tags', data),
        update: (id: number, data: any) => apiClient.put(`/tags/${id}`, data),
        delete: (id: number) => apiClient.delete(`/tags/${id}`),
    },

    // WhatsApp Instances
    instances: {
        getAll: () => apiClient.get('/whatsapp-instances'),
        create: (data: any) => apiClient.post('/whatsapp-instances', data),
        getQRCode: (id: number) => apiClient.get(`/whatsapp-instances/${id}/qr`),
        disconnect: (id: number) => apiClient.post(`/whatsapp-instances/${id}/disconnect`),
    },
};

export default apiClient;
