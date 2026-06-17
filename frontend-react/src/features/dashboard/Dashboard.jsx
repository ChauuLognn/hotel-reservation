import { useState, useEffect } from 'react';
import { DollarSign, Users, Home, Coffee, RefreshCw } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import reportApi from '../../api/reportApi';

function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
}
function formatDate(str) {
  if (!str) return '-';
  const d = new Date(str);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

export default function Dashboard() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth()+1, 0).toISOString().split('T')[0];

  const [dateFrom, setDateFrom] = useState(firstDay);
  const [dateTo, setDateTo] = useState(lastDay);
  const [loading, setLoading] = useState(false);
  const [revenue, setRevenue] = useState(null);
  const [roomUsage, setRoomUsage] = useState(null);
  const [serviceUsage, setServiceUsage] = useState(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [rev, room, svc] = await Promise.all([
        reportApi.getRevenue(dateFrom, dateTo),
        reportApi.getRoomUsage(dateFrom, dateTo),
        reportApi.getServiceUsage(dateFrom, dateTo),
      ]);
      setRevenue(rev.data);
      setRoomUsage(room.data);
      setServiceUsage(svc.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout title="Bảng Điều Khiển">
      {/* Welcome + Filter */}
      <div className="card mb-4">
        <div className="card-body" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <h1 style={{ fontSize:'1.5rem', fontWeight:700, color:'#111827' }}>Chào mừng trở lại! 👋</h1>
            <p style={{ color:'#6b7280', marginTop:'0.25rem' }}>Đây là báo cáo hiệu suất khách sạn của bạn.</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', background:'#f9fafb', padding:'0.6rem 1rem', borderRadius:'10px', border:'1px solid #e5e7eb' }}>
            <input type="date" className="form-input" style={{ width:'auto', padding:'0.4rem 0.6rem', border:'none', background:'transparent' }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            <span style={{ color:'#9ca3af' }}>—</span>
            <input type="date" className="form-input" style={{ width:'auto', padding:'0.4rem 0.6rem', border:'none', background:'transparent' }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
            <button onClick={fetchData} className="btn btn-primary btn-sm" disabled={loading}>
              <RefreshCw size={14} style={{ animation: loading ? 'spin 0.7s linear infinite' : 'none' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Tổng Doanh Thu</p>
              <h3 style={{ fontSize:'1.3rem' }}>{formatVND(revenue?.totalNetRevenue)}</h3>
              <small style={{ color:'#10b981', fontSize:'0.75rem' }}>Doanh thu ròng</small>
            </div>
            <div className="stat-icon" style={{ background:'#d1fae5' }}><DollarSign size={22} color="#10b981" /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Tổng Khách</p>
              <h3>{revenue?.totalGuestsStayed || 0}</h3>
              <small style={{ color:'#3b82f6', fontSize:'0.75rem' }}>Khách đã ở</small>
            </div>
            <div className="stat-icon" style={{ background:'#dbeafe' }}><Users size={22} color="#3b82f6" /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Loại Phòng Hàng Đầu</p>
              <h3 style={{ fontSize:'1.1rem' }}>{roomUsage?.topRoom?.roomTypeName || '-'}</h3>
              <small style={{ color:'#f59e0b', fontSize:'0.75rem' }}>{roomUsage?.topRoom?.timesBooked || 0} lượt đặt</small>
            </div>
            <div className="stat-icon" style={{ background:'#fef3c7' }}><Home size={22} color="#f59e0b" /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Dịch Vụ Hàng Đầu</p>
              <h3 style={{ fontSize:'1.1rem' }}>{serviceUsage?.topService?.serviceName || '-'}</h3>
              <small style={{ color:'#8b5cf6', fontSize:'0.75rem' }}>{formatVND(serviceUsage?.topService?.totalRevenue)}</small>
            </div>
            <div className="stat-icon" style={{ background:'#ede9fe' }}><Coffee size={22} color="#8b5cf6" /></div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'1.5rem' }}>
        {/* Revenue Table */}
        <div className="table-container">
          <div className="table-header">
            <h3>Báo Cáo Doanh Thu Hàng Ngày</h3>
          </div>
          <div style={{ overflowX:'auto', maxHeight:'450px' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Tiền Phòng</th>
                  <th>Tiền Dịch Vụ</th>
                  <th>Hoàn Tiền</th>
                  <th>Doanh Thu Ròng</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center text-gray" style={{ padding:'2rem' }}>Đang tải...</td></tr>
                ) : revenue?.days?.length ? (
                  revenue.days.map((d, i) => (
                    <tr key={i}>
                      <td>{formatDate(d.date)}</td>
                      <td>{formatVND(d.roomCharge)}</td>
                      <td>{formatVND(d.serviceCharge)}</td>
                      <td style={{ color:'#ef4444' }}>{formatVND(d.refundAmount)}</td>
                      <td style={{ color:'#10b981', fontWeight:600 }}>{formatVND(d.netRevenue)}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="text-center text-gray" style={{ padding:'2rem' }}>Không có dữ liệu</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Services */}
        <div className="table-container">
          <div className="table-header"><h3>Dịch Vụ Hàng Đầu</h3></div>
          <div>
            {loading ? (
              <div className="loading-spinner"><div className="spinner" /><span>Đang tải...</span></div>
            ) : serviceUsage?.services?.length ? (
              [...serviceUsage.services]
                .sort((a,b) => (b.totalRevenue||0) - (a.totalRevenue||0))
                .slice(0,5)
                .map((svc, i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.75rem 1rem', borderBottom:'1px solid #f3f4f6' }}>
                    <div>
                      <div style={{ fontWeight:600, fontSize:'0.875rem', color:'#111827' }}>{svc.serviceName}</div>
                      <div style={{ fontSize:'0.75rem', color:'#9ca3af' }}>Đã dùng {svc.timesUsed || 0} lần</div>
                    </div>
                    <div style={{ fontWeight:600, color:'#4f46e5', fontSize:'0.875rem' }}>{formatVND(svc.totalRevenue)}</div>
                  </div>
                ))
            ) : (
              <div className="empty-state"><p>Chưa có dữ liệu dịch vụ</p></div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
