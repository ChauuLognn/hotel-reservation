import axiosClient from './axiosClient';

// GET /api/rooms            - getAll
// GET /api/rooms/{id}
// POST /api/rooms
// PUT /api/rooms/{id}
// DELETE /api/rooms/{id}
// GET /api/rooms/available?name=&checkIn=&checkOut=
// GET /api/rooms/roomTypes
// POST /api/rooms/roomTypes
// GET /api/rooms/roomTypes/{name}
// PUT /api/rooms/roomTypes/{name}
// DELETE /api/rooms/roomTypes/{name}

const roomApi = {
  getAll: () => axiosClient.get('/api/rooms'),
  getById: (id) => axiosClient.get(`/api/rooms/${id}`),
  create: (data) => axiosClient.post('/api/rooms', data),
  update: (id, data) => axiosClient.put(`/api/rooms/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/rooms/${id}`),
  findAvailable: (params) => axiosClient.get('/api/rooms/available', { params }),

  // Room Types - by name (not by id!)
  getAllTypes: () => axiosClient.get('/api/rooms/roomTypes'),
  getTypeByName: (name) => axiosClient.get(`/api/rooms/roomTypes/${name}`),
  createType: (data) => axiosClient.post('/api/rooms/roomTypes', data),
  updateType: (name, data) => axiosClient.put(`/api/rooms/roomTypes/${name}`, data),
  deleteType: (name) => axiosClient.delete(`/api/rooms/roomTypes/${name}`),
};

export default roomApi;
