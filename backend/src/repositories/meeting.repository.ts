import { ClientSession, Types } from 'mongoose';
import { MeetingModel } from '../models/Meeting';
import { RoomModel } from '../models/Room';
import { IMeeting, IMeetingDocument } from '../interfaces/meeting.interface';

export class MeetingRepository {
  /**
   * Finds all meetings based on optional date and roomId filters.
   * Optimizes the query using select projection and lean.
   */
  async findAll(filters: { date?: Date; roomId?: string } = {}): Promise<IMeetingDocument[]> {
    const query: any = {};

    if (filters.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(filters.date);
      endOfDay.setHours(23, 59, 59, 999);

      query.startTime = { $gte: startOfDay, $lte: endOfDay };
    }

    if (filters.roomId) {
      query.room = filters.roomId;
    }

    return MeetingModel.find(query, 'title room startTime endTime status createdAt')
      .populate('room', 'name capacity description')
      .sort({ startTime: 1 })
      .lean<IMeetingDocument[]>()
      .exec();
  }

  /**
   * Finds a specific meeting by ID.
   * Uses projection to fetch only needed properties.
   */
  async findById(id: string): Promise<IMeetingDocument | null> {
    return MeetingModel.findById(id, 'title room startTime endTime status createdAt')
      .populate('room', 'name capacity description')
      .lean<IMeetingDocument>()
      .exec();
  }

  /**
   * Creates a new meeting.
   */
  async create(meetingData: IMeeting, session?: ClientSession): Promise<IMeetingDocument> {
    const meeting = new MeetingModel(meetingData);
    if (session) {
      await meeting.save({ session });
      return meeting;
    }
    return meeting.save();
  }

  /**
   * Updates a meeting status (e.g. to CANCELLED).
   * Populates the room field and returns the updated document.
   */
  async updateStatus(
    id: string,
    status: 'CONFIRMED' | 'CANCELLED',
    session?: ClientSession
  ): Promise<IMeetingDocument | null> {
    const options = session ? { session, new: true } : { new: true };
    return MeetingModel.findByIdAndUpdate(
      id,
      { status },
      options
    ).populate('room', 'name capacity description').exec();
  }

  /**
   * Updates editable fields of a meeting (title, startTime, endTime, room).
   * Returns the updated document populated with room details.
   */
  async update(
    id: string,
    data: { title?: string; startTime?: Date; endTime?: Date; room?: string }
  ): Promise<IMeetingDocument | null> {
    return MeetingModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    )
      .populate('room', 'name capacity description')
      .exec();
  }


  /**
   * Finds overlapping confirmed meetings for a specific room and timeframe.
   * Optimizes by projecting only essential matching fields.
   */
  async findOverlapping(
    roomId: string | Types.ObjectId,
    startTime: Date,
    endTime: Date,
    session?: ClientSession
  ): Promise<IMeetingDocument | null> {
    const query = {
      room: roomId,
      status: 'CONFIRMED',
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    };

    const options = session ? { session } : {};
    return MeetingModel.findOne(query, '_id room startTime endTime status', options)
      .lean<IMeetingDocument>()
      .exec();
  }

  /**
   * Returns list of room IDs that have active confirmed meetings in the timeframe.
   */
  async findBusyRooms(
    startTime: Date,
    endTime: Date,
    session?: ClientSession
  ): Promise<any[]> {
    const query = {
      status: 'CONFIRMED',
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    };
    const options = session ? { session } : {};
    return MeetingModel.find(query, 'room', options).distinct('room').exec();
  }

  /**
   * Fetches all dashboard statistics in a single database roundtrip using a $facet pipeline.
   */
  async getDashboardStats(date: Date): Promise<{
    totalMeetingsToday: number;
    upcomingMeetingsCount: number;
    occupancyRateToday: number;
    mostUsedRoom: string;
    averageDuration: number;
    occupiedRoomsCount: number;
    availableRoomsCount: number;
    meetingsPerDay: { date: string; count: number }[];
    recentMeetings: any[];
  }> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const now = new Date();

    const [facetResults, totalRoomsCount] = await Promise.all([
      MeetingModel.aggregate([
        {
          $facet: {
            // Count total confirmed meetings and sum total duration for today
            todayStats: [
              {
                $match: {
                  status: 'CONFIRMED',
                  startTime: { $gte: startOfDay, $lte: endOfDay },
                },
              },
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                  totalDuration: {
                    $sum: {
                      $divide: [{ $subtract: ['$endTime', '$startTime'] }, 1000 * 60],
                    },
                  },
                },
              },
            ],
            // Count all upcoming confirmed meetings starting in the future
            upcomingStats: [
              {
                $match: {
                  status: 'CONFIRMED',
                  startTime: { $gt: now },
                },
              },
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                },
              },
            ],
            // Find the most frequently booked room overall
            mostUsedRoom: [
              { $match: { status: 'CONFIRMED' } },
              {
                $group: {
                  _id: '$room',
                  count: { $sum: 1 },
                },
              },
              { $sort: { count: -1 } },
              { $limit: 1 },
              {
                $lookup: {
                  from: 'rooms',
                  localField: '_id',
                  foreignField: '_id',
                  as: 'roomDetails',
                },
              },
              { $unwind: { path: '$roomDetails', preserveNullAndEmptyArrays: true } },
            ],
            // Find the average duration of meetings across the system
            avgDuration: [
              { $match: { status: 'CONFIRMED' } },
              {
                $group: {
                  _id: null,
                  avgDuration: {
                    $avg: {
                      $divide: [{ $subtract: ['$endTime', '$startTime'] }, 1000 * 60],
                    },
                  },
                },
              },
            ],
            // Group meetings by day to get chronological booking patterns
            meetingsPerDay: [
              { $match: { status: 'CONFIRMED' } },
              {
                $group: {
                  _id: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
                  count: { $sum: 1 },
                },
              },
              { $sort: { _id: -1 } },
              { $limit: 7 },
            ],
            // Get the 5 most recently scheduled/created meetings
            recentMeetings: [
              { $match: { status: 'CONFIRMED' } },
              { $sort: { startTime: -1 } },
              { $limit: 5 },
              {
                $lookup: {
                  from: 'rooms',
                  localField: 'room',
                  foreignField: '_id',
                  as: 'roomDetails',
                },
              },
              { $unwind: { path: '$roomDetails', preserveNullAndEmptyArrays: true } },
              {
                $project: {
                  _id: 1,
                  title: 1,
                  startTime: 1,
                  endTime: 1,
                  status: 1,
                  createdAt: 1,
                  room: {
                    _id: '$roomDetails._id',
                    name: '$roomDetails.name',
                    capacity: '$roomDetails.capacity',
                  },
                },
              },
            ],
            // Retrieve rooms that are currently occupied at this exact time
            occupiedRoomsNow: [
              {
                $match: {
                  status: 'CONFIRMED',
                  startTime: { $lte: now },
                  endTime: { $gte: now },
                },
              },
              {
                $group: {
                  _id: '$room',
                },
              },
            ],
          },
        },
      ]).exec(),
      RoomModel.countDocuments().exec(),
    ]);

    const result = facetResults[0] || {};
    const totalMeetingsToday = result.todayStats?.[0]?.count || 0;
    const totalDurationToday = result.todayStats?.[0]?.totalDuration || 0;
    const upcomingMeetingsCount = result.upcomingStats?.[0]?.count || 0;

    // Room Utilization Calculation:
    // workingMinutesPerRoom = 840 mins (8 AM to 10 PM)
    // totalCapacity = totalRooms * 840
    const workingMinutesPerRoom = 840;
    const totalRooms = totalRoomsCount || 5;
    const totalWorkingMinutes = totalRooms * workingMinutesPerRoom;
    const occupancyRateToday = Math.min(
      Math.round((totalDurationToday / totalWorkingMinutes) * 100),
      100
    );

    const mostUsedRoomName = result.mostUsedRoom?.[0]?.roomDetails?.name || 'N/A';
    const averageDuration = Math.round(result.avgDuration?.[0]?.avgDuration || 0);

    const occupiedRoomsCount = result.occupiedRoomsNow?.length || 0;
    const availableRoomsCount = Math.max(0, totalRooms - occupiedRoomsCount);

    const meetingsPerDay = (result.meetingsPerDay || []).map((item: any) => ({
      date: item._id,
      count: item.count,
    })).reverse();

    const recentMeetings = result.recentMeetings || [];

    return {
      totalMeetingsToday,
      upcomingMeetingsCount,
      occupancyRateToday,
      mostUsedRoom: mostUsedRoomName,
      averageDuration,
      occupiedRoomsCount,
      availableRoomsCount,
      meetingsPerDay,
      recentMeetings,
    };
  }
}
