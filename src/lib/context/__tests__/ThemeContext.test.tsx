import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';
import '@testing-library/jest-dom';

// Test component that uses the theme hook
function TestComponent() {
  const { theme, setTheme, isDark, resolvedTheme } = useTheme();

  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <div data-testid="isDark">{isDark ? 'true' : 'false'}</div>
      <div data-testid="resolvedTheme">{resolvedTheme}</div>
      <button onClick={() => setTheme('light')} data-testid="set-light">
        Set Light
      </button>
      <button onClick={() => setTheme('dark')} data-testid="set-dark">
        Set Dark
      </button>
      <button onClick={() => setTheme('system')} data-testid="set-system">
        Set System
      </button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset document attributes
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-theme');
  });

  describe('Default system theme', () => {
    it('should use system preference when no theme is stored', async () => {
      // Mock system preference as dark
      const mockMatchMedia = jest.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));
      window.matchMedia = mockMatchMedia;

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('system');
        expect(screen.getByTestId('isDark')).toHaveTextContent('true');
        expect(screen.getByTestId('resolvedTheme')).toHaveTextContent('dark');
      });
    });

    it('should use light mode when system preference is light', async () => {
      const mockMatchMedia = jest.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: light)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));
      window.matchMedia = mockMatchMedia;

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('isDark')).toHaveTextContent('false');
        expect(screen.getByTestId('resolvedTheme')).toHaveTextContent('light');
      });
    });
  });

  describe('Theme toggle', () => {
    it('should toggle between light and dark themes', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Set to light
      fireEvent.click(screen.getByTestId('set-light'));
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light');
        expect(screen.getByTestId('isDark')).toHaveTextContent('false');
        expect(screen.getByTestId('resolvedTheme')).toHaveTextContent('light');
      });

      // Set to dark
      fireEvent.click(screen.getByTestId('set-dark'));
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
        expect(screen.getByTestId('isDark')).toHaveTextContent('true');
        expect(screen.getByTestId('resolvedTheme')).toHaveTextContent('dark');
      });

      // Set to system
      fireEvent.click(screen.getByTestId('set-system'));
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('system');
      });
    });

    it('should apply dark class to document when theme is dark', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      fireEvent.click(screen.getByTestId('set-dark'));
      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      });
    });

    it('should remove dark class from document when theme is light', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      fireEvent.click(screen.getByTestId('set-dark'));
      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });

      fireEvent.click(screen.getByTestId('set-light'));
      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(false);
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      });
    });
  });

  describe('localStorage persistence', () => {
    it('should persist theme preference to localStorage', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      fireEvent.click(screen.getByTestId('set-dark'));
      await waitFor(() => {
        expect(localStorage.getItem('theme')).toBe('dark');
      });

      fireEvent.click(screen.getByTestId('set-light'));
      await waitFor(() => {
        expect(localStorage.getItem('theme')).toBe('light');
      });
    });

    it('should load theme preference from localStorage on mount', async () => {
      localStorage.setItem('theme', 'dark');

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
        expect(screen.getByTestId('isDark')).toHaveTextContent('true');
      });
    });
  });

  describe('Cross-tab sync', () => {
    it('should sync theme across tabs when storage changes', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Simulate storage change from another tab
      const storageEvent = new StorageEvent('storage', {
        key: 'theme',
        newValue: 'dark',
        oldValue: 'light',
      });

      window.dispatchEvent(storageEvent);

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
        expect(screen.getByTestId('isDark')).toHaveTextContent('true');
      });
    });

    it('should not sync when storage key is not theme', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      fireEvent.click(screen.getByTestId('set-light'));
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light');
      });

      // Simulate storage change for different key
      const storageEvent = new StorageEvent('storage', {
        key: 'other-key',
        newValue: 'dark',
      });

      window.dispatchEvent(storageEvent);

      // Theme should remain light
      expect(screen.getByTestId('theme')).toHaveTextContent('light');
    });
  });

  describe('useTheme hook', () => {
    it('should return default values when used outside provider', () => {
      function ComponentWithoutProvider() {
        const { theme, isDark, resolvedTheme } = useTheme();
        return (
          <div>
            <div data-testid="theme">{theme}</div>
            <div data-testid="isDark">{isDark ? 'true' : 'false'}</div>
            <div data-testid="resolvedTheme">{resolvedTheme}</div>
          </div>
        );
      }

      render(<ComponentWithoutProvider />);

      expect(screen.getByTestId('theme')).toHaveTextContent('system');
      expect(screen.getByTestId('isDark')).toHaveTextContent('false');
      expect(screen.getByTestId('resolvedTheme')).toHaveTextContent('light');
    });
  });
});
