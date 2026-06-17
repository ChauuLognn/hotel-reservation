import { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, User } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import reservationApi from '../../api/reservationApi';

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

export default function ReservationGuests() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedResId, setExpandedResId] = useState(null);
  const [expandedGuests, setExpandedGuests] = useState({}); // resId -> list of registered guests
  const [loadingGuests, setLoadingGuests] = useState({});

  useEffect(() => { fetchBookings(); }, []);

  async function fetchBookings() {
    setLoading(true);
    try {
      const res = await reservationApi.getAll();
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch(e) { 
      console.error(e); 
      setBookings([]); 
    }
    finally { setLoading(false); }
  }

  async function toggleExpand(resId) {
    if (expandedResId === resId) {
      setExpandedResId(null);
      return;
    }
    setExpandedResId(resId);
    
    // Check if guests already loaded for this reservation
    if (expandedGuests[resId]) return;

    setLoadingGuests(prev => ({ ...prev, [resId]: true }));
    try {
      // Fetch rooms of reservation
      const roomsRes = await reservationApi.getRoomsByResId(resId);
      const roomsList = roomsRes.data || [];

      // Fetch guests for each room in parallel
      const guestsByRoom = await Promise.all(
        roomsList.map(async (room) => {
          const gRes = await reservationApi.getGuestsByResRoom(room.id);
          return (gRes.data || []).map(g => ({
            ...g,
            roomNumber: room.roomId // room.roomId contains the room number (int)
          }));
        })
      );

      const flatGuests = guestsByRoom.flat();
      setExpandedGuests(prev => ({ ...prev, [resId]: flatGuests }));
    } catch(err) {
      console.error('Lỗi tải danh sách khách lưu trú:', err);
    } finally {
      setLoadingGuests(prev => ({ ...prev, [resId]: false }));
    }
  }

  const filtered = bookings.filter(b => {
    const q = search.toLowerCase();
    return (b.resId||'').toLowerCase().includes(q)
      || (b.guestName||'').toLowerCase().includes(q)
      || (b.guestPhone||'').includes(q);
  });

  return (
    <Layout title="Quản Lý Đặt Chỗ">
      <div className="table-container">
        <div className="table-header">
          <h3>Danh Sách Khách Trong Đặt Phòng</h3>
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input className="search-input" placeholder="Tìm theo mã đặt, tên khách..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}></th>
                <th>Mã Đặt</th>
                <th>Khách Đặt Chính</th>
                <th>SĐT</th>
                <th>Ngày Nhận</th>
                <th>Ngày Trả</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center text-gray" style={{padding:'2rem'}}>Đang tải...</td></tr>
              ) : filtered.length ? filtered.map((b) => {
                const isExpanded = expandedResId === b.resId;
                const st = STATUS_MAP[b.status] || { label: b.status||'-', cls:'badge-secondary' };
                const guestsList = expandedGuests[b.resId] || [];
                const isLoadingG = loadingGuests[b.resId];

                return (
                  <>
                    <tr key={b.resId} style={{ cursor: 'pointer' }} onClick={() => toggleExpand(b.resId)}>
                      <td>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </td>
                      <td style={{ fontWeight:700, color:'#4f46e5' }}>{b.resId}</td>
                      <td style={{ fontWeight:600 }}>{b.guestName}</td>
                      <td>{b.guestPhone || '-'}</td>
                      <td>{formatDate(b.checkIn)}</td>
                      <td>{formatDate(b.checkOut)}</td>
                      <td><span className={`badge-status ${st.cls}`}>{st.label}</span></td>
                    </tr>
                    
                    {isExpanded && (
                      <tr style={{ background: '#f8fafc' }}>
                        <td colSpan={7} style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ borderLeft: '3px solid #6366f1', paddingLeft: '1rem' }}>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1f2937' }}>
                              Chi Tiết Khách Lưu Trú Cho Từng Phòng
                            </h4>
                            
                            {isLoadingG ? (
                              <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Đang tải danh sách khách...</p>
                            ) : guestsList.length ? (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
                                {guestsList.map((g, idx) => (
                                  <div key={idx} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ background: '#e0e7ff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', justifyContent: 'center' }}>
                                      <User size={16} color="#4f46e5" />
                                    </div>
                                    <div>
                                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{g.guestName}</div>
                                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                        Phòng {g.roomNumber} | CCCD: {g.identityNum || '-'}
                                      </div>
                                      {g.checkInAt && (
                                        <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '0.1rem' }}>
                                          Check-in: {new Date(g.checkInAt).toLocaleString('vi-VN')}
                                        </div>
                                      )}
                                      {g.checkOutAt && (
                                        <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                                          Check-out: {new Date(g.checkOutAt).toLocaleString('vi-VN')}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p style={{ fontSize: '0.8rem', color: '#ef4444' }}>Chưa có khách nào được đăng ký lưu trú trong các phòng.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              }) : (
                <tr><td colSpan={7} className="text-center text-gray" style={{padding:'2rem'}}>Không có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
