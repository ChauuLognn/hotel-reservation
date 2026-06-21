import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import authApi from '../../api/authApi';

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
    identityNum: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validations
    if (!form.account || !form.password || !form.fullName || !form.email || !form.phone || !form.address || !form.identityNum) {
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
    } catch (err) {
      const msg = err?.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại!';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container" style={{ maxWidth: '1000px' }}>
        {/* Left Side - Branding */}
        <div className="login-left">
          <div className="logo-icon">🏨</div>
          <h1>Hotel Haven</h1>
          <p>Tạo tài khoản để đặt phòng nhanh chóng, trải nghiệm dịch vụ tiện nghi sang trọng bậc nhất.</p>
          <div className="features">
            <span title="Dịch vụ tốt">✨</span>
            <span title="Bảo mật">🛡️</span>
            <span title="Chất lượng cao">⭐</span>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="login-right" style={{ padding: '40px 48px' }}>
          <h2 className="login-title">Đăng ký thành viên</h2>
          <p className="login-subtitle">Vui lòng điền thông tin của bạn</p>

          {/* Messages */}
          {error && <div className="alert-box alert-error">{error}</div>}
          {success && <div className="alert-box alert-success">{success}</div>}

          {/* Register Form */}
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="account">Tên đăng nhập</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="account"
                    name="account"
                    type="text"
                    className="form-input"
                    placeholder="Tên đăng nhập"
                    value={form.account}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">Mật khẩu</label>
                <div className="password-wrapper">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Mật khẩu"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Họ và tên</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                className="form-input"
                placeholder="Họ và tên đầy đủ"
                value={form.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone">Số điện thoại</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="form-input"
                  placeholder="Số điện thoại liên hệ"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="identityNum">Số CCCD / CMND</label>
                <input
                  id="identityNum"
                  name="identityNum"
                  type="text"
                  className="form-input"
                  placeholder="CCCD/CMND"
                  value={form.identityNum}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="address">Địa chỉ</label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  className="form-input"
                  placeholder="Địa chỉ thường trú"
                  value={form.address}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-login" style={{ marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Đang tạo tài khoản...' : 'Đăng ký ngay'}
            </button>
          </form>

          <div className="register-link">
            Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
