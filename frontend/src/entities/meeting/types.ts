import type { Room } from '../room/types';

export interface Meeting {
  _id: string;
  title: string;
  room: Room;
  startTime: string;
  endTime: string;
  status: 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface BookMeetingDTO {
  title: string;
  startTime: string;
  endTime: string;
}

export interface MeetingStats {
  totalMeetingsToday: number;
  occupancyRateToday: number;
  mostUsedRoom: string;
  averageDuration: number;
}
