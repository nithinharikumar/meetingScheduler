"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomModel = void 0;
const mongoose_1 = require("mongoose");
const RoomSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
});
// Add index on name for fast lookups
RoomSchema.index({ name: 1 });
exports.RoomModel = (0, mongoose_1.model)('Room', RoomSchema);
