import axiosClient from '@shared/api/axiosClient';

const reservationApi = {
  getAll: () => axiosClient.get('/api/reservations/all'),
  getById: (resId: string) => axiosClient.get('/api/reservations', { params: { resId } }),
  getByGuestId: (guestId: number | string) => axiosClient.get(`/api/reservations/guests/${guestId}`),
  getLatestByGuest: (guestId: number | string) => axiosClient.get(`/api/reservations/guests/${guestId}/latestRes`),
  getRoomsByResId: (resId: string) => axiosClient.get(`/api/reservations/${resId}`),
  getDetail: (resId: string) => axiosClient.get(`/api/reservations/${resId}/detail`),
  getFullDetail: (resId: string) => axiosClient.get(`/api/reservations/${resId}/full-detail`),
  getMyBookings: () => axiosClient.get('/api/reservations/my-bookings'),
  create: (data: any) => axiosClient.post('/api/reservations', data),

  // Reservation Guests
  getGuestsByResRoom: (resRoomId: string) => axiosClient.get(`/api/reservation-guests/reservation-room/${resRoomId}`),
  registerGuest: (resRoomId: string, guestId: number | string) =>
    axiosClient.post('/api/reservation-guests/register', null, { params: { resRoomId, guestId } }),
  checkIn: (resRoomId: string, guestId: number | string, checkInAt?: string) =>
    axiosClient.post(`/api/reservation-guests/rooms/${resRoomId}/guests/${guestId}/check-in`, checkInAt),
  checkOut: (resRoomId: string, guestId: number | string, checkOutAt?: string) =>
    axiosClient.post(`/api/reservation-guests/rooms/${resRoomId}/guests/${guestId}/check-out`, checkOutAt),

  // Status History
  getStatusHistory: (resId: string) => axiosClient.get(`/api/reservationStatus/${resId}`),
  getStatusHistoryByResRoom: (resId: string, resRoomId: string) =>
    axiosClient.get(`/api/reservationStatus/${resId}/resRooms/${resRoomId}`),
  updateStatus: (resId: string, data: any) => axiosClient.post(`/api/reservationStatus/${resId}/status`, data),

  // Room Services
  getServicesOfResRoom: (resRoomId: string) => axiosClient.get(`/api/reservation-rooms/${resRoomId}/services`),
  addServiceToResRoom: (resRoomId: string, data: any) =>
    axiosClient.post(`/api/reservation-rooms/${resRoomId}/services`, data),
  deleteServiceFromResRoom: (resRoomId: string, serId: number | string) =>
    axiosClient.delete(`/api/reservation-rooms/${resRoomId}/services/${serId}`),
};

export default reservationApi;
