import axiosClient from '@services/axiosClient';

export interface AvailableRoomsParams {
  name?: string;
  checkIn: string;
  checkOut: string;
}

export interface Room {
  id: number;
  typeName: string;
  status: string;
}

export interface RoomType {
  name: string;
  capacity: number;
  basePrice: number;
  description: string;
}

export interface AvailableRoom {
  roomId: number;
  name: string;
  capacity: number;
  basePrice: number;
}

const roomApi = {
  getAll: (signal?: AbortSignal) => axiosClient.get<Room[]>('/api/rooms', { signal }),
  getById: (id: number | string, signal?: AbortSignal) => axiosClient.get<Room>(`/api/rooms/${id}`, { signal }),
  create: (data: Partial<Room>) => axiosClient.post<Room>('/api/rooms', data),
  update: (id: number | string, data: Partial<Room>) => axiosClient.put<Room>(`/api/rooms/${id}`, data),
  delete: (id: number | string) => axiosClient.delete<string>(`/api/rooms/${id}`),
  findAvailable: (params: AvailableRoomsParams, signal?: AbortSignal) =>
    axiosClient.get<AvailableRoom[]>('/api/rooms/available', { params, signal }),

  // Room Types
  getAllTypes: (signal?: AbortSignal) => axiosClient.get<RoomType[]>('/api/rooms/roomTypes', { signal }),
  getTypeByName: (name: string, signal?: AbortSignal) => axiosClient.get<RoomType>(`/api/rooms/roomTypes/${name}`, { signal }),
  createType: (data: RoomType) => axiosClient.post<RoomType>('/api/rooms/roomTypes', data),
  updateType: (name: string, data: RoomType) => axiosClient.put<RoomType>(`/api/rooms/roomTypes/${name}`, data),
  deleteType: (name: string) => axiosClient.delete<string>(`/api/rooms/roomTypes/${name}`),
};

export default roomApi;
