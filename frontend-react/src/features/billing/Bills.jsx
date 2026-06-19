import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Search, Eye } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import reservationApi from '../../api/reservationApi';
import billApi from '../../api/billApi';
import roomApi from '../../api/roomApi';
import { formatVND, formatDate } from '@shared/utils/format';
import { RESERVATION_STATUS } from '@shared/constants/statusMaps';


export default function Bills() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [billDetails, setBillDetails] = useState({}); // resId -> ReservationBillSummary
  const [roomsList, setRoomsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [stats, setStats] = useState({ paidSum: 0, unpaidCount: 0 });
  const [showModal, setShowModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => { 
    fetchData(); 
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [resList, roomsRes, summariesRes] = await Promise.all([
        reservationApi.getAll(),
        roomApi.getAll(),
        billApi.getSummaries()
      ]);
      const bookingsList = Array.isArray(resList.data) ? resList.data : [];
      setBookings(bookingsList);
      setRoomsList(Array.isArray(roomsRes.data) ? roomsRes.data : []);

      const summariesData = Array.isArray(summariesRes.data) ? summariesRes.data : [];
      const summaries = {};
      let paidSum = 0;
      let unpaidCount = 0;

      summariesData.forEach((s) => {
        summaries[s.reservationId] = s;
        paidSum += Number(s.totalPaid || 0);
        if (Number(s.totalDue || 0) > 0) {
          unpaidCount++;
        }
      });

      setBillDetails(summaries);
      setStats({ paidSum, unpaidCount });
    } catch(e) { 
      console.error(e); 
      setBookings([]); 
    } finally { 
      setLoading(false); 
    }
  }

  const filtered = bookings.filter(b => {
    const q = search.toLowerCase();
    return (b.resId||'').toLowerCase().includes(q)
      || (b.guestName||'').toLowerCase().includes(q)
      || (b.status||'').toLowerCase().includes(q);
  });

  const roomsLookup = roomsList.reduce((acc, r) => {
    acc[r.id] = r;
    return acc;
  }, {});

  function openDetailModal(resId) {
    const billDetail = billDetails[resId];
    if (billDetail && billDetail.resRoomBill) {
      setSelectedBill(billDetail);
      setShowModal(true);
    } else {
      // Fetch details if not cached or missing full invoice list
      setLoading(true);
      billApi.getByResId(resId)
        .then(res => {
          if (res.data) {
            setSelectedBill(res.data);
            setShowModal(true);
          } else {
            alert('Không tìm thấy thông tin hóa đơn cho đặt phòng này.');
          }
        })
        .catch(() => alert('Lỗi tải hóa đơn'))
        .finally(() => setLoading(false));
    }
  }

  async function handleConfirmPayment(resId) {
    if (!confirm('Xác nhận thanh toán cho toàn bộ đặt phòng này?')) return;
    try {
      await billApi.confirmPaidForRes(resId);
      alert('Đã thanh toán hóa đơn thành công!');
      setShowModal(false);
      fetchData();
    } catch(err) {
      alert('Lỗi thanh toán: ' + (err?.response?.data?.message || err.message));
    }
  }

  return (
    <Layout title="Quản Lý Hóa Đơn">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info"><p>Tổng Số Hóa Đơn</p><h3>{bookings.length}</h3></div>
            <div className="stat-icon"><DollarSign size={22} color="#6366f1" /></div>
          </div>
        </div>
        <div className="stat-card" style={{borderColor:'#10b981'}}>
          <div className="stat-content">
            <div className="stat-info"><p>Doanh Thu Đã Thu</p><h3 style={{fontSize:'1.1rem'}}>{formatVND(stats.paidSum)}</h3></div>
            <div className="stat-icon" style={{background:'#d1fae5'}}><DollarSign size={22} color="#10b981" /></div>
          </div>
        </div>
        <div className="stat-card" style={{borderColor:'#f59e0b'}}>
          <div className="stat-content">
            <div className="stat-info"><p>Số HĐ Chưa Thu</p><h3>{stats.unpaidCount}</h3></div>
            <div className="stat-icon" style={{background:'#fef3c7'}}><DollarSign size={22} color="#f59e0b" /></div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h3>Hóa Đơn Theo Phiếu Đặt Phòng</h3>
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input className="search-input" placeholder="Tìm theo mã đặt phòng, tên khách..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Mã Đặt Phòng</th>
                <th>Khách Hàng</th>
                <th>Tổng Cộng</th>
                <th>Đã Thanh Toán</th>
                <th>Chưa Thanh Toán</th>
                <th>Trạng Thái Đặt</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center text-gray" style={{padding:'2rem'}}>Đang tải hóa đơn...</td></tr>
              ) : filtered.length ? filtered.map(b => {
                const bDetail = billDetails[b.resId] || {};
                const st = RESERVATION_STATUS[b.status] || { label: b.status, cls: 'badge-secondary' };
                
                return (
                  <tr key={b.resId}>
                    <td style={{ fontWeight:700, color:'#4f46e5' }}>{b.resId}</td>
                    <td style={{ fontWeight:600 }}>{b.guestName || '-'}</td>
                    <td style={{ fontWeight:700 }}>{formatVND(bDetail.total || b.total)}</td>
                    <td style={{ color:'#10b981', fontWeight:600 }}>{formatVND(bDetail.totalPaid)}</td>
                    <td style={{ color: (bDetail.totalDue > 0) ? '#f59e0b' : 'inherit', fontWeight:600 }}>{formatVND(bDetail.totalDue)}</td>
                    <td><span className={`badge-status ${st.cls}`}>{st.label}</span></td>
                    <td>
                      <div className="flex gap-2">
                        <button className="action-btn view" onClick={() => openDetailModal(b.resId)} title="Xem chi tiết hóa đơn">
                          <Eye size={15} />
                        </button>
                        <button className="action-btn edit" onClick={() => navigate(`/booking-detail/${b.resId}`)} title="Tới chi tiết đặt phòng">
                          ➡️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={7} className="text-center text-gray" style={{padding:'2rem'}}>Không có dữ liệu hóa đơn</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill Invoice Detail Modal */}
      {showModal && selectedBill && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth:'650px', width:'90%' }}>
            <div className="modal-header">
              <h3 className="modal-title">Hóa Đơn Chi Tiết: {selectedBill.reservationId}</h3>
              <button className="action-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight:'70vh', overflowY:'auto' }}>
              <div style={{ marginBottom:'1rem', borderBottom:'1px solid #e2e8f0', paddingBottom:'0.75rem' }}>
                <p>Khách hàng: <strong>{selectedBill.guestName}</strong></p>
                <p>Số điện thoại: <strong>{selectedBill.guestPhone || '-'}</strong> | CCCD: <strong>{selectedBill.guestIdentityNum || '-'}</strong></p>
                <p>Thời gian: <strong>{formatDate(selectedBill.checkIn)}</strong> → <strong>{formatDate(selectedBill.checkOut)}</strong></p>
              </div>

              <h4 style={{ fontSize:'0.9rem', fontWeight:700, marginBottom:'0.5rem', color:'#4f46e5' }}>Danh Sách Khoản Phí Phòng</h4>
              <table className="table" style={{ fontSize:'0.8rem', marginBottom:'1.5rem' }}>
                <thead>
                  <tr><th>Phòng</th><th>Chi Tiết Khoản Phí</th><th>Trạng Thái</th><th style={{ textAlign:'right' }}>Số Tiền</th></tr>
                </thead>
                <tbody>
                  {selectedBill.resRoomBill && selectedBill.resRoomBill.map((rb, i) => {
                    const roomInfo = roomsLookup[rb.roomId] || {};
                    return (
                      <React.Fragment key={i}>
                        <tr key={i} style={{ background:'#f8fafc', fontWeight:700 }}>
                          <td colSpan={3}>Phòng {roomInfo.roomNumber || rb.roomId}</td>
                          <td style={{ textAlign:'right' }}>{formatVND(rb.total)}</td>
                        </tr>
                        {rb.roomBills && rb.roomBills.map((bItem, bIdx) => (
                          <tr key={`${i}-${bIdx}`}>
                            <td></td>
                            <td style={{ color:'#6b7280' }}>
                              {bItem.reason === 'ROOM_CHARGE' ? 'Tiền Phòng' : bItem.reason === 'SERVICE' ? 'Tiền Dịch Vụ sử dụng' : 'Hoàn Tiền/Hủy'}
                            </td>
                            <td>
                              <span className={`badge-status ${bItem.status === 'PAID' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize:'0.65rem', padding:'0.05rem 0.25rem' }}>
                                {bItem.status === 'PAID' ? 'Đã thu' : 'Chưa thu'}
                              </span>
                            </td>
                            <td style={{ textAlign:'right', color: bItem.reason === 'REFUND' ? '#ef4444' : 'inherit' }}>
                              {bItem.reason === 'REFUND' ? '-' : ''}{formatVND(bItem.totalAmount)}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>

              <table className="table" style={{ fontSize:'0.9rem', width:'100%' }}>
                <tbody>
                  <tr>
                    <td style={{ fontWeight:600, color:'#10b981' }}>Doanh Thu Đã Thu (Paid)</td>
                    <td style={{ textAlign:'right', fontWeight:700, color:'#10b981' }}>{formatVND(selectedBill.totalPaid)}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight:600, color:'#f59e0b' }}>Tiền Còn Nợ (Due)</td>
                    <td style={{ textAlign:'right', fontWeight:700, color:'#f59e0b' }}>{formatVND(selectedBill.totalDue)}</td>
                  </tr>
                  <tr style={{ borderTop:'2px solid #cbd5e1', fontSize:'1.1rem' }}>
                    <td style={{ fontWeight:700 }}>Tổng Cộng Hóa Đơn (Grand Total)</td>
                    <td style={{ textAlign:'right', fontWeight:700, color:'#4f46e5' }}>{formatVND(selectedBill.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              {selectedBill.totalDue > 0 && (
                <button type="button" className="btn btn-primary" onClick={() => handleConfirmPayment(selectedBill.reservationId)}>
                  💳 Xác Nhận Thanh Toán {formatVND(selectedBill.totalDue)}
                </button>
              )}
              <button className="btn" onClick={() => setShowModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
