import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    // Handles both login and register flows; reuses the same form.
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate('/');
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const title = mode === 'login' ? 'Welcome back' : 'Create an account';
  const desc =
    mode === 'login'
      ? 'Sign in with your email and password to access CrickTrackr+'
      : 'Sign up with your email and a strong password to get started.';

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-title">{title}</div>
          <div className="auth-subtitle">{desc}</div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          {error && (
            <div style={{ color: '#f97373', fontSize: '0.8rem', marginBottom: '0.6rem' }}>
              {error}
            </div>
          )}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Sign up'}
          </button>
        </form>
        <div className="switch-auth">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button type="button" onClick={() => setMode('register')}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" onClick={() => setMode('login')}>
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
