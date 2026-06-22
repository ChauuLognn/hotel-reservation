import React, { ReactNode } from 'react';
import { useAuth } from '@app/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Home, Calendar, LogOut, Menu, X } from 'lucide-react';
import Button from '@shared/ui/Button';

interface CustomerLayoutProps {
  children: ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function CustomerLayout({ children, activeSection, onSectionChange }: CustomerLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const menuItems = [
    { id: 'home', label: 'Trang Chủ', icon: <Home size={14} /> },
    { id: 'rooms', label: 'Phòng Trống', icon: <Home size={14} /> },
    { id: 'bookings', label: 'Đặt Phòng Của Tôi', icon: <Calendar size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-apple-canvas-parchment flex flex-col font-sans text-apple-ink">
      {/* 1. Global Navigation Bar (global-nav: black, 44px) */}
      <nav className="bg-apple-surface-black text-white h-11 px-4 flex items-center justify-between z-[999] select-none text-[12px] font-normal tracking-apple-display-tight">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onSectionChange('home')}>
            <span className="text-[16px]">🏨</span>
            <span className="font-semibold text-white tracking-apple-tight">Hotel Haven</span>
          </div>

          {/* Desktop menu links */}
          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`text-[12px] transition-colors duration-150 hover:text-white ${activeSection === item.id ? 'text-white font-semibold' : 'text-apple-body-muted'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-apple-body-muted text-[12px]">Chào, {user.empName || user.account}</span>
                <button
                  onClick={logout}
                  className="text-apple-body-muted hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <LogOut size={12} />
                  <span>Đăng Xuất</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="text-apple-body-muted hover:text-white transition-colors"
              >
                Đăng Nhập
              </button>
            )}
          </div>

          {/* Mobile hamburger menu toggle */}
          <button className="md:hidden text-white hover:opacity-80" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-11 bg-apple-surface-black/95 z-[990] flex flex-col p-6 text-[16px] text-white">
          <div className="flex flex-col gap-6">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSectionChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left text-lg pb-2 border-b border-white/5 transition-colors ${activeSection === item.id ? 'text-apple-primary-on-dark font-semibold' : 'text-apple-body-muted'
                  }`}
              >
                {item.label}
              </button>
            ))}
            {user ? (
              <>
                <div className="text-sm text-apple-body-muted pt-2">Đăng nhập với: {user.empName || user.account}</div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-left text-red-400 hover:text-red-300 flex items-center gap-2 pt-2"
                >
                  <LogOut size={18} />
                  <span>Đăng Xuất</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
                className="text-left text-apple-primary-on-dark hover:opacity-90 pt-2"
              >
                Đăng Nhập
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. Sub Navigation Bar (sub-nav-frosted: frosted glass, 52px, sticky) */}
      <div className="sticky top-0 z-[100] h-[52px] border-b border-apple-divider-soft backdrop-blur-frosted flex items-center px-4">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          <h2
            onClick={() => onSectionChange('home')}
            className="font-display font-semibold text-lg text-apple-ink cursor-pointer hover:opacity-85 select-none"
          >
            Haven Premium
          </h2>
          <div className="flex items-center gap-4">
            <Button variant="primary" onClick={() => onSectionChange('rooms')} className="h-[32px] !py-1 text-xs font-semibold">
              Xem phòng trống
            </Button>
          </div>
        </div>
      </div>

      {/* Main Page Canvas */}
      <main className="flex-grow">
        {children}
      </main>

      {/* 3. Footer (Parchment, dense columns with 2.41 line height) */}
      <footer className="bg-apple-canvas-parchment border-t border-apple-divider-soft pt-16 pb-8 px-6 select-none">
        <div className="max-w-7xl mx-auto">
          {/* Dense link grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="text-[12px] font-semibold text-apple-ink uppercase tracking-wider mb-3">Khám Phá</h4>
              <ul className="text-[12px] text-apple-ink-muted-80 leading-[2.41] flex flex-col">
                <li><a href="#rooms" onClick={(e) => { e.preventDefault(); onSectionChange('rooms'); }} className="hover:underline">Phòng VIP Suite</a></li>
                <li><a href="#rooms" onClick={(e) => { e.preventDefault(); onSectionChange('rooms'); }} className="hover:underline">Phòng Deluxe</a></li>
                <li><a href="#rooms" onClick={(e) => { e.preventDefault(); onSectionChange('rooms'); }} className="hover:underline">Phòng Standard</a></li>
                <li><a href="#amenities" className="hover:underline">Hồ bơi ngoài trời</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[12px] font-semibold text-apple-ink uppercase tracking-wider mb-3">Dịch Vụ</h4>
              <ul className="text-[12px] text-apple-ink-muted-80 leading-[2.41] flex flex-col">
                <li><a href="#spa" className="hover:underline">Spa & Chăm sóc sức khỏe</a></li>
                <li><a href="#dining" className="hover:underline">Nhà hàng 5 sao</a></li>
                <li><a href="#gym" className="hover:underline">Phòng Gym hiện đại</a></li>
                <li><a href="#airport" className="hover:underline">Đưa đón sân bay</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[12px] font-semibold text-apple-ink uppercase tracking-wider mb-3">Hỗ Trợ</h4>
              <ul className="text-[12px] text-apple-ink-muted-80 leading-[2.41] flex flex-col">
                <li><span className="hover:underline cursor-pointer">Trung tâm trợ giúp</span></li>
                <li><span className="hover:underline cursor-pointer">Điều khoản dịch vụ</span></li>
                <li><span className="hover:underline cursor-pointer">Chính sách bảo mật</span></li>
                <li><span className="hover:underline cursor-pointer">Liên hệ lễ tân</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[12px] font-semibold text-apple-ink uppercase tracking-wider mb-3">Tài Khoản</h4>
              <ul className="text-[12px] text-apple-ink-muted-80 leading-[2.41] flex flex-col">
                {user ? (
                  <>
                    <li><span onClick={() => onSectionChange('bookings')} className="hover:underline cursor-pointer">Đặt phòng của tôi</span></li>
                    <li><span onClick={logout} className="hover:underline cursor-pointer">Đăng xuất</span></li>
                  </>
                ) : (
                  <>
                    <li><span onClick={() => navigate('/login')} className="hover:underline cursor-pointer">Đăng nhập</span></li>
                    <li><span onClick={() => navigate('/register')} className="hover:underline cursor-pointer">Đăng ký khách hàng</span></li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Legal Fine Print */}
          <div className="border-t border-apple-divider-soft pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-apple-ink-muted-48">
            <p>Copyright © {new Date().getFullYear()} Hotel Haven Inc. Bảo lưu mọi quyền.</p>
            <div className="flex gap-4">
              <span>Chính sách bảo mật</span>
              <span className="text-apple-divider-soft">|</span>
              <span>Điều khoản sử dụng</span>
              <span className="text-apple-divider-soft">|</span>
              <span>Bản đồ trang web</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
