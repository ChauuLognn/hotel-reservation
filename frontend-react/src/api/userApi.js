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

  // Admin User Credentials Management
  getAllUsers: () => axiosClient.get('/api/admin/users'),
  getUserById: (id) => axiosClient.get(`/api/admin/users/${id}`),
  createUser: (data) => axiosClient.post('/api/admin/users', data),
  updateUser: (id, data) => axiosClient.put(`/api/admin/users/${id}`, data),
  deleteUser: (id) => axiosClient.delete(`/api/admin/users/${id}`),
  resetUserPassword: (id, newPassword) => axiosClient.put(`/api/admin/users/${id}/reset-password`, { newPassword }),
};

export default userApi;
