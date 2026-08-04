import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find({}).select('-password');
  res.status(200).json({ success: true, data: users });
});

// @desc    Create a new user
// @route   POST /api/users
// @access  Private/SuperAdmin
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error('Please provide name, email, password, and role');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with that email');
  }

  if (!['SuperAdmin', 'Admin', 'Manager', 'Employee'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role specified');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  if (user) {
    res.status(201).json({
      success: true,
      data: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data received');
  }
});

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { role } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!['Admin', 'Manager', 'Employee'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role');
  }

  // Prevent admin from removing their own admin role
  if (req.user?.id === user.id && role !== 'Admin') {
    res.status(400);
    throw new Error('Cannot remove your own Admin role');
  }

  user.role = role;
  await user.save();

  res.status(200).json({ success: true, data: user });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent admin from deleting themselves
  if (req.user?.id === user.id) {
    res.status(400);
    throw new Error('Cannot delete yourself');
  }

  await user.deleteOne();

  res.status(200).json({ success: true, data: {} });
});
