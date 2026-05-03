import { useState } from 'react';

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
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-xl items-center justify-center">
        <section className="app-panel w-full p-8 lg:p-10">
          <div className="text-center">
            <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-app-primary">
              APNA HOME CRM
            </p>
          </div>

          {/* LOGIN / SIGNUP SWITCH */}
          <div className="mt-8 flex rounded-2xl border border-app-border bg-app-surface p-1">
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
        </section>
      </div>
    </div>
  );
}