import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { apiRequest } from '../lib/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'apna-home-token';
const USER_KEY = 'apna-home-user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  useEffect(() => {
    async function hydrate() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiRequest('/auth/me', { token });
        setUser(response.user);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    }

    hydrate();
  }, [token]);

  async function login(credentials) {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: credentials
    });

    setToken(response.token);
    setUser(response.user);
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
  }

  async function signup(payload) {
    const response = await apiRequest('/auth/signup', {
      method: 'POST',
      body: payload
    });

    setToken(response.token);
    setUser(response.user);
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      signup,
      logout,
      isAuthenticated: Boolean(token && user)
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
