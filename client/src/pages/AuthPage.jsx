import { useState } from 'react';
import { Home, Lock, Users } from 'lucide-react';

import { Button } from '../components/shared/Button';

export function AuthPage({ onLogin, onSignup, busy, error }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    householdName: '',
    email: '',
    password: ''
  });

  return (
    <div className="min-h-screen px-4 py-6 lg:px-6">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="app-panel overflow-hidden p-8 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-charcoal/55">
            Apna Home CRM
          </p>
          <h1 className="mt-5 max-w-xl font-display text-5xl leading-tight text-app-charcoal">
            Shared expense management that actually feels calm.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-app-charcoal/65">
            A full-stack home ledger inspired by Splitwise, built for one five-member household with clean balances, recurring bills, notifications, and exports.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Users,
                title: 'Single household',
                description: 'One group, five members, role-based admin controls.'
              },
              {
                icon: Home,
                title: 'Real-time balances',
                description: 'Debt simplification and instant balance refresh after every bill.'
              },
              {
                icon: Lock,
                title: 'Secure by default',
                description: 'JWT auth, bcrypt password hashing, protected APIs, and validation.'
              }
            ].map((item) => (
              <div className="rounded-[24px] bg-app-sand/35 p-5" key={item.title}>
                <item.icon className="h-5 w-5 text-app-teal" />
                <h3 className="mt-3 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-app-charcoal/58">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="app-panel p-8 lg:p-10">
          <div className="flex rounded-full bg-app-sand/45 p-1">
            {['login', 'signup'].map((value) => (
              <button
                className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
                  mode === value ? 'bg-app-charcoal text-white' : 'text-app-charcoal/65'
                }`}
                key={value}
                onClick={() => setMode(value)}
                type="button"
              >
                {value === 'login' ? 'Login' : 'Sign up'}
              </button>
            ))}
          </div>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-app-charcoal/55">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </p>
            <h2 className="mt-3 font-display text-4xl">
              {mode === 'login' ? 'Enter your household.' : 'Join the home ledger.'}
            </h2>
          </div>

          <form
            className="mt-8 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const payload =
                mode === 'login'
                  ? {
                      email: form.email,
                      password: form.password
                    }
                  : form;

              if (mode === 'login') {
                onLogin(payload);
              } else {
                onSignup(payload);
              }
            }}
          >
            {mode === 'signup' ? (
              <>
                <input
                  className="field"
                  placeholder="Full name"
                  required
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                />
                <input
                  className="field"
                  placeholder="Household name (first member only)"
                  value={form.householdName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, householdName: event.target.value }))
                  }
                />
              </>
            ) : null}
            <input
              className="field"
              placeholder="Email address"
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
            <input
              className="field"
              placeholder="Password"
              required
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            />
            {error ? (
              <div className="rounded-2xl bg-app-coral/12 px-4 py-3 text-sm text-app-coral">{error}</div>
            ) : null}
            <Button className="w-full" disabled={busy} type="submit">
              {busy ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-sm text-app-charcoal/58">
            The first signup becomes the admin and creates the household. Next signups can join until the five-member limit is reached.
          </p>
        </section>
      </div>
    </div>
  );
}
