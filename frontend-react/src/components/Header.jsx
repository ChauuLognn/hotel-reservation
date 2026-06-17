import { Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ title }) {
  const { user } = useAuth();

  return (
    <header className="app-header">
      <h2 className="header-title">{title}</h2>
      <div className="header-actions">
        <div className="notification-badge">
          <Bell size={20} color="#6b7280" />
          <span className="badge">3</span>
        </div>
        <div className="user-info">
          <div className="user-avatar">
            {user?.empName?.charAt(0) || 'A'}
          </div>
          <span className="user-name">{user?.empName || 'Quản Trị'}</span>
        </div>
      </div>
    </header>
  );
}
