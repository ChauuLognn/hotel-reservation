import { useState } from 'react';
import { Settings as SettingsIcon, Save, Key } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../context/AuthContext';
import authApi from '../../api/authApi';

export default function Settings() {
  const { user } = useAuth();
  const [form, setForm] = useState({ oldPassword:'', newPassword:'', confirmPassword:'' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleChangePwd(e) {
    e.preventDefault();
    setMsg(''); setErr('');
    if (form.newPassword !== form.confirmPassword) { setErr('Mật khẩu mới không khớp!'); return; }
    if (form.newPassword.length < 6) { setErr('Mật khẩu mới phải ít nhất 6 ký tự!'); return; }
    setLoading(true);
    try {
      await authApi.changePassword({ oldPassword: form.oldPassword, newPassword: form.newPassword });
      setMsg('Đổi mật khẩu thành công!');
      setForm({ oldPassword:'', newPassword:'', confirmPassword:'' });
    } catch(err2) {
      setErr(err2?.response?.data?.message || 'Đổi mật khẩu thất bại!');
    } finally { setLoading(false); }
  }

  return (
    <Layout title="Cài Đặt">
      <div style={{ maxWidth:'640px' }}>
        {/* Profile Info */}
        <div className="card mb-4">
          <div className="card-header"><h3 className="card-title"><SettingsIcon size={18} style={{marginRight:'0.5rem',display:'inline'}} />Thông Tin Tài Khoản</h3></div>
          <div className="card-body">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Họ Tên</label>
                <input className="form-input" value={user?.empName || ''} disabled style={{ background:'#f9fafb' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Tài Khoản</label>
                <input className="form-input" value={user?.account || ''} disabled style={{ background:'#f9fafb' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Chức Vụ</label>
                <input className="form-input" value={user?.role || ''} disabled style={{ background:'#f9fafb' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Mã Nhân Viên</label>
                <input className="form-input" value={user?.empId || ''} disabled style={{ background:'#f9fafb' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="card">
          <div className="card-header"><h3 className="card-title"><Key size={18} style={{marginRight:'0.5rem',display:'inline'}} />Đổi Mật Khẩu</h3></div>
          <div className="card-body">
            {msg && <div className="alert-box alert-success" style={{marginBottom:'1rem'}}>{msg}</div>}
            {err && <div className="alert-box alert-error" style={{marginBottom:'1rem'}}>{err}</div>}
            <form onSubmit={handleChangePwd}>
              <div className="form-group">
                <label className="form-label">Mật Khẩu Hiện Tại</label>
                <input type="password" className="form-input" value={form.oldPassword} onChange={e => setForm({...form,oldPassword:e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Mật Khẩu Mới</label>
                <input type="password" className="form-input" value={form.newPassword} onChange={e => setForm({...form,newPassword:e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Xác Nhận Mật Khẩu Mới</label>
                <input type="password" className="form-input" value={form.confirmPassword} onChange={e => setForm({...form,confirmPassword:e.target.value})} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Save size={16} /> {loading ? 'Đang lưu...' : 'Lưu Mật Khẩu'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
