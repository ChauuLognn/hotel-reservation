import axiosClient from './axiosClient';

const authApi = {
  login: (data) => axiosClient.post('/api/auth/login', data),
  logout: () => axiosClient.post('/api/auth/logout'),
  register: (data) => axiosClient.post('/api/auth/register', data),
  changePassword: (data) => axiosClient.post('/api/auth/change-password', data),
  forgotPassword: (data) => axiosClient.post('/api/auth/reset-password', data),
};

export default authApi;
