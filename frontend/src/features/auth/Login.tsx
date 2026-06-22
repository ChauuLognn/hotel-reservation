import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User as UserIcon, Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@app/AuthContext';
import { useToast } from '@context/ToastContext';
import Button from '@shared/ui/Button';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', password: '', remember: false });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.password) {
      setError('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    setLoading(true);
    try {
      localStorage.removeItem('currentGuestId');
      const userData = await login(form.username, form.password);
      const userRole = userData?.role || '';

      if (role === 'user') {
        if (['MANAGER', 'EMPLOYEE'].includes(userRole)) {
          showToast('Tài khoản nhân viên được chuyển hướng đến trang quản trị.', 'info');
          navigate('/');
        } else {
          navigate('/user-home');
        }
      } else {
        if (['MANAGER', 'EMPLOYEE'].includes(userRole)) {
          navigate('/');
        } else {
          setError('Tài khoản này không có quyền quản trị!');
        }
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Sai tên đăng nhập hoặc mật khẩu!';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-apple-canvas-parchment flex items-center justify-center p-4">
      <div className="bg-white rounded-apple-lg border border-apple-hairline shadow-sm overflow-hidden max-w-[960px] w-full grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Side: Editorial Banner */}
        <div className="bg-apple-surface-black text-white p-12 flex flex-col justify-center items-center text-center select-none">
          <div className="text-[52px] mb-4">🏨</div>
          <h1 className="font-display font-semibold text-3xl tracking-apple-tight mb-3">Hotel Haven</h1>
          <p className="text-apple-body-muted text-[15px] max-w-xs leading-relaxed">
            Hệ thống quản lý khách sạn thông minh. Trải nghiệm dịch vụ đẳng cấp với công nghệ hiện đại.
          </p>
          <div className="flex gap-4 mt-8 text-lg opacity-75">
            <span title="Chất lượng cao">⭐</span>
            <span title="Bảo mật">🛡️</span>
            <span title="Dịch vụ tốt">✨</span>
          </div>
        </div>

        {/* Right Side: Simple Clean Form */}
        <div className="p-10 md:p-14 flex flex-col justify-center">
          <h2 className="font-display font-semibold text-2xl text-apple-ink tracking-apple-tight mb-1">Đăng nhập</h2>
          <p className="text-apple-ink-muted-48 text-[14px] mb-6">Chọn loại tài khoản để tiếp tục</p>

          {/* Role selector using configurator style chips */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              className={`flex flex-col items-center gap-2 p-3 rounded-apple-md border transition-all active-scale ${
                role === 'user'
                  ? 'border-apple-primary bg-apple-primary/5 text-apple-primary'
                  : 'border-apple-hairline bg-apple-canvas text-apple-ink-muted-80 hover:bg-apple-canvas-parchment'
              }`}
              onClick={() => setRole('user')}
            >
              <UserIcon size={20} />
              <span className="text-[13px] font-semibold">Khách hàng</span>
            </button>
            <button
              type="button"
              className={`flex flex-col items-center gap-2 p-3 rounded-apple-md border transition-all active-scale ${
                role === 'admin'
                  ? 'border-apple-primary bg-apple-primary/5 text-apple-primary'
                  : 'border-apple-hairline bg-apple-canvas text-apple-ink-muted-80 hover:bg-apple-canvas-parchment'
              }`}
              onClick={() => setRole('admin')}
            >
              <Shield size={20} />
              <span className="text-[13px] font-semibold">Quản trị</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-apple-sm text-sm font-medium border border-red-100 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-apple-ink-muted-80" htmlFor="username">
                Tài khoản / Email
              </label>
              <input
                id="username"
                name="username"
                type="text"
                className="w-full bg-apple-canvas text-apple-ink text-[15px] border border-apple-hairline rounded-apple-sm px-4 py-2.5 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all"
                placeholder="Nhập tài khoản hoặc email"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-apple-ink-muted-80" htmlFor="password">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="w-full bg-apple-canvas text-apple-ink text-[15px] border border-apple-hairline rounded-apple-sm pl-4 pr-11 py-2.5 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all"
                  placeholder="Nhập mật khẩu"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-apple-ink-muted-48 hover:text-apple-ink active-scale transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-[13px] my-1 select-none">
              <label className="flex items-center gap-2 text-apple-ink-muted-80 cursor-pointer">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                  className="rounded border-apple-hairline text-apple-primary focus:ring-apple-primary/10"
                />
                Ghi nhớ đăng nhập
              </label>
              <Link to="/forgot-password" className="text-apple-primary hover:underline font-medium">
                Quên mật khẩu?
              </Link>
            </div>

            <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>

          {role === 'user' && (
            <div className="text-center text-[14px] text-apple-ink-muted-80 mt-6 select-none">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-apple-primary hover:underline font-semibold">
                Đăng ký ngay
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
