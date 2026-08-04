import { axiosClient } from '../../shared/api/axiosClient';
import type { Room } from './types';

export const fetchRooms = async (): Promise<Room[]> => {
  const response = await axiosClient.get<{ success: boolean; data: Room[] }>('/rooms');
  // Axios response interceptor returned the data payload
  return (response as any).data;
};

export const createRoom = async (data: { name: string; capacity: number; description?: string }): Promise<Room> => {
  const response = await axiosClient.post<{ success: boolean; data: Room }>('/rooms', data);
  return (response as any).data;
};

export const updateRoom = async (id: string, data: { name?: string; capacity?: number; description?: string }): Promise<Room> => {
  const response = await axiosClient.put<{ success: boolean; data: Room }>(`/rooms/${id}`, data);
  return (response as any).data;
};

export const deleteRoom = async (id: string): Promise<void> => {
  await axiosClient.delete(`/rooms/${id}`);
};
