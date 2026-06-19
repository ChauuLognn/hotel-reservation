import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Home, DollarSign, Clock, CheckCircle, Plus, Trash2, Calendar, Coffee, UserPlus } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import reservationApi from '../../api/reservationApi';
import guestApi from '../../api/guestApi';
import roomApi from '../../api/roomApi';
import serviceApi from '../../api/serviceApi';
import billApi from '../../api/billApi';
import { formatVND, formatDate, formatDateTime } from '@shared/utils/format';
import { RESERVATION_STATUS } from '@shared/constants/statusMaps';


export default function BookingDetail() {
  const { resId } = useParams();
  const navigate = useNavigate();
  
  const [detail, setDetail] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [bill, setBill] = useState(null);
  const [roomsList, setRoomsList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [allGuests, setAllGuests] = useState([]);
  const [resRooms, setResRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [changingStatus, setChangingStatus] = useState(false);


  // Room-by-room stays & services states
  const [roomDetailsMap, setRoomDetailsMap] = useState({}); // resRoomId -> list of registered guests
  const [roomServicesMap, setRoomServicesMap] = useState({}); // resRoomId -> list of used services
  const [loadingRoomData, setLoadingRoomData] = useState({});

  // Modals
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [activeResRoomId, setActiveResRoomId] = useState(null);
  const [selectedGuestId, setSelectedGuestId] = useState('');
  const [guestSearch, setGuestSearch] = useState('');

  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [selectedServiceName, setSelectedServiceName] = useState('');
  const [serviceQty, setServiceQty] = useState(1);

  // Quick guest creation inside check-in modal
  const [showQuickGuest, setShowQuickGuest] = useState(false);
  const [guestForm, setGuestForm] = useState({ firstName:'', lastName:'', phone:'', identityNum:'' });

  useEffect(() => {
    if (resId) fetchAll();
  }, [resId]);

  async function fetchAll() {
    setLoading(true);
    try {
      // 1. Fetch reservation detail, status history, and bills
      const [detailRes, histRes, billRes, svcRes, resRoomsRes] = await Promise.all([
        reservationApi.getDetail(resId),
        reservationApi.getStatusHistory(resId),
        billApi.getByResId(resId).catch(() => ({ data: null })),
        serviceApi.getAll(),
        reservationApi.getRoomsByResId(resId).catch(() => ({ data: [] }))
      ]);

      setDetail(detailRes.data);
      setStatusHistory(Array.isArray(histRes.data) ? histRes.data : []);
      setBill(billRes.data);
      
      const mappedServices = (Array.isArray(svcRes.data) ? svcRes.data : []).map(s => ({
        ...s,
        serviceName: s.name
      }));
      setServicesList(mappedServices);
      
      const resRoomsData = resRoomsRes.data || [];
      setResRooms(resRoomsData);

      if (mappedServices.length > 0) setSelectedServiceName(mappedServices[0].serviceName);

      // Fetch rooms list asynchronously in background
      roomApi.getAll()
        .then(roomsRes => {
          setRoomsList(Array.isArray(roomsRes.data) ? roomsRes.data : []);
        })
        .catch(err => console.error("Error loading rooms list:", err));

      // 2. Fetch guests and services room-by-room
      const tempGuestsMap = {};
      const tempServicesMap = {};
      const tempLoadingMap = {};

      await Promise.all(
        resRoomsData.map(async (rr) => {
          tempLoadingMap[rr.id] = true;
          try {
            const [gRes, sRes] = await Promise.all([
              reservationApi.getGuestsByResRoom(rr.id),
              reservationApi.getServicesOfResRoom(rr.id),
            ]);
            tempGuestsMap[rr.id] = gRes.data || [];
            tempServicesMap[rr.id] = sRes.data || [];
          } catch(err) {
            console.error(`Error loading details for room ${rr.id}:`, err);
          } finally {
            tempLoadingMap[rr.id] = false;
          }
        })
      );

      setRoomDetailsMap(tempGuestsMap);
      setRoomServicesMap(tempServicesMap);
      setLoadingRoomData(tempLoadingMap);

    } catch(e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  }

  // Reload room-by-room data specifically
  async function reloadRoomData(resRoomId) {
    setLoadingRoomData(prev => ({ ...prev, [resRoomId]: true }));
    try {
      const [gRes, sRes, billRes] = await Promise.all([
        reservationApi.getGuestsByResRoom(resRoomId),
        reservationApi.getServicesOfResRoom(resRoomId),
        billApi.getByResId(resId).catch(() => ({ data: null })),
      ]);
      setRoomDetailsMap(prev => ({ ...prev, [resRoomId]: gRes.data || [] }));
      setRoomServicesMap(prev => ({ ...prev, [resRoomId]: sRes.data || [] }));
      setBill(billRes.data);
    } catch(err) {
      console.error(err);
    } finally {
      setLoadingRoomData(prev => ({ ...prev, [resRoomId]: false }));
    }
  }

  async function changeStatus(newStatus) {
    if (!confirm(`Đổi trạng thái đặt phòng thành "${RESERVATION_STATUS[newStatus]?.label}"?`)) return;
    setChangingStatus(true);
    try {
      await reservationApi.updateStatus(resId, { newStatus: newStatus });
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

  async function confirmPaymentForRoom(resRoomId, roomNum) {
    if (!confirm(`Xác nhận thanh toán cho riêng phòng ${roomNum}?`)) return;
    try {
      await billApi.confirmPaidForResRoom(resId, resRoomId);
      fetchAll();
    } catch(err) { alert('Lỗi: ' + (err?.response?.data?.message || err.message)); }
  }

  // Guest registration handler
  async function openAddGuest(resRoomId) {
    setActiveResRoomId(resRoomId);
    setGuestSearch('');
    setShowQuickGuest(false);
    setShowAddGuestModal(true);
    if (!allGuests.length) {
      try {
        const guestsRes = await guestApi.getAll();
        const guestsList = Array.isArray(guestsRes.data) ? guestsRes.data : [];
        setAllGuests(guestsList);
        if (guestsList.length > 0) {
          setSelectedGuestId(String(guestsList[0].id));
        }
      } catch (err) {
        console.error('Lỗi tải danh sách khách hàng:', err);
      }
    }
  }

  async function handleAddGuestSubmit(e) {
    e.preventDefault();
    if (!selectedGuestId || !activeResRoomId) return;
    try {
      await reservationApi.registerGuest(activeResRoomId, Number(selectedGuestId));
      setShowAddGuestModal(false);
      reloadRoomData(activeResRoomId);
    } catch(err) {
      alert('Lỗi đăng ký khách: ' + (err?.response?.data?.message || err.message));
    }
  }

  async function handleQuickGuestSubmit(e) {
    e.preventDefault();
    try {
      const res = await guestApi.create(guestForm);
      const newGuest = res.data;
      alert(`Đã thêm khách hàng: ${newGuest.firstName} ${newGuest.lastName}`);
      
      const gList = await guestApi.getAll();
      setAllGuests(Array.isArray(gList.data) ? gList.data : []);
      setSelectedGuestId(String(newGuest.id));
      setShowQuickGuest(false);
      setGuestForm({ firstName:'', lastName:'', phone:'', identityNum:'' });
    } catch(err) {
      alert('Lỗi thêm khách: ' + (err?.response?.data?.message || err.message));
    }
  }

  // Guest Check-in/Check-out handlers
  async function handleCheckIn(resRoomId, guestId, name) {
    if (!confirm(`Tiến hành check-in cho khách ${name}?`)) return;
    try {
      await reservationApi.checkIn(resRoomId, guestId, null);
      alert('Check-in thành công!');
      reloadRoomData(resRoomId);
    } catch(err) {
      alert('Lỗi check-in: ' + (err?.response?.data?.message || err.message));
    }
  }

  async function handleCheckOut(resRoomId, guestId, name) {
    if (!confirm(`Tiến hành check-out cho khách ${name}?`)) return;
    try {
      await reservationApi.checkOut(resRoomId, guestId, null);
      alert('Check-out thành công!');
      reloadRoomData(resRoomId);
    } catch(err) {
      alert('Lỗi check-out: ' + (err?.response?.data?.message || err.message));
    }
  }

  // Room Services handlers
  function openAddService(resRoomId) {
    setActiveResRoomId(resRoomId);
    setServiceQty(1);
    setShowAddServiceModal(true);
  }

  async function handleAddServiceSubmit(e) {
    e.preventDefault();
    if (!selectedServiceName || !activeResRoomId) return;
    
    const qty = Number(serviceQty);
    if (qty < 1 || qty > 100) {
      alert('Số lượng dịch vụ phải từ 1 đến 100');
      return;
    }
    
    try {
      await reservationApi.addServiceToResRoom(activeResRoomId, {
        name: selectedServiceName,
        quantity: qty
      });
      setShowAddServiceModal(false);
      reloadRoomData(activeResRoomId);
    } catch(err) {
      alert('Lỗi thêm dịch vụ: ' + (err?.response?.data?.message || err.message));
    }
  }

  async function handleDeleteService(resRoomId, svcId) {
    if (!confirm('Xóa dịch vụ này khỏi phòng?')) return;
    try {
      await reservationApi.deleteServiceFromResRoom(resRoomId, svcId);
      reloadRoomData(resRoomId);
    } catch(err) {
      alert('Lỗi xóa dịch vụ: ' + (err?.response?.data?.message || err.message));
    }
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

  // Status mapping
  const st = RESERVATION_STATUS[detail.status] || { label:detail.status, cls:'badge-secondary' };


  // Next status options for receptionist workflow
  const nextStatuses = {
    PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['CHECK_IN', 'CANCELLED'],
    CHECK_IN: ['CHECK_OUT'],
    CHECK_OUT: [],
    CANCELLED: [],
    PENDING_EXPIRED: [],
  };
  const availableStatuses = nextStatuses[detail.status] || [];

  // Build a lookup map of roomsList (id -> number, name, floor)
  const roomsLookup = roomsList.reduce((acc, r) => {
    acc[r.id] = {
      ...r,
      roomNumber: r.id,
      roomTypeName: r.typeName,
      floorNumber: Math.floor(r.id / 100) || 1
    };
    return acc;
  }, {});

  const filteredAllGuests = allGuests.filter(g => {
    const q = guestSearch.toLowerCase();
    return `${g.firstName} ${g.lastName}`.toLowerCase().includes(q) || (g.phone||'').includes(q);
  });

  return (
    <Layout title={`Chi Tiết Đặt Phòng: ${resId}`}>
      <button className="btn mb-4" onClick={() => navigate('/bookings')}>
        <ArrowLeft size={16} /> Quay Lại
      </button>

      {/* Header card info */}
      <div className="card mb-4">
        <div className="card-body" style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem'}}>
          <div>
            <h2 style={{fontSize:'1.4rem', fontWeight:700, color:'#111827'}}>Đặt Phòng #{resId}</h2>
            <p style={{color:'#6b7280', marginTop:'0.25rem'}}>
              Thời gian lưu trú: <strong>{formatDate(detail.checkIn)}</strong> → <strong>{formatDate(detail.checkOut)}</strong>
            </p>
            {detail.note && <p style={{color:'#6b7280', marginTop:'0.25rem'}}>Ghi chú: {detail.note}</p>}
          </div>
          <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'0.5rem'}}>
            <span className={`badge-status ${st.cls}`} style={{fontSize:'0.9rem', padding:'0.4rem 1rem'}}>{st.label}</span>
            
            {/* Action change status buttons */}
            {availableStatuses.length > 0 && (
              <div className="flex gap-2">
                {availableStatuses.map(s => (
                  <button key={s} className="btn btn-sm" onClick={() => changeStatus(s)} disabled={changingStatus}
                    style={{background: s==='CANCELLED'?'#fee2e2':s==='CHECK_IN'?'#d1fae5':'#dbeafe', border:'none', color: s==='CANCELLED'?'#dc2626':s==='CHECK_IN'?'#059669':'#2563eb'}}>
                    {RESERVATION_STATUS[s]?.label}
                  </button>
                ))}
              </div>
            )}

            {detail.status === 'CHECK_OUT' && (
              <button className="btn btn-primary btn-sm" onClick={confirmPayment}>
                <CheckCircle size={14} /> Xác Nhận Thanh Toán Toàn Bộ
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main grids: Room Detail, Stays, Services, Bills, Status History */}
      <div style={{display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:'1.5rem', alignItems:'start'}}>
        
        {/* Left Side: Room list card detail stays & services */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
          
          <h3 style={{ fontSize:'1.1rem', fontWeight:700, color:'#111827', margin:0 }}>🚪 Chi Tiết Phòng Lưu Trú & Dịch Vụ</h3>
          
          {resRooms.map((rr, idx) => {
            const roomInfo = roomsLookup[rr.roomId] || {};
            const registeredGuests = roomDetailsMap[rr.id] || [];
            const usedServices = roomServicesMap[rr.id] || [];
            const isRoomLoading = loadingRoomData[rr.id];
            
            return (
              <div className="card" key={rr.id} style={{ borderColor: isRoomLoading ? '#6366f1' : '#e5e7eb' }}>
                <div className="card-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'#f8fafc', padding:'0.75rem 1rem' }}>
                  <h4 style={{ fontWeight:700, color:'#4f46e5', margin:0 }}>
                    Phòng {roomInfo.roomNumber || rr.roomId} — {roomInfo.roomTypeName || '-'}
                  </h4>
                  <span style={{ fontSize:'0.85rem', color:'#6b7280' }}>
                    {formatVND(rr.totalPrice)} ({roomInfo.floorNumber ? `Tầng ${roomInfo.floorNumber}` : '-'})
                  </span>
                </div>
                <div className="card-body" style={{ padding:'1rem' }}>
                  
                  {/* Guest Stays section */}
                  <div style={{ marginBottom:'1.5rem' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem' }}>
                      <h5 style={{ fontSize:'0.85rem', fontWeight:700, margin:0, color:'#374151' }}>👥 Khách Lưu Trú ({registeredGuests.length})</h5>
                      {['PENDING_PAYMENT', 'CONFIRMED', 'CHECK_IN'].includes(detail.status) && (
                        <button className="btn btn-xs" onClick={() => openAddGuest(rr.id)} style={{ fontSize:'0.72rem', padding:'0.2rem 0.4rem', border:'1px solid #cbd5e1', background:'white' }}>
                          <UserPlus size={10} style={{ display:'inline-block', marginRight:'0.15rem' }} /> Đăng Ký Khách
                        </button>
                      )}
                    </div>
                    
                    <table className="table" style={{ fontSize:'0.8rem' }}>
                      <thead>
                        <tr><th>Tên Khách</th><th>CMND/CCCD</th><th>Nhận Phòng (Check-in)</th><th>Trả Phòng (Check-out)</th></tr>
                      </thead>
                      <tbody>
                        {registeredGuests.length ? registeredGuests.map((rg, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight:600 }}>{rg.guestName}</td>
                            <td>{rg.identityNum || '-'}</td>
                            <td>
                              {rg.checkInAt ? (
                                <span style={{ color:'#10b981' }}>{new Date(rg.checkInAt).toLocaleString('vi-VN')}</span>
                              ) : (
                                ['CONFIRMED', 'CHECK_IN'].includes(detail.status) ? (
                                  <button className="btn btn-xs" onClick={() => handleCheckIn(rr.id, rg.guestId, rg.guestName)} style={{ background:'#d1fae5', color:'#059669', border:'none' }}>Check-In</button>
                                ) : '-'
                              )}
                            </td>
                            <td>
                              {rg.checkOutAt ? (
                                <span style={{ color:'#6b7280' }}>{new Date(rg.checkOutAt).toLocaleString('vi-VN')}</span>
                              ) : (
                                rg.checkInAt && detail.status === 'CHECK_IN' ? (
                                  <button className="btn btn-xs" onClick={() => handleCheckOut(rr.id, rg.guestId, rg.guestName)} style={{ background:'#fee2e2', color:'#dc2626', border:'none' }}>Check-Out</button>
                                ) : '-'
                              )}
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan={4} className="text-center text-gray" style={{ padding:'0.5rem' }}>Chưa có khách đăng ký phòng này</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Room Services section */}
                  <div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem' }}>
                      <h5 style={{ fontSize:'0.85rem', fontWeight:700, margin:0, color:'#374151' }}>☕ Dịch Vụ Sử Dụng ({usedServices.length})</h5>
                      {detail.status === 'CHECK_IN' && (
                        <button className="btn btn-xs" onClick={() => openAddService(rr.id)} style={{ fontSize:'0.72rem', padding:'0.2rem 0.4rem', border:'1px solid #cbd5e1', background:'white' }}>
                          <Plus size={10} style={{ display:'inline-block', marginRight:'0.15rem' }} /> Thêm Dịch Vụ
                        </button>
                      )}
                    </div>

                    <table className="table" style={{ fontSize:'0.8rem' }}>
                      <thead>
                        <tr><th>Tên Dịch Vụ</th><th>SL</th><th>Tiền</th><th>Ngày Dùng</th><th>Thao Tác</th></tr>
                      </thead>
                      <tbody>
                        {usedServices.length ? usedServices.map((svc, i) => (
                          <tr key={svc.id || i}>
                            <td style={{ fontWeight:600 }}>{svc.service}</td>
                            <td>{svc.quantity}</td>
                            <td style={{ fontWeight:600, color:'#4f46e5' }}>{formatVND(svc.totalAmount)}</td>
                            <td>{formatDateTime(svc.usedAt)}</td>
                            <td>
                              {detail.status === 'CHECK_IN' ? (
                                <button className="action-btn delete" onClick={() => handleDeleteService(rr.id, svc.id)} title="Xóa" style={{ padding:'0.15rem' }}>
                                  <Trash2 size={12} />
                                </button>
                              ) : '-'}
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan={5} className="text-center text-gray" style={{ padding:'0.5rem' }}>Chưa dùng dịch vụ nào</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Individual room billing payment confirmation */}
                  {bill?.resRoomBill?.find(rb => rb.resRoomId === rr.id)?.totalDue > 0 && detail.status === 'CHECK_OUT' && (
                    <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'0.75rem' }}>
                      <button className="btn btn-xs" onClick={() => confirmPaymentForRoom(rr.id, roomInfo.roomNumber)} style={{ background:'#dbeafe', color:'#2563eb', border:'none', fontSize:'0.75rem' }}>
                        💳 Thanh Toán Riêng Phòng Này
                      </button>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Bill & Status History */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
          
          {/* Bill summary card */}
          {bill && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title"><DollarSign size={16} style={{marginRight:'0.5rem', verticalAlign:'middle'}} />Hóa Đơn Tổng Hợp</h3>
              </div>
              <div className="card-body">
                <table className="table" style={{ fontSize:'0.85rem' }}>
                  <tbody>
                    {/* resRoomBill list */}
                    {bill.resRoomBill && bill.resRoomBill.map((rb, i) => {
                      const roomInfo = roomsLookup[rb.roomId] || {};
                      return (
                        <React.Fragment key={i}>
                          <tr key={i} style={{ borderBottom:'1px dashed #e5e7eb' }}>
                            <td style={{ fontWeight:700, color:'#4f46e5' }}>Phòng {roomInfo.roomNumber || rb.roomId}</td>
                            <td style={{ textAlign:'right', fontWeight:700 }}>{formatVND(rb.total)}</td>
                          </tr>
                          
                          {/* list individual room bills if any */}
                          {rb.roomBills && rb.roomBills.map((bItem, bIdx) => (
                            <tr key={`${i}-${bIdx}`} style={{ fontSize:'0.75rem', color:'#6b7280' }}>
                              <td style={{ paddingLeft:'1.5rem' }}>
                                • {bItem.reason === 'ROOM_CHARGE' ? 'Tiền Phòng' : bItem.reason === 'SERVICE' ? 'Dịch vụ đã dùng' : 'Hoàn Tiền'} 
                                <span className={`badge-status ${bItem.status === 'PAID' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize:'0.6rem', padding:'0.05rem 0.25rem', marginLeft:'0.4rem' }}>
                                  {bItem.status === 'PAID' ? 'PAID' : 'UNPAID'}
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
                    
                    {/* Grand totals breakdown */}
                    <tr style={{borderTop:'2px solid #e5e7eb', marginTop:'0.5rem'}}>
                      <td style={{fontWeight:600, color:'#10b981'}}>Đã Thanh Toán (Paid)</td>
                      <td style={{textAlign:'right', fontWeight:600, color:'#10b981'}}>{formatVND(bill.totalPaid)}</td>
                    </tr>
                    <tr>
                      <td style={{fontWeight:600, color:'#f59e0b'}}>Chưa Thanh Toán (Due)</td>
                      <td style={{textAlign:'right', fontWeight:600, color:'#f59e0b'}}>{formatVND(bill.totalDue)}</td>
                    </tr>
                    <tr style={{borderTop:'2px solid #cbd5e1', fontSize:'1.1rem'}}>
                      <td style={{fontWeight:700}}>Tổng Cộng</td>
                      <td style={{textAlign:'right', fontWeight:700, color:'#4f46e5'}}>{formatVND(bill.total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Status History card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><Clock size={16} style={{marginRight:'0.5rem', verticalAlign:'middle'}} />Lịch Sử Trạng Thái</h3>
            </div>
            <div className="card-body" style={{maxHeight:'300px', overflowY:'auto'}}>
              {statusHistory.length ? [...statusHistory].reverse().map((h, i) => {
                const hSt = RESERVATION_STATUS[h.newStatus] || {label:h.newStatus, cls:'badge-secondary'};
                return (
                  <div key={i} style={{padding:'0.6rem 0', borderBottom:'1px solid #f3f4f6'}}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span className={`badge-status ${hSt.cls}`} style={{fontSize:'0.75rem'}}>{hSt.label}</span>
                      <span style={{fontSize:'0.78rem', color:'#9ca3af'}}>{formatDateTime(h.updatedAt)}</span>
                    </div>
                    {h.reason && <p style={{ fontSize:'0.72rem', color:'#6b7280', marginTop:'0.2rem' }}>Lý do: {h.reason}</p>}
                    <p style={{ fontSize:'0.72rem', color:'#9ca3af', marginTop:'0.1rem' }}>Mã phòng: {h.roomId}</p>
                  </div>
                );
              }) : <p style={{color:'#9ca3af', textAlign:'center', padding:'1rem'}}>Chưa có lịch sử</p>}
            </div>
          </div>
        </div>

      </div>

      {/* Modal: Register Guest to Room */}
      {showAddGuestModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowAddGuestModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Đăng Ký Khách Vào Phòng</h3>
              <button className="action-btn" onClick={() => setShowAddGuestModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddGuestSubmit}>
              <div className="modal-body">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem' }}>
                  <label className="form-label" style={{ fontWeight:700, margin:0 }}>Chọn Khách Hàng</label>
                  <button type="button" className="btn btn-sm" onClick={() => setShowQuickGuest(!showQuickGuest)} style={{ background:'#e0e7ff', color:'#4f46e5', border:'none', fontSize:'0.75rem' }}>
                    {showQuickGuest ? 'Chọn Khách Có Sẵn' : 'Thêm Mới Khách'}
                  </button>
                </div>

                {!showQuickGuest ? (
                  <div>
                    <input type="text" className="form-input mb-2" placeholder="🔍 Tìm tên hoặc SĐT..." value={guestSearch} onChange={e => setGuestSearch(e.target.value)} />
                    <select className="form-input" required value={selectedGuestId} onChange={e => setSelectedGuestId(e.target.value)}>
                      {filteredAllGuests.map(g => (
                        <option key={g.id} value={g.id}>
                          {g.firstName} {g.lastName} - {g.phone || 'Không có SĐT'} ({g.identityNum || 'Không có CMND'})
                        </option>
                      ))}
                      {!filteredAllGuests.length && <option value="">-- Không tìm thấy khách --</option>}
                    </select>
                  </div>
                ) : (
                  <div style={{ border:'1px solid #cbd5e1', padding:'1rem', borderRadius:'8px' }}>
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
                      <button type="button" className="btn btn-primary btn-sm" onClick={handleQuickGuestSubmit}>💾 Lưu Khách</button>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowAddGuestModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={showQuickGuest}>💾 Đăng Ký</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Service to Room */}
      {showAddServiceModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowAddServiceModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Thêm Dịch Vụ Vào Phòng</h3>
              <button className="action-btn" onClick={() => setShowAddServiceModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddServiceSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Chọn Dịch Vụ *</label>
                  <select className="form-input" value={selectedServiceName} onChange={e => setSelectedServiceName(e.target.value)} required>
                    {servicesList.filter(s => s.status === 'ACTIVE').map(s => (
                      <option key={s.id} value={s.serviceName}>{s.serviceName} - {formatVND(s.price)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Số Lượng *</label>
                  <input type="number" min="1" max="100" className="form-input" required value={serviceQty} onChange={e => setServiceQty(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowAddServiceModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">💾 Thêm Dịch Vụ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
