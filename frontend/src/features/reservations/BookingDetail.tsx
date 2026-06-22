import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, Clock, CheckCircle, Plus, Trash2, UserPlus } from 'lucide-react';
import Layout from '@layout/Layout';
import reservationApi from '@features/reservations/api/reservationApi';
import guestApi from '@features/guests/api/guestApi';
import roomApi from '@features/rooms/api/roomApi';
import serviceApi from '@features/services/api/serviceApi';
import billApi from '@features/billing/api/billApi';
import { formatVND, formatDate, formatDateTime } from '@shared/utils/format';
import { RESERVATION_STATUS } from '@shared/constants/statusMaps';
import { useToast } from '@context/ToastContext';
import { useConfirm } from '@context/ConfirmContext';
import Button from '@shared/ui/Button';
import Modal from '@shared/ui/Modal';

interface GuestItem {
  guestId: number;
  guestName: string;
  identityNum?: string;
  checkInAt?: string;
  checkOutAt?: string;
}

interface ServiceItem {
  id: number;
  service: string;
  quantity: number;
  totalAmount: number;
  usedAt: string;
}

interface BookingRoom {
  id: number;
  roomId: number;
  totalPrice: number;
  guests?: GuestItem[];
  services?: ServiceItem[];
}

interface StatusHistoryItem {
  newStatus: string;
  updatedAt: string;
  reason?: string;
  roomId?: number;
}

interface BookingBillItem {
  reason: 'ROOM_CHARGE' | 'SERVICE' | 'REFUND' | string;
  status: 'PAID' | 'UNPAID' | string;
  totalAmount: number;
}

interface BookingResRoomBill {
  resRoomId: number;
  roomId: number;
  total: number;
  roomBills: BookingBillItem[];
}

interface BookingBill {
  reservationId: string;
  guestName: string;
  guestPhone?: string;
  guestIdentityNum?: string;
  checkIn?: string;
  checkOut?: string;
  total: number;
  totalPaid: number;
  totalDue: number;
  resRoomBill?: BookingResRoomBill[];
}

interface FullBookingDetail {
  resId: string;
  guestName?: string;
  checkIn: string;
  checkOut: string;
  note?: string;
  status: string;
  overallRoomStatus?: string;
  rooms?: BookingRoom[];
}

interface RoomInfo {
  id: number;
  roomNumber: string;
  typeName: string;
  price?: number;
}

interface ServiceInfo {
  id: number;
  name: string;
  price: number;
  status?: string;
  serviceName: string;
}

export default function BookingDetail() {
  const { resId } = useParams<{ resId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const confirm = useConfirm();

  const [detail, setDetail] = useState<FullBookingDetail | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryItem[]>([]);
  const [bill, setBill] = useState<BookingBill | null>(null);
  const [roomsList, setRoomsList] = useState<any[]>([]);
  const [servicesList, setServicesList] = useState<ServiceInfo[]>([]);
  const [allGuests, setAllGuests] = useState<any[]>([]);
  const [resRooms, setResRooms] = useState<BookingRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [changingStatus, setChangingStatus] = useState(false);

  // Room-by-room stays & services states
  const [roomDetailsMap, setRoomDetailsMap] = useState<Record<number, GuestItem[]>>({});
  const [roomServicesMap, setRoomServicesMap] = useState<Record<number, ServiceItem[]>>({});
  const [loadingRoomData, setLoadingRoomData] = useState<Record<number, boolean>>({});

  // Modals
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [activeResRoomId, setActiveResRoomId] = useState<number | null>(null);
  const [selectedGuestId, setSelectedGuestId] = useState('');
  const [guestSearch, setGuestSearch] = useState('');

  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [selectedServiceName, setSelectedServiceName] = useState('');
  const [serviceQty, setServiceQty] = useState(1);

  // Quick guest creation inside check-in modal
  const [showQuickGuest, setShowQuickGuest] = useState(false);
  const [guestForm, setGuestForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    identityNum: '',
  });

  useEffect(() => {
    if (resId) fetchAll();
  }, [resId]);

  async function fetchAll() {
    if (!resId) return;
    setLoading(true);
    try {
      const [fullDetailRes, histRes, billRes, svcRes] = await Promise.all([
        reservationApi.getFullDetail(resId),
        reservationApi.getStatusHistory(resId),
        billApi.getByResId(resId).catch(() => ({ data: null })),
        serviceApi.getAll(),
      ]);

      const fullDetail = fullDetailRes.data;
      setDetail(fullDetail);
      setStatusHistory(Array.isArray(histRes.data) ? histRes.data : []);
      setBill(billRes.data);

      const mappedServices = (Array.isArray(svcRes.data) ? svcRes.data : []).map((s: any) => ({
        ...s,
        serviceName: s.name,
      }));
      setServicesList(mappedServices);

      const roomsData = fullDetail.rooms || [];
      setResRooms(roomsData);

      if (mappedServices.length > 0) {
        setSelectedServiceName(mappedServices[0].serviceName);
      }

      // Fetch rooms list asynchronously in background
      roomApi
        .getAll()
        .then((roomsRes: any) => {
          setRoomsList(Array.isArray(roomsRes.data) ? roomsRes.data : []);
        })
        .catch((err: any) => console.error('Error loading rooms list:', err));

      // Map guests and services from full detail response
      const tempGuestsMap: Record<number, GuestItem[]> = {};
      const tempServicesMap: Record<number, ServiceItem[]> = {};
      const tempLoadingMap: Record<number, boolean> = {};

      roomsData.forEach((room: BookingRoom) => {
        tempGuestsMap[room.id] = room.guests || [];
        tempServicesMap[room.id] = room.services || [];
        tempLoadingMap[room.id] = false;
      });

      setRoomDetailsMap(tempGuestsMap);
      setRoomServicesMap(tempServicesMap);
      setLoadingRoomData(tempLoadingMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Reload room-by-room data specifically
  async function reloadRoomData(resRoomId: number) {
    if (!resId) return;
    setLoadingRoomData((prev) => ({ ...prev, [resRoomId]: true }));
    try {
      const [gRes, sRes, billRes] = await Promise.all([
        reservationApi.getGuestsByResRoom(String(resRoomId)),
        reservationApi.getServicesOfResRoom(String(resRoomId)),
        billApi.getByResId(resId).catch(() => ({ data: null })),
      ]);
      setRoomDetailsMap((prev) => ({ ...prev, [resRoomId]: gRes.data || [] }));
      setRoomServicesMap((prev) => ({ ...prev, [resRoomId]: sRes.data || [] }));
      setBill(billRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRoomData((prev) => ({ ...prev, [resRoomId]: false }));
    }
  }

  async function changeStatus(newStatus: string) {
    if (!resId) return;
    const isConfirmed = await confirm({
      title: 'Đổi Trạng Thái',
      message: `Bạn có chắc chắn muốn đổi trạng thái đặt phòng thành "${
        RESERVATION_STATUS[newStatus]?.label || newStatus
      }"?`,
    });
    if (!isConfirmed) return;
    setChangingStatus(true);
    try {
      await reservationApi.updateStatus(resId, { newStatus: newStatus });
      showToast('Đổi trạng thái thành công!', 'success');
      fetchAll();
    } catch (err: any) {
      showToast('Lỗi: ' + (err?.response?.data?.message || err.message), 'error');
    } finally {
      setChangingStatus(false);
    }
  }

  async function confirmPayment() {
    if (!resId) return;
    const isConfirmed = await confirm({
      title: 'Thanh Toán Hóa Đơn',
      message: 'Xác nhận thanh toán cho toàn bộ đặt phòng này?',
    });
    if (!isConfirmed) return;
    try {
      await billApi.confirmPaidForRes(resId);
      showToast('Thanh toán thành công!', 'success');
      fetchAll();
    } catch (err: any) {
      showToast('Lỗi: ' + (err?.response?.data?.message || err.message), 'error');
    }
  }

  async function confirmPaymentForRoom(resRoomId: number, roomNum: string | number) {
    if (!resId) return;
    const isConfirmed = await confirm({
      title: 'Thanh Toán Phòng',
      message: `Xác nhận thanh toán cho riêng phòng ${roomNum}?`,
    });
    if (!isConfirmed) return;
    try {
      await billApi.confirmPaidForResRoom(resId, String(resRoomId));
      showToast('Thanh toán phòng thành công!', 'success');
      fetchAll();
    } catch (err: any) {
      showToast('Lỗi: ' + (err?.response?.data?.message || err.message), 'error');
    }
  }

  // Guest registration handler
  async function openAddGuest(resRoomId: number) {
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

  async function handleAddGuestSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedGuestId || activeResRoomId === null) return;
    try {
      await reservationApi.registerGuest(String(activeResRoomId), Number(selectedGuestId));
      showToast('Đăng ký khách thành công!', 'success');
      setShowAddGuestModal(false);
      reloadRoomData(activeResRoomId);
    } catch (err: any) {
      showToast('Lỗi đăng ký khách: ' + (err?.response?.data?.message || err.message), 'error');
    }
  }

  async function handleQuickGuestSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await guestApi.create(guestForm);
      const newGuest = res.data;
      showToast(`Đã thêm khách hàng: ${newGuest.firstName} ${newGuest.lastName}`, 'success');

      const gList = await guestApi.getAll();
      setAllGuests(Array.isArray(gList.data) ? gList.data : []);
      setSelectedGuestId(String(newGuest.id));
      setShowQuickGuest(false);
      setGuestForm({ firstName: '', lastName: '', phone: '', identityNum: '' });
    } catch (err: any) {
      showToast('Lỗi thêm khách: ' + (err?.response?.data?.message || err.message), 'error');
    }
  }

  // Guest Check-in/Check-out handlers
  async function handleCheckIn(resRoomId: number, guestId: number, name: string) {
    const isConfirmed = await confirm({
      title: 'Nhận Phòng (Check-in)',
      message: `Tiến hành check-in cho khách ${name}?`,
    });
    if (!isConfirmed) return;
    try {
      await reservationApi.checkIn(String(resRoomId), guestId, undefined);
      showToast('Check-in thành công!', 'success');
      reloadRoomData(resRoomId);
    } catch (err: any) {
      showToast('Lỗi check-in: ' + (err?.response?.data?.message || err.message), 'error');
    }
  }

  async function handleCheckOut(resRoomId: number, guestId: number, name: string) {
    const isConfirmed = await confirm({
      title: 'Trả Phòng (Check-out)',
      message: `Tiến hành check-out cho khách ${name}?`,
    });
    if (!isConfirmed) return;
    try {
      await reservationApi.checkOut(String(resRoomId), guestId, undefined);
      showToast('Check-out thành công!', 'success');
      reloadRoomData(resRoomId);
    } catch (err: any) {
      showToast('Lỗi check-out: ' + (err?.response?.data?.message || err.message), 'error');
    }
  }

  // Room Services handlers
  function openAddService(resRoomId: number) {
    setActiveResRoomId(resRoomId);
    setServiceQty(1);
    setShowAddServiceModal(true);
  }

  async function handleAddServiceSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedServiceName || activeResRoomId === null) return;

    const qty = Number(serviceQty);
    if (qty < 1 || qty > 100) {
      showToast('Số lượng dịch vụ phải từ 1 đến 100', 'error');
      return;
    }

    try {
      await reservationApi.addServiceToResRoom(String(activeResRoomId), {
        name: selectedServiceName,
        quantity: qty,
      });
      showToast('Thêm dịch vụ thành công!', 'success');
      setShowAddServiceModal(false);
      reloadRoomData(activeResRoomId);
    } catch (err: any) {
      showToast('Lỗi thêm dịch vụ: ' + (err?.response?.data?.message || err.message), 'error');
    }
  }

  async function handleDeleteService(resRoomId: number, svcId: number) {
    const isConfirmed = await confirm({
      title: 'Xóa Dịch Vụ',
      message: 'Xóa dịch vụ này khỏi phòng?',
    });
    if (!isConfirmed) return;
    try {
      await reservationApi.deleteServiceFromResRoom(String(resRoomId), svcId);
      showToast('Xóa dịch vụ thành công!', 'success');
      reloadRoomData(resRoomId);
    } catch (err: any) {
      showToast('Lỗi xóa dịch vụ: ' + (err?.response?.data?.message || err.message), 'error');
    }
  }

  if (loading) {
    return (
      <Layout title="Chi Tiết Đặt Phòng">
        <div className="flex justify-center items-center h-64 text-apple-ink-muted-48 gap-2">
          <span className="w-6 h-6 border-2 border-apple-primary border-t-transparent rounded-full animate-spin-custom"></span>
          Đang tải chi tiết đặt phòng...
        </div>
      </Layout>
    );
  }

  if (!detail) {
    return (
      <Layout title="Chi Tiết Đặt Phòng">
        <div className="bg-apple-canvas rounded-apple-lg border border-apple-hairline p-10 text-center">
          <p className="text-apple-ink-muted-48">Không tìm thấy đặt phòng #{resId}</p>
          <Button variant="primary" onClick={() => navigate('/bookings')} className="mt-4">
            Quay Lại Danh Sách
          </Button>
        </div>
      </Layout>
    );
  }

  // Status mapping
  const st = RESERVATION_STATUS[detail.overallRoomStatus || detail.status] || {
    label: detail.status,
    cls: 'bg-gray-100 text-gray-800',
  };

  // Next status options for receptionist workflow
  const nextStatuses: Record<string, string[]> = {
    PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['CANCELLED'],
    CANCELLED: [],
    PENDING_EXPIRED: [],
  };
  const availableStatuses = nextStatuses[detail.status] || [];

  // Build a lookup map of roomsList (id -> number, name, floor)
  const roomsLookup = roomsList.reduce<Record<number, any>>((acc, r) => {
    acc[r.id] = {
      ...r,
      roomNumber: r.roomNumber || String(r.id),
      roomTypeName: r.typeName,
      floorNumber: r.floorId || Math.floor(r.id / 100) || 1,
    };
    return acc;
  }, {});

  const filteredAllGuests = allGuests.filter((g) => {
    const q = guestSearch.toLowerCase();
    return `${g.firstName} ${g.lastName}`.toLowerCase().includes(q) || (g.phone || '').includes(q);
  });

  return (
    <Layout title={`Chi Tiết Đặt Phòng: ${resId}`}>
      <Button variant="pearl-capsule" className="mb-6 py-2 px-4" onClick={() => navigate('/bookings')}>
        <ArrowLeft size={16} className="mr-1.5" /> Quay Lại
      </Button>

      {/* Header card info */}
      <div className="bg-apple-canvas rounded-apple-lg border border-apple-hairline p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 text-left">
            <h2 className="text-xl font-bold text-apple-ink">Đặt Phòng #{resId}</h2>
            <p className="text-[14px] text-apple-ink-muted-80">
              Khách hàng đặt: <strong className="font-semibold text-apple-ink">{detail.guestName || '-'}</strong>
            </p>
            <p className="text-[14px] text-apple-ink-muted-48">
              Thời gian lưu trú: <strong>{formatDate(detail.checkIn)}</strong> →{' '}
              <strong>{formatDate(detail.checkOut)}</strong>
            </p>
            {detail.note && (
              <p className="text-[13px] bg-apple-canvas-parchment text-apple-ink-muted-80 px-3 py-1.5 rounded border border-apple-divider-soft">
                Ghi chú: {detail.note}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-3 text-right">
            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[14px] font-semibold ${st.cls}`}>
              {st.label}
            </span>

            {/* Action status change buttons */}
            {availableStatuses.length > 0 && (
              <div className="flex gap-2">
                {availableStatuses.map((s) => (
                  <button
                    key={s}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full active-scale transition-all ${
                      s === 'CANCELLED'
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-apple-primary/10 text-apple-primary hover:bg-apple-primary/20'
                    }`}
                    onClick={() => changeStatus(s)}
                    disabled={changingStatus}
                  >
                    {RESERVATION_STATUS[s]?.label || s}
                  </button>
                ))}
              </div>
            )}

            {((detail.overallRoomStatus || detail.status) === 'CHECK_OUT' || detail.status === 'CONFIRMED') &&
              bill &&
              bill.totalDue > 0 && (
                <Button variant="primary" className="py-1.5 px-4 text-xs font-semibold" onClick={confirmPayment}>
                  <CheckCircle size={14} className="mr-1" /> Xác Nhận Thanh Toán Toàn Bộ
                </Button>
              )}
          </div>
        </div>
      </div>

      {/* Main grids: Room Detail, Stays, Services, Bills, Status History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Room list card detail stays & services */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-apple-ink text-left">🚪 Chi Tiết Phòng Lưu Trú & Dịch Vụ</h3>

          {resRooms.map((rr) => {
            const roomInfo = roomsLookup[rr.roomId] || {};
            const registeredGuests = roomDetailsMap[rr.id] || [];
            const usedServices = roomServicesMap[rr.id] || [];
            const isRoomLoading = loadingRoomData[rr.id];

            return (
              <div
                className={`bg-apple-canvas rounded-apple-lg border overflow-hidden transition-all duration-200 ${
                  isRoomLoading ? 'border-apple-primary' : 'border-apple-hairline'
                }`}
                key={rr.id}
              >
                <div className="px-6 py-4 bg-apple-surface-pearl border-b border-apple-divider-soft flex items-center justify-between">
                  <h4 className="font-bold text-apple-primary text-base">
                    Phòng {roomInfo.roomNumber || rr.roomId} — {roomInfo.roomTypeName || '-'}
                  </h4>
                  <span className="text-[14px] text-apple-ink-muted-80 font-semibold">
                    {formatVND(rr.totalPrice)} (Tầng {roomInfo.floorNumber || 1})
                  </span>
                </div>
                <div className="p-6 space-y-6 text-left">
                  {/* Guest Stays section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-[14px] font-bold text-apple-ink">👥 Khách Lưu Trú ({registeredGuests.length})</h5>
                      {['PENDING_PAYMENT', 'CONFIRMED', 'CHECK_IN'].includes(detail.overallRoomStatus || detail.status) && (
                        <button
                          className="inline-flex items-center px-2.5 py-1 bg-white hover:bg-apple-canvas-parchment text-apple-ink text-[11px] font-semibold border border-apple-hairline rounded active-scale transition-all"
                          onClick={() => openAddGuest(rr.id)}
                        >
                          <UserPlus size={12} className="mr-1" /> Đăng Ký Khách
                        </button>
                      )}
                    </div>

                    <div className="overflow-x-auto border border-apple-divider-soft rounded-apple-sm">
                      <table className="w-full text-left border-collapse text-[13px]">
                        <thead>
                          <tr className="border-b border-apple-divider-soft bg-apple-surface-pearl font-semibold text-apple-ink-muted-48 uppercase">
                            <th className="px-4 py-2.5">Tên Khách</th>
                            <th className="px-4 py-2.5">CMND/CCCD</th>
                            <th className="px-4 py-2.5">Nhận Phòng (Check-in)</th>
                            <th className="px-4 py-2.5">Trả Phòng (Check-out)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-apple-divider-soft text-apple-ink">
                          {registeredGuests.length ? (
                            registeredGuests.map((rg, i) => (
                              <tr key={i} className="hover:bg-apple-surface-pearl/20">
                                <td className="px-4 py-2.5 font-semibold">{rg.guestName}</td>
                                <td className="px-4 py-2.5 text-apple-ink-muted-80">{rg.identityNum || '-'}</td>
                                <td className="px-4 py-2.5">
                                  {rg.checkInAt ? (
                                    <span className="text-green-600 font-medium">
                                      {new Date(rg.checkInAt).toLocaleString('vi-VN')}
                                    </span>
                                  ) : ['CONFIRMED', 'CHECK_IN'].includes(detail.overallRoomStatus || detail.status) ? (
                                    <button
                                      className="px-2.5 py-1 bg-green-50 hover:bg-green-100 text-green-600 text-[11px] font-bold rounded active-scale transition-all"
                                      onClick={() => handleCheckIn(rr.id, rg.guestId, rg.guestName)}
                                    >
                                      Check-In
                                    </button>
                                  ) : (
                                    '-'
                                  )}
                                </td>
                                <td className="px-4 py-2.5">
                                  {rg.checkOutAt ? (
                                    <span className="text-apple-ink-muted-48">
                                      {new Date(rg.checkOutAt).toLocaleString('vi-VN')}
                                    </span>
                                  ) : rg.checkInAt && (detail.overallRoomStatus || detail.status) === 'CHECK_IN' ? (
                                    <button
                                      className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold rounded active-scale transition-all"
                                      onClick={() => handleCheckOut(rr.id, rg.guestId, rg.guestName)}
                                    >
                                      Check-Out
                                    </button>
                                  ) : (
                                    '-'
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="px-4 py-4 text-center text-apple-ink-muted-48">
                                Chưa có khách đăng ký phòng này
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Room Services section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-[14px] font-bold text-apple-ink">☕ Dịch Vụ Sử Dụng ({usedServices.length})</h5>
                      {(detail.overallRoomStatus || detail.status) === 'CHECK_IN' && (
                        <button
                          className="inline-flex items-center px-2.5 py-1 bg-white hover:bg-apple-canvas-parchment text-apple-ink text-[11px] font-semibold border border-apple-hairline rounded active-scale transition-all"
                          onClick={() => openAddService(rr.id)}
                        >
                          <Plus size={12} className="mr-1" /> Thêm Dịch Vụ
                        </button>
                      )}
                    </div>

                    <div className="overflow-x-auto border border-apple-divider-soft rounded-apple-sm">
                      <table className="w-full text-left border-collapse text-[13px]">
                        <thead>
                          <tr className="border-b border-apple-divider-soft bg-apple-surface-pearl font-semibold text-apple-ink-muted-48 uppercase">
                            <th className="px-4 py-2.5">Tên Dịch Vụ</th>
                            <th className="px-4 py-2.5">SL</th>
                            <th className="px-4 py-2.5">Tổng Tiền</th>
                            <th className="px-4 py-2.5">Ngày Dùng</th>
                            <th className="px-4 py-2.5 text-right">Thao Tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-apple-divider-soft text-apple-ink">
                          {usedServices.length ? (
                            usedServices.map((svc, i) => (
                              <tr key={svc.id || i} className="hover:bg-apple-surface-pearl/20">
                                <td className="px-4 py-2.5 font-semibold">{svc.service}</td>
                                <td className="px-4 py-2.5 text-apple-ink-muted-80">{svc.quantity}</td>
                                <td className="px-4 py-2.5 font-semibold text-apple-primary">{formatVND(svc.totalAmount)}</td>
                                <td className="px-4 py-2.5 text-apple-ink-muted-48 text-xs">{formatDateTime(svc.usedAt)}</td>
                                <td className="px-4 py-2.5 text-right">
                                  {(detail.overallRoomStatus || detail.status) === 'CHECK_IN' ? (
                                    <button
                                      className="p-1 rounded-full text-red-600 hover:bg-red-50 transition-colors active-scale inline-flex"
                                      onClick={() => handleDeleteService(rr.id, svc.id)}
                                      title="Xóa"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  ) : (
                                    '-'
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="px-4 py-4 text-center text-apple-ink-muted-48">
                                Chưa dùng dịch vụ nào
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Individual room billing payment confirmation */}
                  {bill?.resRoomBill?.find((rb) => rb.resRoomId === rr.id)?.totalDue! > 0 &&
                    (detail.overallRoomStatus || detail.status) === 'CHECK_OUT' && (
                      <div className="flex justify-end pt-2">
                        <Button
                          variant="pearl-capsule"
                          className="py-1 px-3 text-xs text-apple-primary border-apple-primary/40"
                          onClick={() => confirmPaymentForRoom(rr.id, roomInfo.roomNumber)}
                        >
                          💳 Thanh Toán Riêng Phòng Này
                        </Button>
                      </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Bill & Status History */}
        <div className="space-y-6">
          {/* Bill summary card */}
          {bill && (
            <div className="bg-apple-canvas rounded-apple-lg border border-apple-hairline p-5 space-y-4 text-left">
              <div className="flex items-center gap-2 border-b border-apple-divider-soft pb-3">
                <DollarSign size={18} className="text-apple-primary" />
                <h3 className="font-semibold text-[16px] text-apple-ink">Hóa Đơn Tổng Hợp</h3>
              </div>
              <div className="space-y-4">
                <table className="w-full text-[13px] border-collapse">
                  <tbody>
                    {bill.resRoomBill &&
                      bill.resRoomBill.map((rb, i) => {
                        const roomInfo = roomsLookup[rb.roomId] || {};
                        return (
                          <React.Fragment key={i}>
                            <tr className="border-b border-apple-divider-soft font-semibold bg-apple-surface-pearl/50">
                              <td className="py-2 px-2 text-apple-primary">Phòng {roomInfo.roomNumber || rb.roomId}</td>
                              <td className="py-2 px-2 text-right text-apple-ink">{formatVND(rb.total)}</td>
                            </tr>

                            {rb.roomBills &&
                              rb.roomBills.map((bItem, bIdx) => (
                                <tr key={`${i}-${bIdx}`} className="text-apple-ink-muted-80 text-[12px]">
                                  <td className="py-1.5 pl-6">
                                    •{' '}
                                    {bItem.reason === 'ROOM_CHARGE'
                                      ? 'Tiền Phòng'
                                      : bItem.reason === 'SERVICE'
                                      ? 'Dịch vụ đã dùng'
                                      : 'Hoàn Tiền'}
                                    <span
                                      className={`inline-flex items-center px-1.5 py-0.25 rounded text-[9px] font-bold ml-2 ${
                                        bItem.status === 'PAID'
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-amber-100 text-amber-800'
                                      }`}
                                    >
                                      {bItem.status === 'PAID' ? 'PAID' : 'UNPAID'}
                                    </span>
                                  </td>
                                  <td className="py-1.5 pr-2 text-right font-mono">
                                    {bItem.reason === 'REFUND' ? '-' : ''}
                                    {formatVND(bItem.totalAmount)}
                                  </td>
                                </tr>
                              ))}
                          </React.Fragment>
                        );
                      })}
                  </tbody>
                </table>

                {/* Grand totals breakdown */}
                <div className="border-t border-apple-divider-soft pt-3 space-y-2 text-[13px]">
                  <div className="flex justify-between font-medium text-green-600">
                    <span>Đã Thanh Toán (Paid)</span>
                    <span className="font-semibold">{formatVND(bill.totalPaid)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-amber-500">
                    <span>Chưa Thanh Toán (Due)</span>
                    <span className="font-semibold">{formatVND(bill.totalDue)}</span>
                  </div>
                  <div className="flex justify-between border-t border-apple-hairline pt-2 text-[15px] font-bold text-apple-ink">
                    <span>Tổng Cộng</span>
                    <span className="text-apple-primary font-mono">{formatVND(bill.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status History card */}
          <div className="bg-apple-canvas rounded-apple-lg border border-apple-hairline p-5 space-y-4 text-left">
            <div className="flex items-center gap-2 border-b border-apple-divider-soft pb-3">
              <Clock size={18} className="text-apple-ink-muted-48" />
              <h3 className="font-semibold text-[16px] text-apple-ink">Lịch Sử Trạng Thái</h3>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {statusHistory.length ? (
                [...statusHistory].reverse().map((h, i) => {
                  const hSt = RESERVATION_STATUS[h.newStatus] || {
                    label: h.newStatus,
                    cls: 'bg-gray-100 text-gray-800',
                  };
                  return (
                    <div key={i} className="py-2.5 border-b border-apple-divider-soft last:border-b-0 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${hSt.cls}`}>
                          {hSt.label}
                        </span>
                        <span className="text-[11px] text-apple-ink-muted-48">{formatDateTime(h.updatedAt)}</span>
                      </div>
                      {h.reason && <p className="text-[12px] text-apple-ink-muted-80">Lý do: {h.reason}</p>}
                      <p className="text-[11px] text-apple-ink-muted-48">Mã phòng: {h.roomId}</p>
                    </div>
                  );
                })
              ) : (
                <p className="text-apple-ink-muted-48 text-[13px] text-center py-4">Chưa có lịch sử</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Register Guest to Room */}
      <Modal
        open={showAddGuestModal}
        onClose={() => setShowAddGuestModal(false)}
        title="Đăng Ký Khách Vào Phòng"
        footer={
          <>
            <Button variant="pearl-capsule" onClick={() => setShowAddGuestModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" form="addGuestFormElement" disabled={showQuickGuest}>
              💾 Đăng Ký
            </Button>
          </>
        }
      >
        <form id="addGuestFormElement" onSubmit={handleAddGuestSubmit} className="space-y-4 text-left">
          <div className="bg-apple-canvas-parchment border border-apple-divider-soft rounded-apple-sm p-4 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-bold text-apple-ink">Chọn Khách Hàng</label>
              <button
                type="button"
                className="inline-flex items-center px-2.5 py-1 bg-apple-primary/10 hover:bg-apple-primary/20 text-apple-primary text-[11px] font-semibold rounded active-scale transition-all"
                onClick={() => setShowQuickGuest(!showQuickGuest)}
              >
                {showQuickGuest ? 'Chọn Khách Có Sẵn' : 'Thêm Mới Khách'}
              </button>
            </div>

            {!showQuickGuest ? (
              <div className="space-y-3">
                <input
                  type="text"
                  className="w-full bg-apple-canvas text-apple-ink text-[14px] hairline-border rounded-apple-sm px-3 py-2 focus:outline-none focus:border-apple-primary transition-all"
                  placeholder="🔍 Tìm tên hoặc SĐT..."
                  value={guestSearch}
                  onChange={(e) => setGuestSearch(e.target.value)}
                />
                <select
                  className="w-full bg-apple-canvas text-apple-ink text-[14px] hairline-border rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary transition-all"
                  required
                  value={selectedGuestId}
                  onChange={(e) => setSelectedGuestId(e.target.value)}
                >
                  {filteredAllGuests.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.firstName} {g.lastName} - {g.phone || 'Không có SĐT'} ({g.identityNum || 'Không có CMND'})
                    </option>
                  ))}
                  {!filteredAllGuests.length && <option value="">-- Không tìm thấy khách --</option>}
                </select>
              </div>
            ) : (
              <div className="bg-apple-canvas p-4 rounded border border-apple-divider-soft space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-apple-ink-muted-80">Họ *</label>
                    <input
                      className="w-full bg-apple-canvas-parchment text-apple-ink text-[14px] hairline-border rounded-apple-sm px-3 py-1.5 focus:outline-none focus:border-apple-primary transition-all"
                      required
                      value={guestForm.firstName}
                      onChange={(e) => setGuestForm({ ...guestForm, firstName: e.target.value })}
                      placeholder="Nguyễn"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-apple-ink-muted-80">Tên *</label>
                    <input
                      className="w-full bg-apple-canvas-parchment text-apple-ink text-[14px] hairline-border rounded-apple-sm px-3 py-1.5 focus:outline-none focus:border-apple-primary transition-all"
                      required
                      value={guestForm.lastName}
                      onChange={(e) => setGuestForm({ ...guestForm, lastName: e.target.value })}
                      placeholder="Văn A"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-apple-ink-muted-80">Điện Thoại *</label>
                    <input
                      className="w-full bg-apple-canvas-parchment text-apple-ink text-[14px] hairline-border rounded-apple-sm px-3 py-1.5 focus:outline-none focus:border-apple-primary transition-all"
                      required
                      value={guestForm.phone}
                      onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                      placeholder="0912345678"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-apple-ink-muted-80">CMND/CCCD *</label>
                    <input
                      className="w-full bg-apple-canvas-parchment text-apple-ink text-[14px] hairline-border rounded-apple-sm px-3 py-1.5 focus:outline-none focus:border-apple-primary transition-all"
                      required
                      value={guestForm.identityNum}
                      onChange={(e) => setGuestForm({ ...guestForm, identityNum: e.target.value })}
                      placeholder="12 chữ số"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="pearl-capsule" type="button" onClick={() => setShowQuickGuest(false)} className="py-1 px-3 text-xs">
                    Hủy
                  </Button>
                  <Button variant="primary" type="button" onClick={handleQuickGuestSubmit} className="py-1 px-3 text-xs">
                    💾 Lưu Khách
                  </Button>
                </div>
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* Modal: Add Service to Room */}
      <Modal
        open={showAddServiceModal}
        onClose={() => setShowAddServiceModal(false)}
        title="Thêm Dịch Vụ Vào Phòng"
        footer={
          <>
            <Button variant="pearl-capsule" onClick={() => setShowAddServiceModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" form="addServiceFormElement">
              💾 Thêm Dịch Vụ
            </Button>
          </>
        }
      >
        <form id="addServiceFormElement" onSubmit={handleAddServiceSubmit} className="space-y-4 text-left">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-apple-ink-muted-80">Chọn Dịch Vụ *</label>
            <select
              className="w-full bg-apple-canvas-parchment text-apple-ink text-[14px] hairline-border rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary transition-all"
              value={selectedServiceName}
              onChange={(e) => setSelectedServiceName(e.target.value)}
              required
            >
              {servicesList
                .filter((s) => s.status === 'ACTIVE')
                .map((s) => (
                  <option key={s.id} value={s.serviceName}>
                    {s.serviceName} - {formatVND(s.price)}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-apple-ink-muted-80">Số Lượng *</label>
            <input
              type="number"
              min="1"
              max="100"
              className="w-full bg-apple-canvas-parchment text-apple-ink text-[14px] hairline-border rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary transition-all"
              required
              value={serviceQty}
              onChange={(e) => setServiceQty(Number(e.target.value))}
            />
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
