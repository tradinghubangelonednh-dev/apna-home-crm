import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import { Card } from '../shared/Card';
import { formatCurrency } from '../../lib/format';

export function MonthlyTrendChart({ data }) {
  return (
    <Card className="h-[320px] bg-white border border-gray-200 rounded-2xl shadow-sm">
      
      {/* HEADER */}
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
          Expense Trend
        </p>
        <h3 className="text-2xl font-semibold text-gray-900">
          Last 6 months
        </h3>
      </div>

      {/* CHART */}
      <ResponsiveContainer width="100%" height="82%">
        <BarChart data={data}>
          
          {/* GRID */}
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />

          {/* AXIS */}
          <XAxis 
            dataKey="label" 
            stroke="#9CA3AF" 
            fontSize={12}
          />
          <YAxis 
            stroke="#9CA3AF" 
            fontSize={12}
          />

          {/* TOOLTIP */}
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              color: '#111827'
            }}
            formatter={(value) => formatCurrency(value)}
          />

          {/* BAR */}
          <Bar
            dataKey="amount"
            fill="#3B82F6"
            radius={[10, 10, 0, 0]}
          />

        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}