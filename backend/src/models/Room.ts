import { Schema, model } from 'mongoose';
import { IRoomDocument } from '../interfaces/room.interface';

const RoomSchema = new Schema<IRoomDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    capacity: {
      type: Number,
      default: 10,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add index on name for fast lookups
RoomSchema.index({ name: 1 });

export const RoomModel = model<IRoomDocument>('Room', RoomSchema);
