import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Calendar, DollarSign, LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import roomApi from '../api/roomApi';
import reservationApi from '../api/reservationApi';

function formatVND(n) { return new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(n||0); }
function formatDate(s) { if(!s) return '-'; return new Date(s).toLocaleDateString('vi-VN'); }

export default function UserHome() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState('home');
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    loadRooms();
    if (user?.userId) loadBookings();
  }, [user]);

  async function loadRooms() {
    setLoading(true);
    try {
      const res = await roomApi.getAll();
      const all = res.data?.data || res.data || [];
      setRooms(all.filter(r => r.status === 'AVAILABLE'));
    } catch {}
    finally { setLoading(false); }
  }

  async function loadBookings() {
    if (!user?.userId) return;
    try {
      // Get guest linked to userId — try via empId
      const res = await reservationApi.getAll();
      setBookings(res.data?.data || res.data || []);
    } catch {}
  }

  const STATUS_MAP = {
    PENDING_PAYMENT: { label:'Chờ Thanh Toán', cls:'badge-warning' },
    CONFIRMED: { label:'Đã Xác Nhận', cls:'badge-info' },
    CHECKED_IN: { label:'Đang Ở', cls:'badge-success' },
    CHECKED_OUT: { label:'Đã Trả Phòng', cls:'badge-secondary' },
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
                    <button className="btn btn-primary" style={{ marginTop:'0.75rem', width:'100%' }} onClick={() => user ? alert('Vui lòng liên hệ lễ tân để đặt phòng!') : navigate('/login')}>
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
                <thead><tr><th>Mã Đặt</th><th>Check-in</th><th>Check-out</th><th>Tổng Tiền</th><th>Trạng Thái</th></tr></thead>
                <tbody>
                  {bookings.length ? bookings.slice(0,10).map(b => {
                    const st = STATUS_MAP[b.status]||{label:b.status,cls:'badge-secondary'};
                    return (
                      <tr key={b.resId}>
                        <td style={{ fontWeight:700, color:'#4f46e5' }}>{b.resId}</td>
                        <td>{formatDate(b.checkInDate)}</td>
                        <td>{formatDate(b.checkOutDate)}</td>
                        <td>{formatVND(b.totalAmount)}</td>
                        <td><span className={`badge-status ${st.cls}`}>{st.label}</span></td>
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan={5} className="text-center text-gray" style={{padding:'2rem'}}>Bạn chưa có đặt phòng nào</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
