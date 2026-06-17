import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Home, Calendar, ClipboardList,
  Coffee, DollarSign, UserPlus, Shield, Settings, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Trang Chủ' },
  { path: '/guests', icon: Users, label: 'Khách Hàng' },
  { path: '/rooms', icon: Home, label: 'Phòng' },
  { path: '/bookings', icon: Calendar, label: 'Đặt Phòng' },
  { path: '/reservations', icon: ClipboardList, label: 'Đặt Chỗ' },
  { path: '/services', icon: Coffee, label: 'Dịch Vụ' },
  { path: '/bills', icon: DollarSign, label: 'Hóa Đơn' },
  { path: '/users', icon: UserPlus, label: 'Người Dùng' },
  { path: '/admin', icon: Shield, label: 'Quản Trị' },];

export default function Sidebar() {
  const { logout, user } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <Home size={24} />
          </div>
          <h1 className="sidebar-title">Hotel Haven</h1>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user?.empName?.charAt(0) || 'A'}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.empName || 'Quản Trị'}</span>
            <span className="sidebar-user-role">{user?.role || 'Admin'}</span>
          </div>
        </div>
        <button onClick={logout} className="sidebar-logout" title="Đăng xuất">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
