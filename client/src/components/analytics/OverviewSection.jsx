import { ArrowLeftRight, BellDot, IndianRupee, Wallet } from 'lucide-react';

import { Card } from '../shared/Card';
import { EmptyState } from '../shared/EmptyState';
import { StatCard } from '../shared/StatCard';
import { formatCurrency, formatDate, initials } from '../../lib/format';

export function OverviewSection({
  dashboard,
  onPrepareSettlement
}) {
  const { summary, analytics, recentExpenses } = dashboard;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#374151]">
            Household Snapshot
          </p>

          <h2 className="mt-2 text-3xl font-bold text-[#111827]">
            Split smarter, settle less.
          </h2>

          <p className="mt-2 text-sm text-[#6B7280] max-w-2xl">
            Real-time balances, monthly insights, and debt simplification.
          </p>
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

      {/* CONTRIBUTIONS + DEBT */}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">

        {/* CONTRIBUTIONS */}
        <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm">

          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#374151]">
              Contributions
            </p>

            <h3 className="text-xl font-bold text-[#111827]">
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
                    <p className="font-semibold text-[#111827]">
                      {entry.user.name}
                    </p>

                    <p className="text-sm text-[#6B7280]">
                      {entry.user.role}
                    </p>
                  </div>

                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">

                  <div>
                    <p className="text-[#6B7280] font-medium">
                      Paid
                    </p>

                    <p className="font-bold text-[#111827] text-base">
                      {formatCurrency(entry.paid)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[#6B7280] font-medium">
                      Share
                    </p>

                    <p className="font-bold text-[#111827] text-base">
                      {formatCurrency(entry.share)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[#6B7280] font-medium">
                      Balance
                    </p>

                    <p
                      className={`font-bold text-base ${
                        entry.difference >= 0
                          ? 'text-emerald-600'
                          : 'text-red-500'
                      }`}
                    >
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
            <p className="text-xs font-semibold uppercase tracking-widest text-[#374151]">
              Debt Simplification
            </p>

            <h3 className="text-xl font-bold text-[#111827]">
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

                  <p className="text-sm font-medium text-[#6B7280]">
                    Suggested transfer
                  </p>

                  <p className="mt-1 font-semibold text-[#111827]">
                    {transaction.from.name} pays {transaction.to.name}
                  </p>

                  <div className="mt-3 flex items-center justify-between">

                    <span className="text-2xl font-bold text-emerald-600">
                      {formatCurrency(transaction.amount)}
                    </span>

                    <button
                      className="px-4 py-2 rounded-xl bg-gray-900 text-white font-semibold"
                      onClick={() => onPrepareSettlement(transaction)}
                    >
                      Create Settlement
                    </button>

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

      {/* OUTSTANDING + RECENT */}
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">

        <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm">

          <h3 className="text-xl font-bold text-[#111827] mb-4">
            Outstanding Balances
          </h3>

          <div className="space-y-3">

            {summary.outstandingBalances.map((entry) => (
              <div
                key={entry.user.id}
                className="flex justify-between p-3 rounded-xl bg-gray-50"
              >

                <div>
                  <p className="font-semibold text-[#111827]">
                    {entry.user.name}
                  </p>

                  <p className="text-sm text-[#6B7280]">
                    {entry.net >= 0
                      ? 'Should receive'
                      : 'Needs to pay'}
                  </p>
                </div>

                <span
                  className={`font-bold text-base ${
                    entry.net >= 0
                      ? 'text-emerald-600'
                      : 'text-red-500'
                  }`}
                >
                  {formatCurrency(entry.net)}
                </span>

              </div>
            ))}

          </div>

        </Card>

        <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm">

          <h3 className="text-xl font-bold text-[#111827] mb-4">
            Recent Activity
          </h3>

          {recentExpenses.length ? (
            <div className="space-y-3">

              {recentExpenses.map((expense) => (
                <div
                  key={expense._id}
                  className="p-4 rounded-xl border border-gray-100 bg-gray-50"
                >

                  <p className="font-semibold text-[#111827]">
                    {expense.title || expense.category}
                  </p>

                  <p className="text-sm text-[#6B7280]">
                    {expense.paidBy.name} • {formatDate(expense.date)}
                  </p>

                  <p className="mt-2 text-lg font-bold text-[#111827]">
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