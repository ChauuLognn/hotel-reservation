import { useState, useEffect } from 'react';
import reservationApi from '@features/reservations/reservationApi';
import guestApi from '@features/guests/guestApi';
import roomApi from '@features/rooms/roomApi';
import serviceApi from '@features/services/serviceApi';
import billApi from '@features/billing/billApi';
import { useToast } from '@context/ToastContext';
import { useConfirm } from '@context/ConfirmContext';

export interface GuestItem {
  guestId: number;
  guestName: string;
  identityNum?: string;
  checkInAt?: string;
  checkOutAt?: string;
}

export interface ServiceItem {
  id: number;
  service: string;
  quantity: number;
  totalAmount: number;
  usedAt: string;
}

export interface BookingRoom {
  id: number;
  roomId: number;
  totalPrice: number;
  guests?: GuestItem[];
  services?: ServiceItem[];
}

export interface StatusHistoryItem {
  newStatus: string;
  updatedAt: string;
  reason?: string;
  roomId?: number;
}

export interface BookingBillItem {
  reason: 'ROOM_CHARGE' | 'SERVICE' | 'REFUND' | string;
  status: 'PAID' | 'UNPAID' | string;
  totalAmount: number;
}

export interface BookingResRoomBill {
  resRoomId: number;
  roomId: number;
  total: number;
  roomBills: BookingBillItem[];
}

export interface BookingBill {
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

export interface FullBookingDetail {
  resId: string;
  guestName?: string;
  checkIn: string;
  checkOut: string;
  note?: string;
  status: string;
  overallRoomStatus?: string;
  rooms?: BookingRoom[];
}

export interface ServiceInfo {
  id: number;
  name: string;
  price: number;
  status?: string;
  serviceName: string;
}

export function useBookingDetail(resId: string | undefined) {
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

  const [roomDetailsMap, setRoomDetailsMap] = useState<Record<number, GuestItem[]>>({});
  const [roomServicesMap, setRoomServicesMap] = useState<Record<number, ServiceItem[]>>({});
  const [loadingRoomData, setLoadingRoomData] = useState<Record<number, boolean>>({});

  async function fetchAll(signal?: AbortSignal) {
    if (!resId) return;
    setLoading(true);
    try {
      const [fullDetailRes, histRes, billRes, svcRes] = await Promise.all([
        reservationApi.getFullDetail(resId, signal),
        reservationApi.getStatusHistory(resId, signal),
        billApi.getByResId(resId, signal).catch(() => ({ data: null })),
        serviceApi.getAll(signal),
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

      // Fetch rooms list asynchronously
      roomApi
        .getAll(signal)
        .then((roomsRes: any) => {
          setRoomsList(Array.isArray(roomsRes.data) ? roomsRes.data : []);
        })
        .catch((err: any) => {
          if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
            console.error('Error loading rooms list:', err);
          }
        });

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
    } catch (e: any) {
      if (e.name === 'CanceledError' || e.name === 'AbortError') return;
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

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
    const label = newStatus === 'CANCELLED' ? 'HỦY' : 'XÁC NHẬN';
    const isConfirmed = await confirm({
      title: 'Đổi Trạng Thái',
      message: `Bạn có chắc chắn muốn đổi trạng thái đặt phòng thành "${label}"?`,
    });
    if (!isConfirmed) return;
    setChangingStatus(true);
    try {
      await reservationApi.updateStatus(resId, { newStatus: newStatus });
      showToast('Đổi trạng thái thành công!', 'success');
      await fetchAll();
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
      await fetchAll();
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
      await fetchAll();
    } catch (err: any) {
      showToast('Lỗi: ' + (err?.response?.data?.message || err.message), 'error');
    }
  }

  async function fetchAllGuests() {
    if (allGuests.length > 0) return;
    try {
      const guestsRes = await guestApi.getAll();
      setAllGuests(Array.isArray(guestsRes.data) ? guestsRes.data : []);
    } catch (err) {
      console.error('Lỗi tải danh sách khách hàng:', err);
    }
  }

  async function handleAddGuest(resRoomId: number, guestId: number) {
    try {
      await reservationApi.registerGuest(String(resRoomId), guestId);
      showToast('Đăng ký khách thành công!', 'success');
      await reloadRoomData(resRoomId);
    } catch (err: any) {
      showToast('Lỗi đăng ký khách: ' + (err?.response?.data?.message || err.message), 'error');
      throw err;
    }
  }

  async function handleQuickGuest(guestForm: any) {
    try {
      const res = await guestApi.create(guestForm);
      const newGuest = res.data;
      showToast(`Đã thêm khách hàng: ${newGuest.firstName} ${newGuest.lastName}`, 'success');
      const gList = await guestApi.getAll();
      setAllGuests(Array.isArray(gList.data) ? gList.data : []);
      return newGuest;
    } catch (err: any) {
      showToast('Lỗi thêm khách: ' + (err?.response?.data?.message || err.message), 'error');
      throw err;
    }
  }

  async function handleCheckIn(resRoomId: number, guestId: number, name: string) {
    const isConfirmed = await confirm({
      title: 'Nhận Phòng (Check-in)',
      message: `Tiến hành check-in cho khách ${name}?`,
    });
    if (!isConfirmed) return;
    try {
      await reservationApi.checkIn(String(resRoomId), guestId, undefined);
      showToast('Check-in thành công!', 'success');
      await reloadRoomData(resRoomId);
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
      await reloadRoomData(resRoomId);
    } catch (err: any) {
      showToast('Lỗi check-out: ' + (err?.response?.data?.message || err.message), 'error');
    }
  }

  async function handleAddService(resRoomId: number, serviceName: string, quantity: number) {
    try {
      await reservationApi.addServiceToResRoom(String(resRoomId), {
        name: serviceName,
        quantity,
      });
      showToast('Thêm dịch vụ thành công!', 'success');
      await reloadRoomData(resRoomId);
    } catch (err: any) {
      showToast('Lỗi thêm dịch vụ: ' + (err?.response?.data?.message || err.message), 'error');
      throw err;
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
      await reloadRoomData(resRoomId);
    } catch (err: any) {
      showToast('Lỗi xóa dịch vụ: ' + (err?.response?.data?.message || err.message), 'error');
    }
  }

  return {
    detail,
    statusHistory,
    bill,
    roomsList,
    servicesList,
    allGuests,
    resRooms,
    loading,
    changingStatus,
    roomDetailsMap,
    roomServicesMap,
    loadingRoomData,
    fetchAll,
    reloadRoomData,
    changeStatus,
    confirmPayment,
    confirmPaymentForRoom,
    fetchAllGuests,
    handleAddGuest,
    handleQuickGuest,
    handleCheckIn,
    handleCheckOut,
    handleAddService,
    handleDeleteService,
  };
}
