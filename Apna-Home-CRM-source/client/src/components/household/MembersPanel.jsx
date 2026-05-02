import { useState } from 'react';
import { Shield, UserPlus } from 'lucide-react';

import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { formatDate, initials } from '../../lib/format';

export function MembersPanel({ household, currentUser, onAddMember, onUpdateRole, busy }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member'
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-app-charcoal/55">
          Household
        </p>
        <h2 className="mt-2 font-display text-4xl">{household?.name || 'Your home'}</h2>
        <p className="mt-3 text-sm text-app-charcoal/62">{household?.description}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-charcoal/55">
                Members
              </p>
              <h3 className="font-display text-2xl">5-person home roster</h3>
            </div>
            <span className="rounded-full bg-app-sand px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-app-charcoal/55">
              {household?.members?.length || 0}/{household?.memberLimit || 5}
            </span>
          </div>
          <div className="space-y-4">
            {household?.members?.map((member) => (
              <div
                className="flex flex-col gap-4 rounded-[22px] border border-app-sand/80 p-4 md:flex-row md:items-center md:justify-between"
                key={member._id}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl font-bold text-white"
                    style={{ backgroundColor: member.avatarColor }}
                  >
                    {initials(member.name)}
                  </div>
                  <div>
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-sm text-app-charcoal/58">
                      {member.email} • Joined {formatDate(member.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-app-sand/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-app-charcoal/55">
                    {member.role}
                  </span>
                  {currentUser.role === 'admin' ? (
                    <select
                      className="field max-w-[140px]"
                      value={member.role}
                      onChange={(event) => onUpdateRole(member._id, event.target.value)}
                      disabled={busy}
                    >
                      <option value="admin">admin</option>
                      <option value="member">member</option>
                    </select>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {currentUser.role === 'admin' ? (
          <Card>
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-app-mint/25 p-3 text-app-teal">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-charcoal/55">
                  Admin tools
                </p>
                <h3 className="font-display text-2xl">Add a household member</h3>
              </div>
            </div>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                onAddMember(form).then(() => {
                  setForm({
                    name: '',
                    email: '',
                    password: '',
                    role: 'member'
                  });
                });
              }}
            >
              <input
                className="field"
                placeholder="Full name"
                required
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />
              <input
                className="field"
                placeholder="Email"
                required
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              />
              <input
                className="field"
                placeholder="Temporary password"
                required
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              />
              <select
                className="field"
                value={form.role}
                onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
              >
                <option value="member">member</option>
                <option value="admin">admin</option>
              </select>
              <Button className="w-full" disabled={busy} type="submit">
                <Shield className="mr-2 h-4 w-4" />
                {busy ? 'Saving...' : 'Add member'}
              </Button>
            </form>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
