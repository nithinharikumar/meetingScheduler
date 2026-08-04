import { axiosClient } from '../../shared/api/axiosClient';
import type { User } from '../../shared/hooks/useAuthStore';

export const fetchUsers = async (): Promise<User[]> => {
  const response = await axiosClient.get<{ success: boolean; data: User[] }>('/users');
  return (response as any).data;
};

export const createUser = async (data: Omit<User, '_id' | 'token'>): Promise<User> => {
  const response = await axiosClient.post<{ success: boolean; data: User }>('/users', data);
  return (response as any).data;
};

export const updateUserRole = async (userId: string, role: string): Promise<User> => {
  const response = await axiosClient.put<{ success: boolean; data: User }>(`/users/${userId}/role`, { role });
  return (response as any).data;
};

export const deleteUser = async (userId: string): Promise<void> => {
  await axiosClient.delete(`/users/${userId}`);
};
