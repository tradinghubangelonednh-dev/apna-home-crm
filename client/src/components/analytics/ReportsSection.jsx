import { Button } from '../shared/Button';
import { Card } from '../shared/Card';

export function ReportsSection({
  selectedMonth,
  onMonthChange,
  onExportCsv,
  onExportPdf
}) {
  return (
    <div className="space-y-6">

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#374151]">
          Reports Center
        </p>

        <h2 className="mt-2 text-3xl font-bold text-[#111827]">
          Export your household reports.
        </h2>

        <p className="mt-2 text-sm text-[#6B7280] max-w-2xl">
          Download monthly reports in CSV or PDF format.
        </p>
      </div>

      <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">

        <div className="flex flex-col gap-4 md:flex-row md:items-center">

          <input
            className="px-4 py-3 rounded-xl border border-gray-200 bg-white text-[#111827] font-medium"
            type="month"
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
          />

          <Button
            variant="secondary"
            className="bg-gray-100 text-[#111827] font-semibold"
            onClick={onExportCsv}
          >
            Export CSV
          </Button>

          <Button
            className="bg-emerald-500 text-white hover:bg-emerald-600 font-semibold"
            onClick={onExportPdf}
          >
            Export PDF
          </Button>

        </div>

      </Card>

    </div>
  );
}