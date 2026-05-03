import { useState } from 'react';
import {
  Bell,
  CircleDollarSign,
  Home,
  LogOut,
  Menu,
  RefreshCcw,
  Repeat,
  ShieldCheck,
  Users
} from 'lucide-react';

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
  const [isOpen, setIsOpen] = useState(false);

  const filteredNav = navigation.filter(
    (item) => !item.adminOnly || user.role === 'admin'
  );

  const handleTabChange = (id) => {
    onTabChange(id);
    setIsOpen(false);
  };

  return (
    <div className="min-h-screen bg-app-sand">

      {/* TOP BAR */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 shadow-lg bg-gradient-to-r from-[#0b1220] via-[#0f172a] to-[#111c33] text-white">

        <h1 className="font-display text-xl font-bold tracking-wide">
          Household
        </h1>

        <button
          onClick={() => setIsOpen(true)}
          className="rounded-xl p-2 hover:bg-white/10 transition"
        >
          <Menu className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-[78%] max-w-sm bg-white p-5 shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >

        {/* USER HEADER */}
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white"
              style={{ backgroundColor: user.avatarColor }}
            >
              {initials(user.name)}
            </div>

            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="text-2xl text-gray-500 hover:text-black"
          >
            ✕
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="mt-6 space-y-2">

          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  isActive
                    ? 'bg-[#0f172a] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}

                {item.id === 'notifications' && unreadCount ? (
                  <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                    {unreadCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <div className="absolute bottom-5 left-5 right-5">
          <Button
            className="w-full"
            variant="secondary"
            onClick={onLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="p-4">
        {children}
      </main>

    </div>
  );
}