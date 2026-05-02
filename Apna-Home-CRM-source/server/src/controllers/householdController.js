import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { Household } from '../models/Household.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { recordAuditLog } from '../services/auditService.js';

const createMemberSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'member']).default('member')
});

const updateRoleSchema = z.object({
  role: z.enum(['admin', 'member'])
});

export const getHousehold = asyncHandler(async (req, res) => {
  const household = await Household.findById(req.user.household).populate(
    'members',
    'name email role avatarColor createdAt'
  );

  res.json({ household });
});

export const addMember = asyncHandler(async (req, res) => {
  const payload = createMemberSchema.parse(req.body);
  const household = await Household.findById(req.user.household).populate('members', '_id');

  if (household.members.length >= household.memberLimit) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'The household is already full');
  }

  const existingUser = await User.findOne({ email: payload.email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(StatusCodes.CONFLICT, 'That email is already in use');
  }

  const user = await User.create({
    ...payload,
    email: payload.email.toLowerCase(),
    household: household._id,
    avatarColor: ['#3d7b80', '#97c8a8', '#ea866f', '#d9ae5f', '#5e7ce2'][
      household.members.length % 5
    ]
  });

  household.members.push(user._id);
  await household.save();

  await recordAuditLog({
    householdId: household._id,
    userId: req.user._id,
    entityType: 'household',
    entityId: user._id,
    action: 'create',
    after: {
      memberId: user._id,
      role: user.role
    }
  });

  res.status(StatusCodes.CREATED).json({ user });
});

export const updateMemberRole = asyncHandler(async (req, res) => {
  const payload = updateRoleSchema.parse(req.body);
  const member = await User.findOne({
    _id: req.params.memberId,
    household: req.user.household
  });

  if (!member) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Member not found');
  }

  if (req.user._id.toString() === member._id.toString() && payload.role !== 'admin') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You cannot remove your own admin access');
  }

  const before = {
    role: member.role
  };

  member.role = payload.role;
  await member.save();

  await recordAuditLog({
    householdId: req.user.household,
    userId: req.user._id,
    entityType: 'household',
    entityId: member._id,
    action: 'role_update',
    before,
    after: { role: member.role }
  });

  res.json({ user: member });
});
