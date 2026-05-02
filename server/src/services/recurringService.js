import cron from 'node-cron';

import { Expense } from '../models/Expense.js';
import { RecurringExpense } from '../models/RecurringExpense.js';
import { User } from '../models/User.js';
import { emitHouseholdEvent } from '../config/socket.js';
import { createExpenseRecord } from './expenseService.js';
import { createNotifications } from './notificationService.js';
import { recordAuditLog } from './auditService.js';

function clampDay(year, month, dayOfMonth) {
  return Math.min(dayOfMonth, new Date(year, month + 1, 0).getDate());
}

export function buildNextRecurringDate(dayOfMonth, fromDate = new Date()) {
  const year = fromDate.getFullYear();
  const month = fromDate.getMonth();
  const day = clampDay(year, month, dayOfMonth);
  const candidate = new Date(year, month, day, 8, 0, 0, 0);

  if (candidate >= fromDate) {
    return candidate;
  }

  const nextMonthDate = new Date(year, month + 1, 1);
  return new Date(
    nextMonthDate.getFullYear(),
    nextMonthDate.getMonth(),
    clampDay(nextMonthDate.getFullYear(), nextMonthDate.getMonth(), dayOfMonth),
    8,
    0,
    0,
    0
  );
}

function addOneMonth(date, dayOfMonth) {
  const nextBase = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return new Date(
    nextBase.getFullYear(),
    nextBase.getMonth(),
    clampDay(nextBase.getFullYear(), nextBase.getMonth(), dayOfMonth),
    8,
    0,
    0,
    0
  );
}

export async function processDueRecurringExpenses({ householdId } = {}) {
  const query = {
    isActive: true,
    nextRunAt: { $lte: new Date() }
  };

  if (householdId) {
    query.household = householdId;
  }

  const recurringExpenses = await RecurringExpense.find(query);

  for (const recurring of recurringExpenses) {
    const existingMatch = await Expense.findOne({
      recurringSource: recurring._id,
      date: {
        $gte: new Date(recurring.nextRunAt.getFullYear(), recurring.nextRunAt.getMonth(), 1),
        $lte: new Date(recurring.nextRunAt.getFullYear(), recurring.nextRunAt.getMonth() + 1, 0, 23, 59, 59, 999)
      }
    });

    if (existingMatch) {
      recurring.nextRunAt = addOneMonth(recurring.nextRunAt, recurring.dayOfMonth);
      await recurring.save();
      continue;
    }

    const householdMembers = await User.find({ household: recurring.household }).select('_id');

    const createdExpense = await createExpenseRecord({
      household: {
        _id: recurring.household,
        members: householdMembers.map((member) => member._id)
      },
      actorId: recurring.createdBy,
      payload: {
        title: recurring.title,
        amount: recurring.amount,
        paidBy: recurring.paidBy,
        participants: recurring.participants,
        splitType: recurring.splitType,
        exactSplits: recurring.exactSplits.map((split) => ({
          user: split.user,
          value: split.value
        })),
        percentageSplits: recurring.percentageSplits.map((split) => ({
          user: split.user,
          value: split.value
        })),
        category: recurring.category,
        date: recurring.nextRunAt,
        notes: recurring.notes
      },
      recurringSource: recurring._id
    });

    await createNotifications({
      householdId: recurring.household,
      userIds: householdMembers.map((member) => member._id),
      type: 'expense',
      title: 'Recurring expense added',
      message: `${recurring.title} has been added automatically for this month.`,
      metadata: {
        expenseId: createdExpense._id.toString(),
        recurringId: recurring._id.toString()
      }
    });

    await recordAuditLog({
      householdId: recurring.household,
      userId: recurring.createdBy,
      entityType: 'recurring',
      entityId: recurring._id,
      action: 'create',
      after: recurring.toObject()
    });

    recurring.lastRunAt = recurring.nextRunAt;
    recurring.nextRunAt = addOneMonth(recurring.nextRunAt, recurring.dayOfMonth);
    await recurring.save();

    emitHouseholdEvent(recurring.household, 'recurring:processed', {
      recurringId: recurring._id.toString(),
      expenseId: createdExpense._id.toString()
    });
  }

  return recurringExpenses.length;
}

export function startRecurringExpenseScheduler() {
  cron.schedule('0 8 * * *', async () => {
    await processDueRecurringExpenses();
  });
}
