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

// 1. Single index on 'room': Optimizes queries filtering meetings by a specific room
MeetingSchema.index({ room: 1 });

// 2. Single index on 'startTime': Optimizes sorting by start time and filtering by start of day range
MeetingSchema.index({ startTime: 1 });

// 3. Single index on 'endTime': Optimizes range queries looking for meetings ending after a specific time
MeetingSchema.index({ endTime: 1 });

// 4. Compound index on 'room' + 'startTime' + 'endTime': Critical for the scheduling algorithm 
// to find overlapping meetings for a specific room within a particular timeframe without scanning other rooms.
MeetingSchema.index({ room: 1, startTime: 1, endTime: 1 });

// 5. Compound index on 'startTime' + 'status': Speeds up dashboard aggregation for active/confirmed meetings today
MeetingSchema.index({ startTime: 1, status: 1 });

// 6. Compound index on 'status' + 'startTime' + 'endTime': Optimizes active meeting lookups over a range
MeetingSchema.index({ status: 1, startTime: 1, endTime: 1 });

export const MeetingModel = model<IMeetingDocument>('Meeting', MeetingSchema);

