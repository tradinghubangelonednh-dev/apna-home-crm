import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

import { Card } from '../shared/Card';
import { formatCurrency } from '../../lib/format';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export function CategoryBreakdownChart({ data }) {
  return (
    <Card className="h-[320px] bg-white border border-gray-200 rounded-2xl shadow-sm">

      {/* HEADER */}
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
          Category Split
        </p>
        <h3 className="text-2xl font-semibold text-gray-900">
          Monthly categories
        </h3>
      </div>

      {/* CHART */}
      <ResponsiveContainer width="100%" height="82%">
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="category"
            innerRadius={58}
            outerRadius={92}
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.category}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              color: '#111827'
            }}
            formatter={(value) => formatCurrency(value)}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* LEGEND */}
      <div className="mt-2 flex flex-wrap gap-3 text-xs font-medium text-gray-600">
        {data.map((entry, index) => (
          <div className="flex items-center gap-2" key={entry.category}>
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-gray-700">
              {entry.category}
            </span>
          </div>
        ))}
      </div>

    </Card>
  );
}