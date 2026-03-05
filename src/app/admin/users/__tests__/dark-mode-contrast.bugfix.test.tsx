/**
 * Bug Condition Exploration Test for User Management Dark Mode Contrast Fix
 * 
 * Property 1: Fault Condition - Dark Mode Text Contrast
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * 
 * This test validates that user count text and pagination text have sufficient
 * contrast (≥4.5:1 ratio) in dark mode by checking for dark mode-aware color classes.
 * 
 * Expected behavior: Text elements should use 'dark:text-gray-400' or similar
 * dark mode variants to ensure WCAG AA compliant contrast in dark mode.
 * 
 * Validates Requirements: 2.1, 2.2, 2.3
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserManagementPage from '../page';

// Mock the API service
jest.mock('@/lib/services/apiService', () => ({
  getAllUsers: jest.fn(() => Promise.resolve([
    {
      id: '1',
      name: 'Test User 1',
      email: 'test1@example.com',
      role: 'CUSTOMER',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Test User 2',
      email: 'test2@example.com',
      role: 'ORGANIZER',
      status: 'active',
      createdAt: '2024-01-02T00:00:00Z',
    },
  ])),
  updateUserStatus: jest.fn(),
  updateUserRole: jest.fn(),
}));

describe('Bug Condition Exploration: Dark Mode Text Contrast', () => {
  beforeEach(() => {
    // Clear any previous renders
    jest.clearAllMocks();
  });

  it('should have dark mode-aware color class for user count text (EXPECTED TO FAIL on unfixed code)', async () => {
    const { container } = render(<UserManagementPage />);
    
    // Wait for users to load
    await screen.findByText(/2 users found/i);
    
    // Find the user count text element
    const userCountElement = screen.getByText(/2 users found/i);
    
    // Check that the element has dark mode-aware color classes
    // The element should have both 'text-gray-600' for light mode AND 'dark:text-gray-400' for dark mode
    const className = userCountElement.className;
    
    // CRITICAL: This assertion will FAIL on unfixed code because it only has 'text-gray-600'
    // After the fix, it should have 'text-gray-600 dark:text-gray-400'
    expect(className).toMatch(/dark:text-gray-\d+/);
    
    // Additional check: verify it has the dark mode variant specifically
    expect(className).toContain('dark:text-gray-400');
    
    // Document the counterexample if this fails:
    // - Current className: will show only 'text-gray-600' without dark mode variant
    // - Expected: should include 'dark:text-gray-400' for proper dark mode contrast
  });

  it('should have dark mode-aware color class for pagination text (EXPECTED TO FAIL on unfixed code)', async () => {
    const { container } = render(<UserManagementPage />);
    
    // Wait for users to load
    await screen.findByText(/Page 1 of 1/i);
    
    // Find the pagination text element
    const paginationElement = screen.getByText(/Page 1 of 1/i);
    
    // Check that the element has dark mode-aware color classes
    const className = paginationElement.className;
    
    // CRITICAL: This assertion will FAIL on unfixed code because it only has 'text-gray-600'
    // After the fix, it should have 'text-gray-600 dark:text-gray-400'
    expect(className).toMatch(/dark:text-gray-\d+/);
    
    // Additional check: verify it has the dark mode variant specifically
    expect(className).toContain('dark:text-gray-400');
    
    // Document the counterexample if this fails:
    // - Current className: will show only 'text-gray-600' without dark mode variant
    // - Expected: should include 'dark:text-gray-400' for proper dark mode contrast
  });

  it('should verify both elements exist and are testable', async () => {
    render(<UserManagementPage />);
    
    // Wait for users to load
    await screen.findByText(/2 users found/i);
    
    // Verify both elements are present in the DOM
    const userCountElement = screen.getByText(/2 users found/i);
    const paginationElement = screen.getByText(/Page 1 of 1/i);
    
    expect(userCountElement).toBeInTheDocument();
    expect(paginationElement).toBeInTheDocument();
    
    // Log current classes for documentation
    console.log('User count element classes:', userCountElement.className);
    console.log('Pagination element classes:', paginationElement.className);
  });

  it('should test with different user counts to ensure consistency', async () => {
    // Mock with more users to test pagination
    const { getAllUsers } = require('@/lib/services/apiService');
    getAllUsers.mockResolvedValueOnce(
      Array.from({ length: 25 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Test User ${i + 1}`,
        email: `test${i + 1}@example.com`,
        role: 'CUSTOMER',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
      }))
    );
    
    render(<UserManagementPage />);
    
    // Wait for users to load
    await screen.findByText(/25 users found/i);
    
    // Find elements
    const userCountElement = screen.getByText(/25 users found/i);
    const paginationElement = screen.getByText(/Page 1 of 3/i);
    
    // Both should have dark mode classes
    expect(userCountElement.className).toMatch(/dark:text-gray-\d+/);
    expect(paginationElement.className).toMatch(/dark:text-gray-\d+/);
  });
});
