import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Eye, Search } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import reservationApi from '../../api/reservationApi';

const STATUS_MAP = {
  PENDING_PAYMENT: { label:'Chờ Thanh Toán', cls:'badge-warning' },
  CONFIRMED: { label:'Đã Xác Nhận', cls:'badge-info' },
  CHECKED_IN: { label:'Đang Ở', cls:'badge-success' },
  CHECKED_OUT: { label:'Đã Trả Phòng', cls:'badge-secondary' },
  CANCELLED: { label:'Đã Hủy', cls:'badge-danger' },
  REFUNDED: { label:'Đã Hoàn Tiền', cls:'badge-purple' },
};

function formatDate(s) { 
  if(!s) return '-'; 
  const d=new Date(s); 
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; 
}
function formatVND(n) { return new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(n||0); }

export default function Bookings() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { fetchReservations(); }, []);

  async function fetchReservations() {
    setLoading(true);
    try {
      const res = await reservationApi.getAll();
      // Backend trả về List<ReservationDto> trực tiếp
      setReservations(Array.isArray(res.data) ? res.data : []);
    } catch(e) { 
      console.error('Lỗi tải đặt phòng:', e); 
      setReservations([]); 
    }
    finally { setLoading(false); }
  }

  const filtered = reservations.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = (r.resId||'').toLowerCase().includes(q)
      || String(r.id||'').includes(q);
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statCounts = Object.keys(STATUS_MAP).reduce((acc,k) => {
    acc[k] = reservations.filter(r => r.status === k).length;
    return acc;
  }, {});

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
            <div className="stat-info"><p>Đang Ở</p><h3>{statCounts.CHECKED_IN||0}</h3></div>
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
              <input className="search-input" placeholder="Tìm mã đặt phòng..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Mã Đặt</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Ghi Chú</th>
                <th>Trạng Thái</th>
                <th>Chi Tiết</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center text-gray" style={{padding:'2rem'}}>Đang tải...</td></tr>
              ) : filtered.length ? filtered.map(r => {
                const st = STATUS_MAP[r.status] || { label:r.status, cls:'badge-secondary' };
                return (
                  <tr key={r.resId||r.id}>
                    <td style={{ fontWeight:700, color:'#4f46e5' }}>{r.resId}</td>
                    <td>{formatDate(r.checkInDate)}</td>
                    <td>{formatDate(r.checkOutDate)}</td>
                    <td style={{color:'#6b7280', maxWidth:'150px', overflow:'hidden', textOverflow:'ellipsis'}}>{r.note || '-'}</td>
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
                <tr><td colSpan={6} className="text-center text-gray" style={{padding:'2rem'}}>
                  {search || statusFilter ? 'Không tìm thấy kết quả' : 'Chưa có đặt phòng nào'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
