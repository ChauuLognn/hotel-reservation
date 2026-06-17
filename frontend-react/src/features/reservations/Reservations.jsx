import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
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

function formatDate(s) { if(!s) return '-'; const d=new Date(s); return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`; }

export default function Reservations() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchGuests(); }, []);

  async function fetchGuests() {
    setLoading(true);
    try {
      const res = await reservationApi.getAllResGuests();
      setGuests(res.data?.data || res.data || []);
    } catch(e) { console.error(e); setGuests([]); }
    finally { setLoading(false); }
  }

  const filtered = guests.filter(g => {
    const q = search.toLowerCase();
    return (g.resId||'').toLowerCase().includes(q)
      || (g.guestName||'').toLowerCase().includes(q)
      || (g.identityNum||'').toLowerCase().includes(q);
  });

  return (
    <Layout title="Quản Lý Đặt Chỗ">
      <div className="table-container">
        <div className="table-header">
          <h3>Danh Sách Khách Trong Đặt Phòng</h3>
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input className="search-input" placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table className="table">
            <thead><tr><th>Mã Đặt</th><th>Tên Khách</th><th>CMND/CCCD</th><th>SĐT</th><th>Ngày Nhận</th><th>Ngày Trả</th><th>Trạng Thái</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center text-gray" style={{padding:'2rem'}}>Đang tải...</td></tr>
              ) : filtered.length ? filtered.map((g, i) => {
                const st = STATUS_MAP[g.status] || { label: g.status||'-', cls:'badge-secondary' };
                return (
                  <tr key={i}>
                    <td style={{ fontWeight:700, color:'#4f46e5' }}>{g.resId}</td>
                    <td style={{ fontWeight:600 }}>{g.guestName || (g.firstName+' '+g.lastName)}</td>
                    <td>{g.identityNum || '-'}</td>
                    <td>{g.phone || '-'}</td>
                    <td>{formatDate(g.checkInDate)}</td>
                    <td>{formatDate(g.checkOutDate)}</td>
                    <td><span className={`badge-status ${st.cls}`}>{st.label}</span></td>
                  </tr>
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
