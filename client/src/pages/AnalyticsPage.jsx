import { Card } from '../components/shared/Card';

import { MonthlyTrendChart } from '../components/analytics/MonthlyTrendChart';
import { CategoryBreakdownChart } from '../components/analytics/CategoryBreakdownChart';

const monthlyTrend = [];

const categoryBreakdown = [];

export function AnalyticsPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Analytics Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          Visual insights of your household expenses
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* EXPENSE TREND */}
        <Card className="p-6 rounded-2xl shadow-sm border border-gray-100 bg-white">

          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Expense Trend (Last 6 months)
          </h2>

          <MonthlyTrendChart data={monthlyTrend} />

        </Card>

        {/* CATEGORY SPLIT */}
        <Card className="p-6 rounded-2xl shadow-sm border border-gray-100 bg-white">

          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Category Breakdown
          </h2>

          <CategoryBreakdownChart data={categoryBreakdown} />

        </Card>

      </div>

    </div>
  );
}