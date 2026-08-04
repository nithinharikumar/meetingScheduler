import mongoose from 'mongoose';
import { RoomModel } from '../models/Room';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from './db';

const SEED_ROOMS = [
  { name: 'Boardroom', capacity: 12, description: 'Executive board meetings with video conferencing' },
  { name: 'Turing', capacity: 8, description: 'Medium collaborative space with whiteboard' },
  { name: 'Lovelace', capacity: 6, description: 'Cozy brainstorm room' },
  { name: 'Hopper', capacity: 6, description: 'Pair programming and huddle space' },
  { name: 'Hamilton', capacity: 4, description: 'Quiet focused work and interview room' },
];

export const seedRooms = async (): Promise<void> => {
  try {
    const count = await RoomModel.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding rooms...');
      await RoomModel.insertMany(SEED_ROOMS);
      console.log('✅ Successfully seeded 5 meeting rooms!');
    } else {
      console.log('ℹ️ Rooms already exist, skipping seed.');
    }

    const existingAdmin = await User.findOne({ email: 'superadmin@syncspace.com' });
    if (!existingAdmin) {
      console.log('🌱 Seeding default SuperAdmin...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('superadmin123', salt);
      await User.create({
        name: 'Super Admin',
        email: 'superadmin@syncspace.com',
        password: hashedPassword,
        role: 'SuperAdmin',
      });
      console.log('✅ Successfully seeded SuperAdmin! (superadmin@syncspace.com / superadmin123)');
    } else {
      console.log('ℹ️ SuperAdmin already exists, skipping seed.');
    }
  } catch (error) {
    console.error('❌ Error seeding rooms:', error);
    throw error;
  }
};

// If run directly via CLI (ts-node seed.ts)
if (require.main === module) {
  (async () => {
    await connectDB();
    await seedRooms();
    await disconnectDB();
  })();
}
