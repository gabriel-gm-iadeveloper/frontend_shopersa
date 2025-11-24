import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = (import.meta.env.VITE_AUTH_STORAGE_KEY || 'SHOPERSA') + ':theme';

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('system'); // 'light' | 'dark' | 'system'

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;
    document.documentElement.dataset.theme = resolved;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  const value = { theme, setTheme, toggle };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);