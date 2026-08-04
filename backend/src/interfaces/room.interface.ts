import { Document } from 'mongoose';

export interface IRoom {
  name: string;
  capacity?: number;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRoomDocument extends IRoom, Document {}
