import axiosClient from '@shared/api/axiosClient';

const userApi = {
  getAllEmps: () => axiosClient.get('/api/emps'),
  getEmpById: (id: string | number) => axiosClient.get(`/api/emps/${id}`),
  createEmp: (data: any) => axiosClient.post('/api/emps', data),
  updateEmp: (id: string | number, data: any) => axiosClient.put(`/api/emps/${id}`, data),
  deleteEmp: (id: string | number) => axiosClient.delete(`/api/emps/${id}`),

  // Admin User Credentials Management
  getAllUsers: () => axiosClient.get('/api/admin/users'),
  getUserById: (id: string | number) => axiosClient.get(`/api/admin/users/${id}`),
  createUser: (data: any) => axiosClient.post('/api/admin/users', data),
  updateUser: (id: string | number, data: any) => axiosClient.put(`/api/admin/users/${id}`, data),
  deleteUser: (id: string | number) => axiosClient.delete(`/api/admin/users/${id}`),
  resetUserPassword: (id: string | number, newPassword: string) =>
    axiosClient.put(`/api/admin/users/${id}/reset-password`, { newPassword }),
};

export default userApi;
