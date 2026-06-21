import { useState, useEffect } from 'react';
import { Plus, Search, Home, Key, Wrench, Edit2, Trash2, Eye } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import roomApi from '../../api/roomApi';
import { formatVND } from '@shared/utils/format';
import { ROOM_STATUS } from '@shared/constants/statusMaps';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

export default function Rooms() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const isManager = user?.role === 'MANAGER';
  const [tab, setTab] = useState('rooms');
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [form, setForm] = useState({ roomNumber:'', roomTypeName:'', status:'READY', floorNumber:'' });
  const [viewRoom, setViewRoom] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Room Types states
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editType, setEditType] = useState(null);
  const [typeForm, setTypeForm] = useState({ name:'', capacity:'', basePrice:'', description:'' });

  // Available room search
  const [availSearch, setAvailSearch] = useState({ name:'', checkIn:'', checkOut:'' });
  const [availRooms, setAvailRooms] = useState([]);
  const [availLoading, setAvailLoading] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [rRes, rtRes] = await Promise.all([roomApi.getAll(), roomApi.getAllTypes()]);
      const rawRooms = rRes.data?.data || rRes.data || [];
      const rawTypes = rtRes.data?.data || rtRes.data || [];
      
      const mappedRooms = rawRooms.map(r => {
        const typeInfo = rawTypes.find(t => t.name === r.typeName);
        return {
          id: r.id,
          roomNumber: r.id,
          roomTypeName: r.typeName,
          floorNumber: Math.floor(r.id / 100) || 1,
          capacity: typeInfo ? typeInfo.capacity : 1,
          basePrice: typeInfo ? typeInfo.basePrice : 0,
          status: r.status
        };
      });
      setRooms(mappedRooms);
      setRoomTypes(rawTypes);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function searchAvailableRooms(e) {
    e.preventDefault();
    if (availSearch.checkIn && availSearch.checkOut && new Date(availSearch.checkIn) >= new Date(availSearch.checkOut)) {
      showToast("Ngày check-out phải sau ngày check-in!", "warning");
      return;
    }
    setAvailLoading(true);
    try {
      const params = {};
      if (availSearch.name) params.name = availSearch.name;
      if (availSearch.checkIn) params.checkIn = availSearch.checkIn;
      if (availSearch.checkOut) params.checkOut = availSearch.checkOut;
      const res = await roomApi.findAvailable(params);
      const list = res.data?.data || res.data || [];
      setAvailRooms(Array.isArray(list) ? list : []);
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
    ready: rooms.filter(r => r.status === 'READY').length,
    underRepair: rooms.filter(r => r.status === 'UNDER_REPAIR').length,
  };

  function openAdd() {
    setEditRoom(null);
    setForm({ roomNumber:'', roomTypeName: roomTypes[0]?.name || '', status:'READY', floorNumber:'' });
    setShowModal(true);
  }

  function openViewRoom(r) {
    setViewRoom(r);
    setShowViewModal(true);
  }

  function openEdit(r) {
    setEditRoom(r);
    setForm({ 
      roomNumber: String(r.roomNumber||''), 
      roomTypeName: r.roomTypeName||'', 
      status: r.status||'READY', 
      floorNumber: String(r.floorNumber||'') 
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const payload = {
        id: Number(form.roomNumber),
        typeName: form.roomTypeName,
        status: form.status,
      };
      if (editRoom) {
        await roomApi.update(editRoom.id, payload);
        showToast('Đã cập nhật thông tin phòng thành công!', 'success');
      } else {
        await roomApi.create(payload);
        showToast('Đã thêm phòng mới thành công!', 'success');
      }
      setShowModal(false);
      fetchAll();
    } catch(err) { showToast('Lỗi: ' + (err?.response?.data?.message || err.message), 'error'); }
  }


  async function handleDeleteRoom(id, roomNumber) {
    const isConfirmed = await confirm({
      title: 'Xóa Phòng',
      message: `Bạn có chắc chắn muốn xóa phòng ${roomNumber}?`
    });
    if (!isConfirmed) return;
    try {
      await roomApi.delete(id);
      showToast('Đã xóa phòng thành công!', 'success');
      fetchAll();
    } catch(err) { showToast('Lỗi: ' + (err?.response?.data?.message || err.message), 'error'); }
  }

  // Room Types CRUD handlers
  function openAddType() {
    setEditType(null);
    setTypeForm({ name:'', capacity:'', basePrice:'', description:'' });
    setShowTypeModal(true);
  }

  function openEditType(rt) {
    setEditType(rt);
    setTypeForm({ name: rt.name, capacity: String(rt.capacity || ''), basePrice: String(rt.basePrice || ''), description: rt.description || '' });
    setShowTypeModal(true);
  }

  async function handleTypeSubmit(e) {
    e.preventDefault();
    try {
      const payload = {
        name: typeForm.name,
        capacity: Number(typeForm.capacity),
        basePrice: Number(typeForm.basePrice),
        description: typeForm.description,
      };
      if (editType) {
        await roomApi.updateType(editType.name, payload);
        showToast('Đã cập nhật loại phòng thành công!', 'success');
      } else {
        await roomApi.createType(payload);
        showToast('Đã thêm loại phòng mới thành công!', 'success');
      }
      setShowTypeModal(false);
      fetchAll();
    } catch(err) { showToast('Lỗi: ' + (err?.response?.data?.message || err.message), 'error'); }
  }

  async function handleDeleteType(name) {
    const isConfirmed = await confirm({
      title: 'Xóa Loại Phòng',
      message: `Bạn có chắc chắn muốn xóa loại phòng "${name}"?`
    });
    if (!isConfirmed) return;
    try {
      await roomApi.deleteType(name);
      showToast('Đã xóa loại phòng thành công!', 'success');
      fetchAll();
    } catch(err) { showToast('Lỗi: ' + (err?.response?.data?.message || err.message), 'error'); }
  }

  return (
    <Layout title="Quản Lý Phòng">
      {/* Stats */}
      <div className="stats-grid">
        {[
          { label:'Tổng Phòng', val: stats.total, icon:<Home size={22} color="#6366f1" />, bg:'#e0e7ff' },
          { label:'Sẵn Sàng', val: stats.ready, icon:<Key size={22} color="#10b981" />, bg:'#d1fae5' },
          { label:'Đang Sửa Chữa', val: stats.underRepair, icon:<Wrench size={22} color="#f59e0b" />, bg:'#fef3c7' },
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
              {isManager && <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Thêm Phòng</button>}
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
                  const st = ROOM_STATUS[r.status] || { label:r.status, cls:'badge-secondary' };
                  return (
                    <tr key={r.id}>
                      <td style={{ fontWeight:700 }}>{r.roomNumber}</td>
                      <td>{r.roomTypeName || '-'}</td>
                      <td>{r.floorNumber || '-'}</td>
                      <td>{r.capacity ? r.capacity + ' người' : '-'}</td>
                      <td style={{ color:'#4f46e5', fontWeight:600 }}>{formatVND(r.basePrice)}</td>
                      <td><span className={`badge-status ${st.cls}`}>{st.label}</span></td>
                      <td>
                        <div className="flex gap-2">
                          <button className="action-btn view" onClick={() => openViewRoom(r)} title="Xem Chi Tiết"><Eye size={15} /></button>
                          {isManager && <button className="action-btn edit" onClick={() => openEdit(r)} title="Sửa"><Edit2 size={15} /></button>}
                          {isManager && <button className="action-btn delete" onClick={() => handleDeleteRoom(r.id, r.roomNumber)} title="Xóa"><Trash2 size={15} /></button>}
                        </div>
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
          <div className="table-header">
            <h3>Loại Phòng</h3>
            {isManager && <button className="btn btn-primary" onClick={openAddType}><Plus size={16} /> Thêm Loại Phòng</button>}
          </div>
          <div style={{ overflowX:'auto' }}>
            <table className="table">
              <thead><tr><th>Tên</th><th>Sức Chứa</th><th>Giá Cơ Bản</th><th>Mô Tả</th><th>Thao Tác</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center text-gray" style={{padding:'2rem'}}>Đang tải...</td></tr>
                ) : roomTypes.length ? roomTypes.map((rt, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight:600 }}>{rt.name}</td>
                    <td>{rt.capacity} người</td>
                    <td style={{ color:'#4f46e5', fontWeight:600 }}>{formatVND(rt.basePrice)}</td>
                    <td style={{ color:'#6b7280' }}>{rt.description || '-'}</td>
                    <td>
                      <div className="flex gap-2">
                        {isManager && <button className="action-btn edit" onClick={() => openEditType(rt)} title="Sửa"><Edit2 size={15} /></button>}
                        {isManager && <button className="action-btn delete" onClick={() => handleDeleteType(rt.name)} title="Xóa"><Trash2 size={15} /></button>}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="text-center text-gray" style={{padding:'2rem'}}>Chưa có loại phòng nào</td></tr>
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
                    <td style={{fontWeight:700}}>{r.roomId}</td>
                    <td>{r.name}</td>
                    <td>{r.capacity} người</td>
                    <td style={{color:'#4f46e5',fontWeight:600}}>{formatVND(r.baseprice)}</td>
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
                    {Object.entries(ROOM_STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
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
      {/* Modal View Room Details */}
      {showViewModal && viewRoom && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowViewModal(false)}>
          <div className="modal" style={{maxWidth: '500px'}}>
            <div className="modal-header">
              <h3 className="modal-title">Chi Tiết Phòng {viewRoom.roomNumber}</h3>
              <button className="action-btn" onClick={() => setShowViewModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{marginBottom: '10px'}}><strong>Loại Phòng:</strong> {viewRoom.roomTypeName}</div>
              <div style={{marginBottom: '10px'}}><strong>Tầng:</strong> {viewRoom.floorNumber}</div>
              <div style={{marginBottom: '10px'}}><strong>Sức Chứa:</strong> {viewRoom.capacity} người</div>
              <div style={{marginBottom: '10px'}}><strong>Giá/Đêm:</strong> {formatVND(viewRoom.basePrice)}</div>
              <div style={{marginBottom: '10px'}}><strong>Trạng Thái:</strong> {ROOM_STATUS[viewRoom.status]?.label || viewRoom.status}</div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn" onClick={() => setShowViewModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add/Edit Room Type */}
      {showTypeModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowTypeModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editType ? 'Sửa Loại Phòng' : 'Thêm Loại Phòng Mới'}</h3>
              <button className="action-btn" onClick={() => setShowTypeModal(false)}>✕</button>
            </div>
            <form onSubmit={handleTypeSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Tên Loại Phòng *</label>
                  <input className="form-input" required value={typeForm.name} onChange={e => setTypeForm({...typeForm, name:e.target.value})} placeholder="VIP Suite" disabled={!!editType} />
                  {editType && <small style={{color:'#9ca3af'}}>Tên loại phòng không thể thay đổi</small>}
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Sức Chứa (người) *</label>
                    <input type="number" min="1" className="form-input" required value={typeForm.capacity} onChange={e => setTypeForm({...typeForm, capacity:e.target.value})} placeholder="2" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Giá Cơ Bản (VNĐ) *</label>
                    <input type="number" min="0" className="form-input" required value={typeForm.basePrice} onChange={e => setTypeForm({...typeForm, basePrice:e.target.value})} placeholder="1000000" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Mô Tả</label>
                  <textarea className="form-input" rows={3} value={typeForm.description} onChange={e => setTypeForm({...typeForm, description:e.target.value})} placeholder="Mô tả loại phòng..." style={{resize:'vertical'}} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowTypeModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">💾 Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
