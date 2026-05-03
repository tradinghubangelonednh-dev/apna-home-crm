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

// NEW IMPORT
import { AnalyticsPage } from './AnalyticsPage';

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
    if (!socket) {
      return undefined;
    }

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

      if (successMessage) {
        setNotice('success', successMessage);
      }

      return result;
    } catch (error) {
      setNotice('error', error.message);
      throw error;
    } finally {
      setBusy(false);
    }
  }

  const members =
    household?.members || dashboard?.members || [];

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

    if (moveToSettlements) {
      setActiveTab('settlements');
    }
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
            downloadFile(
              `/export/expenses.csv${buildQuery(filters)}`,
              token,
              'apna-home-expenses.csv'
            )
              .then(() =>
                setNotice('success', 'CSV export downloaded')
              )
              .catch((error) =>
                setNotice('error', error.message)
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
              .then(() =>
                setNotice('success', 'PDF export downloaded')
              )
              .catch((error) =>
                setNotice('error', error.message)
              )
          }
          onMonthChange={setSelectedMonth}
          onPrepareSettlement={(suggestion) => {
            prepareSuggestion(suggestion, true);
          }}
          selectedMonth={selectedMonth}
        />
      ) : null}

      {activeTab === 'expenses' ? (
        <ExpensesSection
          busy={busy}
          expenses={expenses}
          filters={filters}
          members={members}
          onCreateExpense={(payload) =>
            runAction(
              () =>
                apiRequest('/expenses', {
                  method: 'POST',
                  token,
                  body: payload
                }),
              'Expense added'
            )
          }
          onDeleteExpense={(expenseId) =>
            runAction(
              () =>
                apiRequest(`/expenses/${expenseId}`, {
                  method: 'DELETE',
                  token
                }),
              'Expense deleted'
            )
          }
          onFiltersChange={setFilters}
          onUpdateExpense={(expenseId, payload) =>
            runAction(
              () =>
                apiRequest(`/expenses/${expenseId}`, {
                  method: 'PUT',
                  token,
                  body: payload
                }),
              'Expense updated'
            )
          }
        />
      ) : null}

      {activeTab === 'settlements' ? (
        <SettlementsSection
          busy={busy}
          members={members}
          onCompleteSettlement={(settlementId) =>
            runAction(
              () =>
                apiRequest(
                  `/settlements/${settlementId}/complete`,
                  {
                    method: 'PATCH',
                    token
                  }
                ),
              'Settlement marked as completed'
            )
          }
          onCreateSettlement={(payload) =>
            runAction(
              () =>
                apiRequest('/settlements', {
                  method: 'POST',
                  token,
                  body: payload
                }),
              'Settlement created'
            ).then((result) => {
              setPreparedSuggestion(null);
              return result;
            })
          }
          onSendReminder={(settlementId) =>
            runAction(
              () =>
                apiRequest(`/settlements/${settlementId}/remind`, {
                  method: 'POST',
                  token
                }),
              'Reminder sent'
            )
          }
          pendingSuggestions={
            dashboard.analytics.simplifiedTransactions
          }
          onPrepareSuggestion={(suggestion) =>
            prepareSuggestion(suggestion)
          }
          preparedSuggestion={preparedSuggestion}
          settlements={settlements}
        />
      ) : null}

      {activeTab === 'recurring' ? (
        <RecurringSection
          busy={busy}
          members={members}
          onCreateRecurringExpense={(payload) =>
            runAction(
              () =>
                apiRequest('/recurring', {
                  method: 'POST',
                  token,
                  body: payload
                }),
              'Recurring expense created'
            )
          }
          onRunRecurringExpenses={() =>
            runAction(
              () =>
                apiRequest('/recurring/run', {
                  method: 'POST',
                  token
                }),
              'Due recurring expenses processed'
            )
          }
          onToggleRecurringExpense={(recurringId) =>
            runAction(
              () =>
                apiRequest(`/recurring/${recurringId}/toggle`, {
                  method: 'PATCH',
                  token
                }),
              'Recurring status updated'
            )
          }
          onUpdateRecurringExpense={(recurringId, payload) =>
            runAction(
              () =>
                apiRequest(`/recurring/${recurringId}`, {
                  method: 'PUT',
                  token,
                  body: payload
                }),
              'Recurring expense updated'
            )
          }
          recurringExpenses={recurringExpenses}
        />
      ) : null}

      {/* NEW ANALYTICS SECTION */}
      {activeTab === 'analytics' ? (
        <AnalyticsPage />
      ) : null}

      {activeTab === 'notifications' ? (
        <NotificationsPanel
          notifications={notifications}
          onMarkAllRead={() =>
            runAction(
              () =>
                apiRequest('/notifications/read-all', {
                  method: 'PATCH',
                  token
                }),
              'All notifications marked as read'
            )
          }
          onMarkRead={(notificationId) =>
            runAction(
              () =>
                apiRequest(
                  `/notifications/${notificationId}/read`,
                  {
                    method: 'PATCH',
                    token
                  }
                ),
              'Notification marked as read'
            )
          }
        />
      ) : null}

      {activeTab === 'members' ? (
        <MembersPanel
          busy={busy}
          currentUser={user}
          household={household}
          onAddMember={(payload) =>
            runAction(
              () =>
                apiRequest('/household/members', {
                  method: 'POST',
                  token,
                  body: payload
                }),
              'Member added'
            )
          }
          onUpdateRole={(memberId, role) =>
            runAction(
              () =>
                apiRequest(
                  `/household/members/${memberId}/role`,
                  {
                    method: 'PATCH',
                    token,
                    body: { role }
                  }
                ),
              'Role updated'
            )
          }
        />
      ) : null}

      {activeTab === 'audit' ? (
        <AuditLogPanel auditLogs={auditLogs} />
      ) : null}
    </AppShell>
  );
}