"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomRepository = void 0;
const Room_1 = require("../models/Room");
class RoomRepository {
    async findAll() {
        return Room_1.RoomModel.find({}).sort({ name: 1 }).lean().exec();
    }
    async findById(id) {
        return Room_1.RoomModel.findById(id).lean().exec();
    }
    async findByName(name) {
        return Room_1.RoomModel.findOne({ name }).lean().exec();
    }
    async create(roomData) {
        const room = new Room_1.RoomModel(roomData);
        return room.save();
    }
    async count() {
        return Room_1.RoomModel.countDocuments();
    }
}
exports.RoomRepository = RoomRepository;
