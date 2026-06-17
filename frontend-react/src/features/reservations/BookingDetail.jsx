import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Home, DollarSign, Clock, CheckCircle } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import reservationApi from '../../api/reservationApi';
import billApi from '../../api/billApi';

const STATUS_MAP = {
  PENDING_PAYMENT: { label:'Chờ Thanh Toán', cls:'badge-warning' },
  CONFIRMED: { label:'Đã Xác Nhận', cls:'badge-info' },
  CHECKED_IN: { label:'Đang Ở', cls:'badge-success' },
  CHECKED_OUT: { label:'Đã Trả Phòng', cls:'badge-secondary' },
  CANCELLED: { label:'Đã Hủy', cls:'badge-danger' },
  REFUNDED: { label:'Đã Hoàn Tiền', cls:'badge-purple' },
};

function formatDateTime(s) { 
  if(!s) return '-'; 
  const d=new Date(s); 
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; 
}
function formatVND(n) { return new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(n||0); }

export default function BookingDetail() {
  const { resId } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [changingStatus, setChangingStatus] = useState(false);

  useEffect(() => {
    if (resId) fetchAll();
  }, [resId]);

  async function fetchAll() {
    setLoading(true);
    try {
      // /api/reservations/{resId}/detail trả về chi tiết gồm resRooms và guests
      const [detailRes, histRes, billRes] = await Promise.all([
        reservationApi.getDetail(resId),
        reservationApi.getStatusHistory(resId),
        billApi.getByResId(resId).catch(() => ({ data: null })),
      ]);
      setDetail(detailRes.data);
      setStatusHistory(Array.isArray(histRes.data) ? histRes.data : []);
      setBill(billRes.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function changeStatus(newStatus) {
    if (!confirm(`Đổi trạng thái thành "${STATUS_MAP[newStatus]?.label}"?`)) return;
    setChangingStatus(true);
    try {
      await reservationApi.updateStatus(resId, { status: newStatus });
      fetchAll();
    } catch(err) { alert('Lỗi: ' + (err?.response?.data?.message || err.message)); }
    finally { setChangingStatus(false); }
  }

  async function confirmPayment() {
    if (!confirm('Xác nhận thanh toán cho toàn bộ đặt phòng này?')) return;
    try {
      await billApi.confirmPaidForRes(resId);
      fetchAll();
    } catch(err) { alert('Lỗi: ' + (err?.response?.data?.message || err.message)); }
  }

  if (loading) return (
    <Layout title="Chi Tiết Đặt Phòng">
      <div className="loading-spinner"><div className="spinner" />Đang tải...</div>
    </Layout>
  );

  if (!detail) return (
    <Layout title="Chi Tiết Đặt Phòng">
      <div className="empty-state"><p>Không tìm thấy đặt phòng #{resId}</p></div>
    </Layout>
  );

  // detail có thể là object với fields: resId, status, checkInDate, checkOutDate, resRooms[], guests[], note
  const st = STATUS_MAP[detail.status] || { label:detail.status, cls:'badge-secondary' };
  const resRooms = detail.resRooms || detail.reservationRooms || [];
  const guests = detail.guests || detail.reservationGuests || [];

  // Status workflow
  const nextStatuses = {
    PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['CHECKED_IN', 'CANCELLED'],
    CHECKED_IN: ['CHECKED_OUT'],
    CHECKED_OUT: ['REFUNDED'],
    CANCELLED: [],
    REFUNDED: [],
  };
  const availableStatuses = nextStatuses[detail.status] || [];

  return (
    <Layout title={`Chi Tiết: ${resId}`}>
      <button className="btn mb-4" onClick={() => navigate('/bookings')}>
        <ArrowLeft size={16} /> Quay Lại
      </button>

      {/* Header */}
      <div className="card mb-4">
        <div className="card-body" style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem'}}>
          <div>
            <h2 style={{fontSize:'1.4rem', fontWeight:700, color:'#111827'}}>Đặt Phòng #{resId}</h2>
            <p style={{color:'#6b7280', marginTop:'0.25rem'}}>
              Check-in: <strong>{formatDateTime(detail.checkInDate)}</strong> → Check-out: <strong>{formatDateTime(detail.checkOutDate)}</strong>
            </p>
            {detail.note && <p style={{color:'#6b7280', marginTop:'0.25rem'}}>Ghi chú: {detail.note}</p>}
          </div>
          <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'0.5rem'}}>
            <span className={`badge-status ${st.cls}`} style={{fontSize:'0.9rem', padding:'0.4rem 1rem'}}>{st.label}</span>
            {availableStatuses.length > 0 && (
              <div className="flex gap-2">
                {availableStatuses.map(s => (
                  <button key={s} className="btn btn-sm" onClick={() => changeStatus(s)} disabled={changingStatus}
                    style={{background: s==='CANCELLED'?'#fee2e2':s==='CHECKED_IN'?'#d1fae5':'#dbeafe', border:'none', color: s==='CANCELLED'?'#dc2626':s==='CHECKED_IN'?'#059669':'#2563eb'}}>
                    {STATUS_MAP[s]?.label}
                  </button>
                ))}
              </div>
            )}
            {detail.status === 'CHECKED_OUT' && (
              <button className="btn btn-primary btn-sm" onClick={confirmPayment}>
                <CheckCircle size={14} /> Xác Nhận Thanh Toán
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem'}}>
        {/* Reservation Rooms */}
        <div className="table-container">
          <div className="table-header">
            <h3><Home size={16} style={{marginRight:'0.5rem', verticalAlign:'middle'}} />Phòng Đã Đặt ({resRooms.length})</h3>
          </div>
          <table className="table">
            <thead><tr><th>Mã ResRoom</th><th>Số Phòng</th><th>Loại</th><th>Giá/Đêm</th><th>TT</th></tr></thead>
            <tbody>
              {resRooms.length ? resRooms.map((rr, i) => {
                const rrSt = STATUS_MAP[rr.status] || {label:rr.status, cls:'badge-secondary'};
                return (
                  <tr key={i}>
                    <td style={{fontSize:'0.75rem', color:'#9ca3af'}}>{rr.resRoomId||rr.id}</td>
                    <td style={{fontWeight:700}}>{rr.roomNumber}</td>
                    <td>{rr.roomTypeName||'-'}</td>
                    <td>{formatVND(rr.pricePerNight||rr.basePrice)}</td>
                    <td><span className={`badge-status ${rrSt.cls}`} style={{fontSize:'0.7rem'}}>{rrSt.label}</span></td>
                  </tr>
                );
              }) : <tr><td colSpan={5} className="text-center text-gray">Không có phòng</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Guests */}
        <div className="table-container">
          <div className="table-header">
            <h3><User size={16} style={{marginRight:'0.5rem', verticalAlign:'middle'}} />Danh Sách Khách ({guests.length})</h3>
          </div>
          <table className="table">
            <thead><tr><th>Họ Tên</th><th>CMND</th><th>SĐT</th></tr></thead>
            <tbody>
              {guests.length ? guests.map((g, i) => (
                <tr key={i}>
                  <td style={{fontWeight:600}}>{g.guestName || ((g.firstName||'') + ' ' + (g.lastName||''))}</td>
                  <td>{g.identityNum||'-'}</td>
                  <td>{g.phone||'-'}</td>
                </tr>
              )) : <tr><td colSpan={3} className="text-center text-gray">Không có khách</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Bill */}
        {bill && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><DollarSign size={16} style={{marginRight:'0.5rem', verticalAlign:'middle'}} />Hóa Đơn</h3>
            </div>
            <div className="card-body">
              <table className="table">
                <tbody>
                  {bill.resRoomBills && bill.resRoomBills.map((rb, i) => (
                    <tr key={i}>
                      <td style={{color:'#6b7280', fontSize:'0.8rem'}}>Phòng {rb.roomNumber}</td>
                      <td style={{textAlign:'right'}}>{formatVND(rb.totalAmount)}</td>
                    </tr>
                  ))}
                  <tr style={{borderTop:'2px solid #e5e7eb'}}>
                    <td style={{fontWeight:700}}>Tổng Cộng</td>
                    <td style={{textAlign:'right', fontWeight:700, fontSize:'1.15rem', color:'#4f46e5'}}>{formatVND(bill.totalAmount||bill.grandTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Status History */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><Clock size={16} style={{marginRight:'0.5rem', verticalAlign:'middle'}} />Lịch Sử Trạng Thái</h3>
          </div>
          <div className="card-body" style={{maxHeight:'250px', overflowY:'auto'}}>
            {statusHistory.length ? [...statusHistory].reverse().map((h, i) => {
              const hSt = STATUS_MAP[h.status] || {label:h.status, cls:'badge-secondary'};
              return (
                <div key={i} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.6rem 0', borderBottom:'1px solid #f3f4f6'}}>
                  <span className={`badge-status ${hSt.cls}`} style={{fontSize:'0.75rem'}}>{hSt.label}</span>
                  <span style={{fontSize:'0.78rem', color:'#9ca3af'}}>{formatDateTime(h.changedAt)}</span>
                </div>
              );
            }) : <p style={{color:'#9ca3af', textAlign:'center', padding:'1rem'}}>Chưa có lịch sử</p>}
          </div>
        </div>
      </div>
    </Layout>
  );
}
