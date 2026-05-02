import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Plus, RefreshCcw } from 'lucide-react';

import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { EmptyState } from '../shared/EmptyState';
import { Modal } from '../shared/Modal';
import { formatCurrency, formatDate } from '../../lib/format';

function RecurringForm({ members, recurringExpense, onSubmit, busy }) {
  const [form, setForm] = useState({
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
    category: 'rent',
    notes: '',
    dayOfMonth: 1,
    isActive: true
  });

  useEffect(() => {
    if (!recurringExpense) {
      setForm({
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
        category: 'rent',
        notes: '',
        dayOfMonth: 1,
        isActive: true
      });
      return;
    }

    setForm({
      title: recurringExpense.title,
      amount: recurringExpense.amount,
      paidBy: recurringExpense.paidBy._id,
      participants: recurringExpense.participants.map((participant) => participant._id),
      splitType: recurringExpense.splitType,
      exactSplits: recurringExpense.exactSplits?.length
        ? recurringExpense.exactSplits
        : members.map((member) => ({ user: member._id, value: '' })),
      percentageSplits: recurringExpense.percentageSplits?.length
        ? recurringExpense.percentageSplits
        : members.map((member) => ({ user: member._id, value: '' })),
      category: recurringExpense.category,
      notes: recurringExpense.notes,
      dayOfMonth: recurringExpense.dayOfMonth,
      isActive: recurringExpense.isActive
    });
  }, [members, recurringExpense]);

  function toggleParticipant(userId) {
    setForm((current) => ({
      ...current,
      participants: current.participants.includes(userId)
        ? current.participants.filter((participant) => participant !== userId)
        : [...current.participants, userId]
    }));
  }

  const selectedParticipants = useMemo(
    () => members.filter((member) => form.participants.includes(member._id)),
    [members, form.participants]
  );

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          ...form,
          amount: Number(form.amount),
          dayOfMonth: Number(form.dayOfMonth),
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
        });
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">Title</label>
          <input
            className="field"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            required
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
          <label className="label">Day of month</label>
          <input
            className="field"
            max="31"
            min="1"
            type="number"
            value={form.dayOfMonth}
            onChange={(event) => setForm((current) => ({ ...current, dayOfMonth: event.target.value }))}
          />
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
        />
      </div>

      <Button className="w-full" disabled={busy} type="submit">
        {busy ? 'Saving...' : recurringExpense ? 'Update recurring expense' : 'Create recurring expense'}
      </Button>
    </form>
  );
}

export function RecurringSection({
  members,
  recurringExpenses,
  onCreateRecurringExpense,
  onUpdateRecurringExpense,
  onToggleRecurringExpense,
  onRunRecurringExpenses,
  busy
}) {
  const [open, setOpen] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-app-charcoal/55">
            Recurring Expenses
          </p>
          <h2 className="mt-2 font-display text-4xl">Automate rent, bills, and repeats.</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={onRunRecurringExpenses}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Run due now
          </Button>
          <Button
            onClick={() => {
              setEditingRecurring(null);
              setOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add recurring
          </Button>
        </div>
      </div>

      {recurringExpenses.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {recurringExpenses.map((expense) => (
            <Card key={expense._id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-app-teal" />
                    <p className="font-semibold">{expense.title}</p>
                  </div>
                  <p className="mt-2 text-sm text-app-charcoal/58">{expense.notes || 'No notes'}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                    expense.isActive ? 'bg-app-mint/25 text-app-teal' : 'bg-app-coral/15 text-app-coral'
                  }`}
                >
                  {expense.isActive ? 'active' : 'paused'}
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-app-charcoal/50">Amount</p>
                  <p className="font-display text-2xl">{formatCurrency(expense.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-app-charcoal/50">Next run</p>
                  <p className="font-semibold">{formatDate(expense.nextRunAt)}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setEditingRecurring(expense);
                    setOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onToggleRecurringExpense(expense._id)}
                >
                  {expense.isActive ? 'Pause' : 'Resume'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No recurring templates"
          description="Create monthly rent or utility rules so the app can add them automatically."
        />
      )}

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditingRecurring(null);
        }}
        title={editingRecurring ? 'Edit recurring expense' : 'Create recurring expense'}
      >
        <RecurringForm
          busy={busy}
          members={members}
          recurringExpense={editingRecurring}
          onSubmit={(payload) => {
            const action = editingRecurring
              ? onUpdateRecurringExpense(editingRecurring._id, payload)
              : onCreateRecurringExpense(payload);
            action.then(() => {
              setOpen(false);
              setEditingRecurring(null);
            });
          }}
        />
      </Modal>
    </div>
  );
}
