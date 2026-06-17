import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import authApi from '../../api/authApi';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    account: '',
    identityNum: '',
    newPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
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
    } catch (err) {
      const msg = err?.response?.data?.message || 'Thông tin xác thực không đúng, vui lòng kiểm tra lại!';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Side - Branding */}
        <div className="login-left">
          <div className="logo-icon">🔑</div>
          <h1>Khôi phục mật khẩu</h1>
          <p>Nhập thông tin tài khoản và số CCCD/CMND của bạn để thiết lập mật khẩu mới.</p>
          <div className="features">
            <span title="An toàn">🛡️</span>
            <span title="Nhanh chóng">⚡</span>
            <span title="Bảo mật">🔐</span>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="login-right">
          <h2 className="login-title">Đặt lại mật khẩu</h2>
          <p className="login-subtitle">Xác minh danh tính để khôi phục tài khoản</p>

          {/* Messages */}
          {error && <div className="alert-box alert-error">{error}</div>}
          {success && <div className="alert-box alert-success">{success}</div>}

          {/* Forgot Password Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="account">Tên đăng nhập</label>
              <input
                id="account"
                name="account"
                type="text"
                className="form-input"
                placeholder="Nhập tên đăng nhập của bạn"
                value={form.account}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="identityNum">Số CCCD / CMND</label>
              <input
                id="identityNum"
                name="identityNum"
                type="text"
                className="form-input"
                placeholder="Nhập số CCCD/CMND đã đăng ký"
                value={form.identityNum}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="newPassword">Mật khẩu mới</label>
              <div className="password-wrapper">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Nhập mật khẩu mới"
                  value={form.newPassword}
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

            <button type="submit" className="btn-login" style={{ marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Đang thực hiện...' : 'Đặt lại mật khẩu'}
            </button>
          </form>

          <div className="register-link">
            Quay lại <Link to="/login">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
