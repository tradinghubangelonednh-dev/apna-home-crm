import { Expense } from '../models/Expense.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { buildExpenseFilters } from '../services/expenseService.js';
import { buildDashboardSnapshot } from '../services/dashboardService.js';
import { generateDashboardPdf, generateExpensesCsv } from '../services/exportService.js';

export const exportExpensesCsv = asyncHandler(async (req, res) => {
  const expenses = await Expense.find(buildExpenseFilters(req.user.household, req.query))
    .populate('paidBy', 'name')
    .populate('participants', 'name')
    .sort({ date: -1 });
  const csv = generateExpensesCsv(expenses);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="apna-home-expenses.csv"');
  res.send(csv);
});

export const exportDashboardPdf = asyncHandler(async (req, res) => {
  const snapshot = await buildDashboardSnapshot({
    householdId: req.user.household,
    userId: req.user._id,
    month: req.query.month,
    year: req.query.year
  });
  const pdf = await generateDashboardPdf(snapshot);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="apna-home-dashboard.pdf"');
  res.send(pdf);
});
