import { useEffect, useMemo, useState } from 'react';
import { Edit3, Plus, Trash2 } from 'lucide-react';

import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { EmptyState } from '../shared/EmptyState';
import { Modal } from '../shared/Modal';
import { formatCurrency, formatDate } from '../../lib/format';

function buildInitialForm(members, expense) {
  if (expense) {
    return {
      title: expense.title || '',
      amount: expense.amount,
      paidBy: expense.paidBy._id,
      participants: expense.participants.map((participant) => participant._id),
      splitType: expense.splitType,
      exactSplits: expense.splits.map((split) => ({
        user: split.user._id,
        value: split.amount
      })),
      percentageSplits: expense.splits.map((split) => ({
        user: split.user._id,
        value: split.percentage || 0
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
    participants: members.map((member) => member._id),
    splitType: 'equal',
    exactSplits: members.map((member) => ({ user: member._id, value: '' })),
    percentageSplits: members.map((member) => ({
      user: member._id,
      value: Number((100 / Math.max(members.length, 1)).toFixed(2))
    })),
    category: 'food',
    date: new Date().toISOString().slice(0, 10),
    notes: ''
  };
}

function ExpenseForm({ members, expense, onSubmit, busy }) {
  const [form, setForm] = useState(() => buildInitialForm(members, expense));

  useEffect(() => {
    setForm(buildInitialForm(members, expense));
  }, [members, expense]);

  const selectedParticipants = useMemo(
    () => members.filter((member) => form.participants.includes(member._id)),
    [members, form.participants]
  );

  function toggleParticipant(userId) {
    setForm((current) => {
      const participants = current.participants.includes(userId)
        ? current.participants.filter((participant) => participant !== userId)
        : [...current.participants, userId];

      return {
        ...current,
        participants
      };
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      ...form,
      amount: Number(form.amount),
      exactSplits: form.exactSplits
        .filter((entry) => form.participants.includes(entry.user))
        .map((entry) => ({
          user: entry.user,
          value: Number(entry.value)
        })),
      percentageSplits: form.percentageSplits
        .filter((entry) => form.participants.includes(entry.user))
        .map((entry) => ({
          user: entry.user,
          value: Number(entry.value)
        }))
    };

    onSubmit(payload);
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">Expense title</label>
          <input
            className="field"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="Friday grocery run"
          />
        </div>
        <div>
          <label className="label">Amount</label>
          <input
            className="field"
            min="0"
            step="0.01"
            type="number"
            value={form.amount}
            onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
            required
          />
        </div>
        <div>
          <label className="label">Paid by</label>
          <select
            className="field"
            value={form.paidBy}
            onChange={(event) => setForm((current) => ({ ...current, paidBy: event.target.value }))}
          >
            {members.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Category</label>
          <select
            className="field"
            value={form.category}
            onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
          >
            {['food', 'rent', 'electricity', 'misc'].map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Split type</label>
          <select
            className="field"
            value={form.splitType}
            onChange={(event) => setForm((current) => ({ ...current, splitType: event.target.value }))}
          >
            {['equal', 'exact', 'percentage'].map((splitType) => (
              <option key={splitType} value={splitType}>
                {splitType}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Date</label>
          <input
            className="field"
            type="date"
            value={form.date}
            onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
          />
        </div>
      </div>

      <div>
        <label className="label">Participants</label>
        <div className="grid gap-3 md:grid-cols-3">
          {members.map((member) => (
            <label
              className={`rounded-[22px] border px-4 py-3 text-sm transition ${
                form.participants.includes(member._id)
                  ? 'border-app-teal bg-app-mint/25'
                  : 'border-app-sand bg-white'
              }`}
              key={member._id}
            >
              <input
                checked={form.participants.includes(member._id)}
                className="mr-3"
                onChange={() => toggleParticipant(member._id)}
                type="checkbox"
              />
              {member.name}
            </label>
          ))}
        </div>
      </div>

      {form.splitType !== 'equal' ? (
        <div>
          <label className="label">
            {form.splitType === 'exact' ? 'Exact split amounts' : 'Percentage split'}
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            {selectedParticipants.map((member) => {
              const listKey = form.splitType === 'exact' ? 'exactSplits' : 'percentageSplits';
              const entry = form[listKey].find((item) => item.user === member._id) || {
                user: member._id,
                value: ''
              };

              return (
                <div key={member._id}>
                  <span className="mb-2 block text-sm font-medium text-app-charcoal/65">
                    {member.name}
                  </span>
                  <input
                    className="field"
                    min="0"
                    step="0.01"
                    type="number"
                    value={entry.value}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        [listKey]: current[listKey].map((item) =>
                          item.user === member._id
                            ? { ...item, value: event.target.value }
                            : item
                        )
                      }))
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div>
        <label className="label">Notes</label>
        <textarea
          className="field min-h-[110px]"
          value={form.notes}
          onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
          placeholder="Anything useful for the household to remember"
        />
      </div>

      <Button className="w-full" disabled={busy} type="submit">
        {busy ? 'Saving...' : expense ? 'Update expense' : 'Add expense'}
      </Button>
    </form>
  );
}

export function ExpensesSection({
  members,
  expenses,
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-app-charcoal/55">
            Expense History
          </p>
          <h2 className="mt-2 font-display text-4xl">Every bill, searchable.</h2>
        </div>
        <Button
          onClick={() => {
            setEditingExpense(null);
            setOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add expense
        </Button>
      </div>

      <Card>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <input
            className="field"
            placeholder="Search title or note"
            value={filters.search}
            onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })}
          />
          <select
            className="field"
            value={filters.category}
            onChange={(event) => onFiltersChange({ ...filters, category: event.target.value })}
          >
            <option value="">All categories</option>
            {['food', 'rent', 'electricity', 'misc'].map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            className="field"
            value={filters.paidBy}
            onChange={(event) => onFiltersChange({ ...filters, paidBy: event.target.value })}
          >
            <option value="">All payers</option>
            {members.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name}
              </option>
            ))}
          </select>
          <select
            className="field"
            value={filters.splitType}
            onChange={(event) => onFiltersChange({ ...filters, splitType: event.target.value })}
          >
            <option value="">All split types</option>
            {['equal', 'exact', 'percentage'].map((splitType) => (
              <option key={splitType} value={splitType}>
                {splitType}
              </option>
            ))}
          </select>
          <Button
            variant="ghost"
            onClick={() =>
              onFiltersChange({
                search: '',
                category: '',
                paidBy: '',
                splitType: '',
                startDate: '',
                endDate: ''
              })
            }
          >
            Clear filters
          </Button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <input
            className="field"
            type="date"
            value={filters.startDate}
            onChange={(event) => onFiltersChange({ ...filters, startDate: event.target.value })}
          />
          <input
            className="field"
            type="date"
            value={filters.endDate}
            onChange={(event) => onFiltersChange({ ...filters, endDate: event.target.value })}
          />
        </div>
      </Card>

      {expenses.length ? (
        <div className="space-y-4">
          {expenses.map((expense) => (
            <Card className="p-0" key={expense._id}>
              <div className="grid gap-4 px-5 py-5 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.5fr] lg:items-center">
                <div>
                  <p className="font-semibold text-app-charcoal">{expense.title || expense.category}</p>
                  <p className="mt-1 text-sm text-app-charcoal/58">
                    {expense.notes || 'No notes'} • {expense.splitType} split
                  </p>
                </div>
                <div>
                  <p className="text-sm text-app-charcoal/50">Paid by</p>
                  <p className="font-medium">{expense.paidBy.name}</p>
                </div>
                <div>
                  <p className="text-sm text-app-charcoal/50">
                    {formatDate(expense.date)} • {expense.category}
                  </p>
                  <p className="font-display text-2xl text-app-charcoal">
                    {formatCurrency(expense.amount)}
                  </p>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingExpense(expense);
                      setOpen(true);
                    }}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      if (window.confirm('Delete this expense?')) {
                        onDeleteExpense(expense._id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="border-t border-app-sand/70 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-charcoal/45">
                  Participants
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-sm text-app-charcoal/70">
                  {expense.splits.map((split) => (
                    <span
                      className="rounded-full bg-app-sand/45 px-3 py-1.5"
                      key={`${expense._id}-${split.user._id}`}
                    >
                      {split.user.name}: {formatCurrency(split.amount)}
                      {split.percentage ? ` (${split.percentage}%)` : ''}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No matching expenses"
          description="Add an expense or change the filters to see more history."
        />
      )}

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditingExpense(null);
        }}
        title={editingExpense ? 'Edit expense' : 'Add expense'}
      >
        <ExpenseForm
          busy={busy}
          expense={editingExpense}
          members={members}
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
