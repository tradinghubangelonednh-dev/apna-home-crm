import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

import { Card } from './Card';

export function StatCard({ icon: Icon, label, value, tone = 'neutral', hint }) {
  const toneStyles = {
    neutral: 'bg-app-charcoal/8 text-app-charcoal',
    positive: 'bg-app-mint/25 text-app-teal',
    alert: 'bg-app-coral/18 text-app-coral'
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-charcoal/55">
            {label}
          </p>
          <p className="mt-3 font-display text-3xl text-app-charcoal">{value}</p>
          {hint ? <p className="mt-2 text-sm text-app-charcoal/60">{hint}</p> : null}
        </div>
        <div className={`rounded-2xl p-3 ${toneStyles[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-app-charcoal/45">
        {tone === 'positive' ? <ArrowUpCircle className="h-4 w-4" /> : <ArrowDownCircle className="h-4 w-4" />}
        Live household snapshot
      </div>
    </Card>
  );
}
