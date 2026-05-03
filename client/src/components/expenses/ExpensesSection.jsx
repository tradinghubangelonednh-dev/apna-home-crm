import { useEffect, useMemo, useState } from 'react';
import { Edit3, Plus, Trash2 } from 'lucide-react';

import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { EmptyState } from '../shared/EmptyState';
import { Modal } from '../shared/Modal';
import { formatCurrency, formatDate } from '../../lib/format';

/* ---------------------- GLOBAL STYLES ---------------------- */

const inputClass =
  'w-full rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] px-4 py-3 text-sm font-medium text-[#111827] outline-none transition focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20';

const labelClass =
  'text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]';

/* ---------------------- FORM BUILDER ---------------------- */

function buildInitialForm(members, expense) {
  if (expense) {
    return {
      title: expense.title || '',
      amount: expense.amount,
      paidBy: expense.paidBy._id,
      participants: expense.participants.map((p) => p._id),
      splitType: expense.splitType,
      exactSplits: expense.splits.map((s) => ({
        user: s.user._id,
        value: s.amount
      })),
      percentageSplits: expense.splits.map((s) => ({
        user: s.user._id,
        value: s.percentage || 0
      })),
      category: expense.category,
      date: new Date(expense.date).toISOString().slice(0, 10),
      notes: expense.notes || ''
    };
  }

  return {
    title: '',
    amount: '',
    paidBy: members[0]?._id || '',
    participants: members.map((m) => m._id),
    splitType: 'equal',
    exactSplits: members.map((m) => ({ user: m._id, value: '' })),
    percentageSplits: members.map((m) => ({
      user: m._id,
      value: Number((100 / Math.max(members.length, 1)).toFixed(2))
    })),
    category: 'food',
    date: new Date().toISOString().slice(0, 10),
    notes: ''
  };
}

/* ---------------------- FORM ---------------------- */

function ExpenseForm({ members, expense, onSubmit, busy }) {
  const [form, setForm] = useState(() => buildInitialForm(members, expense));

  useEffect(() => {
    setForm(buildInitialForm(members, expense));
  }, [members, expense]);

  const selectedParticipants = useMemo(
    () => members.filter((m) => form.participants.includes(m._id)),
    [members, form.participants]
  );

  function toggleParticipant(userId) {
    setForm((prev) => {
      const exists = prev.participants.includes(userId);
      return {
        ...prev,
        participants: exists
          ? prev.participants.filter((id) => id !== userId)
          : [...prev.participants, userId]
      };
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      ...form,
      amount: Number(form.amount),
      exactSplits: form.exactSplits.map((e) => ({
        user: e.user,
        value: Number(e.value)
      })),
      percentageSplits: form.percentageSplits.map((e) => ({
        user: e.user,
        value: Number(e.value)
      }))
    };

    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* TITLE + AMOUNT */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Expense Title</label>
          <input className={inputClass}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>

        <div>
          <label className={labelClass}>Amount</label>
          <input type="number" className={inputClass}
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        </div>

        <div>
          <label className={labelClass}>Paid By</label>
          <select className={inputClass}
            value={form.paidBy}
            onChange={(e) => setForm({ ...form, paidBy: e.target.value })}>
            {members.map((m) => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Category</label>
          <select className={inputClass}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {['food', 'rent', 'electricity', 'misc'].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Split Type</label>
          <select className={inputClass}
            value={form.splitType}
            onChange={(e) => setForm({ ...form, splitType: e.target.value })}>
            {['equal', 'exact', 'percentage'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Date</label>
          <input type="date" className={inputClass}
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
      </div>

      {/* PARTICIPANTS */}
      <div>
        <label className={labelClass}>Participants</label>

        <div className="grid gap-3 md:grid-cols-3 mt-2">
          {members.map((m) => (
            <label
              key={m._id}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer ${
                form.participants.includes(m._id)
                  ? 'border-[#10B981] bg-[#ECFDF5]'
                  : 'border-[#E5E7EB] bg-white'
              }`}
            >
              <input
                type="checkbox"
                checked={form.participants.includes(m._id)}
                onChange={() => toggleParticipant(m._id)}
                className="accent-[#10B981]"
              />
              {m.name}
            </label>
          ))}
        </div>
      </div>

      {/* SPLITS */}
      {form.splitType !== 'equal' && (
        <div>
          <label className={labelClass}>
            {form.splitType === 'exact' ? 'Exact Split' : 'Percentage Split'}
          </label>

          <div className="grid gap-4 md:grid-cols-2 mt-2">
            {selectedParticipants.map((m) => {
              const key =
                form.splitType === 'exact'
                  ? 'exactSplits'
                  : 'percentageSplits';

              const entry =
                form[key].find((i) => i.user === m._id) || {
                  user: m._id,
                  value: ''
                };

              return (
                <div key={m._id}>
                  <p className="text-sm font-medium mb-1">{m.name}</p>
                  <input
                    className={inputClass}
                    type="number"
                    value={entry.value}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        [key]: prev[key].map((i) =>
                          i.user === m._id
                            ? { ...i, value: e.target.value }
                            : i
                        )
                      }))
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* NOTES */}
      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          className={`${inputClass} min-h-[110px]`}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>

      {/* BUTTON */}
      <button className="w-full h-12 bg-[#10B981] text-white rounded-xl font-semibold">
        {busy ? 'Saving...' : expense ? 'Update Expense' : 'Add Expense'}
      </button>

    </form>
  );
}

/* ---------------------- MAIN SECTION ---------------------- */

export function ExpensesSection({
  members = [],
  expenses = [],
  filters,
  onFiltersChange,
  onCreateExpense,
  onUpdateExpense,
  onDeleteExpense,
  busy
}) {
  const [open, setOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between">
        <h2 className="text-3xl font-bold">Expenses</h2>

        <Button onClick={() => { setEditingExpense(null); setOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* FILTERS */}
      <Card className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <input className={inputClass} placeholder="Search..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })} />

        <select className={inputClass}
          value={filters.category}
          onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}>
          <option value="">Category</option>
          {['food', 'rent', 'electricity', 'misc'].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select className={inputClass}
          value={filters.paidBy}
          onChange={(e) => onFiltersChange({ ...filters, paidBy: e.target.value })}>
          <option value="">Paid By</option>
          {members.map((m) => (
            <option key={m._id} value={m._id}>{m.name}</option>
          ))}
        </select>

        <select className={inputClass}
          value={filters.splitType}
          onChange={(e) => onFiltersChange({ ...filters, splitType: e.target.value })}>
          <option value="">Split Type</option>
          {['equal', 'exact', 'percentage'].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </Card>

      {/* LIST */}
      {expenses.length ? (
        <div className="space-y-4">
          {expenses.map((expense) => (
            <Card key={expense._id}>
              <p className="font-semibold">{expense.title}</p>

              <div className="flex justify-between mt-2">
                <span>{expense.paidBy.name}</span>
                <span>{formatCurrency(expense.amount)}</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No expenses" description="Add one" />
      )}

      {/* MODAL */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <ExpenseForm
          members={members}
          expense={editingExpense}
          busy={busy}
          onSubmit={(payload) => {
            const action = editingExpense
              ? onUpdateExpense(editingExpense._id, payload)
              : onCreateExpense(payload);

            action.then(() => {
              setOpen(false);
              setEditingExpense(null);
            });
          }}
        />
      </Modal>

    </div>
  );
}