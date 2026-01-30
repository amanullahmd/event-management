/**
 * Tests for HeroSection component
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HeroSection } from '../HeroSection';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('HeroSection', () => {
  describe('rendering', () => {
    it('should render the hero section', () => {
      render(<HeroSection />);

      expect(screen.getByText(/Delightful Events/i)).toBeInTheDocument();
      expect(screen.getByText(/Start Here/i)).toBeInTheDocument();
    });

    it('should display the tagline', () => {
      render(<HeroSection />);

      expect(
        screen.getByText(/Discover amazing events happening near you/i)
      ).toBeInTheDocument();
    });

    it('should render the search bar', () => {
      render(<HeroSection />);

      expect(
        screen.getByPlaceholderText(/Search events, categories, or locations/i)
      ).toBeInTheDocument();
    });

    it('should render the search button', () => {
      render(<HeroSection />);

      expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
    });

    it('should render the category bar', () => {
      render(<HeroSection />);

      expect(screen.getByText(/Browse by category/i)).toBeInTheDocument();
    });
  });

  describe('search functionality', () => {
    it('should update search input value', async () => {
      render(<HeroSection />);

      const searchInput = screen.getByPlaceholderText(
        /Search events, categories, or locations/i
      );

      await userEvent.type(searchInput, 'jazz concert');

      expect(searchInput).toHaveValue('jazz concert');
    });

    it('should disable search button when input is empty', () => {
      render(<HeroSection />);

      const searchButton = screen.getByRole('button', { name: /Search/i });

      expect(searchButton).toBeDisabled();
    });

    it('should enable search button when input has text', async () => {
      render(<HeroSection />);

      const searchInput = screen.getByPlaceholderText(
        /Search events, categories, or locations/i
      );
      const searchButton = screen.getByRole('button', { name: /Search/i });

      await userEvent.type(searchInput, 'jazz');

      expect(searchButton).not.toBeDisabled();
    });

    it('should call onSearch callback when form is submitted', async () => {
      const handleSearch = jest.fn();
      render(<HeroSection onSearch={handleSearch} />);

      const searchInput = screen.getByPlaceholderText(
        /Search events, categories, or locations/i
      );
      const searchButton = screen.getByRole('button', { name: /Search/i });

      await userEvent.type(searchInput, 'jazz concert');
      fireEvent.click(searchButton);

      expect(handleSearch).toHaveBeenCalledWith('jazz concert');
    });

    it('should not submit empty search queries', async () => {
      const handleSearch = jest.fn();
      render(<HeroSection onSearch={handleSearch} />);

      const searchButton = screen.getByRole('button', { name: /Search/i });

      fireEvent.click(searchButton);

      expect(handleSearch).not.toHaveBeenCalled();
    });

    it('should trim whitespace from search query', async () => {
      const handleSearch = jest.fn();
      render(<HeroSection onSearch={handleSearch} />);

      const searchInput = screen.getByPlaceholderText(
        /Search events, categories, or locations/i
      );
      const searchButton = screen.getByRole('button', { name: /Search/i });

      await userEvent.type(searchInput, '   jazz   ');
      fireEvent.click(searchButton);

      expect(handleSearch).toHaveBeenCalledWith('   jazz   ');
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<HeroSection />);

      expect(screen.getByLabelText(/Search events/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Search/i)).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      render(<HeroSection />);

      const heading = screen.getByText(/Delightful Events/i);
      expect(heading.tagName).toBe('H1');
    });
  });

  describe('styling', () => {
    it('should have gradient background', () => {
      const { container } = render(<HeroSection />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('bg-gradient-to-br');
    });

    it('should apply custom className', () => {
      const { container } = render(<HeroSection className="custom-class" />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('custom-class');
    });
  });
});

