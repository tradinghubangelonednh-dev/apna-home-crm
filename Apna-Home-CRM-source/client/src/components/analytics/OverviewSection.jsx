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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-app-charcoal/55">
            Household Snapshot
          </p>
          <h2 className="mt-2 font-display text-4xl text-app-charcoal">Split smarter, settle less.</h2>
          <p className="mt-3 max-w-2xl text-sm text-app-charcoal/62">
            Real-time balances, monthly insight, and debt simplification for your five-member home.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            className="field"
            type="month"
            value={selectedMonth}
            onChange={(event) => onMonthChange(event.target.value)}
          />
          <Button variant="secondary" onClick={onExportCsv}>
            Export CSV
          </Button>
          <Button onClick={onExportPdf}>Export PDF</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={IndianRupee}
          label="Monthly Spend"
          value={formatCurrency(summary.totalMonthlyExpenses)}
          hint="This month’s household total"
        />
        <StatCard
          icon={Wallet}
          label="Outstanding"
          value={formatCurrency(summary.outstandingTotal)}
          tone="alert"
          hint="Net still owed across members"
        />
        <StatCard
          icon={ArrowLeftRight}
          label="Pending Settlements"
          value={formatCurrency(summary.pendingSettlementsAmount)}
          tone="positive"
          hint="Open payment requests"
        />
        <StatCard
          icon={BellDot}
          label="Unread Alerts"
          value={summary.unreadNotifications}
          tone="neutral"
          hint="Expense and reminder notifications"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <MonthlyTrendChart data={analytics.monthlyTrend} />
        <CategoryBreakdownChart data={analytics.categoryBreakdown} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-charcoal/55">
                Contributions
              </p>
              <h3 className="font-display text-2xl">Who paid more this month</h3>
            </div>
          </div>
          <div className="space-y-4">
            {summary.perUserContribution.map((entry) => (
              <div
                className="flex flex-col gap-3 rounded-[22px] border border-app-sand/80 bg-app-sand/30 p-4 md:flex-row md:items-center md:justify-between"
                key={entry.user._id}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-bold text-white"
                    style={{ backgroundColor: entry.user.avatarColor }}
                  >
                    {initials(entry.user.name)}
                  </div>
                  <div>
                    <p className="font-semibold">{entry.user.name}</p>
                    <p className="text-sm text-app-charcoal/58">{entry.user.role}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-app-charcoal/50">Paid</p>
                    <p className="font-semibold">{formatCurrency(entry.paid)}</p>
                  </div>
                  <div>
                    <p className="text-app-charcoal/50">Share</p>
                    <p className="font-semibold">{formatCurrency(entry.share)}</p>
                  </div>
                  <div>
                    <p className="text-app-charcoal/50">Net</p>
                    <p className={entry.difference >= 0 ? 'font-semibold text-app-teal' : 'font-semibold text-app-coral'}>
                      {formatCurrency(entry.difference)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-charcoal/55">
              Debt Simplification
            </p>
            <h3 className="font-display text-2xl">Fewest payments needed</h3>
          </div>
          {analytics.simplifiedTransactions.length ? (
            <div className="space-y-4">
              {analytics.simplifiedTransactions.map((transaction, index) => (
                <div
                  className="rounded-[22px] border border-app-sand/80 bg-white p-4"
                  key={`${transaction.from.id}-${transaction.to.id}-${index}`}
                >
                  <p className="text-sm text-app-charcoal/60">Suggested transfer</p>
                  <p className="mt-1 font-semibold text-app-charcoal">
                    {transaction.from.name} pays {transaction.to.name}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-display text-2xl text-app-teal">
                      {formatCurrency(transaction.amount)}
                    </span>
                    <Button
                      size="sm"
                      variant="secondary"
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
              description="No simplified payments are needed right now."
            />
          )}
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-charcoal/55">
              Outstanding Balances
            </p>
            <h3 className="font-display text-2xl">Net position by member</h3>
          </div>
          <div className="space-y-3">
            {summary.outstandingBalances.map((entry) => (
              <div
                className="flex items-center justify-between rounded-[22px] bg-app-sand/30 px-4 py-3"
                key={entry.user.id}
              >
                <div>
                  <p className="font-semibold">{entry.user.name}</p>
                  <p className="text-sm text-app-charcoal/55">
                    {entry.net >= 0 ? 'Should receive' : 'Needs to pay'}
                  </p>
                </div>
                <span className={entry.net >= 0 ? 'font-semibold text-app-teal' : 'font-semibold text-app-coral'}>
                  {formatCurrency(entry.net)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-charcoal/55">
              Recent Activity
            </p>
            <h3 className="font-display text-2xl">Latest monthly expenses</h3>
          </div>
          {recentExpenses.length ? (
            <div className="space-y-3">
              {recentExpenses.map((expense) => (
                <div
                  className="flex flex-col gap-3 rounded-[22px] border border-app-sand/80 p-4 md:flex-row md:items-center md:justify-between"
                  key={expense._id}
                >
                  <div>
                    <p className="font-semibold">{expense.title || expense.category}</p>
                    <p className="text-sm text-app-charcoal/55">
                      {expense.paidBy.name} paid on {formatDate(expense.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl text-app-charcoal">
                      {formatCurrency(expense.amount)}
                    </p>
                    <p className="text-sm text-app-charcoal/55">{expense.splitType} split</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No expenses yet"
              description="Add the first shared bill to start tracking contributions."
            />
          )}
        </Card>
      </div>
    </div>
  );
}
