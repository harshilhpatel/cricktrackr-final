import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);
const THEME_KEY = 'cricktrackr_theme';
const THEMES = ['light', 'dark', 'night'];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Load saved theme or default to light.
    const stored = localStorage.getItem(THEME_KEY);
    return THEMES.includes(stored) ? stored : 'light';
  });

  useEffect(() => {
    // Persist theme and update body class for global styling.
    localStorage.setItem(THEME_KEY, theme);
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-night');
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => {
      const idx = THEMES.indexOf(prev);
      const next = THEMES[(idx + 1) % THEMES.length];
      return next;
    });

  const value = { theme, toggleTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}


export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
