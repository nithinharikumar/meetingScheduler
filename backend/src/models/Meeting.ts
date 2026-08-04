import { Schema, model } from 'mongoose';
import { IMeetingDocument } from '../interfaces/meeting.interface';

const MeetingSchema = new Schema<IMeetingDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['CONFIRMED', 'CANCELLED'],
      default: 'CONFIRMED',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance and query optimization
MeetingSchema.index({ room: 1, startTime: 1, endTime: 1 });
MeetingSchema.index({ startTime: 1, status: 1 });
MeetingSchema.index({ status: 1, startTime: 1, endTime: 1 });

export const MeetingModel = model<IMeetingDocument>('Meeting', MeetingSchema);
