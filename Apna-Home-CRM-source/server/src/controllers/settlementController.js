import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { emitHouseholdEvent } from '../config/socket.js';
import { Settlement } from '../models/Settlement.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { recordAuditLog } from '../services/auditService.js';
import { createNotifications } from '../services/notificationService.js';

const settlementSchema = z.object({
  fromUser: z.string(),
  toUser: z.string(),
  amount: z.number().positive(),
  dueDate: z.coerce.date().optional(),
  notes: z.string().max(500).optional()
});

export const listSettlements = asyncHandler(async (req, res) => {
  const settlements = await Settlement.find({ household: req.user.household })
    .populate('fromUser', 'name email role avatarColor')
    .populate('toUser', 'name email role avatarColor')
    .sort({ createdAt: -1 });

  res.json({ settlements });
});

export const createSettlement = asyncHandler(async (req, res) => {
  const payload = settlementSchema.parse(req.body);

  if (payload.fromUser === payload.toUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Settlement participants must be different');
  }

  const memberIds = (
    await User.find({ household: req.user.household }).select('_id')
  ).map((member) => member._id.toString());

  if (!memberIds.includes(payload.fromUser) || !memberIds.includes(payload.toUser)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Selected users must belong to the household');
  }

  const settlement = await Settlement.create({
    household: req.user.household,
    ...payload,
    createdBy: req.user._id
  });

  await Promise.all([
    createNotifications({
      householdId: req.user.household,
      userIds: [payload.fromUser, payload.toUser],
      type: 'settlement',
      title: 'Settlement created',
      message: `${req.user.name} created a settlement request for Rs ${payload.amount.toFixed(2)}.`,
      metadata: {
        settlementId: settlement._id.toString()
      }
    }),
    recordAuditLog({
      householdId: req.user.household,
      userId: req.user._id,
      entityType: 'settlement',
      entityId: settlement._id,
      action: 'create',
      after: settlement.toObject()
    })
  ]);

  emitHouseholdEvent(req.user.household, 'settlement:changed', {
    action: 'created',
    settlementId: settlement._id.toString()
  });

  res.status(StatusCodes.CREATED).json({
    settlement: await Settlement.findById(settlement._id)
      .populate('fromUser', 'name email role avatarColor')
      .populate('toUser', 'name email role avatarColor')
  });
});

export const completeSettlement = asyncHandler(async (req, res) => {
  const settlement = await Settlement.findOne({
    _id: req.params.settlementId,
    household: req.user.household
  });

  if (!settlement) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Settlement not found');
  }

  if (settlement.status === 'completed') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Settlement is already completed');
  }

  const before = settlement.toObject();
  settlement.status = 'completed';
  settlement.completedAt = new Date();
  settlement.completedBy = req.user._id;
  await settlement.save();

  await Promise.all([
    createNotifications({
      householdId: req.user.household,
      userIds: [settlement.fromUser, settlement.toUser],
      type: 'settlement',
      title: 'Settlement completed',
      message: `A payment of Rs ${settlement.amount.toFixed(2)} has been marked as completed.`,
      metadata: {
        settlementId: settlement._id.toString()
      }
    }),
    recordAuditLog({
      householdId: req.user.household,
      userId: req.user._id,
      entityType: 'settlement',
      entityId: settlement._id,
      action: 'complete',
      before,
      after: settlement.toObject()
    })
  ]);

  emitHouseholdEvent(req.user.household, 'settlement:changed', {
    action: 'completed',
    settlementId: settlement._id.toString()
  });

  res.json({
    settlement: await Settlement.findById(settlement._id)
      .populate('fromUser', 'name email role avatarColor')
      .populate('toUser', 'name email role avatarColor')
  });
});

export const sendSettlementReminder = asyncHandler(async (req, res) => {
  const settlement = await Settlement.findOne({
    _id: req.params.settlementId,
    household: req.user.household
  }).populate('fromUser', 'name');

  if (!settlement) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Settlement not found');
  }

  await Promise.all([
    createNotifications({
      householdId: req.user.household,
      userIds: [settlement.fromUser._id],
      type: 'reminder',
      title: 'Settlement reminder',
      message: `Reminder: you still need to settle Rs ${settlement.amount.toFixed(2)}.`,
      metadata: {
        settlementId: settlement._id.toString()
      }
    }),
    recordAuditLog({
      householdId: req.user.household,
      userId: req.user._id,
      entityType: 'settlement',
      entityId: settlement._id,
      action: 'remind',
      after: {
        settlementId: settlement._id
      }
    })
  ]);

  res.json({ message: 'Reminder sent successfully' });
});
