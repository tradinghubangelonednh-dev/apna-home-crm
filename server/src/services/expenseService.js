import { StatusCodes } from 'http-status-codes';

import { Expense } from '../models/Expense.js';
import { ApiError } from '../utils/apiError.js';
import { buildExpenseSplits } from '../utils/splitter.js';

function normalizeId(value) {
  return value.toString();
}

export function assertUsersBelongToHousehold(memberIds, userIds) {
  const normalizedMemberIds = memberIds.map(normalizeId);

  for (const userId of userIds.map(normalizeId)) {
    if (!normalizedMemberIds.includes(userId)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Selected users must belong to the household');
    }
  }
}

export function prepareExpensePayload({ household, actorId, payload, recurringSource = null }) {
  const householdId = household._id || household.id;
  const memberIds = household.members.map(normalizeId);
  const participantIds = [...new Set(payload.participants.map(normalizeId))];
  const paidBy = normalizeId(payload.paidBy);

  assertUsersBelongToHousehold(memberIds, [paidBy, ...participantIds]);

  const splits = buildExpenseSplits({
    amount: payload.amount,
    participants: participantIds,
    splitType: payload.splitType,
    exactSplits: payload.exactSplits,
    percentageSplits: payload.percentageSplits
  });

  return {
    household: householdId,
    title: payload.title?.trim() || '',
    amount: payload.amount,
    paidBy,
    participants: participantIds,
    splitType: payload.splitType,
    splits,
    category: payload.category,
    date: payload.date,
    notes: payload.notes?.trim() || '',
    createdBy: actorId,
    updatedBy: actorId,
    recurringSource
  };
}

export async function createExpenseRecord({ household, actorId, payload, recurringSource = null }) {
  const expense = await Expense.create(
    prepareExpensePayload({
      household,
      actorId,
      payload,
      recurringSource
    })
  );

  return Expense.findById(expense._id)
    .populate('paidBy', 'name email role avatarColor')
    .populate('participants', 'name email role avatarColor')
    .populate('splits.user', 'name email role avatarColor');
}

export function buildExpenseFilters(householdId, query) {
  const filters = {
    household: householdId
  };

  if (query.category) {
    filters.category = query.category;
  }

  if (query.paidBy) {
    filters.paidBy = query.paidBy;
  }

  if (query.splitType) {
    filters.splitType = query.splitType;
  }

  if (query.startDate || query.endDate) {
    filters.date = {};
    if (query.startDate) {
      filters.date.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      const endDate = new Date(query.endDate);
      endDate.setHours(23, 59, 59, 999);
      filters.date.$lte = endDate;
    }
  }

  if (query.search) {
    filters.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { notes: { $regex: query.search, $options: 'i' } }
    ];
  }

  return filters;
}
