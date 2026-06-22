import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import authApi from './api/authApi';
import Button from '@shared/ui/Button';

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    account: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    address: '',
    identityNum: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (
      !form.account ||
      !form.password ||
      !form.fullName ||
      !form.email ||
      !form.phone ||
      !form.address ||
      !form.identityNum
    ) {
      setError('Vui lòng nhập đầy đủ tất cả các trường!');
      return;
    }

    setLoading(true);
    try {
      await authApi.register(form);
      setSuccess('Đăng ký tài khoản thành công! Đang chuyển hướng về trang đăng nhập...');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Đăng ký thất bại, vui lòng thử lại!';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-apple-canvas-parchment flex items-center justify-center p-4">
      <div className="bg-white rounded-apple-lg border border-apple-hairline shadow-sm overflow-hidden max-w-[1000px] w-full grid grid-cols-1 md:grid-cols-5">
        
        {/* Left Side Banner: 2 columns */}
        <div className="md:col-span-2 bg-apple-surface-black text-white p-10 flex flex-col justify-center items-center text-center select-none">
          <div className="text-[52px] mb-4">🏨</div>
          <h1 className="font-display font-semibold text-2xl tracking-apple-tight mb-3">Hotel Haven</h1>
          <p className="text-apple-body-muted text-[14px] leading-relaxed max-w-xs">
            Tạo tài khoản để đặt phòng nhanh chóng, trải nghiệm dịch vụ tiện nghi sang trọng bậc nhất.
          </p>
          <div className="flex gap-4 mt-6 text-lg opacity-75">
            <span title="Dịch vụ tốt">✨</span>
            <span title="Bảo mật">🛡️</span>
            <span title="Chất lượng cao">⭐</span>
          </div>
        </div>

        {/* Right Side Register Form: 3 columns */}
        <div className="md:col-span-3 p-10 md:p-12">
          <h2 className="font-display font-semibold text-2xl text-apple-ink tracking-apple-tight mb-1">Đăng ký thành viên</h2>
          <p className="text-apple-ink-muted-48 text-[14px] mb-6">Vui lòng điền thông tin của bạn</p>

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

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-apple-ink-muted-80" htmlFor="account">
                  Tên đăng nhập
                </label>
                <input
                  id="account"
                  name="account"
                  type="text"
                  className="w-full bg-apple-canvas text-apple-ink text-[14px] border border-apple-hairline rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all"
                  placeholder="Tên đăng nhập"
                  value={form.account}
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
                    className="w-full bg-apple-canvas text-apple-ink text-[14px] border border-apple-hairline rounded-apple-sm pl-3.5 pr-11 py-2 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all"
                    placeholder="Mật khẩu"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-apple-ink-muted-48 hover:text-apple-ink active-scale"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-apple-ink-muted-80" htmlFor="fullName">
                Họ và tên
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                className="w-full bg-apple-canvas text-apple-ink text-[14px] border border-apple-hairline rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all"
                placeholder="Họ và tên đầy đủ"
                value={form.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-apple-ink-muted-80" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="w-full bg-apple-canvas text-apple-ink text-[14px] border border-apple-hairline rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-apple-ink-muted-80" htmlFor="phone">
                  Số điện thoại
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="w-full bg-apple-canvas text-apple-ink text-[14px] border border-apple-hairline rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all"
                  placeholder="Số điện thoại liên hệ"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-apple-ink-muted-80" htmlFor="identityNum">
                  Số CCCD / CMND
                </label>
                <input
                  id="identityNum"
                  name="identityNum"
                  type="text"
                  className="w-full bg-apple-canvas text-apple-ink text-[14px] border border-apple-hairline rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all"
                  placeholder="CCCD / CMND"
                  value={form.identityNum}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-apple-ink-muted-80" htmlFor="address">
                  Địa chỉ
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  className="w-full bg-apple-canvas text-apple-ink text-[14px] border border-apple-hairline rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all"
                  placeholder="Địa chỉ thường trú"
                  value={form.address}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full mt-4" disabled={loading}>
              {loading ? 'Đang tạo tài khoản...' : 'Đăng ký ngay'}
            </Button>
          </form>

          <div className="text-center text-[14px] text-apple-ink-muted-80 mt-6 select-none">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-apple-primary hover:underline font-semibold">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
