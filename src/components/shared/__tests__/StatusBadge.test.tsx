/**
 * StatusBadge Component Tests
 * 
 * Unit tests for the StatusBadge component verifying:
 * - Correct rendering of all badge types
 * - Proper color classes for each badge type
 * - Accessibility attributes
 * - Custom className support
 * 
 * Requirements: 5.1, 5.6
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatusBadge, StatusBadgeProps } from '../StatusBadge';

describe('StatusBadge', () => {
  const badgeTypes: StatusBadgeProps['type'][] = [
    'almost-full',
    'sale-ends-soon',
    'starting-soon',
    'featured',
    'free',
  ];

  describe('renders all badge types correctly', () => {
    it.each(badgeTypes)('renders %s badge with correct label', (type) => {
      render(<StatusBadge type={type} />);
      
      const expectedLabels: Record<StatusBadgeProps['type'], string> = {
        'almost-full': 'Almost Full',
        'sale-ends-soon': 'Sale Ends Soon',
        'starting-soon': 'Starting Soon',
        'featured': 'Featured',
        'free': 'Free',
      };
      
      expect(screen.getByText(expectedLabels[type])).toBeInTheDocument();
    });
  });

  describe('uses distinct colors for badge types - Validates: Requirements 5.6', () => {
    it('renders almost-full badge with red color', () => {
      render(<StatusBadge type="almost-full" />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-red-500');
    });

    it('renders sale-ends-soon badge with orange color', () => {
      render(<StatusBadge type="sale-ends-soon" />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-orange-500');
    });

    it('renders starting-soon badge with orange color', () => {
      render(<StatusBadge type="starting-soon" />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-orange-500');
    });

    it('renders featured badge with purple/violet color', () => {
      render(<StatusBadge type="featured" />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-violet-500');
    });

    it('renders free badge with green color', () => {
      render(<StatusBadge type="free" />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-green-500');
    });
  });

  describe('accessibility', () => {
    it('has role="status" for screen readers', () => {
      render(<StatusBadge type="featured" />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has appropriate aria-label for each badge type', () => {
      render(<StatusBadge type="almost-full" />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveAttribute('aria-label', 'Event status: Almost Full');
    });
  });

  describe('custom className support', () => {
    it('applies custom className for positioning', () => {
      render(<StatusBadge type="featured" className="absolute top-2 left-2" />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('absolute', 'top-2', 'left-2');
    });

    it('preserves base styles when custom className is applied', () => {
      render(<StatusBadge type="free" className="custom-class" />);
      const badge = screen.getByRole('status');
      // Should have both base styles and custom class
      expect(badge).toHaveClass('rounded-full', 'custom-class');
    });
  });

  describe('badge styling', () => {
    it('has pill-style rounded corners', () => {
      render(<StatusBadge type="featured" />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('rounded-full');
    });

    it('has appropriate padding', () => {
      render(<StatusBadge type="featured" />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('px-2.5', 'py-1');
    });

    it('has semibold font weight', () => {
      render(<StatusBadge type="featured" />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('font-semibold');
    });

    it('has small text size', () => {
      render(<StatusBadge type="featured" />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('text-xs');
    });
  });
});
