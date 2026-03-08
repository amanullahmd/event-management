/**
 * DashboardLayout Unit Tests
 *
 * Verifies the DashboardLayout renders the top bar elements:
 * search input, bell icon, theme toggle, and user avatar with dynamic initial.
 *
 * Validates: Requirements 6.1, 6.2
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// --- Mocks ---

let mockUseAuth: jest.Mock;

jest.mock('@/modules/authentication/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/admin',
}));

jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) =>
    React.createElement('a', { href, ...props }, children);
});

// Mock Sidebar to avoid its complexity
jest.mock('../Sidebar', () => ({
  Sidebar: ({ links }: any) =>
    React.createElement('nav', { 'data-testid': 'sidebar' }, 'Sidebar'),
}));

// Mock ThemeToggle to render a recognizable element
jest.mock('@/modules/shared-common/components/ui/theme-toggle', () => ({
  ThemeToggle: () =>
    React.createElement('button', { 'data-testid': 'theme-toggle' }, 'ThemeToggle'),
}));

// Mock ThemeContext used by ThemeToggle
jest.mock('@/lib/context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light', setTheme: jest.fn() }),
}));

import { DashboardLayout } from '../DashboardLayout';

// --- Test helpers ---

const defaultLinks = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Users', href: '/admin/users' },
];

function renderLayout(authOverrides: Partial<ReturnType<typeof mockUseAuth>> = {}) {
  mockUseAuth = jest.fn().mockReturnValue({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    ...authOverrides,
  });

  return render(
    <DashboardLayout sidebarLinks={defaultLinks}>
      <div data-testid="content">Page Content</div>
    </DashboardLayout>
  );
}

// --- Tests ---

describe('DashboardLayout structure', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the search input', () => {
    renderLayout();
    const searchInput = screen.getByPlaceholderText('Search...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput.tagName).toBe('INPUT');
  });

  it('renders the bell notification icon', () => {
    renderLayout();
    // The Bell icon from lucide-react renders as an SVG; find the button wrapping it
    const buttons = screen.getAllByRole('button');
    // The bell button contains an SVG with the lucide-bell class or similar
    const bellButton = buttons.find((btn) => {
      const svg = btn.querySelector('svg');
      return svg !== null && btn.textContent === '';
    });
    expect(bellButton).toBeDefined();
  });

  it('renders the theme toggle', () => {
    renderLayout();
    const themeToggle = screen.getByTestId('theme-toggle');
    expect(themeToggle).toBeInTheDocument();
  });

  it('renders the sidebar', () => {
    renderLayout();
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toBeInTheDocument();
  });

  it('renders children content', () => {
    renderLayout();
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });
});

describe('DashboardLayout avatar initial', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows the user first name initial (uppercased) when authenticated', () => {
    renderLayout({
      user: {
        id: '1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        role: 'ADMIN',
        status: 'active',
        createdAt: new Date(),
      },
      isAuthenticated: true,
    });

    // The avatar should show "A" (first char of "Alice Johnson")
    const avatar = screen.getByText('A');
    expect(avatar).toBeInTheDocument();
  });

  it('shows uppercased initial for lowercase name', () => {
    renderLayout({
      user: {
        id: '2',
        name: 'bob smith',
        email: 'bob@example.com',
        role: 'ORGANIZER',
        status: 'active',
        createdAt: new Date(),
      },
      isAuthenticated: true,
    });

    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('shows "U" when no user is authenticated', () => {
    renderLayout({ user: null, isAuthenticated: false });

    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('shows "U" when user has no name', () => {
    renderLayout({
      user: {
        id: '3',
        name: '',
        email: 'noname@example.com',
        role: 'CUSTOMER',
        status: 'active',
        createdAt: new Date(),
      },
      isAuthenticated: true,
    });

    expect(screen.getByText('U')).toBeInTheDocument();
  });
});
