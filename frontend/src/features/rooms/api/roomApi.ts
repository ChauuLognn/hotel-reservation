import axiosClient from '@shared/api/axiosClient';

interface AvailableRoomsParams {
  name?: string;
  checkIn: string;
  checkOut: string;
}

const roomApi = {
  getAll: () => axiosClient.get('/api/rooms'),
  getById: (id: number | string) => axiosClient.get(`/api/rooms/${id}`),
  create: (data: any) => axiosClient.post('/api/rooms', data),
  update: (id: number | string, data: any) => axiosClient.put(`/api/rooms/${id}`, data),
  delete: (id: number | string) => axiosClient.delete(`/api/rooms/${id}`),
  findAvailable: (params: AvailableRoomsParams) => axiosClient.get('/api/rooms/available', { params }),

  // Room Types
  getAllTypes: () => axiosClient.get('/api/rooms/roomTypes'),
  getTypeByName: (name: string) => axiosClient.get(`/api/rooms/roomTypes/${name}`),
  createType: (data: any) => axiosClient.post('/api/rooms/roomTypes', data),
  updateType: (name: string, data: any) => axiosClient.put(`/api/rooms/roomTypes/${name}`, data),
  deleteType: (name: string) => axiosClient.delete(`/api/rooms/roomTypes/${name}`),
};

export default roomApi;
