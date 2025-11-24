import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggle } = useTheme();
  const isDark = (theme === 'dark') || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <button className="btn btn-outline-light ms-2" onClick={toggle} aria-label="Cambiar tema">
      {isDark ? <i className="bi bi-sun"></i> : <i className="bi bi-moon"></i>}
    </button>
  );
};

export default ThemeToggle;