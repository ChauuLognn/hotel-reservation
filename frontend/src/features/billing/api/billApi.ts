import axiosClient from '@shared/api/axiosClient';

const billApi = {
  getByResId: (resId: string) => axiosClient.get(`/api/reservations/${resId}/bills`),
  confirmPaidForRes: (resId: string) => axiosClient.post(`/api/reservations/${resId}/bills`),
  getByResRoomId: (resId: string, resRoomId: string) =>
    axiosClient.get(`/api/reservations/${resId}/bills/reservation-rooms/${resRoomId}`),
  confirmPaidForResRoom: (resId: string, resRoomId: string) =>
    axiosClient.post(`/api/reservations/${resId}/bills/reservation-rooms/${resRoomId}`),
  getSummaries: () => axiosClient.get('/api/bills/summaries'),
};

export default billApi;
