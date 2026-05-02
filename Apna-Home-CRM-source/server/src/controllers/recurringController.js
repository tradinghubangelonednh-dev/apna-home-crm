import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { emitHouseholdEvent } from '../config/socket.js';
import { RecurringExpense } from '../models/RecurringExpense.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { buildExpenseSplits } from '../utils/splitter.js';
import { recordAuditLog } from '../services/auditService.js';
import { assertUsersBelongToHousehold } from '../services/expenseService.js';
import {
  buildNextRecurringDate,
  processDueRecurringExpenses
} from '../services/recurringService.js';

const splitEntrySchema = z.object({
  user: z.string(),
  value: z.number().positive()
});

const recurringSchema = z.object({
  title: z.string().min(2).max(120),
  amount: z.number().positive(),
  paidBy: z.string(),
  participants: z.array(z.string()).min(1),
  splitType: z.enum(['equal', 'exact', 'percentage']),
  exactSplits: z.array(splitEntrySchema).optional(),
  percentageSplits: z.array(splitEntrySchema).optional(),
  category: z.enum(['food', 'rent', 'electricity', 'misc']),
  notes: z.string().max(1000).optional(),
  dayOfMonth: z.number().min(1).max(31),
  isActive: z.boolean().optional()
});

export const listRecurringExpenses = asyncHandler(async (req, res) => {
  const recurringExpenses = await RecurringExpense.find({
    household: req.user.household
  })
    .populate('paidBy', 'name email role avatarColor')
    .populate('participants', 'name email role avatarColor')
    .sort({ createdAt: -1 });

  res.json({ recurringExpenses });
});

export const createRecurringExpense = asyncHandler(async (req, res) => {
  const payload = recurringSchema.parse(req.body);
  const memberIds = (
    await User.find({ household: req.user.household }).select('_id')
  ).map((member) => member._id.toString());

  assertUsersBelongToHousehold(memberIds, [payload.paidBy, ...payload.participants]);
  buildExpenseSplits({
    amount: payload.amount,
    participants: payload.participants,
    splitType: payload.splitType,
    exactSplits: payload.exactSplits,
    percentageSplits: payload.percentageSplits
  });

  const recurringExpense = await RecurringExpense.create({
    household: req.user.household,
    ...payload,
    exactSplits: (payload.exactSplits || []).map((entry) => ({
      user: entry.user,
      value: entry.value
    })),
    percentageSplits: (payload.percentageSplits || []).map((entry) => ({
      user: entry.user,
      value: entry.value
    })),
    nextRunAt: buildNextRecurringDate(payload.dayOfMonth),
    createdBy: req.user._id
  });

  await recordAuditLog({
    householdId: req.user.household,
    userId: req.user._id,
    entityType: 'recurring',
    entityId: recurringExpense._id,
    action: 'create',
    after: recurringExpense.toObject()
  });

  emitHouseholdEvent(req.user.household, 'recurring:changed', {
    action: 'created',
    recurringId: recurringExpense._id.toString()
  });

  res.status(StatusCodes.CREATED).json({ recurringExpense });
});

export const updateRecurringExpense = asyncHandler(async (req, res) => {
  const payload = recurringSchema.parse(req.body);
  const recurringExpense = await RecurringExpense.findOne({
    _id: req.params.recurringId,
    household: req.user.household
  });

  if (!recurringExpense) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Recurring expense not found');
  }

  const memberIds = (
    await User.find({ household: req.user.household }).select('_id')
  ).map((member) => member._id.toString());

  assertUsersBelongToHousehold(memberIds, [payload.paidBy, ...payload.participants]);
  buildExpenseSplits({
    amount: payload.amount,
    participants: payload.participants,
    splitType: payload.splitType,
    exactSplits: payload.exactSplits,
    percentageSplits: payload.percentageSplits
  });

  const before = recurringExpense.toObject();
  recurringExpense.title = payload.title;
  recurringExpense.amount = payload.amount;
  recurringExpense.paidBy = payload.paidBy;
  recurringExpense.participants = payload.participants;
  recurringExpense.splitType = payload.splitType;
  recurringExpense.exactSplits = (payload.exactSplits || []).map((entry) => ({
    user: entry.user,
    value: entry.value
  }));
  recurringExpense.percentageSplits = (payload.percentageSplits || []).map((entry) => ({
    user: entry.user,
    value: entry.value
  }));
  recurringExpense.category = payload.category;
  recurringExpense.notes = payload.notes || '';
  recurringExpense.dayOfMonth = payload.dayOfMonth;
  recurringExpense.isActive = payload.isActive ?? recurringExpense.isActive;
  recurringExpense.nextRunAt = buildNextRecurringDate(payload.dayOfMonth);
  await recurringExpense.save();

  await recordAuditLog({
    householdId: req.user.household,
    userId: req.user._id,
    entityType: 'recurring',
    entityId: recurringExpense._id,
    action: 'update',
    before,
    after: recurringExpense.toObject()
  });

  emitHouseholdEvent(req.user.household, 'recurring:changed', {
    action: 'updated',
    recurringId: recurringExpense._id.toString()
  });

  res.json({ recurringExpense });
});

export const toggleRecurringExpense = asyncHandler(async (req, res) => {
  const recurringExpense = await RecurringExpense.findOne({
    _id: req.params.recurringId,
    household: req.user.household
  });

  if (!recurringExpense) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Recurring expense not found');
  }

  const before = recurringExpense.toObject();
  recurringExpense.isActive = !recurringExpense.isActive;
  await recurringExpense.save();

  await recordAuditLog({
    householdId: req.user.household,
    userId: req.user._id,
    entityType: 'recurring',
    entityId: recurringExpense._id,
    action: 'update',
    before,
    after: recurringExpense.toObject()
  });

  emitHouseholdEvent(req.user.household, 'recurring:changed', {
    action: 'toggled',
    recurringId: recurringExpense._id.toString()
  });

  res.json({ recurringExpense });
});

export const runRecurringExpenses = asyncHandler(async (req, res) => {
  const processed = await processDueRecurringExpenses({
    householdId: req.user.household
  });

  res.json({ processed });
});
