import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Eye, Search, Plus, Trash2, UserPlus } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import reservationApi from '../../api/reservationApi';
import guestApi from '../../api/guestApi';
import roomApi from '../../api/roomApi';

const STATUS_MAP = {
  PENDING_PAYMENT: { label:'Chờ Thanh Toán', cls:'badge-warning' },
  PENDING_EXPIRED: { label:'Hết Hạn', cls:'badge-danger' },
  CONFIRMED: { label:'Đã Xác Nhận', cls:'badge-info' },
  CHECK_IN: { label:'Đang Ở', cls:'badge-success' },
  CHECK_OUT: { label:'Đã Trả Phòng', cls:'badge-secondary' },
  CANCELLED: { label:'Đã Hủy', cls:'badge-danger' },
};

function formatDate(s) { 
  if(!s) return '-'; 
  const d=new Date(s); 
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; 
}
function formatVND(n) { return new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(n||0); }

export default function Reservations() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Booking Modal states
  const [showModal, setShowModal] = useState(false);
  const [guests, setGuests] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedGuestId, setSelectedGuestId] = useState('');
  const [bookingItems, setBookingItems] = useState([
    { roomName: '', rooms: 1, checkIn: '', checkOut: '' }
  ]);
  const [guestSearch, setGuestSearch] = useState('');

  // Quick guest creation inside modal
  const [showQuickGuest, setShowQuickGuest] = useState(false);
  const [guestForm, setGuestForm] = useState({ firstName:'', lastName:'', phone:'', identityNum:'', email:'', address:'' });

  useEffect(() => { fetchReservations(); }, []);

  async function fetchReservations() {
    setLoading(true);
    try {
      const res = await reservationApi.getAll();
      setReservations(Array.isArray(res.data) ? res.data : []);
    } catch(e) { 
      console.error('Lỗi tải đặt phòng:', e); 
      setReservations([]); 
    }
    finally { setLoading(false); }
  }

  async function loadModalData() {
    try {
      const [gRes, rtRes] = await Promise.all([guestApi.getAll(), roomApi.getAllTypes()]);
      setGuests(Array.isArray(gRes.data) ? gRes.data : []);
      setRoomTypes(Array.isArray(rtRes.data) ? rtRes.data : []);
      if (gRes.data?.length > 0) setSelectedGuestId(String(gRes.data[0].id));
      if (rtRes.data?.length > 0) {
        setBookingItems([
          { roomName: rtRes.data[0].name, rooms: 1, checkIn: '', checkOut: '' }
        ]);
      }
    } catch(err) {
      console.error('Lỗi tải thông tin modal:', err);
    }
  }

  function handleOpenModal() {
    loadModalData();
    setShowModal(true);
  }

  function handleAddItem() {
    const defaultTypeName = roomTypes[0]?.name || '';
    setBookingItems([...bookingItems, { roomName: defaultTypeName, rooms: 1, checkIn: '', checkOut: '' }]);
  }

  function handleRemoveItem(idx) {
    if (bookingItems.length === 1) return;
    setBookingItems(bookingItems.filter((_, i) => i !== idx));
  }

  function updateItem(idx, field, val) {
    const updated = [...bookingItems];
    updated[idx][field] = val;
    setBookingItems(updated);
  }

  async function handleQuickGuestSubmit(e) {
    e.preventDefault();
    try {
      const res = await guestApi.create(guestForm);
      const newGuest = res.data;
      alert(`Đã thêm khách hàng: ${newGuest.firstName} ${newGuest.lastName}`);
      
      // Reload guests list and select the newly created guest
      const gList = await guestApi.getAll();
      setGuests(Array.isArray(gList.data) ? gList.data : []);
      setSelectedGuestId(String(newGuest.id));
      
      setShowQuickGuest(false);
      setGuestForm({ firstName:'', lastName:'', phone:'', identityNum:'', email:'', address:'' });
    } catch(err) {
      alert('Lỗi thêm khách: ' + (err?.response?.data?.message || err.message));
    }
  }

  async function handleCreateBooking(e) {
    e.preventDefault();
    if (!selectedGuestId) {
      alert('Vui lòng chọn khách hàng!');
      return;
    }
    
    // Validate items
    for (let i=0; i<bookingItems.length; i++) {
      const item = bookingItems[i];
      if (!item.roomName) { alert('Vui lòng chọn loại phòng!'); return; }
      if (!item.checkIn || !item.checkOut) { alert('Vui lòng chọn ngày nhận/trả phòng!'); return; }
      if (new Date(item.checkOut) <= new Date(item.checkIn)) {
        alert('Ngày trả phòng phải sau ngày nhận phòng!');
        return;
      }
    }

    try {
      const payload = {
        guestId: Number(selectedGuestId),
        items: bookingItems.map(it => ({
          roomName: it.roomName,
          rooms: Number(it.rooms),
          checkIn: it.checkIn,
          checkOut: it.checkOut
        }))
      };

      const res = await reservationApi.create(payload);
      const resData = res.data;
      alert(`✅ Tạo đặt giữ chỗ thành công!\nMã đặt phòng: ${resData.resId}`);
      setShowModal(false);
      navigate(`/booking-detail/${resData.resId}`);
    } catch(err) {
      alert('Lỗi tạo đặt phòng: ' + (err?.response?.data?.message || err.message));
    }
  }

  const filtered = reservations.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = (r.resId||'').toLowerCase().includes(q)
      || (r.guestName||'').toLowerCase().includes(q)
      || String(r.id||'').includes(q);
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statCounts = Object.keys(STATUS_MAP).reduce((acc,k) => {
    acc[k] = reservations.filter(r => r.status === k).length;
    return acc;
  }, {});

  const filteredGuests = guests.filter(g => {
    const q = guestSearch.toLowerCase();
    return `${g.firstName} ${g.lastName}`.toLowerCase().includes(q) || (g.phone||'').includes(q);
  });

  return (
    <Layout title="Quản Lý Đặt Phòng">
      {/* Status Summary */}
      <div className="stats-grid" style={{ gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))' }}>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info"><p>Tổng Đặt Phòng</p><h3>{reservations.length}</h3></div>
            <div className="stat-icon"><Calendar size={22} color="#6366f1" /></div>
          </div>
        </div>
        <div className="stat-card" style={{borderColor:'#f59e0b'}}>
          <div className="stat-content">
            <div className="stat-info"><p>Chờ TT</p><h3>{statCounts.PENDING_PAYMENT||0}</h3></div>
            <div className="stat-icon" style={{background:'#fef3c7'}}><Calendar size={22} color="#f59e0b" /></div>
          </div>
        </div>
        <div className="stat-card" style={{borderColor:'#3b82f6'}}>
          <div className="stat-content">
            <div className="stat-info"><p>Xác Nhận</p><h3>{statCounts.CONFIRMED||0}</h3></div>
            <div className="stat-icon" style={{background:'#dbeafe'}}><Calendar size={22} color="#3b82f6" /></div>
          </div>
        </div>
        <div className="stat-card" style={{borderColor:'#10b981'}}>
          <div className="stat-content">
            <div className="stat-info"><p>Đang Ở</p><h3>{statCounts.CHECK_IN||0}</h3></div>
            <div className="stat-icon" style={{background:'#d1fae5'}}><Calendar size={22} color="#10b981" /></div>
          </div>
        </div>
        <div className="stat-card" style={{borderColor:'#ef4444'}}>
          <div className="stat-content">
            <div className="stat-info"><p>Đã Hủy</p><h3>{statCounts.CANCELLED||0}</h3></div>
            <div className="stat-icon" style={{background:'#fee2e2'}}><Calendar size={22} color="#ef4444" /></div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-header">
          <h3>Danh Sách Đặt Phòng</h3>
          <div className="flex gap-2">
            <select className="form-input" style={{width:'180px',padding:'0.5rem'}} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              {Object.entries(STATUS_MAP).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input className="search-input" placeholder="Tìm kiếm đặt phòng..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={handleOpenModal}>
              <Plus size={16} /> Đặt Phòng Mới
            </button>
          </div>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Mã Đặt</th>
                <th>Khách Hàng</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Tổng Tiền</th>
                <th>Trạng Thái</th>
                <th>Chi Tiết</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center text-gray" style={{padding:'2rem'}}>Đang tải...</td></tr>
              ) : filtered.length ? filtered.map(r => {
                const st = STATUS_MAP[r.status] || { label:r.status, cls:'badge-secondary' };
                return (
                  <tr key={r.resId||r.id}>
                    <td style={{ fontWeight:700, color:'#4f46e5' }}>{r.resId}</td>
                    <td style={{ fontWeight:600 }}>{r.guestName || '-'}</td>
                    <td>{formatDate(r.checkIn)}</td>
                    <td>{formatDate(r.checkOut)}</td>
                    <td style={{ fontWeight:600 }}>{formatVND(r.total)}</td>
                    <td><span className={`badge-status ${st.cls}`}>{st.label}</span></td>
                    <td>
                      <button
                        className="action-btn view"
                        onClick={() => navigate(`/booking-detail/${r.resId}`)}
                        title="Xem chi tiết"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={7} className="text-center text-gray" style={{padding:'2rem'}}>
                  {search || statusFilter ? 'Không tìm thấy kết quả' : 'Chưa có đặt phòng nào'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Booking Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth:'750px', width:'90%' }}>
            <div className="modal-header">
              <h3 className="modal-title">Đặt Phòng Khách Sạn</h3>
              <button className="action-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateBooking}>
              <div className="modal-body" style={{ maxHeight:'70vh', overflowY:'auto' }}>
                
                {/* Guest selection & search */}
                <div className="card mb-4" style={{ padding:'1rem', background:'#f8fafc' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem' }}>
                    <label className="form-label" style={{ fontWeight:700, margin:0 }}>Khách Hàng Đặt *</label>
                    <button type="button" className="btn btn-sm" onClick={() => setShowQuickGuest(!showQuickGuest)} style={{ background:'#e0e7ff', color:'#4f46e5', border:'none', fontSize:'0.78rem' }}>
                      <UserPlus size={12} style={{ marginRight:'0.2rem', display:'inline-block' }} /> {showQuickGuest ? 'Chọn Khách Có Sẵn' : 'Thêm Khách Mới Nhanh'}
                    </button>
                  </div>

                  {!showQuickGuest ? (
                    <div style={{ display:'flex', gap:'0.5rem' }}>
                      <div style={{ flex:1 }}>
                        <input type="text" className="form-input mb-2" placeholder="🔍 Gõ tìm tên hoặc SĐT khách..." value={guestSearch} onChange={e => setGuestSearch(e.target.value)} style={{ padding:'0.4rem 0.75rem', fontSize:'0.85rem' }} />
                        <select className="form-input" required value={selectedGuestId} onChange={e => setSelectedGuestId(e.target.value)}>
                          {filteredGuests.map(g => (
                            <option key={g.id} value={g.id}>
                              {g.firstName} {g.lastName} - {g.phone || 'Không có SĐT'} ({g.identityNum || 'Không có CMND'})
                            </option>
                          ))}
                          {!filteredGuests.length && <option value="">-- Không tìm thấy khách --</option>}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background:'white', padding:'1rem', borderRadius:'8px', border:'1px solid #e2e8f0' }}>
                      <h4 style={{ fontSize:'0.85rem', fontWeight:600, marginBottom:'0.75rem', color:'#4f46e5' }}>Đăng Ký Khách Hàng Mới</h4>
                      <div className="grid-2">
                        <div className="form-group">
                          <label className="form-label">Họ *</label>
                          <input className="form-input" required value={guestForm.firstName} onChange={e => setGuestForm({...guestForm, firstName:e.target.value})} placeholder="Nguyễn" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Tên *</label>
                          <input className="form-input" required value={guestForm.lastName} onChange={e => setGuestForm({...guestForm, lastName:e.target.value})} placeholder="Văn A" />
                        </div>
                      </div>
                      <div className="grid-2">
                        <div className="form-group">
                          <label className="form-label">Điện Thoại *</label>
                          <input className="form-input" required value={guestForm.phone} onChange={e => setGuestForm({...guestForm, phone:e.target.value})} placeholder="0912345678" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">CMND/CCCD *</label>
                          <input className="form-input" required value={guestForm.identityNum} onChange={e => setGuestForm({...guestForm, identityNum:e.target.value})} placeholder="12 chữ số" />
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:'0.5rem', justifyContent:'flex-end', marginTop:'0.5rem' }}>
                        <button type="button" className="btn btn-sm" onClick={() => setShowQuickGuest(false)}>Hủy</button>
                        <button type="button" className="btn btn-primary btn-sm" onClick={handleQuickGuestSubmit}>💾 Lưu Khách Hàng</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Booking list items */}
                <div style={{ borderTop:'1px solid #e2e8f0', paddingTop:'1rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
                    <label className="form-label" style={{ fontWeight:700, margin:0 }}>Danh Sách Phòng Đặt *</label>
                    <button type="button" className="btn btn-sm btn-primary" onClick={handleAddItem}>
                      <Plus size={14} /> Thêm Phòng
                    </button>
                  </div>

                  {bookingItems.map((item, idx) => (
                    <div key={idx} style={{ background:'#f8fafc', padding:'1rem', borderRadius:'8px', border:'1px solid #e2e8f0', marginBottom:'0.75rem', position:'relative' }}>
                      {bookingItems.length > 1 && (
                        <button type="button" onClick={() => handleRemoveItem(idx)} style={{ position:'absolute', top:'0.5rem', right:'0.5rem', background:'transparent', border:'none', color:'#ef4444', cursor:'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      )}
                      
                      <div className="grid-2 mb-2">
                        <div className="form-group" style={{ margin:0 }}>
                          <label className="form-label">Hạng Phòng *</label>
                          <select className="form-input" value={item.roomName} onChange={e => updateItem(idx, 'roomName', e.target.value)} required>
                            {roomTypes.map(rt => (
                              <option key={rt.name} value={rt.name}>{rt.name} - {formatVND(rt.basePrice)}/đêm</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group" style={{ margin:0 }}>
                          <label className="form-label">Số Lượng Phòng *</label>
                          <input type="number" min="1" className="form-input" required value={item.rooms} onChange={e => updateItem(idx, 'rooms', e.target.value)} />
                        </div>
                      </div>

                      <div className="grid-2">
                        <div className="form-group" style={{ margin:0 }}>
                          <label className="form-label">Ngày Check-in *</label>
                          <input type="date" className="form-input" required value={item.checkIn} onChange={e => updateItem(idx, 'checkIn', e.target.value)} />
                        </div>
                        <div className="form-group" style={{ margin:0 }}>
                          <label className="form-label">Ngày Check-out *</label>
                          <input type="date" className="form-input" required value={item.checkOut} onChange={e => updateItem(idx, 'checkOut', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">💾 Tạo Đặt Phòng (Confirm Hold)</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
