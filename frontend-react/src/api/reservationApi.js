import axiosClient from './axiosClient';

// GET  /api/reservations/all                         - getAll
// GET  /api/reservations?resId={resId}               - getById (query param)
// POST /api/reservations                             - create (from hold)
// GET  /api/reservations/guests/{guestId}            - getByGuestId
// GET  /api/reservations/guests/{guestId}/latestRes  - getLatestByGuest
// GET  /api/reservations/{resId}                     - getRoomsByResId
// GET  /api/reservations/{resId}/detail              - getDetail

// Reservation Guests
// GET  /api/reservation-guests/reservation-room/{resRoomId}
// POST /api/reservation-guests/register?resRoomId=&guestId=
// POST /api/reservation-guests/resRoomId={resRoomId}-guestId={guestId}/checkIn
// POST /api/reservation-guests/resRoomId={resRoomId}-guestId={guestId}/checkOut

// Status History
// GET  /api/reservationStatus/{resId}
// GET  /api/reservationStatus/{resId}/resRooms/{resRoomId}
// POST /api/reservationStatus/{resId}/status

const reservationApi = {
  getAll: () => axiosClient.get('/api/reservations/all'),
  getById: (resId) => axiosClient.get('/api/reservations', { params: { resId } }),
  getByGuestId: (guestId) => axiosClient.get(`/api/reservations/guests/${guestId}`),
  getLatestByGuest: (guestId) => axiosClient.get(`/api/reservations/guests/${guestId}/latestRes`),
  getRoomsByResId: (resId) => axiosClient.get(`/api/reservations/${resId}`),
  getDetail: (resId) => axiosClient.get(`/api/reservations/${resId}/detail`),
  create: (data) => axiosClient.post('/api/reservations', data),

  // Reservation Guests
  getGuestsByResRoom: (resRoomId) => axiosClient.get(`/api/reservation-guests/reservation-room/${resRoomId}`),
  registerGuest: (resRoomId, guestId) => axiosClient.post('/api/reservation-guests/register', null, { params: { resRoomId, guestId } }),
  checkIn: (resRoomId, guestId, checkInAt) => axiosClient.post(`/api/reservation-guests/resRoomId=${resRoomId}-guestId=${guestId}/checkIn`, checkInAt),
  checkOut: (resRoomId, guestId, checkOutAt) => axiosClient.post(`/api/reservation-guests/resRoomId=${resRoomId}-guestId=${guestId}/checkOut`, checkOutAt),

  // Status History
  getStatusHistory: (resId) => axiosClient.get(`/api/reservationStatus/${resId}`),
  getStatusHistoryByResRoom: (resId, resRoomId) => axiosClient.get(`/api/reservationStatus/${resId}/resRooms/${resRoomId}`),
  updateStatus: (resId, data) => axiosClient.post(`/api/reservationStatus/${resId}/status`, data),

  // Room Services
  getServicesOfResRoom: (resRoomId) => axiosClient.get(`/api/reservation-rooms/${resRoomId}/services`),
  addServiceToResRoom: (resRoomId, data) => axiosClient.post(`/api/reservation-rooms/${resRoomId}/services`, data),
  deleteServiceFromResRoom: (resRoomId, serId) => axiosClient.delete(`/api/reservation-rooms/${resRoomId}/services/${serId}`),
};

export default reservationApi;
