import mongoose from 'mongoose';
import { RoomRepository } from '../repositories/room.repository';
import { MeetingRepository } from '../repositories/meeting.repository';
import { IMeetingDocument } from '../interfaces/meeting.interface';

// Simple in-memory lock to prevent race conditions in single-instance Node applications
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
  async bookMeeting(title: string, startTime: Date, endTime: Date): Promise<IMeetingDocument> {
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

        // 2. Fetch all rooms
        const allRooms = await this.roomRepository.findAll();

        if (allRooms.length === 0) {
          throw new Error('No meeting rooms exist in the system.');
        }

        // 3. Find the first room not in the busy list
        const busyIdsStr = busyRoomIds.map((id) => id.toString());
        const availableRoom = allRooms.find((room) => !busyIdsStr.includes(room._id.toString()));

        if (!availableRoom) {
          throw new Error('No rooms are available during the requested time.');
        }

        // 4. Create and save the meeting
        const meetingData = {
          title,
          room: availableRoom._id,
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

  async getAllRooms() {
    return this.roomRepository.findAll();
  }

  async getDashboardStats(date: Date) {
    return this.meetingRepository.getDashboardStats(date);
  }
}
export const schedulerService = new SchedulerService();
