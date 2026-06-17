import axiosClient from './axiosClient';

// GET /api/emps           - getAll
// GET /api/emps/{id}
// POST /api/emps
// PUT /api/emps/{id}
// DELETE /api/emps/{id}

const userApi = {
  getAllEmps: () => axiosClient.get('/api/emps'),
  getEmpById: (id) => axiosClient.get(`/api/emps/${id}`),
  createEmp: (data) => axiosClient.post('/api/emps', data),
  updateEmp: (id, data) => axiosClient.put(`/api/emps/${id}`, data),
  deleteEmp: (id) => axiosClient.delete(`/api/emps/${id}`),
};

export default userApi;
