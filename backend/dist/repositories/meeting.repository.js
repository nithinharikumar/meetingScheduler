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
}
exports.MeetingRepository = MeetingRepository;
