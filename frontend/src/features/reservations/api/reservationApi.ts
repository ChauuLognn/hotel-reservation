import axiosClient from '@shared/api/axiosClient';

const reservationApi = {
  getAll: (signal?: AbortSignal) => axiosClient.get<any[]>('/api/reservations/all', { signal }),
  getById: (resId: string, signal?: AbortSignal) => axiosClient.get<any>('/api/reservations', { params: { resId }, signal }),
  getByGuestId: (guestId: number | string, signal?: AbortSignal) => axiosClient.get<any[]>(`/api/reservations/guests/${guestId}`, { signal }),
  getLatestByGuest: (guestId: number | string, signal?: AbortSignal) => axiosClient.get<any>(`/api/reservations/guests/${guestId}/latestRes`, { signal }),
  getRoomsByResId: (resId: string, signal?: AbortSignal) => axiosClient.get<any[]>(`/api/reservations/${resId}`, { signal }),
  getDetail: (resId: string, signal?: AbortSignal) => axiosClient.get<any>(`/api/reservations/${resId}/detail`, { signal }),
  getFullDetail: (resId: string, signal?: AbortSignal) => axiosClient.get<any>(`/api/reservations/${resId}/full-detail`, { signal }),
  getMyBookings: (signal?: AbortSignal) => axiosClient.get<any[]>('/api/reservations/my-bookings', { signal }),
  create: (data: any) => axiosClient.post<any>('/api/reservations', data),

  // Reservation Guests
  getGuestsByResRoom: (resRoomId: string, signal?: AbortSignal) => axiosClient.get<any[]>(`/api/reservation-guests/reservation-room/${resRoomId}`, { signal }),
  registerGuest: (resRoomId: string, guestId: number | string) =>
    axiosClient.post<any>('/api/reservation-guests/register', null, { params: { resRoomId, guestId } }),
  checkIn: (resRoomId: string, guestId: number | string, checkInAt?: string) =>
    axiosClient.post<any>(`/api/reservation-guests/rooms/${resRoomId}/guests/${guestId}/check-in`, checkInAt),
  checkOut: (resRoomId: string, guestId: number | string, checkOutAt?: string) =>
    axiosClient.post<any>(`/api/reservation-guests/rooms/${resRoomId}/guests/${guestId}/check-out`, checkOutAt),

  // Status History
  getStatusHistory: (resId: string, signal?: AbortSignal) => axiosClient.get<any[]>(`/api/reservationStatus/${resId}`, { signal }),
  getStatusHistoryByResRoom: (resId: string, resRoomId: string, signal?: AbortSignal) =>
    axiosClient.get<any[]>(`/api/reservationStatus/${resId}/resRooms/${resRoomId}`, { signal }),
  updateStatus: (resId: string, data: { newStatus: string; reason?: string }) =>
    axiosClient.post<any>(`/api/reservationStatus/${resId}/status`, data),

  // Room Services
  getServicesOfResRoom: (resRoomId: string, signal?: AbortSignal) => axiosClient.get<any[]>(`/api/reservation-rooms/${resRoomId}/services`, { signal }),
  addServiceToResRoom: (resRoomId: string, data: any) =>
    axiosClient.post<any>(`/api/reservation-rooms/${resRoomId}/services`, data),
  deleteServiceFromResRoom: (resRoomId: string, serId: number | string) =>
    axiosClient.delete<any>(`/api/reservation-rooms/${resRoomId}/services/${serId}`),
};

export default reservationApi;
