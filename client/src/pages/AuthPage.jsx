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
    <div className="min-h-screen bg-app-background px-4 py-6 lg:px-6">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        
        {/* LEFT SIDE */}
        <section className="app-panel overflow-hidden p-8 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">
            APNA HOME CRM
          </p>

          <h1 className="mt-5 max-w-xl font-display text-5xl leading-tight text-app-text">
            Shared expense management that actually feels calm.
          </h1>

          <p className="mt-4 max-w-2xl text-base text-app-muted">
            A modern household expense manager inspired by Splitwise with real-time balances, recurring bills, notifications, exports, and premium analytics.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Users,
                title: 'Single household',
                description: 'One group, five members with admin controls.'
              },
              {
                icon: Home,
                title: 'Real-time balances',
                description: 'Instant balance refresh after every expense.'
              },
              {
                icon: Lock,
                title: 'Secure by default',
                description: 'JWT auth, protected APIs, and encrypted passwords.'
              }
            ].map((item) => (
              <div
                className="rounded-[24px] border border-app-border bg-app-surfaceLight p-5 transition hover:border-app-primary"
                key={item.title}
              >
                <item.icon className="h-5 w-5 text-app-primary" />

                <h3 className="mt-3 text-lg font-semibold text-app-text">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-app-muted">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="app-panel p-8 lg:p-10">

          {/* LOGIN / SIGNUP SWITCH */}
          <div className="flex rounded-2xl border border-app-border bg-app-surface p-1">
            {['login', 'signup'].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                  mode === value
                    ? 'bg-app-primary text-white shadow-lg'
                    : 'text-app-muted hover:text-app-text'
                }`}
              >
                {value === 'login' ? 'Login' : 'Sign up'}
              </button>
            ))}
          </div>

          {/* TITLE */}
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-app-primary">
              {mode === 'login' ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
            </p>

            <h2 className="mt-3 font-display text-4xl text-app-text">
              {mode === 'login'
                ? 'Enter your household.'
                : 'Join the home ledger.'}
            </h2>
          </div>

          {/* FORM */}
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
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value
                    }))
                  }
                />

                <input
                  className="field"
                  placeholder="Household name (first member only)"
                  value={form.householdName}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      householdName: event.target.value
                    }))
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
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value
                }))
              }
            />

            <input
              className="field"
              placeholder="Password"
              required
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value
                }))
              }
            />

            {error ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            ) : null}

            <Button className="w-full" disabled={busy} type="submit">
              {busy
                ? 'Please wait...'
                : mode === 'login'
                ? 'Login'
                : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-sm leading-7 text-app-muted">
            The first signup becomes the admin and creates the household.
            Additional members can join until the five-member limit is reached.
          </p>
        </section>
      </div>
    </div>
  );
}