import { useMemo, useState } from 'react';

import { Card } from '../components/shared/Card';
import { formatCurrency, formatDate } from '../lib/format';

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function getExpenseMonth(date) {
  return new Date(date).toISOString().slice(0, 7);
}

export function StatementPage({ expenses = [] }) {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  const filteredExpenses = useMemo(
    () =>
      expenses.filter(
        (expense) => getExpenseMonth(expense.date) === selectedMonth
      ),
    [expenses, selectedMonth]
  );

  const totalAmount = useMemo(
    () =>
      filteredExpenses.reduce(
        (total, expense) => total + Number(expense.amount || 0),
        0
      ),
    [filteredExpenses]
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
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

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
            Select Month
          </label>

          <input
            type="month"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
            Records
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {filteredExpenses.length}
          </h2>
        </Card>

        <Card className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
            Total Amount
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {formatCurrency(totalAmount)}
          </h2>
        </Card>
      </div>

      {/* TABLE */}
      <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
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
              {filteredExpenses.length ? (
                filteredExpenses.map((expense) => (
                  <tr
                    key={expense._id}
                    className="border-b border-gray-100 transition hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-600">
                      {formatDate(expense.date)}
                    </td>

                    <td className="px-6 py-5">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {expense.title || 'Untitled expense'}
                        </p>

                        {expense.notes ? (
                          <p className="mt-1 text-xs text-gray-500">
                            {expense.notes}
                          </p>
                        ) : null}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-6 py-5 text-sm font-medium text-gray-700">
                      {expense.paidBy?.name || 'Unknown'}
                    </td>

                    <td className="whitespace-nowrap px-6 py-5">
                      <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-teal-700">
                        {expense.category}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-6 py-5 text-right font-bold text-gray-900">
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
                    No expense history available for this month.
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