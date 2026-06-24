import { useState } from 'react';
import reservationApi from '@services/reservationApi';
import { useAuth } from '@contexts/AuthContext';
import { useToast } from '@contexts/ToastContext';
import { useConfirm } from '@contexts/ConfirmContext';

export interface Booking {
  resId: string;
  checkIn: string;
  checkOut: string;
  total: number;
  status: string;
}

export function useBookings() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [bookings, setBookings] = useState<Booking[]>([]);

  async function loadBookings(signal?: AbortSignal) {
    if (!user?.userId) return;
    try {
      const res = await reservationApi.getMyBookings(signal);
      setBookings(res.data || []);
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      setBookings([]);
    }
  }

  async function handleCancelBooking(resId: string) {
    const isConfirmed = await confirm({
      title: 'Hủy Đặt Phòng',
      message: 'Bạn có chắc chắn muốn hủy đặt phòng này?',
    });
    if (!isConfirmed) return;
    try {
      await reservationApi.updateStatus(resId, { newStatus: 'CANCELLED', reason: 'Khách hàng tự hủy' });
      showToast('Đã hủy đặt phòng thành công!', 'success');
      await loadBookings();
    } catch (err: any) {
      showToast('Lỗi hủy đặt phòng: ' + (err?.response?.data?.message || err.message), 'error');
    }
  }

  async function handleConfirmPayment(resId: string) {
    const isConfirmed = await confirm({
      title: 'Xác Nhận Thanh Toán',
      message: 'Xác nhận bạn đã thanh toán cho đặt phòng này?',
    });
    if (!isConfirmed) return;
    try {
      await reservationApi.updateStatus(resId, { newStatus: 'CONFIRMED', reason: 'Khách hàng xác nhận thanh toán' });
      showToast('Xác nhận thanh toán thành công!', 'success');
      await loadBookings();
    } catch (err: any) {
      showToast('Lỗi xác nhận thanh toán: ' + (err?.response?.data?.message || err.message), 'error');
    }
  }

  return {
    bookings,
    loadBookings,
    handleCancelBooking,
    handleConfirmPayment,
  };
}
