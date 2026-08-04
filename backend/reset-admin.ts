import { connectDB, disconnectDB } from './src/config/db';
import { User } from './src/models/User';
import bcrypt from 'bcryptjs';

const resetSuperAdmin = async () => {
  await connectDB();
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('superadmin123', salt);
  
  const user = await User.findOneAndUpdate(
    { email: 'superadmin@syncspace.com' },
    { password: hashedPassword, role: 'SuperAdmin' },
    { new: true, upsert: true }
  );
  
  if (user) {
    console.log('SuperAdmin password reset successfully!');
  } else {
    console.log('Failed to reset SuperAdmin password.');
  }
  
  await disconnectDB();
};

resetSuperAdmin().catch(console.error);
