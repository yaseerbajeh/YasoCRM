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
    text: 'خبرنا بإستعمالهم في رسم عملياتهم يسعدنا اليوم نقدم معلة أنّا منهم من المشغل. يحتاجها الأم.',
    time: '3:30 PM',
    sent: true,
    status: 'delivered',
  },
  {
    id: '3',
    text: 'إذا أصلا لحيحن صفقة من تبقى في العظام الذهبية.',
    time: '2:30 PM',
    sent: false,
  },
  {
    id: '4',
    text: 'قبلالبيت مشين؟',
    time: '2:30 PM',
    sent: true,
    status: 'delivered',
  },
];

const quickReplies = [
  { id: '1', label: 'ترحيبا', active: true },
  { id: '2', label: 'تثقيفة', active: false },
  { id: '3', label: 'عرض سعر', active: false },
  { id: '4', label: 'جدولة', active: false },
];

export default function ChatView() {
  return (
    <div className="flex-1 bg-white flex flex-col">
      <div className="bg-gray-100 px-6 py-3 flex items-center justify-between border-b border-gray-300">
        <div className="flex items-center gap-3">
          <button className="text-gray-600 hover:text-gray-800">
            <MoreVertical size={20} />
          </button>
          <button className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700">
            <Phone size={18} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <img
            src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100"
            alt="أحمد علي"
            className="w-10 h-10 rounded-full object-cover"
          />
          <h2 className="text-lg font-semibold text-gray-800">أحمد علي</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4" dir="rtl">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sent ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-md px-4 py-3 rounded-2xl ${
                msg.sent
                  ? 'bg-green-600 text-white rounded-br-sm'
                  : 'bg-gray-300 text-gray-800 rounded-bl-sm'
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-xs opacity-80">{msg.time}</span>
                {msg.sent && msg.status === 'delivered' && (
                  <span className="text-xs">✓✓</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 py-3 border-t border-gray-300" dir="rtl">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-gray-700 font-medium">قوالب سريعة</span>
          <div className="flex items-center gap-2 flex-1">
            {quickReplies.map((reply) => (
              <button
                key={reply.id}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border-2 transition-colors ${
                  reply.active
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-400 hover:border-gray-500'
                }`}
              >
                {reply.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="text-gray-600 hover:text-gray-800">
            <MoreVertical size={20} />
          </button>
          <div className="flex-1 bg-white border-2 border-gray-300 rounded-lg">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
              <button className="text-gray-600 hover:text-gray-800">
                <Undo size={18} />
              </button>
              <button className="text-gray-600 hover:text-gray-800">
                <Redo size={18} />
              </button>
              <div className="w-px h-5 bg-gray-300" />
              <button className="text-gray-600 hover:text-gray-800">
                <Type size={18} />
              </button>
              <button className="text-gray-600 hover:text-gray-800">
                <Link size={18} />
              </button>
              <button className="text-gray-600 hover:text-gray-800">
                <List size={18} />
              </button>
              <button className="text-gray-600 hover:text-gray-800">
                <ListOrdered size={18} />
              </button>
              <button className="text-gray-600 hover:text-gray-800">
                <Smile size={18} />
              </button>
              <button className="text-gray-600 hover:text-gray-800">
                <Paperclip size={18} />
              </button>
              <button className="text-gray-600 hover:text-gray-800">
                <Bold size={18} />
              </button>
              <button className="text-gray-600 hover:text-gray-800">
                <Italic size={18} />
              </button>
            </div>
            <input
              type="text"
              placeholder="اكتب رسالتك هنا..."
              className="w-full px-3 py-2 text-sm text-right focus:outline-none"
            />
          </div>
          <button className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700">
            <Play size={18} fill="white" />
          </button>
          <button className="text-gray-600 hover:text-gray-800">
            <Paperclip size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
