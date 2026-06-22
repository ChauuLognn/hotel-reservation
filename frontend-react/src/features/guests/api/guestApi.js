import axiosClient from './axiosClient';

// GET /api/guests  - getAll
// GET /api/guests/{id}
// POST /api/guests
// PUT /api/guests/{id}
// DELETE /api/guests/{id}
// GET /api/guests/{guestId}/stays

const guestApi = {
  getAll: () => axiosClient.get('/api/guests'),
  getById: (id) => axiosClient.get(`/api/guests/${id}`),
  create: (data) => axiosClient.post('/api/guests', data),
  update: (id, data) => axiosClient.put(`/api/guests/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/guests/${id}`),
  getStays: (guestId) => axiosClient.get(`/api/guests/${guestId}/stays`),
};

export default guestApi;
