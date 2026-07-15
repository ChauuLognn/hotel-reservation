import axiosClient from '@services/axiosClient';

export interface ServiceInfo {
  id: number;
  name: string;
  price: number;
  status: string;
}

const serviceApi = {
  getAll: (signal?: AbortSignal) => axiosClient.get<ServiceInfo[]>('/api/services', { signal }),
  getByName: (name: string, signal?: AbortSignal) => axiosClient.get<ServiceInfo>(`/api/services/${encodeURIComponent(name)}`, { signal }),
  create: (data: any) => axiosClient.post<ServiceInfo>('/api/services', data),
  update: (name: string, data: any) => axiosClient.put<ServiceInfo>(`/api/services/${encodeURIComponent(name)}`, data),
  delete: (name: string) => axiosClient.delete<string>(`/api/services/${encodeURIComponent(name)}`),
};

export default serviceApi;
