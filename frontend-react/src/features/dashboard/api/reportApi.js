import axiosClient from './axiosClient';

const reportApi = {
  getRevenue: (from, to) => axiosClient.get(`/api/reports/revenue?from=${from}&to=${to}`),
  getRoomUsage: (from, to) => axiosClient.get(`/api/reports/rooms?from=${from}&to=${to}`),
  getServiceUsage: (from, to) => axiosClient.get(`/api/reports/services?from=${from}&to=${to}`),
};

export default reportApi;
