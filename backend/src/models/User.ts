import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Optional because we might not return it
  role: 'SuperAdmin' | 'Admin' | 'Manager' | 'Employee';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['SuperAdmin', 'Admin', 'Manager', 'Employee'],
      default: 'Employee',
    },
  },
  {
    timestamps: true,
  }
);

// Exclude password when converting to JSON
UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete (ret as any).password;
    delete (ret as any).__v;
    return ret;
  },
});

export const User = mongoose.model<IUser>('User', UserSchema);
