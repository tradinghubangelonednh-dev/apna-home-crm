import { Expense } from '../models/Expense.js';
import { Notification } from '../models/Notification.js';
import { Settlement } from '../models/Settlement.js';
import { User } from '../models/User.js';
import {
  calculateNetBalances,
  groupExpensesByMonth,
  simplifyDebts,
  sumAmounts
} from '../utils/balance.js';

function buildMonthWindow(month, year) {
  const now = new Date();
  const resolvedYear = Number(year || now.getFullYear());
  const resolvedMonth = Number(month || now.getMonth() + 1);
  const start = new Date(resolvedYear, resolvedMonth - 1, 1);
  const end = new Date(resolvedYear, resolvedMonth, 0, 23, 59, 59, 999);

  return { start, end, month: resolvedMonth, year: resolvedYear };
}

export async function buildDashboardSnapshot({ householdId, userId, month, year }) {
  const [{ start, end, month: resolvedMonth, year: resolvedYear }, members, expenses, settlements, unread] =
    await Promise.all([
      Promise.resolve(buildMonthWindow(month, year)),
      User.find({ household: householdId }).select('name email role avatarColor').lean(),
      Expense.find({ household: householdId })
        .populate('paidBy', 'name email role avatarColor')
        .populate('participants', 'name email role avatarColor')
        .populate('splits.user', 'name email role avatarColor')
        .sort({ date: -1, createdAt: -1 })
        .lean(),
      Settlement.find({ household: householdId })
        .populate('fromUser', 'name email role avatarColor')
        .populate('toUser', 'name email role avatarColor')
        .sort({ createdAt: -1 })
        .lean(),
      Notification.countDocuments({ user: userId, readAt: null })
    ]);

  const monthlyExpenses = expenses.filter((expense) => {
    const date = new Date(expense.date);
    return date >= start && date <= end;
  });

  const balances = calculateNetBalances({
    members,
    expenses,
    settlements
  });

  const pendingSettlements = settlements.filter((entry) => entry.status === 'pending');
  const simplifiedTransactions = simplifyDebts(balances);
  const categoryBreakdown = ['food', 'rent', 'electricity', 'misc'].map((category) => ({
    category,
    amount: sumAmounts(
      monthlyExpenses.filter((expense) => expense.category === category),
      (expense) => expense.amount
    )
  }));

  const contributionByUser = members.map((member) => {
    const paid = sumAmounts(
      monthlyExpenses.filter((expense) => expense.paidBy._id.toString() === member._id.toString()),
      (expense) => expense.amount
    );
    const share = sumAmounts(
      monthlyExpenses.flatMap((expense) =>
        expense.splits
          .filter((split) => split.user._id.toString() === member._id.toString())
          .map((split) => split.amount)
      ),
      (amount) => amount
    );

    return {
      user: member,
      paid,
      share,
      difference: Number((paid - share).toFixed(2))
    };
  });

  const outstandingTotal = balances
    .filter((entry) => entry.net > 0)
    .reduce((accumulator, current) => accumulator + current.net, 0);

  return {
    meta: {
      month: resolvedMonth,
      year: resolvedYear
    },
    summary: {
      totalMonthlyExpenses: sumAmounts(monthlyExpenses, (expense) => expense.amount),
      perUserContribution: contributionByUser,
      outstandingBalances: balances,
      outstandingTotal: Number(outstandingTotal.toFixed(2)),
      pendingSettlementsAmount: sumAmounts(pendingSettlements, (entry) => entry.amount),
      unreadNotifications: unread
    },
    analytics: {
      categoryBreakdown,
      monthlyTrend: groupExpensesByMonth(expenses).slice(-6),
      simplifiedTransactions
    },
    recentExpenses: monthlyExpenses.slice(0, 6),
    pendingSettlements,
    balances,
    members
  };
}
