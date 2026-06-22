import axiosClient from './axiosClient';

// GET  /api/services          - getAll (returns List<Service>)
// POST /api/services          - create
// GET  /api/services/{name}   - getByName (uses name not id!)
// PUT  /api/services/{name}   - update by name
// DELETE /api/services/{name} - delete by name

const serviceApi = {
  getAll: () => axiosClient.get('/api/services'),
  getByName: (name) => axiosClient.get(`/api/services/${encodeURIComponent(name)}`),
  create: (data) => axiosClient.post('/api/services', data),
  update: (name, data) => axiosClient.put(`/api/services/${encodeURIComponent(name)}`, data),
  delete: (name) => axiosClient.delete(`/api/services/${encodeURIComponent(name)}`),
};

export default serviceApi;
