import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Home, Calendar, ClipboardList,
  Coffee, DollarSign, UserPlus, Shield, LogOut
} from 'lucide-react';
import { useAuth } from '@contexts/AuthContext';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Trang Chủ' },
  { path: '/guests', icon: Users, label: 'Khách Hàng' },
  { path: '/rooms', icon: Home, label: 'Phòng' },
  { path: '/bookings', icon: Calendar, label: 'Đặt Phòng' },
  { path: '/reservations', icon: ClipboardList, label: 'Đặt Chỗ' },
  { path: '/services', icon: Coffee, label: 'Dịch Vụ' },
  { path: '/bills', icon: DollarSign, label: 'Hóa Đơn' },
  { path: '/users', icon: UserPlus, label: 'Người Dùng' },
  { path: '/admin', icon: Shield, label: 'Quản Trị' },
];

export default function Sidebar() {
  const { logout, user } = useAuth();

  return (
    <aside className="w-[260px] flex-shrink-0 bg-apple-surface-black text-white flex flex-col h-full border-r border-white/5 select-none">
      {/* Brand Header */}
      <div className="px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-apple-md bg-white/10 flex items-center justify-center text-white">
            <Home size={20} />
          </div>
          <h1 className="font-display font-semibold text-[17px] tracking-apple-tight text-white">Hotel Haven</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {navItems
          .filter(({ path }) => {
            if (['/users', '/admin'].includes(path)) {
              return user?.role === 'MANAGER';
            }
            return true;
          })
          .map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-apple-sm text-[14px] font-medium transition-all duration-200 active-scale ${
                  isActive
                    ? 'bg-apple-primary text-white shadow-[0_1px_8px_rgba(0,102,204,0.3)]'
                    : 'text-apple-body-muted hover:bg-white/[0.06] hover:text-white'
                }`
              }
            >
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
      </nav>

      {/* Footer Profile */}
      <div className="p-4 border-t border-white/5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-white/10 text-white font-bold flex items-center justify-center text-[14px]">
          {user?.empName?.charAt(0) || 'A'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-white truncate">{user?.empName || 'Quản Trị'}</p>
          <p className="text-[11px] text-white/50 truncate uppercase tracking-wider">{user?.role || 'Admin'}</p>
        </div>
        <button
          onClick={logout}
          className="w-8 h-8 rounded-apple-sm flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/80 active-scale transition-all duration-200"
          title="Đăng xuất"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
