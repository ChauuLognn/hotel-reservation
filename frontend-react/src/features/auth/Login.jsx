import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', password: '', remember: false });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.password) {
      setError('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    setLoading(true);
    try {
      // Clear old guestId to prevent cross-account booking history
      localStorage.removeItem('currentGuestId');
      const userData = await login(form.username, form.password);
      const userRole = userData?.role || '';
      
      // If Customer tab is active, redirect to customer home
      if (role === 'user') {
        navigate('/user-home');
      } else {
        // Admin tab active: check if user is staff/admin
        if (['MANAGER', 'EMPLOYEE'].includes(userRole)) {
          navigate('/');
        } else {
          setError('Tài khoản này không có quyền quản trị!');
        }
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Sai tên đăng nhập hoặc mật khẩu!';
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
          <div className="logo-icon">🏨</div>
          <h1>Hotel Haven</h1>
          <p>Hệ thống quản lý khách sạn thông minh. Trải nghiệm dịch vụ đẳng cấp với công nghệ hiện đại.</p>
          <div className="features">
            <span title="Chất lượng cao">⭐</span>
            <span title="Bảo mật">🛡️</span>
            <span title="Dịch vụ tốt">✨</span>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-right">
          <h2 className="login-title">Đăng nhập</h2>
          <p className="login-subtitle">Chọn loại tài khoản để tiếp tục</p>

          {/* Role Selector */}
          <div className="role-selector">
            <button
              type="button"
              className={`role-btn ${role === 'user' ? 'active' : ''}`}
              onClick={() => setRole('user')}
            >
              <div className="role-icon">
                <User size={22} color={role === 'user' ? 'white' : '#667eea'} />
              </div>
              <span className="role-label">Khách hàng</span>
            </button>
            <button
              type="button"
              className={`role-btn ${role === 'admin' ? 'active' : ''}`}
              onClick={() => setRole('admin')}
            >
              <div className="role-icon">
                <Shield size={22} color={role === 'admin' ? 'white' : '#667eea'} />
              </div>
              <span className="role-label">Quản trị</span>
            </button>
          </div>

          {/* Error Message */}
          {error && <div className="alert-box alert-error">{error}</div>}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">Tài khoản / Email</label>
              <input
                id="username"
                name="username"
                type="text"
                className="form-input"
                placeholder="Nhập tài khoản hoặc email"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Mật khẩu</label>
              <div className="password-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Nhập mật khẩu"
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

            <div className="remember-forgot">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                />
                Ghi nhớ đăng nhập
              </label>
              <Link to="/forgot-password" className="forgot-link">Quên mật khẩu?</Link>
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          {role === 'user' && (
            <div className="register-link">
              Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
