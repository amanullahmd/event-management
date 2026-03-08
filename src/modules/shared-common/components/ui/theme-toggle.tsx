'use client';

import React, { useState } from 'react';
import { useTheme } from '@/lib/context/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [showTooltip, setShowTooltip] = useState(false);

  const themes = ['light', 'dark', 'system'] as const;
  const currentIndex = themes.indexOf(theme as any);
  const nextIndex = (currentIndex + 1) % themes.length;
  const nextTheme = themes[nextIndex];

  const handleToggle = () => {
    setTheme(nextTheme);
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-5 h-5" />;
      case 'dark':
        return <Moon className="w-5 h-5" />;
      case 'system':
        return <Monitor className="w-5 h-5" />;
      default:
        return <Sun className="w-5 h-5" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light Mode';
      case 'dark':
        return 'Dark Mode';
      case 'system':
        return 'System Preference';
      default:
        return 'Toggle Theme';
    }
  };

  const tooltipLabel = `Switch to ${nextTheme === 'light' ? 'Light' : nextTheme === 'dark' ? 'Dark' : 'System'} Mode`;

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label={`Toggle theme. Current: ${getLabel()}`}
        title={tooltipLabel}
        className={`
          inline-flex items-center justify-center
          p-2 rounded-lg
          text-slate-700 dark:text-slate-300
          hover:bg-slate-100 dark:hover:bg-slate-800
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500
          transition-all duration-200
          ${className}
        `}
      >
        <span className="transition-transform duration-300">
          {getIcon()}
        </span>
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className={`
            absolute bottom-full left-1/2 -translate-x-1/2 mb-2
            px-3 py-1.5 rounded-md
            bg-slate-900 dark:bg-slate-100
            text-white dark:text-slate-900
            text-xs font-medium whitespace-nowrap
            pointer-events-none
            animate-fade-in-up
            z-50
          `}
        >
          {tooltipLabel}
          <div
            className={`
              absolute top-full left-1/2 -translate-x-1/2
              border-4 border-transparent
              border-t-slate-900 dark:border-t-slate-100
            `}
          />
        </div>
      )}

      {showLabel && (
        <span className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          {getLabel()}
        </span>
      )}
    </div>
  );
}
