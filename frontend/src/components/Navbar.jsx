import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Navbar() {
  const { user, logout, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [displayInput, setDisplayInput] = React.useState('');

  const displayName = React.useMemo(() => {
    // Derive a readable name from profile or email.
    if (user?.displayName) return user.displayName;
    if (!user?.email) return '';
    const base = user.email.split('@')[0] || '';
    if (!base) return user.email;
    return base
      .split(/[._]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }, [user]);

  React.useEffect(() => {
    // Prefill profile input when menu opens.
    if (menuOpen) setDisplayInput(displayName);
  }, [menuOpen, displayName]);

  const logoLetter = React.useMemo(() => {
    // Show first letter of displayName/email on the logo chip.
    const source = displayName || user?.email || 'C';
    const letter = source.trim().charAt(0);
    return letter ? letter.toUpperCase() : 'C';
  }, [displayName, user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const saveDisplayName = () => {
    updateProfile({ displayName: displayInput });
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-left">
          <button className="logo-circle logo-button" onClick={() => setMenuOpen((o) => !o)}>
            {logoLetter}
          </button>
          <div className="logo-text">
            <span>CrickTrackr+</span>
            <span>Cricket dashboard</span>
          </div>
          {menuOpen && (
            <div className="profile-menu">
              <div className="profile-menu-header">Profile</div>
              <div className="profile-menu-item">
                <div className="label-quiet">Email</div>
                <div style={{ fontWeight: 600 }}>{user?.email}</div>
              </div>
              <div className="profile-menu-item">
                <div className="label-quiet">Display name</div>
                <input
                  className="input input-sm"
                  value={displayInput}
                  onChange={(e) => setDisplayInput(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="profile-menu-actions">
                <button className="btn btn-sm btn-secondary" onClick={saveDisplayName}>Save</button>
                <button className="btn btn-sm btn-outline" onClick={() => setMenuOpen(false)}>Close</button>
              </div>
            </div>
          )}
        </div>
        <div className="navbar-links">
          <NavLink
            to="/"
            className={({ isActive }) => isActive ? 'nav-link nav-link-active' : 'nav-link'}
          >
            Home
          </NavLink>
          <NavLink
            to="/matches"
            className={({ isActive }) => isActive ? 'nav-link nav-link-active' : 'nav-link'}
          >
            Matches
          </NavLink>
          <NavLink
            to="/players"
            className={({ isActive }) => isActive ? 'nav-link nav-link-active' : 'nav-link'}
          >
            Players
          </NavLink>
          <NavLink
            to="/compare"
            className={({ isActive }) => isActive ? 'nav-link nav-link-active' : 'nav-link'}
          >
            Compare
          </NavLink>
          <NavLink
            to="/add-player"
            className={({ isActive }) => isActive ? 'nav-link nav-link-active' : 'nav-link'}
          >
            Add Player
          </NavLink>
          <NavLink
            to="/docs"
            className={({ isActive }) => isActive ? 'nav-link nav-link-active' : 'nav-link'}
          >
            Docs
          </NavLink>
          <NavLink
            to="/sources"
            className={({ isActive }) => isActive ? 'nav-link nav-link-active' : 'nav-link'}
          >
            Sources
          </NavLink>
        </div>
        <div className="navbar-right">
          <button className="theme-toggle" onClick={toggleTheme} title="Cycle theme">
            <span className={`theme-toggle-handle ${theme !== 'light' ? 'is-dark' : ''}`}>
              {theme === 'light' && '☀️'}
              {theme === 'dark' && '🌙'}
              {theme === 'night' && '🏟️'}
            </span>
          </button>
          {user && <div className="user-pill">{displayName || user.email}</div>}
          <button className="btn btn-sm btn-outline" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
