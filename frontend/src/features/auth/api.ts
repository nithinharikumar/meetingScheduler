import { axiosClient } from '../../shared/api/axiosClient';
import type { User } from '../../shared/hooks/useAuthStore';

export const loginUser = async (credentials: any): Promise<User> => {
  const response = await axiosClient.post<{ success: boolean; data: User }>('/auth/login', credentials);
  return (response as any).data;
};

export const registerUser = async (userData: any): Promise<User> => {
  const response = await axiosClient.post<{ success: boolean; data: User }>('/auth/register', userData);
  return (response as any).data;
};
