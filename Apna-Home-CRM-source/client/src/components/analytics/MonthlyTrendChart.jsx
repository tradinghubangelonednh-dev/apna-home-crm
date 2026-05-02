import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card } from '../shared/Card';
import { formatCurrency } from '../../lib/format';

export function MonthlyTrendChart({ data }) {
  return (
    <Card className="h-[320px]">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-charcoal/55">
          Expense Trend
        </p>
        <h3 className="font-display text-2xl">Last 6 months</h3>
      </div>
      <ResponsiveContainer width="100%" height="82%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eadfc9" />
          <XAxis dataKey="label" stroke="#203135" fontSize={12} />
          <YAxis stroke="#203135" fontSize={12} />
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Bar dataKey="amount" fill="#3d7b80" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
