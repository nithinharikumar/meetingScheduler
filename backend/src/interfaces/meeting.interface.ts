import { Document, Types } from 'mongoose';

export interface IMeeting {
  title: string;
  room: Types.ObjectId | string;
  startTime: Date;
  endTime: Date;
  status: 'CONFIRMED' | 'CANCELLED';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMeetingDocument extends IMeeting, Document {}
