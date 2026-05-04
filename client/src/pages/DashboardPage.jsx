import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { apiRequest, downloadFile } from '../lib/api';
import { fromMonthInput, toMonthInput } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { AppShell } from '../layouts/AppShell';
import { OverviewSection } from '../components/analytics/OverviewSection';
import { ExpensesSection } from '../components/expenses/ExpensesSection';
import { SettlementsSection } from '../components/settlements/SettlementsSection';
import { RecurringSection } from '../components/recurring/RecurringSection';
import { NotificationsPanel } from '../components/notifications/NotificationsPanel';
import { MembersPanel } from '../components/household/MembersPanel';
import { AuditLogPanel } from '../components/household/AuditLogPanel';
import { AnalyticsPage } from './AnalyticsPage';
import { ReportsSection } from '../components/analytics/ReportsSection';

const initialFilters = {
  search: '',
  category: '',
  paidBy: '',
  splitType: '',
  startDate: '',
  endDate: ''
};

function buildQuery(params) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

export function DashboardPage() {
  const { token, user, logout } = useAuth();
  const { socket } = useSocket();

  const today = new Date();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMonth, setSelectedMonth] = useState(
    toMonthInput(today.getMonth() + 1, today.getFullYear())
  );
  const [filters, setFilters] = useState(initialFilters);
  const [dashboard, setDashboard] = useState(null);
  const [household, setHousehold] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [preparedSuggestion, setPreparedSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const feedbackTimer = useRef(null);
  const parsedMonth = useMemo(() => fromMonthInput(selectedMonth), [selectedMonth]);

  const loadDashboard = useCallback(async () => {
    const response = await apiRequest(
      `/dashboard${buildQuery({
        month: parsedMonth.month,
        year: parsedMonth.year
      })}`,
      { token }
    );
    setDashboard(response);
  }, [parsedMonth.month, parsedMonth.year, token]);

  const loadHousehold = useCallback(async () => {
    const response = await apiRequest('/household', { token });
    setHousehold(response.household);
  }, [token]);

  const loadExpenses = useCallback(async () => {
    const response = await apiRequest(`/expenses${buildQuery(filters)}`, { token });
    setExpenses(response.expenses);
  }, [filters, token]);

  const loadSettlements = useCallback(async () => {
    const response = await apiRequest('/settlements', { token });
    setSettlements(response.settlements);
  }, [token]);

  const loadRecurring = useCallback(async () => {
    const response = await apiRequest('/recurring', { token });
    setRecurringExpenses(response.recurringExpenses);
  }, [token]);

  const loadNotifications = useCallback(async () => {
    const response = await apiRequest('/notifications', { token });
    setNotifications(response.notifications);
  }, [token]);

  const loadAuditLogs = useCallback(async () => {
    if (user.role !== 'admin') {
      setAuditLogs([]);
      return;
    }

    const response = await apiRequest('/audit-logs', { token });
    setAuditLogs(response.auditLogs);
  }, [token, user.role]);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      loadDashboard(),
      loadHousehold(),
      loadExpenses(),
      loadSettlements(),
      loadRecurring(),
      loadNotifications(),
      loadAuditLogs()
    ]);
  }, [
    loadAuditLogs,
    loadDashboard,
    loadExpenses,
    loadHousehold,
    loadNotifications,
    loadRecurring,
    loadSettlements
  ]);

  useEffect(() => {
    setLoading(true);
    refreshAll().finally(() => setLoading(false));
  }, [refreshAll]);

  useEffect(() => {
    if (!socket) return undefined;

    const handleRealtime = () => {
      refreshAll();
    };

    socket.on('expense:changed', handleRealtime);
    socket.on('settlement:changed', handleRealtime);
    socket.on('notifications:changed', handleRealtime);
    socket.on('recurring:changed', handleRealtime);
    socket.on('recurring:processed', handleRealtime);

    return () => {
      socket.off('expense:changed', handleRealtime);
      socket.off('settlement:changed', handleRealtime);
      socket.off('notifications:changed', handleRealtime);
      socket.off('recurring:changed', handleRealtime);
      socket.off('recurring:processed', handleRealtime);
    };
  }, [refreshAll, socket]);

  function setNotice(type, message) {
    setFeedback({ type, message });
    window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setFeedback(null), 3000);
  }

  async function runAction(action, successMessage) {
    setBusy(true);

    try {
      const result = await action();
      await refreshAll();

      if (successMessage) setNotice('success', successMessage);

      return result;
    } catch (error) {
      setNotice('error', error.message);
      throw error;
    } finally {
      setBusy(false);
    }
  }

  const members = household?.members || dashboard?.members || [];

  const unreadCount =
    dashboard?.summary?.unreadNotifications ||
    notifications.filter((item) => !item.readAt).length;

  function prepareSuggestion(suggestion, moveToSettlements = false) {
    setPreparedSuggestion(
      suggestion
        ? {
            ...suggestion,
            from: { ...suggestion.from },
            to: { ...suggestion.to },
            nonce: Date.now()
          }
        : null
    );

    if (moveToSettlements) setActiveTab('settlements');
  }

  if (loading || !dashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="app-panel px-8 py-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-app-charcoal/50">
            Loading
          </p>

          <h2 className="mt-3 font-display text-3xl">
            Preparing your household dashboard...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <AppShell
      activeTab={activeTab}
      onLogout={logout}
      onTabChange={setActiveTab}
      unreadCount={unreadCount}
      user={user}
    >
      {feedback ? (
        <div
          className={`app-panel px-5 py-4 text-sm ${
            feedback.type === 'error'
              ? 'border-app-coral/40 bg-app-coral/10 text-app-coral'
              : 'border-app-mint/40 bg-app-mint/12 text-app-teal'
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      {activeTab === 'overview' ? (
        <OverviewSection
          dashboard={dashboard}
          onExportCsv={() =>
            downloadFile(`/export/expenses.csv${buildQuery(filters)}`, token, 'apna-home-expenses.csv')
          }
          onExportPdf={() =>
            downloadFile(
              `/export/dashboard.pdf${buildQuery({
                month: parsedMonth.month,
                year: parsedMonth.year
              })}`,
              token,
              'apna-home-dashboard.pdf'
            )
          }
          onMonthChange={setSelectedMonth}
          onPrepareSettlement={(s) => prepareSuggestion(s, true)}
          selectedMonth={selectedMonth}
        />
      ) : null}

      {activeTab === 'reports' ? (
        <ReportsSection
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          onExportCsv={() =>
            downloadFile(
              `/export/expenses.csv${buildQuery(filters)}`,
              token,
              'apna-home-expenses.csv'
            )
          }
          onExportPdf={() =>
            downloadFile(
              `/export/dashboard.pdf${buildQuery({
                month: parsedMonth.month,
                year: parsedMonth.year
              })}`,
              token,
              'apna-home-dashboard.pdf'
            )
          }
        />
      ) : null}

      {activeTab === 'expenses' ? (
        <ExpensesSection
          busy={busy}
          expenses={expenses}
          filters={filters}
          members={members}
          onCreateExpense={(p) =>
            runAction(
              () => apiRequest('/expenses', { method: 'POST', token, body: p }),
              'Expense added'
            )
          }
          onDeleteExpense={(id) =>
            runAction(
              () => apiRequest(`/expenses/${id}`, { method: 'DELETE', token }),
              'Expense deleted'
            )
          }
          onFiltersChange={setFilters}
          onUpdateExpense={(id, p) =>
            runAction(
              () => apiRequest(`/expenses/${id}`, { method: 'PUT', token, body: p }),
              'Expense updated'
            )
          }
        />
      ) : null}

      {activeTab === 'settlements' ? (
        <SettlementsSection
          busy={busy}
          members={members}
          settlements={settlements}
          pendingSuggestions={dashboard.analytics.simplifiedTransactions}
          preparedSuggestion={preparedSuggestion}
          onPrepareSuggestion={prepareSuggestion}
          onCreateSettlement={(p) =>
            runAction(
              () => apiRequest('/settlements', { method: 'POST', token, body: p }),
              'Settlement created'
            )
          }
          onCompleteSettlement={(id) =>
            runAction(
              () => apiRequest(`/settlements/${id}/complete`, { method: 'PATCH', token }),
              'Completed'
            )
          }
          onSendReminder={(id) =>
            runAction(
              () => apiRequest(`/settlements/${id}/remind`, { method: 'POST', token }),
              'Reminder sent'
            )
          }
        />
      ) : null}

      {activeTab === 'recurring' ? (
        <RecurringSection
          busy={busy}
          members={members}
          recurringExpenses={recurringExpenses}
          onCreateRecurringExpense={(p) =>
            runAction(
              () => apiRequest('/recurring', { method: 'POST', token, body: p }),
              'Created'
            )
          }
          onRunRecurringExpenses={() =>
            runAction(
              () => apiRequest('/recurring/run', { method: 'POST', token }),
              'Processed'
            )
          }
          onToggleRecurringExpense={(id) =>
            runAction(
              () => apiRequest(`/recurring/${id}/toggle`, { method: 'PATCH', token }),
              'Updated'
            )
          }
          onUpdateRecurringExpense={(id, p) =>
            runAction(
              () => apiRequest(`/recurring/${id}`, { method: 'PUT', token, body: p }),
              'Updated'
            )
          }
        />
      ) : null}

      {activeTab === 'analytics' ? <AnalyticsPage /> : null}

      {activeTab === 'notifications' ? (
        <NotificationsPanel
          notifications={notifications}
          onMarkRead={(id) =>
            runAction(
              () => apiRequest(`/notifications/${id}/read`, { method: 'PATCH', token }),
              'Notification marked as read'
            )
          }
          onMarkAllRead={() =>
            runAction(
              () => apiRequest('/notifications/read-all', { method: 'PATCH', token }),
              'All notifications marked as read'
            )
          }
        />
      ) : null}

      {activeTab === 'members' ? (
        <MembersPanel
          busy={busy}
          household={household}
          currentUser={user}
        />
      ) : null}

      {activeTab === 'audit' ? <AuditLogPanel auditLogs={auditLogs} /> : null}
    </AppShell>
  );
}