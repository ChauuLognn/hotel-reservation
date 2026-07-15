import { Bell } from 'lucide-react';
import { useAuth } from '@contexts/AuthContext';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-apple-canvas px-6 py-4 flex items-center justify-between border-b border-apple-divider-soft h-[60px] select-none shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      <h2 className="text-[19px] font-display font-semibold text-apple-ink tracking-apple-tight">{title}</h2>
      <div className="flex items-center gap-5">
        {/* Notification Bell */}
        <div className="relative cursor-pointer active-scale">
          <Bell size={20} className="text-apple-ink-muted-80" />
          <span className="absolute -top-1.5 -right-1.5 w-[16px] h-[16px] bg-[#ff3b30] text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-sm">
            3
          </span>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-apple-primary/10 text-apple-primary font-bold flex items-center justify-center text-[14px]">
            {user?.empName?.charAt(0) || 'A'}
          </div>
          <span className="text-[14px] font-semibold text-apple-ink">{user?.empName || 'Quản Trị'}</span>
        </div>
      </div>
    </header>
  );
}
