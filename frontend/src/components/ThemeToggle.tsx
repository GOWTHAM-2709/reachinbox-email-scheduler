import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      aria-label="Toggle theme"
      className={`relative p-2 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 active:scale-95 ${
        theme === 'light'
          ? 'bg-slate-100/80 hover:bg-slate-200 text-slate-700 border-slate-200 shadow-sm'
          : 'bg-slate-800/80 hover:bg-slate-700 text-amber-300 border-slate-700 shadow-sm'
      } ${className}`}
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 text-slate-700 transition-transform duration-300 hover:-rotate-12" />
      ) : (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
      )}
    </button>
  );
};
