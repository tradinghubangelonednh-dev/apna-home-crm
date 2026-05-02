import { asyncHandler } from '../utils/asyncHandler.js';
import { buildDashboardSnapshot } from '../services/dashboardService.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const snapshot = await buildDashboardSnapshot({
    householdId: req.user.household,
    userId: req.user._id,
    month: req.query.month,
    year: req.query.year
  });

  res.json(snapshot);
});
