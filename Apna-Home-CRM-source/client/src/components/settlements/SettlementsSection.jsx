import { useEffect, useState } from 'react';
import { BellRing, CheckCircle2, HandCoins, Plus } from 'lucide-react';

import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { EmptyState } from '../shared/EmptyState';
import { Modal } from '../shared/Modal';
import { formatCurrency, formatDate } from '../../lib/format';

function SettlementForm({ members, suggestion, onSubmit, busy }) {
  const [form, setForm] = useState({
    fromUser: suggestion?.from?.id || members[0]?._id || '',
    toUser: suggestion?.to?.id || members[1]?._id || '',
    amount: suggestion?.amount || '',
    dueDate: '',
    notes: ''
  });

  useEffect(() => {
    setForm({
      fromUser: suggestion?.from?.id || members[0]?._id || '',
      toUser: suggestion?.to?.id || members[1]?._id || '',
      amount: suggestion?.amount || '',
      dueDate: '',
      notes: ''
    });
  }, [members, suggestion]);

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          ...form,
          amount: Number(form.amount),
          dueDate: form.dueDate || undefined
        });
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">From</label>
          <select
            className="field"
            value={form.fromUser}
            onChange={(event) => setForm((current) => ({ ...current, fromUser: event.target.value }))}
          >
            {members.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">To</label>
          <select
            className="field"
            value={form.toUser}
            onChange={(event) => setForm((current) => ({ ...current, toUser: event.target.value }))}
          >
            {members.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name}
              </option>
            ))}
          </select>
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
          />
        </div>
        <div>
          <label className="label">Due date</label>
          <input
            className="field"
            type="date"
            value={form.dueDate}
            onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
          />
        </div>
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea
          className="field min-h-[110px]"
          value={form.notes}
          onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
          placeholder="Optional reminder or reference"
        />
      </div>
      <Button className="w-full" disabled={busy} type="submit">
        {busy ? 'Saving...' : 'Create settlement'}
      </Button>
    </form>
  );
}

export function SettlementsSection({
  members,
  settlements,
  pendingSuggestions,
  preparedSuggestion,
  onPrepareSuggestion,
  onCreateSettlement,
  onCompleteSettlement,
  onSendReminder,
  busy
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (preparedSuggestion) {
      setOpen(true);
    }
  }, [preparedSuggestion]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-app-charcoal/55">
            Settlements
          </p>
          <h2 className="mt-2 font-display text-4xl">Track who paid back whom.</h2>
        </div>
        <Button
          onClick={() => {
            onPrepareSuggestion(null);
            setOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New settlement
        </Button>
      </div>

      {pendingSuggestions?.length ? (
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <HandCoins className="h-5 w-5 text-app-teal" />
            <div>
              <p className="font-semibold">Suggested payments</p>
              <p className="text-sm text-app-charcoal/60">
                Based on the simplified debt graph from your current balances.
              </p>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {pendingSuggestions.map((transaction, index) => (
              <div className="rounded-[22px] bg-app-sand/30 p-4" key={`${transaction.from.id}-${index}`}>
                <p className="font-semibold">
                  {transaction.from.name} → {transaction.to.name}
                </p>
                <p className="mt-2 font-display text-2xl text-app-charcoal">
                  {formatCurrency(transaction.amount)}
                </p>
                <Button
                  className="mt-3"
                  size="sm"
                  variant="secondary"
                  onClick={() => onPrepareSuggestion(transaction)}
                >
                  Use in form
                </Button>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {settlements.length ? (
        <div className="space-y-4">
          {settlements.map((settlement) => (
            <Card key={settlement._id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-semibold text-app-charcoal">
                    {settlement.fromUser.name} pays {settlement.toUser.name}
                  </p>
                  <p className="mt-1 text-sm text-app-charcoal/58">
                    {settlement.notes || 'No notes'}
                    {settlement.dueDate ? ` • Due ${formatDate(settlement.dueDate)}` : ''}
                  </p>
                </div>
                <div className="flex flex-col gap-2 lg:items-end">
                  <span className="font-display text-2xl">{formatCurrency(settlement.amount)}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                      settlement.status === 'completed'
                        ? 'bg-app-mint/25 text-app-teal'
                        : 'bg-app-coral/15 text-app-coral'
                    }`}
                  >
                    {settlement.status}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {settlement.status !== 'completed' ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onCompleteSettlement(settlement._id)}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark complete
                  </Button>
                ) : null}
                {settlement.status === 'pending' ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onSendReminder(settlement._id)}
                  >
                    <BellRing className="mr-2 h-4 w-4" />
                    Send reminder
                  </Button>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No settlements yet"
          description="Create a settlement once members start paying each other back."
        />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Create settlement">
        <SettlementForm
          busy={busy}
          members={members}
          suggestion={preparedSuggestion}
          onSubmit={(payload) =>
            onCreateSettlement(payload).then(() => {
              setOpen(false);
            })
          }
        />
      </Modal>
    </div>
  );
}
