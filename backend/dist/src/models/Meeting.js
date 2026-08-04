"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingModel = void 0;
const mongoose_1 = require("mongoose");
const MeetingSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    room: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
// Indexes for performance and query optimization
MeetingSchema.index({ room: 1, startTime: 1, endTime: 1 });
MeetingSchema.index({ startTime: 1, status: 1 });
MeetingSchema.index({ status: 1, startTime: 1, endTime: 1 });
exports.MeetingModel = (0, mongoose_1.model)('Meeting', MeetingSchema);
