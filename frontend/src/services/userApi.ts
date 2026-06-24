import axiosClient from '@services/axiosClient';

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  identityNum: string;
  email: string;
  phone: string;
  address?: string;
  role: { id: number; name: string } | string;
}

export interface UserAccount {
  id: number;
  account: string;
  emp: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    identityNum: string;
    address?: string;
    role: { id: number; name: string } | string;
  };
}

const userApi = {
  getAllEmps: (signal?: AbortSignal) => axiosClient.get<Employee[]>('/api/emps', { signal }),
  getEmpById: (id: string | number, signal?: AbortSignal) => axiosClient.get<Employee>(`/api/emps/${id}`, { signal }),
  createEmp: (data: any) => axiosClient.post<Employee>('/api/emps', data),
  updateEmp: (id: string | number, data: any) => axiosClient.put<Employee>(`/api/emps/${id}`, data),
  deleteEmp: (id: string | number) => axiosClient.delete<string>(`/api/emps/${id}`),

  // Admin User Credentials Management
  getAllUsers: (signal?: AbortSignal) => axiosClient.get<UserAccount[]>('/api/admin/users', { signal }),
  getUserById: (id: string | number, signal?: AbortSignal) => axiosClient.get<UserAccount>(`/api/admin/users/${id}`, { signal }),
  createUser: (data: any) => axiosClient.post<UserAccount>('/api/admin/users', data),
  updateUser: (id: string | number, data: any) => axiosClient.put<UserAccount>(`/api/admin/users/${id}`, data),
  deleteUser: (id: string | number) => axiosClient.delete<any>(`/api/admin/users/${id}`),
  resetUserPassword: (id: string | number, newPassword: string) =>
    axiosClient.put<any>(`/api/admin/users/${id}/reset-password`, { newPassword }),
};

export default userApi;
