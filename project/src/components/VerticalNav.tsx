import { Grid, MessageCircle, Users, BarChart3, Settings } from 'lucide-react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function NavItem({ icon, label, active }: NavItemProps) {
  return (
    <button
      className={`flex flex-col items-center justify-center gap-1 py-4 px-3 transition-colors ${
        active ? 'text-green-600' : 'text-gray-600 hover:text-gray-800'
      }`}
    >
      {icon}
      <span className="text-xs text-center leading-tight">{label}</span>
    </button>
  );
}

export default function VerticalNav() {
  return (
    <div className="w-20 bg-gray-100 border-l border-gray-300 flex flex-col">
      <NavItem icon={<Grid size={24} />} label="لوحة القيادة" active />
      <NavItem icon={<MessageCircle size={24} />} label="المحادثات" />
      <NavItem icon={<Users size={24} />} label="جهات الاتصال" />
      <NavItem icon={<BarChart3 size={24} />} label="التحليلات" />
      <NavItem icon={<Settings size={24} />} label="الإعدادات" />
    </div>
  );
}
