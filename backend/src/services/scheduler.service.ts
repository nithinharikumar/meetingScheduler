import mongoose from 'mongoose';
import { RoomRepository } from '../repositories/room.repository';
import { MeetingRepository } from '../repositories/meeting.repository';
import { IMeetingDocument } from '../interfaces/meeting.interface';

// Simple in-memory lock to prevent race conditions in single-instance Node applications
//it is   used    when we are checking    the room      available at teh same time
class Mutex {
  private queue: Promise<any> = Promise.resolve();

  async runExclusive<T>(callback: () => Promise<T>): Promise<T> {
    const next = this.queue.then(async () => {
      return callback();
    });
    this.queue = next.catch(() => {});
    return next;
  }
}

export class SchedulerService {
  private roomRepository: RoomRepository;
  private meetingRepository: MeetingRepository;
  private mutex: Mutex;

  constructor() {
    this.roomRepository = new RoomRepository();
    this.meetingRepository = new MeetingRepository();
    this.mutex = new Mutex();
  }

  /**
   * Automatically allocates the first available room for the given timeframe.
   * Uses a Mutex lock to prevent race conditions (double booking) under high concurrency.
   */
  async bookMeeting(title: string, startTime: Date, endTime: Date, roomId?: string): Promise<IMeetingDocument> {
    if (startTime >= endTime) {
      throw new Error('Start time must be before end time.');
    }

    // Run booking within the Mutex lock to ensure absolute concurrency safety
    return this.mutex.runExclusive(async () => {
      // Start session only if MongoDB is running as a replica set
      let session: mongoose.ClientSession | null = null;
      try {
        const client = mongoose.connection.getClient();
        const topologyType = (client as any).topology?.description?.type;
        const supportsTransactions = topologyType === 'ReplicaSetWithPrimary' || topologyType === 'Sharded';
        
        if (supportsTransactions) {
          session = await mongoose.startSession();
          session.startTransaction();
        }
      } catch (err) {
        // Fallback (e.g. if getClient fails or client has no topology info)
        session = null;
      }

      try {
        // 1. Get all busy room IDs during the requested period
        const busyRoomIds = await this.meetingRepository.findBusyRooms(
          startTime,
          endTime,
          session || undefined
        );

        let selectedRoom;

        if (roomId) {
          // Manual booking: check if room is busy
          const busyIdsStr = busyRoomIds.map((id) => id.toString());
          if (busyIdsStr.includes(roomId)) {
            throw new Error('The selected room is occupied during the requested timeframe.');
          }

          // Verify room exists
          const room = await this.roomRepository.findById(roomId);
          if (!room) {
            throw new Error('Selected room does not exist.');
          }
          selectedRoom = room;
        } else {
          // Automatic booking: Find the first available room
          const allRooms = await this.roomRepository.findAll();

          if (allRooms.length === 0) {
            throw new Error('No meeting rooms exist in the system.');
          }

          const busyIdsStr = busyRoomIds.map((id) => id.toString());
          selectedRoom = allRooms.find((room) => !busyIdsStr.includes(room._id.toString()));

          if (!selectedRoom) {
            throw new Error('No rooms are available during the requested time.');
          }
        }

        // 4. Create and save the meeting
        const meetingData = {
          title,
          room: selectedRoom._id,
          startTime,
          endTime,
          status: 'CONFIRMED' as const,
        };

        const createdMeeting = await this.meetingRepository.create(meetingData, session || undefined);

        if (session) {
          await session.commitTransaction();
          session.endSession();
        }

        // Return the meeting populated with room details
        const populated = await this.meetingRepository.findById(createdMeeting._id.toString());
        if (!populated) {
          throw new Error('Failed to retrieve newly created meeting.');
        }
        return populated;
      } catch (error) {
        if (session) {
          await session.abortTransaction();
          session.endSession();
        }
        throw error;
      }
    });
  }

  async getAllMeetings(filters: { date?: Date; roomId?: string } = {}): Promise<IMeetingDocument[]> {
    return this.meetingRepository.findAll(filters);
  }

  async cancelMeeting(id: string): Promise<IMeetingDocument> {
    const meeting = await this.meetingRepository.findById(id);
    if (!meeting) {
      throw new Error('Meeting not found.');
    }

    if (meeting.status === 'CANCELLED') {
      throw new Error('Meeting is already cancelled.');
    }

    const updated = await this.meetingRepository.updateStatus(id, 'CANCELLED');
    if (!updated) {
      throw new Error('Failed to cancel meeting.');
    }

    return updated;
  }

  async getMeetingById(id: string): Promise<IMeetingDocument | null> {
    return this.meetingRepository.findById(id);
  }

  async updateMeeting(
    id: string,
    data: { title?: string; startTime?: Date; endTime?: Date; roomId?: string }
  ): Promise<IMeetingDocument> {
    const meeting = await this.meetingRepository.findById(id);
    if (!meeting) throw new Error('Meeting not found.');
    if (meeting.status === 'CANCELLED') throw new Error('Cannot edit a cancelled meeting.');

    const startTime = data.startTime ?? new Date((meeting as any).startTime);
    const endTime = data.endTime ?? new Date((meeting as any).endTime);

    if (startTime >= endTime) {
      throw new Error('Start time must be before end time.');
    }

    // Check for overlaps if time or room changes
    const roomId = data.roomId ?? (meeting as any).room?._id?.toString() ?? (meeting as any).room?.toString();
    const overlapping = await this.meetingRepository.findOverlapping(roomId, startTime, endTime);
    if (overlapping && overlapping._id.toString() !== id) {
      throw new Error('The selected room is occupied during the requested timeframe.');
    }

    const updatePayload: any = {};
    if (data.title) updatePayload.title = data.title;
    if (data.startTime) updatePayload.startTime = data.startTime;
    if (data.endTime) updatePayload.endTime = data.endTime;
    if (data.roomId) updatePayload.room = data.roomId;

    const updated = await this.meetingRepository.update(id, updatePayload);
    if (!updated) throw new Error('Failed to update meeting.');
    return updated;
  }

  async getAllRooms() {
    return this.roomRepository.findAll();
  }

  async createRoom(name: string, capacity: number, description?: string) {
    const existing = await this.roomRepository.findByName(name);
    if (existing) throw new Error(`A room named "${name}" already exists.`);
    return this.roomRepository.create({ name, capacity: capacity ?? 10, description });
  }

  async updateRoom(id: string, data: { name?: string; capacity?: number; description?: string }) {
    const room = await this.roomRepository.findById(id);
    if (!room) throw new Error('Room not found.');
    if (data.name && data.name !== room.name) {
      const existing = await this.roomRepository.findByName(data.name);
      if (existing) throw new Error(`A room named "${data.name}" already exists.`);
    }
    const updated = await this.roomRepository.update(id, data);
    if (!updated) throw new Error('Failed to update room.');
    return updated;
  }

  async deleteRoom(id: string) {
    const room = await this.roomRepository.findById(id);
    if (!room) throw new Error('Room not found.');

    // Guard: cannot delete if active confirmed meetings exist for this room
    const { MeetingModel } = await import('../models/Meeting');
    const activeMeetings = await MeetingModel.countDocuments({ room: id, status: 'CONFIRMED' });
    if (activeMeetings > 0) {
      throw new Error(`Cannot delete room: it has ${activeMeetings} active confirmed meeting(s). Cancel them first.`);
    }

    const deleted = await this.roomRepository.delete(id);
    if (!deleted) throw new Error('Failed to delete room.');
    return deleted;
  }

  async getDashboardStats(date: Date) {
    return this.meetingRepository.getDashboardStats(date);
  }
}
export const schedulerService = new SchedulerService();

