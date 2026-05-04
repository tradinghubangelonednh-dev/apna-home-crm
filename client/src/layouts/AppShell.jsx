import { useState } from 'react';
import {
  Bell,
  Building2,
  CircleDollarSign,
  FileText,
  Home,
  LogOut,
  Menu,
  PieChart,
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
  { id: 'analytics', label: 'Analytics', icon: PieChart },
  { id: 'reports', label: 'Reports', icon: FileText },
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
    (item) => !item.adminOnly || user?.role === 'admin'
  );

  const handleTabChange = (id) => {
    onTabChange(id);
    setIsOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-[#111827]">

      {/* TOP BAR */}
      <div
        className="sticky top-0 z-50 flex items-center justify-between px-4 py-3
        bg-[#0B1220] border-b border-[#1F2937]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-400 shadow-lg shadow-teal-500/20 ring-1 ring-teal-400/25">
            <Building2 className="h-5 w-5" />
          </div>

          <h1 className="font-bold text-lg tracking-wide text-white">
            Household
          </h1>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-xl hover:bg-[#1F2937] transition"
        >
          <Menu className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-72
        bg-[#0B1220] border-r border-[#1F2937]
        shadow-2xl transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >

        {/* USER HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-[#1F2937]">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white bg-teal-500">
              {initials(user?.name || 'User')}
            </div>

            <div>
              <p className="font-semibold text-white">
                {user?.name || 'User'}
              </p>

              <p className="text-xs text-gray-300">
                {user?.role || 'member'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="mt-4 space-y-1 px-3">

          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl transition text-sm font-medium
                ${
                  isActive
                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                    : 'text-gray-300 hover:bg-[#111827] hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />

                <span>
                  {item.label}
                </span>

                {item.id === 'notifications' && unreadCount ? (
                  <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
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
      <main className="flex-1 bg-[#F9FAFB] text-[#111827] p-4 ml-0 md:ml-72">
        {children}
      </main>

    </div>
  );
}