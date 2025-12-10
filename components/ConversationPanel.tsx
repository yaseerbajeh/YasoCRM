'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, Smile, Paperclip, Send, CheckCheck } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Contact {
  id: number;
  name: string;
  phone: string;
  avatar: string;
  status: string;
}

interface Message {
  id: number;
  sender: 'contact' | 'agent';
  text: string;
  time: string;
  read?: boolean;
}

interface ConversationPanelProps {
  contact: Contact;
}

const quickReplies = [
  'شكراً لتواصلك معنا',
  'سأساعدك الآن',
  'يرجى الانتظار قليلاً',
  'تم حل المشكلة',
];

export default function ConversationPanel({ contact }: ConversationPanelProps) {
  const [messageText, setMessageText] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages from database when contact changes
  useEffect(() => {
    if (!contact.id) return;

    const loadMessages = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/test/messages/${contact.id}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [contact.id]);

  const handleSend = async () => {
    if (!messageText.trim()) return;

    const tempMessage: Message = {
      id: Date.now(),
      sender: 'agent',
      text: messageText,
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };

    // Add message to local state immediately for instant feedback
    setMessages((prev) => [...prev, tempMessage]);
    const currentMessage = messageText;
    setMessageText('');

    // Save message to database
    try {
      const response = await axios.post(`${API_URL}/api/test/messages`, {
        contact_id: contact.id,
        message: currentMessage,
        sender: 'agent',
      });

      // Update with the real message from database
      if (response.data.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessage.id ? response.data.message : msg
          )
        );
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove the temp message if it failed
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
      setMessageText(currentMessage); // Restore the message text
    }
  };

  return (
    <div className="flex h-full flex-1 flex-col bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <img
            src={contact.avatar}
            alt={contact.name}
            className="size-10 rounded-full"
          />
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {contact.name}
            </h3>
            <p className="text-xs text-green-600">{contact.status}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex size-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100">
            <Search className="size-5" />
          </button>
          <button className="flex size-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100">
            <MoreVertical className="size-5" />
          </button>
        </div>
      </header>

      <div className="max-h-[60vh] space-y-6 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-slate-500">
            جاري تحميل الرسائل...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center p-12 text-slate-500">
            لا توجد رسائل. ابدأ المحادثة!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end gap-3 ${message.sender === 'agent' ? 'justify-end' : 'justify-start'
                }`}
            >
              <div
                className={`flex flex-col gap-1 ${message.sender === 'agent' ? 'items-end' : 'items-start'
                  }`}
              >
                <p
                  className={`max-w-md rounded-xl px-4 py-3 text-base ${message.sender === 'agent'
                      ? 'rounded-bl-none bg-blue-600 text-white'
                      : 'rounded-br-none bg-white text-slate-900'
                    }`}
                >
                  {message.text}
                </p>

                <div className="flex items-center gap-1 px-1">
                  <span className="text-xs text-slate-400">{message.time}</span>
                  {message.sender === 'agent' && message.read && (
                    <CheckCheck className="size-4 text-blue-600" />
                  )}
                </div>
              </div>

              {message.sender === 'agent' && (
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                  <span className="text-xs font-bold text-white">م</span>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {showQuickReplies && (
        <div className="border-t border-slate-200 bg-white p-4">
          <div className="mb-2 text-xs font-medium text-slate-600">
            ردود سريعة
          </div>
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => setMessageText(reply)}
                className="rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-600 transition-colors hover:bg-blue-100"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      <footer className="border-t border-slate-200 bg-white p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowQuickReplies(!showQuickReplies)}
            className="flex size-10 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100"
          >
            <Smile className="size-5" />
          </button>

          <button className="flex size-10 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100">
            <Paperclip className="size-5" />
          </button>

          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اكتب رسالتك..."
            className="h-12 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <button
            onClick={handleSend}
            disabled={!messageText.trim()}
            className="flex h-12 shrink-0 items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:bg-blue-300"
          >
            إرسال
          </button>
        </div>
      </footer>
    </div>
  );
}
