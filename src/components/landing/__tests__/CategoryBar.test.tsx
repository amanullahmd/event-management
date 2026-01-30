/**
 * Tests for CategoryBar component
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryBar } from '../CategoryBar';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('CategoryBar', () => {
  describe('rendering', () => {
    it('should render the category bar', () => {
      render(<CategoryBar />);

      expect(screen.getByText(/Browse by category/i)).toBeInTheDocument();
    });

    it('should render all category buttons', () => {
      render(<CategoryBar />);

      expect(screen.getByLabelText(/Filter by Music/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Filter by Comedy/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Filter by Food & Drink/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Filter by Education/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Filter by Tech/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Filter by Design/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Filter by Health & Wellness/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Filter by Sports/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Filter by Networking/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Filter by Art/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Filter by Nightlife/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Filter by Family/i)).toBeInTheDocument();
    });

    it('should display category labels', () => {
      render(<CategoryBar />);

      expect(screen.getByText('Music')).toBeInTheDocument();
      expect(screen.getByText('Comedy')).toBeInTheDocument();
      expect(screen.getByText('Food & Drink')).toBeInTheDocument();
    });
  });

  describe('category buttons', () => {
    it('should have proper button type', () => {
      render(<CategoryBar />);

      const musicButton = screen.getByLabelText(/Filter by Music/i);
      expect(musicButton).toHaveAttribute('type', 'button');
    });

    it('should have hover effects', () => {
      render(<CategoryBar />);

      const musicButton = screen.getByLabelText(/Filter by Music/i);
      expect(musicButton).toHaveClass('hover:bg-white/20');
    });

    it('should have focus styles', () => {
      render(<CategoryBar />);

      const musicButton = screen.getByLabelText(/Filter by Music/i);
      expect(musicButton).toHaveClass('focus:outline-none');
      expect(musicButton).toHaveClass('focus:ring-2');
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels for all categories', () => {
      render(<CategoryBar />);

      const categories = [
        'Music',
        'Comedy',
        'Food & Drink',
        'Education',
        'Tech',
        'Design',
        'Health & Wellness',
        'Sports',
        'Networking',
        'Art',
        'Nightlife',
        'Family',
      ];

      categories.forEach((category) => {
        expect(
          screen.getByLabelText(new RegExp(`Filter by ${category}`, 'i'))
        ).toBeInTheDocument();
      });
    });

    it('should have proper button roles', () => {
      render(<CategoryBar />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('styling', () => {
    it('should apply custom className', () => {
      const { container } = render(<CategoryBar className="custom-class" />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-class');
    });

    it('should have scrollable container', () => {
      const { container } = render(<CategoryBar />);

      const scrollContainer = container.querySelector('[style*="scrollbar"]');
      expect(scrollContainer).toBeInTheDocument();
    });
  });

  describe('responsive design', () => {
    it('should have touch-pan-x for mobile scrolling', () => {
      const { container } = render(<CategoryBar />);

      const scrollContainer = container.querySelector('.touch-pan-x');
      expect(scrollContainer).toBeInTheDocument();
    });

    it('should have snap-scroll for smooth scrolling', () => {
      const { container } = render(<CategoryBar />);

      const scrollContainer = container.querySelector('.snap-x');
      expect(scrollContainer).toBeInTheDocument();
    });
  });
});

