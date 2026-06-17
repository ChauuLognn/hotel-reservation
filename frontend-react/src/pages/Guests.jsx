import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Users } from 'lucide-react';
import Layout from '../components/Layout';
import guestApi from '../api/guestApi';

export default function Guests() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editGuest, setEditGuest] = useState(null);
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', phone:'', identityNum:'', address:'' });

  useEffect(() => { fetchGuests(); }, []);

  async function fetchGuests() {
    setLoading(true);
    try {
      const res = await guestApi.getAll();
      // Backend trả về List<GuestDto> trực tiếp (không wrap)
      setGuests(Array.isArray(res.data) ? res.data : []);
    } catch (e) { 
      console.error('Lỗi tải khách:', e);
      setGuests([]); 
    }
    finally { setLoading(false); }
  }

  const filtered = guests.filter(g => {
    const q = search.toLowerCase();
    return ((g.firstName||'')+(g.lastName||'')).toLowerCase().includes(q)
      || (g.email||'').toLowerCase().includes(q)
      || (g.phone||'').toLowerCase().includes(q)
      || (g.identityNum||'').toLowerCase().includes(q);
  });

  function openAdd() { setEditGuest(null); setForm({ firstName:'',lastName:'',email:'',phone:'',identityNum:'',address:'' }); setShowModal(true); }
  function openEdit(g) { setEditGuest(g); setForm({ firstName:g.firstName||'',lastName:g.lastName||'',email:g.email||'',phone:g.phone||'',identityNum:g.identityNum||'',address:g.address||'' }); setShowModal(true); }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editGuest) { 
        await guestApi.update(editGuest.id, form); 
      } else { 
        await guestApi.create(form); 
      }
      setShowModal(false);
      fetchGuests();
    } catch (err) { 
      alert('Lỗi: ' + (err?.response?.data?.message || err.message)); 
    }
  }

  async function handleDelete(id) {
    if (!confirm('Xóa khách hàng này?')) return;
    try { await guestApi.delete(id); fetchGuests(); }
    catch (err) { alert('Lỗi: ' + (err?.response?.data?.message || err.message)); }
  }

  return (
    <Layout title="Quản Lý Khách Hàng">
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info"><p>Tổng Khách</p><h3>{guests.length}</h3></div>
            <div className="stat-icon"><Users size={22} color="#6366f1" /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info"><p>Khách Tháng Này</p><h3>{guests.filter(g => new Date(g.createdAt||Date.now()).getMonth() === new Date().getMonth()).length}</h3></div>
            <div className="stat-icon" style={{background:'#dbeafe'}}><Users size={22} color="#3b82f6" /></div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-header">
          <h3>Danh Sách Khách Hàng</h3>
          <div className="flex gap-2">
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input className="search-input" placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={openAdd}>
              <Plus size={16} /> Thêm Khách
            </button>
          </div>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th><th>Họ Tên</th><th>Email</th><th>Điện Thoại</th><th>CMND/CCCD</th><th>Địa Chỉ</th><th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center text-gray" style={{padding:'2rem'}}>Đang tải...</td></tr>
              ) : filtered.length ? (
                filtered.map(g => (
                  <tr key={g.id}>
                    <td style={{color:'#9ca3af', fontSize:'0.8rem'}}>#{g.id}</td>
                    <td style={{ fontWeight:600 }}>{g.firstName} {g.lastName}</td>
                    <td>{g.email || '-'}</td>
                    <td>{g.phone || '-'}</td>
                    <td>{g.identityNum || '-'}</td>
                    <td style={{maxWidth:'200px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{g.address || '-'}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="action-btn edit" onClick={() => openEdit(g)} title="Sửa"><Edit2 size={15} /></button>
                        <button className="action-btn delete" onClick={() => handleDelete(g.id)} title="Xóa"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="text-center text-gray" style={{padding:'2rem'}}>
                  {search ? 'Không tìm thấy kết quả' : 'Chưa có khách hàng nào'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editGuest ? 'Sửa Khách Hàng' : 'Thêm Khách Hàng Mới'}</h3>
              <button className="action-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Họ *</label>
                    <input className="form-input" required value={form.firstName} onChange={e => setForm({...form, firstName:e.target.value})} placeholder="Nguyễn" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tên *</label>
                    <input className="form-input" required value={form.lastName} onChange={e => setForm({...form, lastName:e.target.value})} placeholder="Văn A" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" value={form.email} onChange={e => setForm({...form, email:e.target.value})} placeholder="example@email.com" />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Điện Thoại</label>
                    <input className="form-input" value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} placeholder="0912345678" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CMND/CCCD</label>
                    <input className="form-input" value={form.identityNum} onChange={e => setForm({...form, identityNum:e.target.value})} placeholder="012345678901" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Địa Chỉ</label>
                  <input className="form-input" value={form.address} onChange={e => setForm({...form, address:e.target.value})} placeholder="123 Đường ABC, TP.HCM" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">💾 Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
