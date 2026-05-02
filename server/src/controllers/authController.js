import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { Household } from '../models/Household.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signToken } from '../utils/jwt.js';
import { recordAuditLog } from '../services/auditService.js';

const signupSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6),
  householdName: z.string().min(2).max(120).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    household: user.household,
    avatarColor: user.avatarColor
  };
}

export const signup = asyncHandler(async (req, res) => {
  const payload = signupSchema.parse(req.body);
  const existingUser = await User.findOne({ email: payload.email.toLowerCase() });

  if (existingUser) {
    throw new ApiError(StatusCodes.CONFLICT, 'An account with this email already exists');
  }

  let household = await Household.findOne().populate('members', '_id');
  let role = 'member';

  if (!household) {
    household = await Household.create({
      name: payload.householdName || 'Apna Home CRM Household'
    });
    role = 'admin';
  } else if (household.members.length >= household.memberLimit) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'This household already has the maximum of five members'
    );
  }

  const user = await User.create({
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role,
    household: household._id,
    avatarColor: ['#3d7b80', '#97c8a8', '#ea866f', '#d9ae5f', '#5e7ce2'][
      household.members.length % 5
    ]
  });

  household.members.push(user._id);
  if (!household.createdBy) {
    household.createdBy = user._id;
  }
  await household.save();

  await recordAuditLog({
    householdId: household._id,
    userId: user._id,
    entityType: 'auth',
    entityId: user._id,
    action: 'create',
    after: serializeUser(user)
  });

  res.status(StatusCodes.CREATED).json({
    token: signToken(user._id),
    user: serializeUser(user)
  });
});

export const login = asyncHandler(async (req, res) => {
  const payload = loginSchema.parse(req.body);
  const user = await User.findOne({ email: payload.email.toLowerCase() });

  if (!user || !(await user.comparePassword(payload.password))) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid email or password');
  }

  user.lastLoginAt = new Date();
  await user.save();

  await recordAuditLog({
    householdId: user.household,
    userId: user._id,
    entityType: 'auth',
    entityId: user._id,
    action: 'login',
    after: {
      lastLoginAt: user.lastLoginAt
    }
  });

  res.json({
    token: signToken(user._id),
    user: serializeUser(user)
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({
    user: serializeUser(req.user)
  });
});
