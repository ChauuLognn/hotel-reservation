import axiosClient from './axiosClient';

// Bill endpoints are nested under /api/reservations/{resId}/bills
// GET  /api/reservations/{resId}/bills
// POST /api/reservations/{resId}/bills
// GET  /api/reservations/{resId}/bills/reservation-rooms/{resRoomId}
// POST /api/reservations/{resId}/bills/reservation-rooms/{resRoomId}

const billApi = {
  getByResId: (resId) => axiosClient.get(`/api/reservations/${resId}/bills`),
  confirmPaidForRes: (resId) => axiosClient.post(`/api/reservations/${resId}/bills`),
  getByResRoomId: (resId, resRoomId) => axiosClient.get(`/api/reservations/${resId}/bills/reservation-rooms/${resRoomId}`),
  confirmPaidForResRoom: (resId, resRoomId) => axiosClient.post(`/api/reservations/${resId}/bills/reservation-rooms/${resRoomId}`),
  getSummaries: () => axiosClient.get('/api/bills/summaries'),
};

export default billApi;
