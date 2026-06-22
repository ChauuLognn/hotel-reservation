import axiosClient from '@shared/api/axiosClient';

const reportApi = {
  getRevenue: (from: string, to: string) => axiosClient.get(`/api/reports/revenue?from=${from}&to=${to}`),
  getRoomUsage: (from: string, to: string) => axiosClient.get(`/api/reports/rooms?from=${from}&to=${to}`),
  getServiceUsage: (from: string, to: string) => axiosClient.get(`/api/reports/services?from=${from}&to=${to}`),
};

export default reportApi;
