import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    // Avoid redirecting while auth is still hydrating.
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  if (!user) {
    // Not authenticated? Send to login.
    return <Navigate to="/login" replace />;
  }

  // Authenticated: render the protected content.
  return children;
}
