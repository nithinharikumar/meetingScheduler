"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingRepository = void 0;
const Meeting_1 = require("../models/Meeting");
class MeetingRepository {
    async findAll(filters = {}) {
        const query = {};
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
        return Meeting_1.MeetingModel.find(query)
            .populate('room')
            .sort({ startTime: 1 })
            .lean()
            .exec();
    }
    async findById(id) {
        return Meeting_1.MeetingModel.findById(id).populate('room').lean().exec();
    }
    async create(meetingData, session) {
        const meeting = new Meeting_1.MeetingModel(meetingData);
        if (session) {
            await meeting.save({ session });
            return meeting;
        }
        return meeting.save();
    }
    async updateStatus(id, status, session) {
        const options = session ? { session, new: true } : { new: true };
        return Meeting_1.MeetingModel.findByIdAndUpdate(id, { status }, options).populate('room').exec();
    }
    async findOverlapping(roomId, startTime, endTime, session) {
        const query = {
            room: roomId,
            status: 'CONFIRMED',
            startTime: { $lt: endTime },
            endTime: { $gt: startTime },
        };
        const options = session ? { session } : {};
        return Meeting_1.MeetingModel.findOne(query, null, options).lean().exec();
    }
    async findBusyRooms(startTime, endTime, session) {
        const query = {
            status: 'CONFIRMED',
            startTime: { $lt: endTime },
            endTime: { $gt: startTime },
        };
        const options = session ? { session } : {};
        return Meeting_1.MeetingModel.find(query, 'room', options).distinct('room').exec();
    }
    async getDashboardStats(date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        // 1. Today's stats: Total meetings and total duration (in minutes)
        const todayStatsPromise = Meeting_1.MeetingModel.aggregate([
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
        ]).exec();
        // 2. Most used room overall
        const mostUsedRoomPromise = Meeting_1.MeetingModel.aggregate([
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
        ]).exec();
        // 3. Average duration overall
        const avgDurationPromise = Meeting_1.MeetingModel.aggregate([
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
        ]).exec();
        const [todayStats, mostUsedRoom, avgDuration] = await Promise.all([
            todayStatsPromise,
            mostUsedRoomPromise,
            avgDurationPromise,
        ]);
        const totalMeetingsToday = todayStats[0]?.count || 0;
        const totalDurationToday = todayStats[0]?.totalDuration || 0;
        // Occupancy rate today:
        // 5 rooms, each has 14 hours of work hours (8 AM to 10 PM) = 840 minutes.
        // Total capacity = 5 * 840 = 4200 minutes.
        const workingMinutesPerRoom = (22 - 8) * 60; // 840
        const totalWorkingMinutes = 5 * workingMinutesPerRoom; // 4200
        const occupancyRateToday = Math.min(Math.round((totalDurationToday / totalWorkingMinutes) * 100), 100);
        const mostUsedRoomName = mostUsedRoom[0]?.roomDetails?.name || 'N/A';
        const averageDuration = Math.round(avgDuration[0]?.avgDuration || 0);
        return {
            totalMeetingsToday,
            occupancyRateToday,
            mostUsedRoom: mostUsedRoomName,
            averageDuration,
        };
    }
}
exports.MeetingRepository = MeetingRepository;
