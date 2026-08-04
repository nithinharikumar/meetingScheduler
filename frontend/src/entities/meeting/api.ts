import { axiosClient } from '../../shared/api/axiosClient';
import type { Meeting, BookMeetingDTO, MeetingStats } from './types';

export const fetchMeetings = async (filters: { date?: string; roomId?: string } = {}): Promise<Meeting[]> => {
  const params: any = {};
  if (filters.date) {
    // Pass date as ISO string at start of that day
    const dateObj = new Date(filters.date);
    params.date = dateObj.toISOString();
  }
  if (filters.roomId) {
    params.roomId = filters.roomId;
  }

  const response = await axiosClient.get<{ success: boolean; data: Meeting[] }>('/meetings', { params });
  return (response as any).data;
};

export const bookMeeting = async (dto: BookMeetingDTO): Promise<Meeting> => {
  const response = await axiosClient.post<{ success: boolean; data: Meeting }>('/meetings', dto);
  return (response as any).data;
};

export const cancelMeeting = async (id: string): Promise<Meeting> => {
  const response = await axiosClient.patch<{ success: boolean; data: Meeting }>(`/meetings/${id}/cancel`);
  return (response as any).data;
};

export const fetchMeetingStats = async (date: string): Promise<MeetingStats> => {
  const dateObj = new Date(date);
  const params = { date: dateObj.toISOString() };
  const response = await axiosClient.get<{ success: boolean; data: MeetingStats }>('/meetings/stats', { params });
  return (response as any).data;
};
