import axiosClient from '@services/axiosClient';

const guestApi = {
  getAll: () => axiosClient.get('/api/guests'),
  getById: (id: number | string) => axiosClient.get(`/api/guests/${id}`),
  create: (data: any) => axiosClient.post('/api/guests', data),
  update: (id: number | string, data: any) => axiosClient.put(`/api/guests/${id}`, data),
  delete: (id: number | string) => axiosClient.delete(`/api/guests/${id}`),
  getStays: (guestId: number | string) => axiosClient.get(`/api/guests/${guestId}/stays`),
  getMe: () => axiosClient.get('/api/guests/me'),
  updateMe: (data: any) => axiosClient.put('/api/guests/me', data),
};

export default guestApi;
