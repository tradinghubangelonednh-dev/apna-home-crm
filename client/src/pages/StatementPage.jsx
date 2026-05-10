import { Card } from '../components/shared/Card';
import { formatCurrency, formatDate } from '../lib/format';

export function StatementPage({ expenses = [] }) {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
          Financial Statement
        </p>

        <h1 className="mt-2 text-4xl font-bold text-gray-900">
          Expense History
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Complete household expense records and transaction timeline.
        </p>
      </div>

      {/* TABLE */}
      <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Date
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Expense
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Paid By
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Category
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody>
              {expenses.length ? (
                expenses.map((expense) => (
                  <tr
                    key={expense._id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-5 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(expense.date)}
                    </td>

                    <td className="px-6 py-5">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {expense.title}
                        </p>

                        {expense.notes ? (
                          <p className="mt-1 text-xs text-gray-500">
                            {expense.notes}
                          </p>
                        ) : null}
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm font-medium text-gray-700 whitespace-nowrap">
                      {expense.paidBy?.name || 'Unknown'}
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-teal-700">
                        {expense.category}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-right font-bold text-gray-900 whitespace-nowrap">
                      {formatCurrency(expense.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-14 text-center text-sm text-gray-500"
                  >
                    No expense history available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}