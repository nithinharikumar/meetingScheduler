"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedRooms = void 0;
const Room_1 = require("../models/Room");
const db_1 = require("./db");
const SEED_ROOMS = [
    { name: 'Boardroom', capacity: 12, description: 'Executive board meetings with video conferencing' },
    { name: 'Turing', capacity: 8, description: 'Medium collaborative space with whiteboard' },
    { name: 'Lovelace', capacity: 6, description: 'Cozy brainstorm room' },
    { name: 'Hopper', capacity: 6, description: 'Pair programming and huddle space' },
    { name: 'Hamilton', capacity: 4, description: 'Quiet focused work and interview room' },
];
const seedRooms = async () => {
    try {
        const count = await Room_1.RoomModel.countDocuments();
        if (count === 0) {
            console.log('🌱 Seeding rooms...');
            await Room_1.RoomModel.insertMany(SEED_ROOMS);
            console.log('✅ Successfully seeded 5 meeting rooms!');
        }
        else {
            console.log('ℹ️ Rooms already exist, skipping seed.');
        }
    }
    catch (error) {
        console.error('❌ Error seeding rooms:', error);
        throw error;
    }
};
exports.seedRooms = seedRooms;
// If run directly via CLI (ts-node seed.ts)
if (require.main === module) {
    (async () => {
        await (0, db_1.connectDB)();
        await (0, exports.seedRooms)();
        await (0, db_1.disconnectDB)();
    })();
}
