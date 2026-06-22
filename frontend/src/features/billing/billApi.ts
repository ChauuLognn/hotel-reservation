import axiosClient from '@shared/api/axiosClient';

export interface BillItem {
  id: number;
  resRoomId: number;
  reason: string;
  totalAmount: number;
  status: string;
}

export interface BillSummary {
  reservationId: string;
  guestName: string;
  total: number;
  totalPaid: number;
  totalDue: number;
}

const billApi = {
  getByResId: (resId: string, signal?: AbortSignal) => axiosClient.get<any>(`/api/reservations/${resId}/bills`, { signal }),
  confirmPaidForRes: (resId: string) => axiosClient.post<any>(`/api/reservations/${resId}/bills`),
  getByResRoomId: (resId: string, resRoomId: string, signal?: AbortSignal) =>
    axiosClient.get<any>(`/api/reservations/${resId}/bills/reservation-rooms/${resRoomId}`, { signal }),
  confirmPaidForResRoom: (resId: string, resRoomId: string) =>
    axiosClient.post<any>(`/api/reservations/${resId}/bills/reservation-rooms/${resRoomId}`),
  getSummaries: (signal?: AbortSignal) => axiosClient.get<BillSummary[]>('/api/bills/summaries', { signal }),
};

export default billApi;
