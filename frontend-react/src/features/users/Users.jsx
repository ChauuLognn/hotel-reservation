import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, UserPlus } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import userApi from '../../api/userApi';

const ROLES = ['ADMIN','MANAGER','RECEPTIONIST','EMPLOYEE'];
const ROLE_BADGE = {
  ADMIN: 'badge-danger', MANAGER: 'badge-warning',
  RECEPTIONIST: 'badge-info', EMPLOYEE: 'badge-secondary',
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await userApi.getAllEmps();
      setUsers(res.data?.data || res.data || []);
    } catch(e) { console.error(e); setUsers([]); }
    finally { setLoading(false); }
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (u.firstName+' '+u.lastName).toLowerCase().includes(q)
      || (u.email||'').toLowerCase().includes(q)
      || (u.role?.name||'').toLowerCase().includes(q);
  });

  return (
    <Layout title="Quản Lý Người Dùng">
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-content"><div className="stat-info"><p>Tổng Nhân Viên</p><h3>{users.length}</h3></div><div className="stat-icon"><UserPlus size={22} color="#6366f1" /></div></div></div>
        {ROLES.map(r => (
          <div key={r} className="stat-card" style={{borderColor: r==='ADMIN'?'#ef4444': r==='MANAGER'?'#f59e0b': r==='RECEPTIONIST'?'#3b82f6':'#9ca3af'}}>
            <div className="stat-content">
              <div className="stat-info">
                <p>{r}</p>
                <h3>{users.filter(u => u.role?.name === r).length}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="table-container">
        <div className="table-header">
          <h3>Danh Sách Nhân Viên</h3>
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input className="search-input" placeholder="Tìm nhân viên..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table className="table">
            <thead><tr><th>Họ Tên</th><th>Email</th><th>Điện Thoại</th><th>Chức Vụ</th><th>CMND/CCCD</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center text-gray" style={{padding:'2rem'}}>Đang tải...</td></tr>
              ) : filtered.length ? filtered.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight:600 }}>{u.firstName} {u.lastName}</td>
                  <td>{u.email || '-'}</td>
                  <td>{u.phone || '-'}</td>
                  <td><span className={`badge-status ${ROLE_BADGE[u.role?.name]||'badge-secondary'}`}>{u.role?.name || '-'}</span></td>
                  <td>{u.identityNum || '-'}</td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="text-center text-gray" style={{padding:'2rem'}}>Không có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
