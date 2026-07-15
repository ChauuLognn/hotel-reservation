import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import authApi from '@services/authApi';
import Button from '@components/ui/Button';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    account: '',
    identityNum: '',
    newPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.account || !form.identityNum || !form.newPassword) {
      setError('Vui lòng điền đầy đủ tất cả các thông tin!');
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword(form);
      setSuccess('Đặt lại mật khẩu thành công! Đang chuyển hướng về trang đăng nhập...');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Thông tin xác thực không đúng, vui lòng kiểm tra lại!';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-apple-canvas-parchment flex items-center justify-center p-4">
      <div className="bg-white rounded-apple-lg border border-apple-hairline shadow-sm overflow-hidden max-w-[960px] w-full grid grid-cols-1 md:grid-cols-2 animate-slide-up">
        
        {/* Left Side: Editorial Banner */}
        <div className="bg-apple-surface-black text-white p-12 flex flex-col justify-center items-center text-center select-none">
          <div className="text-[52px] mb-4">🔑</div>
          <h1 className="font-display font-semibold text-2xl tracking-apple-tight mb-3">Khôi phục mật khẩu</h1>
          <p className="text-apple-body-muted text-[14px] leading-relaxed max-w-xs">
            Nhập thông tin tài khoản và số CCCD/CMND của bạn để thiết lập mật khẩu mới.
          </p>
          <div className="flex gap-4 mt-8 text-lg opacity-75 animate-subtle-float">
            <span title="An toàn">🛡️</span>
            <span title="Nhanh chóng">⚡</span>
            <span title="Bảo mật">🔐</span>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-10 md:p-14 flex flex-col justify-center">
          <h2 className="font-display font-semibold text-2xl text-apple-ink tracking-apple-tight mb-1">Đặt lại mật khẩu</h2>
          <p className="text-apple-ink-muted-48 text-[14px] mb-6">Xác minh danh tính để khôi phục tài khoản</p>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-apple-sm text-sm font-medium border border-red-100 mb-5">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-600 px-4 py-3 rounded-apple-sm text-sm font-medium border border-green-100 mb-5 animate-pulse">
              {success}
            </div>
          )}

          {/* Forgot Password Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-apple-ink-muted-80" htmlFor="account">
                Tên đăng nhập
              </label>
              <input
                id="account"
                name="account"
                type="text"
                className="w-full bg-apple-canvas text-apple-ink text-[15px] border border-apple-hairline rounded-apple-sm px-4 py-2.5 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all"
                placeholder="Nhập tên đăng nhập của bạn"
                value={form.account}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-apple-ink-muted-80" htmlFor="identityNum">
                Số CCCD / CMND
              </label>
              <input
                id="identityNum"
                name="identityNum"
                type="text"
                className="w-full bg-apple-canvas text-apple-ink text-[15px] border border-apple-hairline rounded-apple-sm px-4 py-2.5 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all"
                placeholder="Nhập số CCCD/CMND đã đăng ký"
                value={form.identityNum}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-apple-ink-muted-80" htmlFor="newPassword">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  className="w-full bg-apple-canvas text-apple-ink text-[15px] border border-apple-hairline rounded-apple-sm pl-4 pr-11 py-2.5 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all"
                  placeholder="Nhập mật khẩu mới"
                  value={form.newPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-apple-ink-muted-48 hover:text-apple-ink active-scale"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
              {loading ? 'Đang thực hiện...' : 'Đặt lại mật khẩu'}
            </Button>
          </form>

          <div className="text-center text-[14px] text-apple-ink-muted-80 mt-6 select-none">
            Quay lại{' '}
            <Link to="/login" className="text-apple-primary hover:underline font-semibold">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
