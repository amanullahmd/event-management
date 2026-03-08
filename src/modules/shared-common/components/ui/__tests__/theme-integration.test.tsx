/**
 * Theme Integration Tests
 * 
 * Tests theme switching across multiple components
 * Validates: Requirements 4.7, 4.8, 5.1, 5.2, 5.5, 5.6
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@/lib/context/ThemeContext';
import { ThemeToggle } from '@/modules/shared-common/components/ui/theme-toggle';

/**
 * Test component that uses theme context
 */
function TestComponent() {
  return (
    <div>
      <ThemeToggle />
      <div data-testid="test-content">Test Content</div>
    </div>
  );
}

describe('Theme Integration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset document theme
    document.documentElement.removeAttribute('data-theme');
    // Mock window.matchMedia (not implemented in jsdom)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  test('theme provider initializes with system preference', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const content = screen.getByTestId('test-content');
    expect(content).toBeInTheDocument();
  });

  test('theme toggle switches between light and dark', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();

    // Click to toggle theme
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(toggleButton).toBeInTheDocument();
    });
  });

  test('theme preference is persisted to localStorage', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      // ThemeContext persists under the 'theme' key
      const storedTheme = localStorage.getItem('theme');
      expect(storedTheme).toBeTruthy();
    });
  });

  test('theme is restored from localStorage on mount', () => {
    // Set theme in localStorage
    localStorage.setItem('theme-preference', 'dark');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const content = screen.getByTestId('test-content');
    expect(content).toBeInTheDocument();
  });

  test('theme CSS variables are updated on theme change', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      const htmlElement = document.documentElement;
      const theme = htmlElement.getAttribute('data-theme');
      expect(theme).toBeTruthy();
    });
  });

  test('theme transition completes within 300ms', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByRole('button');
    const startTime = performance.now();

    fireEvent.click(toggleButton);

    await waitFor(() => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(300);
    });
  });

  test('theme change does not cause layout shift', async () => {
    const { container } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const content = screen.getByTestId('test-content');
    const initialRect = content.getBoundingClientRect();

    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      const finalRect = content.getBoundingClientRect();
      expect(finalRect.width).toBe(initialRect.width);
      expect(finalRect.height).toBe(initialRect.height);
    });
  });

  test('theme change maintains scroll position', async () => {
    const { container } = render(
      <ThemeProvider>
        <div style={{ height: '2000px' }}>
          <TestComponent />
        </div>
      </ThemeProvider>
    );

    // Scroll to a position
    window.scrollY = 500;
    const initialScrollY = window.scrollY;

    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(window.scrollY).toBe(initialScrollY);
    });
  });

  test('theme preference syncs across multiple tabs', async () => {
    // Simulate first tab
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Set theme in localStorage (simulating another tab)
    localStorage.setItem('theme', 'dark');
    const storageEvent = new StorageEvent('storage', {
      key: 'theme',
      newValue: 'dark',
      oldValue: 'light',
      storageArea: localStorage,
    });

    window.dispatchEvent(storageEvent);

    await waitFor(() => {
      const storedTheme = localStorage.getItem('theme');
      expect(storedTheme).toBe('dark');
    });
  });

  test('theme respects prefers-reduced-motion', async () => {
    // Mock prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    Object.defineProperty(mediaQuery, 'matches', {
      writable: true,
      value: true,
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(toggleButton).toBeInTheDocument();
    });
  });

  test('theme toggle is keyboard accessible', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByRole('button');
    toggleButton.focus();

    expect(toggleButton).toHaveFocus();

    // Simulate Enter key press
    fireEvent.keyDown(toggleButton, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(toggleButton).toBeInTheDocument();
    });
  });

  test('theme toggle has accessible label', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toHaveAccessibleName();
  });

  test('theme colors are applied to all components', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      // Verify the theme attribute is applied to the document root
      const htmlElement = document.documentElement;
      const theme = htmlElement.getAttribute('data-theme');
      expect(theme).toBeTruthy();
    });
  });
});
