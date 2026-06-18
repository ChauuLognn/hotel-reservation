import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Calendar, DollarSign, LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import roomApi from '../../api/roomApi';
import reservationApi from '../../api/reservationApi';
import userApi from '../../api/userApi';
import guestApi from '../../api/guestApi';


function formatVND(n) { return new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(n||0); }
function formatDate(s) { if(!s) return '-'; return new Date(s).toLocaleDateString('vi-VN'); }

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTomorrowString = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function UserHome() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState('home');
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Search & Booking States
  const [checkIn, setCheckIn] = useState(getTodayString());
  const [checkOut, setCheckOut] = useState(getTomorrowString());
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [guestForm, setGuestForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    identityNum: '',
    dateOfBirth: ''
  });

  useEffect(() => {
    loadRooms();
    if (user?.userId) loadBookings();
  }, [user]);

  async function loadRooms() {
    setLoading(true);
    setIsSearching(false);
    try {
      const availRes = await roomApi.findAvailable({ checkIn: getTodayString(), checkOut: getTomorrowString() });
      const availList = availRes.data?.data || availRes.data || [];

      const enriched = availList.map(av => ({
        id: av.roomId,
        roomNumber: av.roomId,
        floorNumber: Math.floor(av.roomId / 100) || 1,
        status: 'READY',
        roomType: {
          name: av.name,
          basePrice: av.baseprice,
          capacity: av.capacity
        }
      }));
      setRooms(enriched);
    } catch (err) {
      console.error('Lỗi tải phòng:', err);
    } finally {
      setLoading(false);
    }
  }

  async function searchRooms() {
    if (!checkIn || !checkOut) {
      alert('Vui lòng chọn đầy đủ ngày nhận và trả phòng!');
      return;
    }
    if (new Date(checkIn) >= new Date(checkOut)) {
      alert('Ngày trả phòng phải sau ngày nhận phòng!');
      return;
    }
    setLoading(true);
    setIsSearching(true);
    try {
      const availRes = await roomApi.findAvailable({ checkIn, checkOut });
      const availList = availRes.data?.data || availRes.data || [];
      
      const enriched = availList.map(av => ({
        id: av.roomId,
        roomNumber: av.roomId,
        floorNumber: Math.floor(av.roomId / 100) || 1,
        status: 'AVAILABLE',
        roomType: {
          name: av.name,
          basePrice: av.baseprice,
          capacity: av.capacity
        }
      }));
      setRooms(enriched);
    } catch (err) {
      alert('Lỗi tải phòng trống: ' + (err?.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }


  async function loadBookings() {
    if (!user?.userId) return;
    try {
      let guestId = localStorage.getItem('currentGuestId');
      
      if (!guestId && user.empId) {
        const empRes = await userApi.getEmpById(user.empId);
        const emp = empRes.data?.data || empRes.data || {};
        
        if (emp.identityNum || emp.phone) {
          const guestsRes = await guestApi.getAll();
          const guestsList = guestsRes.data?.data || guestsRes.data || [];
          const guest = guestsList.find(g => g.identityNum === emp.identityNum || g.phone === emp.phone);
          if (guest) {
            guestId = guest.id;
            localStorage.setItem('currentGuestId', guestId);
          }
        }
      }
      
      if (guestId) {
        const res = await reservationApi.getByGuestId(guestId);
        setBookings(res.data?.data || res.data || []);
      } else {
        setBookings([]);
      }
    } catch {}
  }

  const handleOpenBooking = async (room) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedRoom(room);
    
    // Tự động điền thông tin cá nhân
    try {
      if (user.empId) {
        const empRes = await userApi.getEmpById(user.empId);
        const emp = empRes.data?.data || empRes.data || {};
        setGuestForm({
          firstName: emp.firstName || '',
          lastName: emp.lastName || '',
          phone: emp.phone || '',
          identityNum: emp.identityNum || '',
          dateOfBirth: emp.dateOfBirth || ''
        });
      }
    } catch (err) {
      console.error('Lỗi tải thông tin cá nhân:', err);
    }
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedRoom) return;

    if (!guestForm.firstName || !guestForm.lastName || !guestForm.phone || !guestForm.identityNum) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc!');
      return;
    }

    setIsBooking(true);
    try {
      // 1. Tìm hoặc tạo Guest Profile
      const guestsRes = await guestApi.getAll();
      const guestsList = guestsRes.data?.data || guestsRes.data || [];
      let guest = guestsList.find(g => g.identityNum === guestForm.identityNum || g.phone === guestForm.phone);
      
      let guestId;
      if (guest) {
        guestId = guest.id;
        // Cập nhật thông tin khách hàng nếu cần
        await guestApi.update(guestId, {
          firstName: guestForm.firstName,
          lastName: guestForm.lastName,
          identityNum: guestForm.identityNum,
          phone: guestForm.phone,
          dateOfBirth: guestForm.dateOfBirth || null
        });
      } else {
        // Tạo guest mới
        const newGuestRes = await guestApi.create({
          firstName: guestForm.firstName,
          lastName: guestForm.lastName,
          identityNum: guestForm.identityNum,
          phone: guestForm.phone,
          dateOfBirth: guestForm.dateOfBirth || null
        });
        const newGuest = newGuestRes.data?.data || newGuestRes.data || {};
        guestId = newGuest.id;
      }

      if (!guestId) {
        throw new Error('Không thể tạo hoặc xác định hồ sơ khách hàng.');
      }

      // 2. Tạo đặt phòng (confirmHold)
      const payload = {
        guestId: Number(guestId),
        items: [{
          roomName: selectedRoom.roomType.name,
          rooms: 1,
          checkIn: checkIn,
          checkOut: checkOut
        }]
      };

      const res = await reservationApi.create(payload);
      const resData = res.data;
      alert(`✅ Đặt phòng thành công!\nMã đặt phòng của bạn là: ${resData.resId}`);
      
      // Lưu guestId
      localStorage.setItem('currentGuestId', guestId);
      
      setSelectedRoom(null);
      setSection('bookings');
      await loadBookings();
    } catch (err) {
      alert('Lỗi đặt phòng: ' + (err?.response?.data?.message || err.message));
    } finally {
      setIsBooking(false);
    }
  };

  async function handleCancelBooking(resId) {
    if (!confirm('Bạn có chắc muốn hủy đặt phòng này?')) return;
    try {
      await reservationApi.updateStatus(resId, { newStatus: 'CANCELLED', reason: 'Khách hàng tự hủy' });
      alert('Đã hủy đặt phòng thành công!');
      await loadBookings();
    } catch (err) {
      alert('Lỗi hủy đặt phòng: ' + (err?.response?.data?.message || err.message));
    }
  }

  async function handleConfirmPayment(resId) {
    if (!confirm('Xác nhận bạn đã thanh toán cho đặt phòng này?')) return;
    try {
      await reservationApi.updateStatus(resId, { newStatus: 'CONFIRMED', reason: 'Khách hàng xác nhận thanh toán' });
      alert('Xác nhận thanh toán thành công!');
      await loadBookings();
    } catch (err) {
      alert('Lỗi xác nhận thanh toán: ' + (err?.response?.data?.message || err.message));
    }
  }

  const STATUS_MAP = {
    PENDING_PAYMENT: { label:'Chờ Thanh Toán', cls:'badge-warning' },
    PENDING_EXPIRED: { label:'Hết Hạn', cls:'badge-danger' },
    CONFIRMED: { label:'Đã Xác Nhận', cls:'badge-info' },
    CHECK_IN: { label:'Đang Ở', cls:'badge-success' },
    CHECK_OUT: { label:'Đã Trả Phòng', cls:'badge-secondary' },
    CANCELLED: { label:'Đã Hủy', cls:'badge-danger' },
  };

  return (
    <div className="user-home-page">
      {/* Navbar */}
      <nav className="user-navbar">
        <div className="user-nav-brand">
          <div className="user-nav-logo">🏨</div>
          <span className="user-nav-title">Hotel Haven</span>
        </div>
        <div className="user-nav-links" style={{ display: menuOpen || window.innerWidth > 768 ? 'flex' : 'none' }}>
          {[
            { id:'home', label:'Trang Chủ', icon: <Home size={16} /> },
            { id:'rooms', label:'Phòng', icon: <Home size={16} /> },
            { id:'bookings', label:'Đặt Phòng Của Tôi', icon: <Calendar size={16} /> },
          ].map(n => (
            <button key={n.id} className={`user-nav-link ${section===n.id?'active':''}`} onClick={() => { setSection(n.id); setMenuOpen(false); }}>
              {n.label}
            </button>
          ))}
          {user ? (
            <button className="user-nav-link" onClick={logout}>
              <LogOut size={16} style={{ marginRight:'0.3rem', display:'inline' }} /> Đăng Xuất
            </button>
          ) : (
            <button className="user-nav-link" onClick={() => navigate('/login')}>Đăng Nhập</button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      {section === 'home' && (
        <div style={{ background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding:'4rem 2rem', textAlign:'center', color:'white' }}>
          <h1 style={{ fontSize:'2.5rem', fontWeight:700, marginBottom:'1rem' }}>Chào mừng đến Hotel Haven!</h1>
          <p style={{ fontSize:'1.1rem', opacity:0.9, maxWidth:'600px', margin:'0 auto 2rem' }}>Trải nghiệm dịch vụ khách sạn 5 sao với công nghệ đặt phòng hiện đại.</p>
          <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
            <button className="btn-login" style={{ width:'auto', padding:'0.75rem 2rem' }} onClick={() => setSection('rooms')}>
              Xem Phòng Ngay
            </button>
            {!user && (
              <button className="btn" style={{ padding:'0.75rem 2rem' }} onClick={() => navigate('/login')}>
                Đăng Nhập
              </button>
            )}
          </div>
        </div>
      )}

      {/* Features */}
      {section === 'home' && (
        <div style={{ padding:'3rem 2rem', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))', gap:'1.5rem', maxWidth:'1200px', margin:'0 auto' }}>
          {[
            { icon:'🏊', title:'Hồ Bơi', desc:'Hồ bơi ngoài trời tiêu chuẩn Olympic' },
            { icon:'🍽️', title:'Nhà Hàng', desc:'Ẩm thực quốc tế đa dạng, phong phú' },
            { icon:'💆', title:'Spa & Wellness', desc:'Dịch vụ spa thư giãn đẳng cấp 5 sao' },
            { icon:'🏋️', title:'Phòng Gym', desc:'Trang thiết bị tập luyện hiện đại' },
          ].map((f,i) => (
            <div key={i} className="card" style={{ padding:'1.5rem', textAlign:'center' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>{f.icon}</div>
              <h3 style={{ fontWeight:700, marginBottom:'0.5rem', color:'#111827' }}>{f.title}</h3>
              <p style={{ color:'#6b7280', fontSize:'0.9rem' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Rooms Section */}
      {(section === 'home' || section === 'rooms') && (
        <div style={{ padding:'2rem', maxWidth:'1200px', margin:'0 auto' }}>
          <h2 style={{ fontSize:'1.6rem', fontWeight:700, color:'#111827', marginBottom:'1.5rem' }}>
            {section==='home' ? '🏠 Phòng Nổi Bật' : '🏠 Tất Cả Phòng Trống'}
          </h2>

          {/* Date Search Bar */}
          <div style={{ 
            background: '#ffffff', 
            padding: '1.5rem', 
            borderRadius: '12px', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', 
            marginBottom: '2rem',
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Ngày Nhận Phòng</label>
              <input 
                type="date" 
                value={checkIn} 
                min={getTodayString()}
                onChange={(e) => setCheckIn(e.target.value)} 
                style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
              />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Ngày Trả Phòng</label>
              <input 
                type="date" 
                value={checkOut} 
                min={checkIn || getTodayString()}
                onChange={(e) => setCheckOut(e.target.value)} 
                style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={searchRooms}
                className="btn btn-primary"
                style={{ padding: '0.625rem 1.5rem', height: '42px', fontWeight: 600 }}
              >
                Tìm Phòng Trống
              </button>
              {isSearching && (
                <button 
                  onClick={() => {
                    setIsSearching(false);
                    loadRooms();
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '0.625rem 1.5rem', height: '42px', fontWeight: 600, background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' }}
                >
                  Đặt Lại
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="loading-spinner"><div className="spinner" />Đang tải...</div>
          ) : (
            <div className="room-grid">
              {(section === 'home' ? rooms.slice(0,6) : rooms).map(r => (
                <div key={r.id} className="room-card-user">
                  <div className="room-card-img">🛏️</div>
                  <div className="room-card-body">
                    <div className="room-card-type">Phòng {r.roomNumber} - {r.roomType?.name || 'Standard'}</div>
                    <div className="room-card-price">{formatVND(r.roomType?.basePrice)}<span style={{ fontSize:'0.75rem', fontWeight:400, color:'#6b7280' }}>/đêm</span></div>
                    <div className="room-card-info">
                      👤 {r.roomType?.capacity || '?'} người &nbsp;|&nbsp; 🏢 Tầng {r.floorNumber || '?'}
                    </div>
                    <button className="btn btn-primary" style={{ marginTop:'0.75rem', width:'100%' }} onClick={() => handleOpenBooking(r)}>
                      Đặt Phòng
                    </button>
                  </div>
                </div>
              ))}
              {!rooms.length && <p style={{ color:'#6b7280', gridColumn:'1/-1', textAlign:'center' }}>Hiện không có phòng trống</p>}
            </div>
          )}
        </div>
      )}


      {/* My Bookings */}
      {section === 'bookings' && (
        <div style={{ padding:'2rem', maxWidth:'1200px', margin:'0 auto' }}>
          <h2 style={{ fontSize:'1.6rem', fontWeight:700, color:'#111827', marginBottom:'1.5rem' }}>📋 Đặt Phòng Của Tôi</h2>
          {!user ? (
            <div className="card" style={{ padding:'3rem', textAlign:'center' }}>
              <p style={{ color:'#6b7280', marginBottom:'1rem' }}>Vui lòng đăng nhập để xem lịch sử đặt phòng</p>
              <button className="btn btn-primary" onClick={() => navigate('/login')}>Đăng Nhập</button>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Mã Đặt</th><th>Check-in</th><th>Check-out</th><th>Tổng Tiền</th><th>Trạng Thái</th><th>Hành Động</th></tr></thead>
                <tbody>
                  {bookings.length ? bookings.slice(0,10).map(b => {
                    const st = STATUS_MAP[b.status]||{label:b.status,cls:'badge-secondary'};
                    return (
                      <tr key={b.resId}>
                        <td style={{ fontWeight:700, color:'#4f46e5' }}>{b.resId}</td>
                        <td>{formatDate(b.checkIn)}</td>
                        <td>{formatDate(b.checkOut)}</td>
                        <td>{formatVND(b.total)}</td>
                        <td><span className={`badge-status ${st.cls}`}>{st.label}</span></td>
                        <td>
                          {b.status === 'PENDING_PAYMENT' && (
                            <div style={{ display:'flex', gap:'0.4rem' }}>
                              <button className="btn btn-xs" onClick={() => handleConfirmPayment(b.resId)} style={{ background:'#d1fae5', color:'#059669', border:'none', fontSize:'0.75rem' }}>
                                Thanh Toán
                              </button>
                              <button className="btn btn-xs" onClick={() => handleCancelBooking(b.resId)} style={{ background:'#fee2e2', color:'#dc2626', border:'none', fontSize:'0.75rem' }}>
                                Hủy
                              </button>
                            </div>
                          )}
                          {b.status === 'CONFIRMED' && (
                            <button className="btn btn-xs" onClick={() => handleCancelBooking(b.resId)} style={{ background:'#fee2e2', color:'#dc2626', border:'none', fontSize:'0.75rem' }}>
                              Hủy
                            </button>
                          )}
                          {!['PENDING_PAYMENT','CONFIRMED'].includes(b.status) && '-'}
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan={6} className="text-center text-gray" style={{padding:'2rem'}}>Bạn chưa có đặt phòng nào</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Booking Modal */}
      {selectedRoom && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedRoom(null)}>
          <div className="modal" style={{ maxWidth: '600px', width: '90%' }}>
            <div className="modal-header">
              <h3 className="modal-title">Xác Nhận Đặt Phòng</h3>
              <button className="action-btn" onClick={() => setSelectedRoom(null)}>✕</button>
            </div>
            <form onSubmit={handleConfirmBooking}>
              <div className="modal-body" style={{ padding: '1.5rem', maxHeight: '75vh', overflowY: 'auto' }}>
                <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                  <h4 style={{ fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>Thông tin phòng chọn:</h4>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>🏢 Phòng: <strong>{selectedRoom.roomNumber}</strong> ({selectedRoom.roomType?.name})</p>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>💵 Giá: <strong>{formatVND(selectedRoom.roomType?.basePrice)}/đêm</strong></p>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>📅 Thời gian: <strong>{formatDate(checkIn)}</strong> đến <strong>{formatDate(checkOut)}</strong></p>
                </div>

                <h4 style={{ fontWeight: 700, color: '#111827', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>Thông Tin Khách Lưu Trú:</h4>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Họ và đệm *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      value={guestForm.firstName} 
                      onChange={e => setGuestForm({ ...guestForm, firstName: e.target.value })} 
                      placeholder="Ví dụ: Nguyễn Văn" 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tên *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      value={guestForm.lastName} 
                      onChange={e => setGuestForm({ ...guestForm, lastName: e.target.value })} 
                      placeholder="Ví dụ: Anh" 
                    />
                  </div>
                </div>

                <div className="grid-2" style={{ marginTop: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Số Điện Thoại *</label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      required 
                      value={guestForm.phone} 
                      onChange={e => setGuestForm({ ...guestForm, phone: e.target.value })} 
                      placeholder="Ví dụ: 0912345678" 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Số CMND / CCCD *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      value={guestForm.identityNum} 
                      onChange={e => setGuestForm({ ...guestForm, identityNum: e.target.value })} 
                      placeholder="Ví dụ: 030012345678" 
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">Ngày Sinh</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={guestForm.dateOfBirth} 
                    onChange={e => setGuestForm({ ...guestForm, dateOfBirth: e.target.value })} 
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn" onClick={() => setSelectedRoom(null)} style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' }}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={isBooking}>
                  {isBooking ? 'Đang Xử Lý...' : 'Xác Nhận Đặt Phòng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

