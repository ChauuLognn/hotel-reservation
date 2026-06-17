import { useState, useEffect } from 'react';
import { Plus, Search, Home, Key, Wrench } from 'lucide-react';
import Layout from '../components/Layout';
import roomApi from '../api/roomApi';

const STATUS_LABELS = {
  AVAILABLE: { label:'Còn Trống', cls:'badge-success' },
  OCCUPIED: { label:'Đang Thuê', cls:'badge-danger' },
  MAINTENANCE: { label:'Bảo Trì', cls:'badge-warning' },
  CLEANING: { label:'Đang Dọn', cls:'badge-info' },
};

function formatVND(n) { return new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(n||0); }

export default function Rooms() {
  const [tab, setTab] = useState('rooms');
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [form, setForm] = useState({ roomNumber:'', roomTypeName:'', status:'AVAILABLE', floorNumber:'' });
  // Available room search
  const [availSearch, setAvailSearch] = useState({ name:'', checkIn:'', checkOut:'' });
  const [availRooms, setAvailRooms] = useState([]);
  const [availLoading, setAvailLoading] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [rRes, rtRes] = await Promise.all([roomApi.getAll(), roomApi.getAllTypes()]);
      setRooms(Array.isArray(rRes.data) ? rRes.data : []);
      setRoomTypes(Array.isArray(rtRes.data) ? rtRes.data : []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function searchAvailableRooms(e) {
    e.preventDefault();
    setAvailLoading(true);
    try {
      const params = {};
      if (availSearch.name) params.name = availSearch.name;
      if (availSearch.checkIn) params.checkIn = availSearch.checkIn;
      if (availSearch.checkOut) params.checkOut = availSearch.checkOut;
      const res = await roomApi.findAvailable(params);
      setAvailRooms(Array.isArray(res.data) ? res.data : []);
    } catch(e) { console.error(e); setAvailRooms([]); }
    finally { setAvailLoading(false); }
  }

  const filtered = rooms.filter(r => {
    const q = search.toLowerCase();
    return String(r.roomNumber||'').toLowerCase().includes(q)
      || (r.roomTypeName||'').toLowerCase().includes(q)
      || (r.status||'').toLowerCase().includes(q);
  });

  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'AVAILABLE').length,
    occupied: rooms.filter(r => r.status === 'OCCUPIED').length,
    maintenance: rooms.filter(r => r.status === 'MAINTENANCE').length,
  };

  function openAdd() {
    setEditRoom(null);
    setForm({ roomNumber:'', roomTypeName: roomTypes[0]?.name || '', status:'AVAILABLE', floorNumber:'' });
    setShowModal(true);
  }

  function openEdit(r) {
    setEditRoom(r);
    setForm({ roomNumber: String(r.roomNumber||''), roomTypeName: r.roomTypeName||'', status: r.status||'AVAILABLE', floorNumber: String(r.floorNumber||'') });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const payload = {
        roomNumber: Number(form.roomNumber),
        roomTypeName: form.roomTypeName,
        status: form.status,
        floorNumber: form.floorNumber ? Number(form.floorNumber) : null,
      };
      if (editRoom) await roomApi.update(editRoom.id, payload);
      else await roomApi.create(payload);
      setShowModal(false);
      fetchAll();
    } catch(err) { alert('Lỗi: ' + (err?.response?.data?.message || err.message)); }
  }

  return (
    <Layout title="Quản Lý Phòng">
      {/* Stats */}
      <div className="stats-grid">
        {[
          { label:'Tổng Phòng', val: stats.total, icon:<Home size={22} color="#6366f1" />, bg:'#e0e7ff' },
          { label:'Còn Trống', val: stats.available, icon:<Key size={22} color="#10b981" />, bg:'#d1fae5' },
          { label:'Đang Thuê', val: stats.occupied, icon:<Home size={22} color="#ef4444" />, bg:'#fee2e2' },
          { label:'Bảo Trì', val: stats.maintenance, icon:<Wrench size={22} color="#f59e0b" />, bg:'#fef3c7' },
        ].map((s,i) => (
          <div key={i} className="stat-card">
            <div className="stat-content">
              <div className="stat-info"><p>{s.label}</p><h3>{s.val}</h3></div>
              <div className="stat-icon" style={{ background:s.bg }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${tab==='rooms'?'active':''}`} onClick={() => setTab('rooms')}>Phòng</button>
        <button className={`tab-btn ${tab==='types'?'active':''}`} onClick={() => setTab('types')}>Loại Phòng</button>
        <button className={`tab-btn ${tab==='available'?'active':''}`} onClick={() => setTab('available')}>Tìm Phòng Trống</button>
      </div>

      {/* Rooms Tab */}
      {tab === 'rooms' && (
        <div className="table-container">
          <div className="table-header">
            <h3>Tất Cả Phòng</h3>
            <div className="flex gap-2">
              <div className="search-box">
                <Search size={16} className="search-icon" />
                <input className="search-input" placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Thêm Phòng</button>
            </div>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table className="table">
              <thead>
                <tr><th>Số Phòng</th><th>Loại</th><th>Tầng</th><th>Sức Chứa</th><th>Giá/Đêm</th><th>Trạng Thái</th><th>Thao Tác</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center text-gray" style={{padding:'2rem'}}>Đang tải...</td></tr>
                ) : filtered.length ? filtered.map(r => {
                  const st = STATUS_LABELS[r.status] || { label:r.status, cls:'badge-secondary' };
                  return (
                    <tr key={r.id}>
                      <td style={{ fontWeight:700 }}>{r.roomNumber}</td>
                      <td>{r.roomTypeName || '-'}</td>
                      <td>{r.floorNumber || '-'}</td>
                      <td>{r.capacity ? r.capacity + ' người' : '-'}</td>
                      <td style={{ color:'#4f46e5', fontWeight:600 }}>{formatVND(r.basePrice)}</td>
                      <td><span className={`badge-status ${st.cls}`}>{st.label}</span></td>
                      <td>
                        <button className="action-btn edit" onClick={() => openEdit(r)} title="Sửa">✏️</button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={7} className="text-center text-gray" style={{padding:'2rem'}}>Chưa có phòng nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Room Types Tab */}
      {tab === 'types' && (
        <div className="table-container">
          <div className="table-header"><h3>Loại Phòng</h3></div>
          <div style={{ overflowX:'auto' }}>
            <table className="table">
              <thead><tr><th>Tên</th><th>Sức Chứa</th><th>Giá Cơ Bản</th><th>Mô Tả</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="text-center text-gray" style={{padding:'2rem'}}>Đang tải...</td></tr>
                ) : roomTypes.length ? roomTypes.map((rt, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight:600 }}>{rt.name}</td>
                    <td>{rt.capacity} người</td>
                    <td style={{ color:'#4f46e5', fontWeight:600 }}>{formatVND(rt.basePrice)}</td>
                    <td style={{ color:'#6b7280' }}>{rt.description || '-'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="text-center text-gray" style={{padding:'2rem'}}>Chưa có loại phòng nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Available Rooms Tab */}
      {tab === 'available' && (
        <div>
          <form onSubmit={searchAvailableRooms} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr auto', gap:'1rem', marginBottom:'1rem', padding:'1rem', background:'#f9fafb', borderRadius:'10px', border:'1px solid #e5e7eb' }}>
            <div className="form-group" style={{margin:0}}>
              <label className="form-label">Loại Phòng</label>
              <select className="form-input" value={availSearch.name} onChange={e => setAvailSearch({...availSearch, name:e.target.value})}>
                <option value="">-- Tất cả --</option>
                {roomTypes.map(rt => <option key={rt.name} value={rt.name}>{rt.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{margin:0}}>
              <label className="form-label">Ngày Check-in</label>
              <input type="date" className="form-input" value={availSearch.checkIn} onChange={e => setAvailSearch({...availSearch, checkIn:e.target.value})} />
            </div>
            <div className="form-group" style={{margin:0}}>
              <label className="form-label">Ngày Check-out</label>
              <input type="date" className="form-input" value={availSearch.checkOut} onChange={e => setAvailSearch({...availSearch, checkOut:e.target.value})} />
            </div>
            <div style={{display:'flex', alignItems:'flex-end'}}>
              <button type="submit" className="btn btn-primary">Tìm Kiếm</button>
            </div>
          </form>
          <div className="table-container">
            <div className="table-header"><h3>Phòng Trống</h3></div>
            <table className="table">
              <thead><tr><th>Số Phòng</th><th>Loại</th><th>Sức Chứa</th><th>Giá/Đêm</th><th>Trạng Thái</th></tr></thead>
              <tbody>
                {availLoading ? (
                  <tr><td colSpan={5} className="text-center text-gray" style={{padding:'2rem'}}>Đang tìm...</td></tr>
                ) : availRooms.length ? availRooms.map((r,i) => (
                  <tr key={i}>
                    <td style={{fontWeight:700}}>{r.roomNumber}</td>
                    <td>{r.roomTypeName}</td>
                    <td>{r.capacity} người</td>
                    <td style={{color:'#4f46e5',fontWeight:600}}>{formatVND(r.basePrice)}</td>
                    <td><span className="badge-status badge-success">Trống</span></td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="text-center text-gray" style={{padding:'2rem'}}>Nhấn Tìm Kiếm để tìm phòng trống</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add/Edit Room */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editRoom ? 'Sửa Phòng' : 'Thêm Phòng Mới'}</h3>
              <button className="action-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Số Phòng *</label>
                    <input type="number" className="form-input" required value={form.roomNumber} onChange={e => setForm({...form,roomNumber:e.target.value})} placeholder="101" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tầng</label>
                    <input type="number" className="form-input" value={form.floorNumber} onChange={e => setForm({...form,floorNumber:e.target.value})} placeholder="1" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Loại Phòng *</label>
                  <select className="form-input" value={form.roomTypeName} onChange={e => setForm({...form,roomTypeName:e.target.value})} required>
                    <option value="">-- Chọn loại phòng --</option>
                    {roomTypes.map(rt => <option key={rt.name} value={rt.name}>{rt.name} - {formatVND(rt.basePrice)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Trạng Thái</label>
                  <select className="form-input" value={form.status} onChange={e => setForm({...form,status:e.target.value})}>
                    {Object.entries(STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
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
