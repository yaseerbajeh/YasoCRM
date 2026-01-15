import { ChevronLeft } from 'lucide-react';

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  message: string;
  time: string;
  status: string;
  statusColor: string;
}

const conversations: Conversation[] = [
  {
    id: '1',
    name: 'أحمد علي',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100',
    message: 'مرحباً! أنا مهتم بخدماتكم.',
    time: '2:30 PM',
    status: 'عمل متواصل',
    statusColor: 'bg-green-600',
  },
  {
    id: '2',
    name: 'سارة محمد',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100',
    message: 'أخبرتنا النتائج',
    time: '2:30 PM',
    status: 'عمل حالي',
    statusColor: 'bg-blue-600',
  },
  {
    id: '3',
    name: 'خالد عمر',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=100',
    message: 'أخبرتنا حالي',
    time: '2:30 PM',
    status: 'متواصلة',
    statusColor: 'bg-orange-500',
  },
  {
    id: '4',
    name: 'خالد عمر',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=100',
    message: 'أخبرتنا حالي',
    time: '2:30 PM',
    status: 'متابعة',
    statusColor: 'bg-orange-500',
  },
  {
    id: '5',
    name: 'أحمد علي',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100',
    message: 'أخبرتنا النجاس، مرحبًا بخدماتكم.',
    time: '2:30 PM',
    status: 'عمل متواصل',
    statusColor: 'bg-green-600',
  },
  {
    id: '6',
    name: 'سارة محمد',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100',
    message: 'أخبرتنا النجاس، علني معلم التفصيل.',
    time: '2:30 PM',
    status: 'عمل حالي',
    statusColor: 'bg-blue-600',
  },
  {
    id: '7',
    name: 'سارة محمد',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100',
    message: 'مرحبًا بخدماتكم.',
    time: '2:30 PM',
    status: 'عمل متواصل',
    statusColor: 'bg-green-600',
  },
  {
    id: '8',
    name: 'خالد عمر',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=100',
    message: 'أخبرتنا حالي',
    time: '2:30 PM',
    status: 'متواصلة',
    statusColor: 'bg-orange-500',
  },
];

export default function ConversationsList() {
  return (
    <div className="w-80 bg-gray-100 border-l border-gray-300 flex flex-col">
      <div className="bg-gray-200 px-4 py-3 flex items-center justify-between border-b border-gray-300">
        <ChevronLeft size={20} className="text-gray-700" />
        <h2 className="text-lg font-semibold text-gray-800">الدردشات</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className="px-4 py-3 border-b border-gray-300 hover:bg-gray-200 cursor-pointer flex items-start gap-3"
          >
            <img
              src={conv.avatar}
              alt={conv.name}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="text-sm font-semibold text-gray-800 truncate">
                  {conv.name}
                </h3>
                <span className="text-xs text-gray-600 flex-shrink-0">{conv.time}</span>
              </div>
              <p className="text-sm text-gray-600 truncate mb-1">{conv.message}</p>
              <span
                className={`${conv.statusColor} text-white text-xs px-2 py-0.5 rounded-full inline-block`}
              >
                {conv.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
