import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const deriveDisplayName = (user) => {
  // Build a friendly display name from user fields if missing.
  if (!user) return '';
  if (user.displayName) return user.displayName;
  if (user.email) {
    const base = user.email.split('@')[0] || '';
    if (!base) return user.email;
    return base
      .split(/[._]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }
  return '';
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hydrate auth from localStorage on app load.
    const stored = localStorage.getItem('cricktrackr_auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const parsedUser = parsed.user ? { ...parsed.user, displayName: deriveDisplayName(parsed.user) } : null;
        setUser(parsedUser);
        setToken(parsed.token);
      } catch {
        localStorage.removeItem('cricktrackr_auth');
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Persist auth changes (or clear) when user/token changes.
    if (token && user) {
      localStorage.setItem('cricktrackr_auth', JSON.stringify({ token, user }));
    } else {
      localStorage.removeItem('cricktrackr_auth');
    }
  }, [token, user]);

  const register = async (email, password) => {
    // Register then store user/token.
    const res = await axios.post(`${API_URL}/api/auth/register`, { email, password });
    const nextUser = { ...res.data.user, displayName: deriveDisplayName(res.data.user) };
    setUser(nextUser);
    setToken(res.data.token);
  };

  const login = async (email, password) => {
    // Login then store user/token.
    const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    const nextUser = { ...res.data.user, displayName: deriveDisplayName(res.data.user) };
    setUser(nextUser);
    setToken(res.data.token);
  };

  const updateProfile = (payload) => {
    setUser((prev) => {
      const merged = { ...prev, ...payload };
      return { ...merged, displayName: deriveDisplayName(merged) };
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  // configure axios auth header globally
  axios.defaults.baseURL = API_URL;
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  const value = { user, token, loading, register, login, logout, updateProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
