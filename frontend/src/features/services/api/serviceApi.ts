import axiosClient from '@shared/api/axiosClient';

const serviceApi = {
  getAll: () => axiosClient.get('/api/services'),
  getByName: (name: string) => axiosClient.get(`/api/services/${encodeURIComponent(name)}`),
  create: (data: any) => axiosClient.post('/api/services', data),
  update: (name: string, data: any) => axiosClient.put(`/api/services/${encodeURIComponent(name)}`, data),
  delete: (name: string) => axiosClient.delete(`/api/services/${encodeURIComponent(name)}`),
};

export default serviceApi;
