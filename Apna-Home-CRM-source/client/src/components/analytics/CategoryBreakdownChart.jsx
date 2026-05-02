import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { Card } from '../shared/Card';
import { formatCurrency } from '../../lib/format';

const COLORS = ['#3d7b80', '#d9ae5f', '#97c8a8', '#ea866f'];

export function CategoryBreakdownChart({ data }) {
  return (
    <Card className="h-[320px]">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-charcoal/55">
          Category Split
        </p>
        <h3 className="font-display text-2xl">Monthly categories</h3>
      </div>
      <ResponsiveContainer width="100%" height="82%">
        <PieChart>
          <Pie data={data} dataKey="amount" nameKey="category" innerRadius={58} outerRadius={92}>
            {data.map((entry, index) => (
              <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatCurrency(value)} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap gap-3 text-xs font-medium text-app-charcoal/70">
        {data.map((entry, index) => (
          <div className="flex items-center gap-2" key={entry.category}>
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            {entry.category}
          </div>
        ))}
      </div>
    </Card>
  );
}
