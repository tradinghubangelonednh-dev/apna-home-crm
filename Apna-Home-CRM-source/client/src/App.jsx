import { useState } from 'react';

import { DashboardPage } from './pages/DashboardPage';
import { AuthPage } from './pages/AuthPage';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { isAuthenticated, loading, login, signup } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function run(action) {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="app-panel px-8 py-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-app-charcoal/50">
            Starting up
          </p>
          <h2 className="mt-3 font-display text-3xl">Checking your session...</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthPage
        busy={busy}
        error={error}
        onLogin={(payload) => run(() => login(payload))}
        onSignup={(payload) => run(() => signup(payload))}
      />
    );
  }

  return <DashboardPage />;
}
