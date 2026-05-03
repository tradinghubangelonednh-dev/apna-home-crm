import { useState } from 'react';

import { useAuth } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

export default function App() {
  const { isAuthenticated, loading, login, signup } = useAuth();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // APP ROUTING
  const [page, setPage] = useState('dashboard');

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

  // LOADING SCREEN
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="app-panel px-8 py-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
            Starting up
          </p>

          <h2 className="mt-3 text-3xl font-semibold text-gray-900">
            Checking your session...
          </h2>
        </div>
      </div>
    );
  }

  // AUTH SCREEN
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

  // MAIN APP
  return (
    <div className="min-h-screen">

      {page === 'dashboard' && (
        <DashboardPage
          currentPage={page}
          onNavigate={setPage}
        />
      )}

      {page === 'analytics' && (
        <AnalyticsPage
          currentPage={page}
          onNavigate={setPage}
        />
      )}

    </div>
  );
}