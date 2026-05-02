import { Bell, CircleDollarSign, Home, LogOut, RefreshCcw, Repeat, ShieldCheck, Users } from 'lucide-react';

import { Button } from '../components/shared/Button';
import { initials } from '../lib/format';

const navigation = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'expenses', label: 'Expenses', icon: CircleDollarSign },
  { id: 'settlements', label: 'Settlements', icon: RefreshCcw },
  { id: 'recurring', label: 'Recurring', icon: Repeat },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'audit', label: 'Audit', icon: ShieldCheck, adminOnly: true }
];

export function AppShell({
  user,
  activeTab,
  onTabChange,
  onLogout,
  unreadCount,
  children
}) {
  return (
    <div className="min-h-screen px-4 py-5 lg:px-6">
      <div className="mx-auto grid max-w-[1600px] gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="app-panel h-fit overflow-hidden p-5">
          <div className="rounded-[24px] bg-app-charcoal px-5 py-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
              Apna Home CRM
            </p>
            <h1 className="mt-3 font-display text-3xl">Shared household control room</h1>
            <p className="mt-3 text-sm text-white/72">
              Split expenses, simplify balances, and keep all five members aligned.
            </p>
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-[24px] bg-app-sand/45 p-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl font-bold text-white"
              style={{ backgroundColor: user.avatarColor }}
            >
              {initials(user.name)}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold">{user.name}</p>
              <p className="truncate text-sm text-app-charcoal/58">
                {user.role} • {user.email}
              </p>
            </div>
          </div>

          <nav className="mt-5 space-y-2 xl:block">
            {navigation
              .filter((item) => !item.adminOnly || user.role === 'admin')
              .map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                      isActive
                        ? 'bg-app-charcoal text-white'
                        : 'bg-transparent text-app-charcoal hover:bg-app-charcoal/5'
                    }`}
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    type="button"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </span>
                    {item.id === 'notifications' && unreadCount ? (
                      <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">
                        {unreadCount}
                      </span>
                    ) : null}
                  </button>
                );
              })}
          </nav>

          <Button className="mt-6 w-full" variant="secondary" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </aside>

        <main className="space-y-6">
          <div className="app-panel flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-app-charcoal/55">
                Live household workspace
              </p>
              <p className="mt-1 text-sm text-app-charcoal/62">
                Changes to expenses and settlements refresh in real time across the household.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 xl:hidden">
              {navigation
                .filter((item) => !item.adminOnly || user.role === 'admin')
                .map((item) => (
                  <Button
                    key={item.id}
                    size="sm"
                    variant={item.id === activeTab ? 'primary' : 'ghost'}
                    onClick={() => onTabChange(item.id)}
                  >
                    {item.label}
                  </Button>
                ))}
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
