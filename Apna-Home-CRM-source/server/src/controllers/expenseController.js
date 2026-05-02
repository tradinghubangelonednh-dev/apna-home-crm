import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { emitHouseholdEvent } from '../config/socket.js';
import { Expense } from '../models/Expense.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { recordAuditLog } from '../services/auditService.js';
import {
  assertUsersBelongToHousehold,
  buildExpenseFilters,
  createExpenseRecord,
  prepareExpensePayload
} from '../services/expenseService.js';
import { createNotifications } from '../services/notificationService.js';

const splitEntrySchema = z.object({
  user: z.string(),
  value: z.number().positive()
});

const expenseSchema = z.object({
  title: z.string().max(120).optional(),
  amount: z.number().positive(),
  paidBy: z.string(),
  participants: z.array(z.string()).min(1),
  splitType: z.enum(['equal', 'exact', 'percentage']),
  exactSplits: z.array(splitEntrySchema).optional(),
  percentageSplits: z.array(splitEntrySchema).optional(),
  category: z.enum(['food', 'rent', 'electricity', 'misc']),
  date: z.coerce.date(),
  notes: z.string().max(1000).optional()
});

export const listExpenses = asyncHandler(async (req, res) => {
  const filters = buildExpenseFilters(req.user.household, req.query);
  const expenses = await Expense.find(filters)
    .populate('paidBy', 'name email role avatarColor')
    .populate('participants', 'name email role avatarColor')
    .populate('splits.user', 'name email role avatarColor')
    .sort({ date: -1, createdAt: -1 });

  res.json({ expenses });
});

export const createExpense = asyncHandler(async (req, res) => {
  const payload = expenseSchema.parse(req.body);
  const expense = await createExpenseRecord({
    household: {
      _id: req.user.household,
      members: (
        await User.find({ household: req.user.household }).select('_id')
      ).map((member) => member._id)
    },
    actorId: req.user._id,
    payload
  });

  const householdMembers = await User.find({ household: req.user.household }).select('_id');

  await Promise.all([
    createNotifications({
      householdId: req.user.household,
      userIds: householdMembers.map((member) => member._id),
      type: 'expense',
      title: 'New shared expense added',
      message: `${req.user.name} added ${expense.title || expense.category} for Rs ${Number(
        expense.amount
      ).toFixed(2)}.`,
      metadata: {
        expenseId: expense._id.toString()
      }
    }),
    recordAuditLog({
      householdId: req.user.household,
      userId: req.user._id,
      entityType: 'expense',
      entityId: expense._id,
      action: 'create',
      after: expense.toObject()
    })
  ]);

  emitHouseholdEvent(req.user.household, 'expense:changed', {
    action: 'created',
    expenseId: expense._id.toString()
  });

  res.status(StatusCodes.CREATED).json({ expense });
});

export const updateExpense = asyncHandler(async (req, res) => {
  const payload = expenseSchema.parse(req.body);
  const expense = await Expense.findOne({
    _id: req.params.expenseId,
    household: req.user.household
  });

  if (!expense) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Expense not found');
  }

  const memberIds = (
    await User.find({ household: req.user.household }).select('_id')
  ).map((member) => member._id.toString());
  const participants = [...new Set(payload.participants)];

  assertUsersBelongToHousehold(memberIds, [payload.paidBy, ...participants]);
  const before = expense.toObject();

  Object.assign(
    expense,
    prepareExpensePayload({
      household: {
        _id: req.user.household,
        members: memberIds
      },
      actorId: req.user._id,
      payload,
      recurringSource: expense.recurringSource
    })
  );
  await expense.save();

  await recordAuditLog({
    householdId: req.user.household,
    userId: req.user._id,
    entityType: 'expense',
    entityId: expense._id,
    action: 'update',
    before,
    after: expense.toObject()
  });

  emitHouseholdEvent(req.user.household, 'expense:changed', {
    action: 'updated',
    expenseId: expense._id.toString()
  });

  res.json({
    expense: await Expense.findById(expense._id)
      .populate('paidBy', 'name email role avatarColor')
      .populate('participants', 'name email role avatarColor')
      .populate('splits.user', 'name email role avatarColor')
  });
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({
    _id: req.params.expenseId,
    household: req.user.household
  });

  if (!expense) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Expense not found');
  }

  const before = expense.toObject();
  await expense.deleteOne();

  await recordAuditLog({
    householdId: req.user.household,
    userId: req.user._id,
    entityType: 'expense',
    entityId: expense._id,
    action: 'delete',
    before
  });

  emitHouseholdEvent(req.user.household, 'expense:changed', {
    action: 'deleted',
    expenseId: expense._id.toString()
  });

  res.status(StatusCodes.NO_CONTENT).send();
});
