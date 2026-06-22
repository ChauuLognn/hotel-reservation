import axiosClient from '@shared/api/axiosClient';

const authApi = {
  login: (data: any) => axiosClient.post('/api/auth/login', data),
  logout: () => axiosClient.post('/api/auth/logout'),
  register: (data: any) => axiosClient.post('/api/auth/register', data),
  changePassword: (data: any) => axiosClient.post('/api/auth/change-password', data),
  forgotPassword: (data: any) => axiosClient.post('/api/auth/reset-password', data),
};

export default authApi;
