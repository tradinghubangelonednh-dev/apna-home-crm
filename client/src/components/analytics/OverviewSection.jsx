import { ArrowLeftRight, BellDot, IndianRupee, Wallet } from 'lucide-react';

import { CategoryBreakdownChart } from './CategoryBreakdownChart';
import { MonthlyTrendChart } from './MonthlyTrendChart';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { EmptyState } from '../shared/EmptyState';
import { StatCard } from '../shared/StatCard';
import { formatCurrency, formatDate, initials } from '../../lib/format';

export function OverviewSection({
  dashboard,
  selectedMonth,
  onMonthChange,
  onPrepareSettlement,
  onExportCsv,
  onExportPdf
}) {
  const { summary, analytics, recentExpenses } = dashboard;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            Household Snapshot
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            Split smarter, settle less.
          </h2>

          <p className="mt-2 text-sm text-gray-500 max-w-2xl">
            Real-time balances, monthly insights, and debt simplification.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">

          <input
            className="px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900"
            type="month"
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
          />

          <Button variant="secondary" className="bg-gray-100 text-gray-900">
            Export CSV
          </Button>

          <Button className="bg-emerald-500 text-white hover:bg-emerald-600">
            Export PDF
          </Button>

        </div>
      </div>

      {/* STATS */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={IndianRupee}
          label="Monthly Spend"
          value={formatCurrency(summary.totalMonthlyExpenses)}
          hint="This month total"
        />

        <StatCard
          icon={Wallet}
          label="Outstanding"
          value={formatCurrency(summary.outstandingTotal)}
          tone="alert"
          hint="Money pending"
        />

        <StatCard
          icon={ArrowLeftRight}
          label="Pending Settlements"
          value={formatCurrency(summary.pendingSettlementsAmount)}
          tone="positive"
          hint="Open payments"
        />

        <StatCard
          icon={BellDot}
          label="Unread Alerts"
          value={summary.unreadNotifications}
          tone="neutral"
          hint="Notifications"
        />

      </div>

      {/* CHARTS */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <MonthlyTrendChart data={analytics.monthlyTrend} />
        <CategoryBreakdownChart data={analytics.categoryBreakdown} />
      </div>

      {/* CONTRIBUTIONS + DEBT */}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">

        {/* CONTRIBUTIONS */}
        <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm">

          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Contributions
            </p>
            <h3 className="text-xl font-bold text-gray-900">
              Who paid more this month
            </h3>
          </div>

          <div className="space-y-4">

            {summary.perUserContribution.map((entry) => (
              <div
                key={entry.user._id}
                className="flex flex-col md:flex-row md:justify-between gap-3 p-4 rounded-2xl border border-gray-100 bg-gray-50"
              >

                <div className="flex items-center gap-3">

                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: entry.user.avatarColor }}
                  >
                    {initials(entry.user.name)}
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900">
                      {entry.user.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {entry.user.role}
                    </p>
                  </div>

                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">

                  <div>
                    <p className="text-gray-400">Paid</p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(entry.paid)}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400">Share</p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(entry.share)}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400">Net</p>
                    <p className={`font-semibold ${entry.difference >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {formatCurrency(entry.difference)}
                    </p>
                  </div>

                </div>

              </div>
            ))}

          </div>

        </Card>

        {/* DEBT SIMPLIFICATION */}
        <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm">

          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Debt Simplification
            </p>
            <h3 className="text-xl font-bold text-gray-900">
              Fewest payments needed
            </h3>
          </div>

          {analytics.simplifiedTransactions.length ? (
            <div className="space-y-4">

              {analytics.simplifiedTransactions.map((transaction, index) => (
                <div
                  key={`${transaction.from.id}-${transaction.to.id}-${index}`}
                  className="p-4 border border-gray-100 rounded-2xl bg-gray-50"
                >

                  <p className="text-sm text-gray-500">
                    Suggested transfer
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {transaction.from.name} pays {transaction.to.name}
                  </p>

                  <div className="mt-3 flex items-center justify-between">

                    <span className="text-2xl font-bold text-emerald-600">
                      {formatCurrency(transaction.amount)}
                    </span>

                    <Button
                      size="sm"
                      className="bg-gray-900 text-white"
                      onClick={() => onPrepareSettlement(transaction)}
                    >
                      Create Settlement
                    </Button>

                  </div>

                </div>
              ))}

            </div>
          ) : (
            <EmptyState
              title="All clear"
              description="No payments needed right now."
            />
          )}

        </Card>

      </div>

      {/* RECENT ACTIVITY */}
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">

        <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm">

          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Outstanding Balances
          </h3>

          <div className="space-y-3">

            {summary.outstandingBalances.map((entry) => (
              <div
                key={entry.user.id}
                className="flex justify-between p-3 rounded-xl bg-gray-50"
              >

                <div>
                  <p className="font-semibold text-gray-900">
                    {entry.user.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {entry.net >= 0 ? 'Should receive' : 'Needs to pay'}
                  </p>
                </div>

                <span className={`font-semibold ${entry.net >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {formatCurrency(entry.net)}
                </span>

              </div>
            ))}

          </div>

        </Card>

        <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm">

          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Recent Activity
          </h3>

          {recentExpenses.length ? (
            <div className="space-y-3">

              {recentExpenses.map((expense) => (
                <div
                  key={expense._id}
                  className="p-4 rounded-xl border border-gray-100 bg-gray-50"
                >

                  <p className="font-semibold text-gray-900">
                    {expense.title || expense.category}
                  </p>

                  <p className="text-sm text-gray-500">
                    {expense.paidBy.name} • {formatDate(expense.date)}
                  </p>

                  <p className="mt-2 font-bold text-gray-900">
                    {formatCurrency(expense.amount)}
                  </p>

                </div>
              ))}

            </div>
          ) : (
            <EmptyState
              title="No expenses yet"
              description="Add your first expense to start tracking."
            />
          )}

        </Card>

      </div>

    </div>
  );
}