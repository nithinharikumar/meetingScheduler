import { axiosClient } from '../../shared/api/axiosClient';
import type { Room } from './types';

export const fetchRooms = async (): Promise<Room[]> => {
  const response = await axiosClient.get<{ success: boolean; data: Room[] }>('/rooms');
  // Axios response interceptor returned the data payload
  return (response as any).data;
};
