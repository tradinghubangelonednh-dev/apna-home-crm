import auditRoutes from './auditRoutes.js';
import authRoutes from './authRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import expenseRoutes from './expenseRoutes.js';
import exportRoutes from './exportRoutes.js';
import householdRoutes from './householdRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import recurringRoutes from './recurringRoutes.js';
import settlementRoutes from './settlementRoutes.js';

export function registerRoutes(app) {
  app.use('/api/auth', authRoutes);
  app.use('/api/household', householdRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/expenses', expenseRoutes);
  app.use('/api/settlements', settlementRoutes);
  app.use('/api/recurring', recurringRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/export', exportRoutes);
  app.use('/api/audit-logs', auditRoutes);
}
