import { useState, useEffect } from 'react';
import roomApi from '@features/rooms/roomApi';
import { getTodayString, getTomorrowString } from '@shared/utils/date';
import { useToast } from '@context/ToastContext';

export interface Room {
  id: number;
  roomNumber: number;
  floorNumber: number;
  status: string;
  roomType: {
    name: string;
    basePrice: number;
    capacity: number;
  };
}

export function useRoomSearch() {
  const { showToast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [checkIn, setCheckIn] = useState<string>(getTodayString());
  const [checkOut, setCheckOut] = useState<string>(getTomorrowString());
  const [isSearching, setIsSearching] = useState<boolean>(false);

  async function loadRooms(signal?: AbortSignal) {
    setLoading(true);
    setIsSearching(false);
    try {
      const availRes = await roomApi.findAvailable(
        { checkIn: getTodayString(), checkOut: getTomorrowString() },
        signal
      );
      const availList = availRes.data || [];

      const enriched: Room[] = availList.map((av: any) => ({
        id: av.roomId,
        roomNumber: av.roomId,
        floorNumber: Math.floor(av.roomId / 100) || 1,
        status: 'READY',
        roomType: {
          name: av.name,
          basePrice: av.basePrice,
          capacity: av.capacity,
        },
      }));
      setRooms(enriched);
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      console.error('Lỗi tải phòng:', err);
    } finally {
      setLoading(false);
    }
  }

  async function searchRooms(signal?: AbortSignal) {
    if (!checkIn || !checkOut) {
      showToast('Vui lòng chọn đầy đủ ngày nhận và trả phòng!', 'warning');
      return;
    }
    if (new Date(checkIn) >= new Date(checkOut)) {
      showToast('Ngày trả phòng phải sau ngày nhận phòng!', 'warning');
      return;
    }
    setLoading(true);
    setIsSearching(true);
    try {
      const availRes = await roomApi.findAvailable({ checkIn, checkOut }, signal);
      const availList = availRes.data || [];

      const enriched: Room[] = availList.map((av: any) => ({
        id: av.roomId,
        roomNumber: av.roomId,
        floorNumber: Math.floor(av.roomId / 100) || 1,
        status: 'READY',
        roomType: {
          name: av.name,
          basePrice: av.basePrice,
          capacity: av.capacity,
        },
      }));
      setRooms(enriched);
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      showToast('Lỗi tải phòng trống: ' + (err?.response?.data?.message || err.message), 'error');
    } finally {
      setLoading(false);
    }
  }

  return {
    rooms,
    loading,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    isSearching,
    setIsSearching,
    loadRooms,
    searchRooms,
  };
}
