import { useState, useEffect } from 'react';
import { DollarSign, Search, Eye, Plus } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import billApi from '../../api/billApi';

const BILL_STATUS = {
  UNPAID: { label:'Chưa Thanh Toán', cls:'badge-warning' },
  PAID: { label:'Đã Thanh Toán', cls:'badge-success' },
  REFUNDED: { label:'Đã Hoàn Tiền', cls:'badge-info' },
  CANCELLED: { label:'Đã Hủy', cls:'badge-danger' },
};

function formatVND(n) { return new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(n||0); }
function formatDate(s) { if(!s) return '-'; const d=new Date(s); return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`; }

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchBills(); }, []);

  async function fetchBills() {
    setLoading(true);
    try {
      const res = await billApi.getAll();
      setBills(res.data?.data || res.data || []);
    } catch(e) { console.error(e); setBills([]); }
    finally { setLoading(false); }
  }

  const filtered = bills.filter(b => {
    const q = search.toLowerCase();
    return String(b.id||'').includes(q)
      || String(b.resId||'').toLowerCase().includes(q)
      || (b.status||'').toLowerCase().includes(q);
  });

  const totalRevenue = bills.filter(b => b.status === 'PAID').reduce((sum,b) => sum + (b.totalAmount||0), 0);
  const unpaid = bills.filter(b => b.status === 'UNPAID').length;

  return (
    <Layout title="Quản Lý Hóa Đơn">
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-content"><div className="stat-info"><p>Tổng Hóa Đơn</p><h3>{bills.length}</h3></div><div className="stat-icon"><DollarSign size={22} color="#6366f1" /></div></div></div>
        <div className="stat-card" style={{borderColor:'#10b981'}}><div className="stat-content"><div className="stat-info"><p>Doanh Thu Thu Được</p><h3 style={{fontSize:'1.1rem'}}>{formatVND(totalRevenue)}</h3></div><div className="stat-icon" style={{background:'#d1fae5'}}><DollarSign size={22} color="#10b981" /></div></div></div>
        <div className="stat-card" style={{borderColor:'#f59e0b'}}><div className="stat-content"><div className="stat-info"><p>Chưa Thanh Toán</p><h3>{unpaid}</h3></div><div className="stat-icon" style={{background:'#fef3c7'}}><DollarSign size={22} color="#f59e0b" /></div></div></div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h3>Danh Sách Hóa Đơn</h3>
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input className="search-input" placeholder="Tìm mã hóa đơn, mã đặt phòng..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Mã HĐ</th>
                <th>Mã Đặt Phòng</th>
                <th>Tiền Phòng</th>
                <th>Tiền DV</th>
                <th>Hoàn Tiền</th>
                <th>Tổng Cộng</th>
                <th>Ngày Tạo</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center text-gray" style={{padding:'2rem'}}>Đang tải...</td></tr>
              ) : filtered.length ? filtered.map(b => {
                const st = BILL_STATUS[b.status] || { label: b.status, cls: 'badge-secondary' };
                return (
                  <tr key={b.id}>
                    <td style={{ fontWeight:700, color:'#4f46e5' }}>#{b.id}</td>
                    <td>{b.resId || '-'}</td>
                    <td>{formatVND(b.roomCharge)}</td>
                    <td>{formatVND(b.serviceCharge)}</td>
                    <td style={{ color:'#ef4444' }}>{formatVND(b.refundAmount)}</td>
                    <td style={{ fontWeight:700 }}>{formatVND(b.totalAmount)}</td>
                    <td>{formatDate(b.createdAt)}</td>
                    <td><span className={`badge-status ${st.cls}`}>{st.label}</span></td>
                    <td>
                      <button className="action-btn view" onClick={() => { setSelected(b); setShowModal(true); }} title="Xem chi tiết">
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={9} className="text-center text-gray" style={{padding:'2rem'}}>Không có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && selected && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Chi Tiết Hóa Đơn #{selected.id}</h3>
              <button className="action-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <table className="table">
                <tbody>
                  <tr><td style={{ fontWeight:600, width:'40%' }}>Mã Đặt Phòng</td><td>{selected.resId}</td></tr>
                  <tr><td style={{ fontWeight:600 }}>Tiền Phòng</td><td>{formatVND(selected.roomCharge)}</td></tr>
                  <tr><td style={{ fontWeight:600 }}>Tiền Dịch Vụ</td><td>{formatVND(selected.serviceCharge)}</td></tr>
                  <tr><td style={{ fontWeight:600 }}>Hoàn Tiền</td><td style={{ color:'#ef4444' }}>{formatVND(selected.refundAmount)}</td></tr>
                  <tr><td style={{ fontWeight:700 }}>Tổng Cộng</td><td style={{ fontWeight:700, color:'#4f46e5', fontSize:'1.1rem' }}>{formatVND(selected.totalAmount)}</td></tr>
                  <tr><td style={{ fontWeight:600 }}>Trạng Thái</td><td><span className={`badge-status ${(BILL_STATUS[selected.status]||{cls:'badge-secondary'}).cls}`}>{(BILL_STATUS[selected.status]||{label:selected.status}).label}</span></td></tr>
                  <tr><td style={{ fontWeight:600 }}>Ngày Tạo</td><td>{formatDate(selected.createdAt)}</td></tr>
                  <tr><td style={{ fontWeight:600 }}>Ghi Chú</td><td>{selected.note || '-'}</td></tr>
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
