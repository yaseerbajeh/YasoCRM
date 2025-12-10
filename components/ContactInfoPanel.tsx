'use client';

interface Contact {
  id: number;
  name: string;
  phone: string;
  avatar: string;
  lastSeen: string;
  tags: string[];
  notes: string;
}

interface ContactInfoPanelProps {
  contact: Contact;
}

export default function ContactInfoPanel({ contact }: ContactInfoPanelProps) {
  return (
    <div className="flex h-full w-80 flex-col border-r border-slate-200 bg-white p-6">
      <div className="flex flex-col items-center text-center">
        <img
          src={contact.avatar}
          alt={contact.name}
          className="mb-4 size-24 rounded-full"
        />
        <h3 className="text-xl font-bold text-slate-900">{contact.name}</h3>
        <p className="text-sm text-slate-500">{contact.phone}</p>
        <p className="mt-1 text-xs text-slate-400">آخر ظهور: {contact.lastSeen}</p>
      </div>

      <hr className="my-6 border-slate-200" />

      <div>
        <h4 className="mb-3 text-sm font-semibold text-slate-900">الوسوم</h4>
        <div className="flex flex-wrap gap-2">
          {contact.tags.map((tag, index) => (
            <span
              key={index}
              className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                index === 0
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-purple-100 text-purple-800'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <hr className="my-6 border-slate-200" />

      <div>
        <h4 className="mb-3 text-sm font-semibold text-slate-900">
          ملاحظات داخلية
        </h4>
        <div className="rounded-lg bg-slate-100 p-3">
          <p className="text-sm leading-relaxed text-slate-600">
            {contact.notes}
          </p>
        </div>
      </div>

      <hr className="my-6 border-slate-200" />

      <div>
        <h4 className="mb-3 text-sm font-semibold text-slate-900">
          إحصائيات التفاعل
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
            <span className="text-sm text-slate-600">إجمالي الرسائل</span>
            <span className="text-lg font-bold text-slate-900">47</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
            <span className="text-sm text-slate-600">متوسط وقت الرد</span>
            <span className="text-lg font-bold text-slate-900">2 د</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
            <span className="text-sm text-slate-600">آخر تفاعل</span>
            <span className="text-lg font-bold text-slate-900">اليوم</span>
          </div>
        </div>
      </div>
    </div>
  );
}
