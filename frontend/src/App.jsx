import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './pages/Login.jsx';
import HomePage from './pages/Home.jsx';
import PlayersPage from './pages/Players.jsx';
import AddPlayerPage from './pages/AddPlayer.jsx';
import MatchesPage from './pages/Matches.jsx';
import DocsPage from './pages/Docs.jsx';
import SourcesPage from './pages/Sources.jsx';
import NotFoundPage from './pages/NotFound.jsx';
import PlayerComparePage from './pages/PlayerCompare.jsx';
import { useAuth } from './context/AuthContext.jsx';

export default function App() {
  const { user } = useAuth();

  return (
    <div className="app-shell">
      {/* Navbar shows only when authenticated. */}
      {user && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/players"
            element={
              <ProtectedRoute>
                <PlayersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/compare"
            element={
              <ProtectedRoute>
                <PlayerComparePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-player"
            element={
              <ProtectedRoute>
                <AddPlayerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matches"
            element={
              <ProtectedRoute>
                <MatchesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/docs"
            element={
              <ProtectedRoute>
                <DocsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sources"
            element={
              <ProtectedRoute>
                <SourcesPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}
