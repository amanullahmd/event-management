/**
 * Tests for LocationSelector component
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocationSelector } from '../LocationSelector';
import type { Location } from '@/lib/context/LocationContext';

const mockLocations: Location[] = [
  { id: 'ny', name: 'New York', region: 'NY', eventCount: 150 },
  { id: 'la', name: 'Los Angeles', region: 'CA', eventCount: 120 },
  { id: 'sf', name: 'San Francisco', region: 'CA', eventCount: 100 },
  { id: 'chicago', name: 'Chicago', region: 'IL', eventCount: 80 },
];

describe('LocationSelector', () => {
  describe('rendering', () => {
    it('should render the selector button', () => {
      const handleChange = jest.fn();
      render(
        <LocationSelector
          value={null}
          onChange={handleChange}
          locations={mockLocations}
        />
      );

      expect(screen.getByRole('button', { name: /select a location/i })).toBeInTheDocument();
    });

    it('should display placeholder when no location is selected', () => {
      const handleChange = jest.fn();
      render(
        <LocationSelector
          value={null}
          onChange={handleChange}
          locations={mockLocations}
          placeholder="Choose a city"
        />
      );

      expect(screen.getByText('Choose a city')).toBeInTheDocument();
    });

    it('should display selected location name', () => {
      const handleChange = jest.fn();
      render(
        <LocationSelector
          value="ny"
          onChange={handleChange}
          locations={mockLocations}
        />
      );

      expect(screen.getByText('New York')).toBeInTheDocument();
    });
  });

  describe('dropdown interaction', () => {
    it('should open dropdown when button is clicked', async () => {
      const handleChange = jest.fn();
      render(
        <LocationSelector
          value={null}
          onChange={handleChange}
          locations={mockLocations}
        />
      );

      const button = screen.getByRole('button', { name: /select a location/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('New York')).toBeInTheDocument();
      });
    });

    it('should close dropdown when a location is selected', async () => {
      const handleChange = jest.fn();
      const { rerender } = render(
        <LocationSelector
          value={null}
          onChange={handleChange}
          locations={mockLocations}
        />
      );

      const button = screen.getByRole('button', { name: /select a location/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('New York')).toBeInTheDocument();
      });

      const nyOption = screen.getByRole('option', { name: /New York/ });
      fireEvent.click(nyOption);

      expect(handleChange).toHaveBeenCalledWith('ny');
    });

    it('should close dropdown when clicking outside', async () => {
      const handleChange = jest.fn();
      const { container } = render(
        <div>
          <LocationSelector
            value={null}
            onChange={handleChange}
            locations={mockLocations}
          />
          <div data-testid="outside">Outside element</div>
        </div>
      );

      const button = screen.getByRole('button', { name: /select a location/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('New York')).toBeInTheDocument();
      });

      const outside = screen.getByTestId('outside');
      fireEvent.mouseDown(outside);

      await waitFor(() => {
        expect(screen.queryByText('New York')).not.toBeInTheDocument();
      });
    });
  });

  describe('location selection', () => {
    it('should call onChange with selected location ID', async () => {
      const handleChange = jest.fn();
      render(
        <LocationSelector
          value={null}
          onChange={handleChange}
          locations={mockLocations}
        />
      );

      const button = screen.getByRole('button', { name: /select a location/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Los Angeles')).toBeInTheDocument();
      });

      const laOption = screen.getByRole('option', { name: /Los Angeles/ });
      fireEvent.click(laOption);

      expect(handleChange).toHaveBeenCalledWith('la');
    });

    it('should allow selecting "All Locations"', async () => {
      const handleChange = jest.fn();
      render(
        <LocationSelector
          value="ny"
          onChange={handleChange}
          locations={mockLocations}
        />
      );

      const button = screen.getByRole('button', { name: /New York/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('All Locations')).toBeInTheDocument();
      });

      const allOption = screen.getByRole('option', { name: /All Locations/ });
      fireEvent.click(allOption);

      expect(handleChange).toHaveBeenCalledWith(null);
    });

    it('should display event count for each location', async () => {
      const handleChange = jest.fn();
      render(
        <LocationSelector
          value={null}
          onChange={handleChange}
          locations={mockLocations}
        />
      );

      const button = screen.getByRole('button', { name: /select a location/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('150 events')).toBeInTheDocument();
        expect(screen.getByText('120 events')).toBeInTheDocument();
      });
    });
  });

  describe('search functionality', () => {
    it('should filter locations by name', async () => {
      const handleChange = jest.fn();
      render(
        <LocationSelector
          value={null}
          onChange={handleChange}
          locations={mockLocations}
        />
      );

      const button = screen.getByRole('button', { name: /select a location/i });
      fireEvent.click(button);

      const searchInput = screen.getByPlaceholderText('Search locations...');
      await userEvent.type(searchInput, 'san');

      await waitFor(() => {
        expect(screen.getByText('San Francisco')).toBeInTheDocument();
        expect(screen.queryByText('New York')).not.toBeInTheDocument();
      });
    });

    it('should filter locations by region', async () => {
      const handleChange = jest.fn();
      render(
        <LocationSelector
          value={null}
          onChange={handleChange}
          locations={mockLocations}
        />
      );

      const button = screen.getByRole('button', { name: /select a location/i });
      fireEvent.click(button);

      const searchInput = screen.getByPlaceholderText('Search locations...');
      await userEvent.type(searchInput, 'CA');

      await waitFor(() => {
        expect(screen.getByText('Los Angeles')).toBeInTheDocument();
        expect(screen.getByText('San Francisco')).toBeInTheDocument();
        expect(screen.queryByText('New York')).not.toBeInTheDocument();
      });
    });

    it('should show "No locations found" when search has no matches', async () => {
      const handleChange = jest.fn();
      render(
        <LocationSelector
          value={null}
          onChange={handleChange}
          locations={mockLocations}
        />
      );

      const button = screen.getByRole('button', { name: /select a location/i });
      fireEvent.click(button);

      const searchInput = screen.getByPlaceholderText('Search locations...');
      await userEvent.type(searchInput, 'xyz');

      await waitFor(() => {
        expect(screen.getByText('No locations found')).toBeInTheDocument();
      });
    });

    it('should be case-insensitive', async () => {
      const handleChange = jest.fn();
      render(
        <LocationSelector
          value={null}
          onChange={handleChange}
          locations={mockLocations}
        />
      );

      const button = screen.getByRole('button', { name: /select a location/i });
      fireEvent.click(button);

      const searchInput = screen.getByPlaceholderText('Search locations...');
      await userEvent.type(searchInput, 'NEW YORK');

      await waitFor(() => {
        expect(screen.getByText('New York')).toBeInTheDocument();
      });
    });
  });

  describe('keyboard navigation', () => {
    it('should close dropdown on Escape key', async () => {
      const handleChange = jest.fn();
      render(
        <LocationSelector
          value={null}
          onChange={handleChange}
          locations={mockLocations}
        />
      );

      const button = screen.getByRole('button', { name: /select a location/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('New York')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search locations...');
      fireEvent.keyDown(searchInput, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByText('New York')).not.toBeInTheDocument();
      });
    });

    it('should select first filtered location on Enter key', async () => {
      const handleChange = jest.fn();
      render(
        <LocationSelector
          value={null}
          onChange={handleChange}
          locations={mockLocations}
        />
      );

      const button = screen.getByRole('button', { name: /select a location/i });
      fireEvent.click(button);

      const searchInput = screen.getByPlaceholderText('Search locations...');
      await userEvent.type(searchInput, 'san');

      fireEvent.keyDown(searchInput, { key: 'Enter' });

      expect(handleChange).toHaveBeenCalledWith('sf');
    });
  });

  describe('clear button', () => {
    it('should show clear button when location is selected', () => {
      const handleChange = jest.fn();
      render(
        <LocationSelector
          value="ny"
          onChange={handleChange}
          locations={mockLocations}
        />
      );

      const clearButton = screen.getByLabelText('Clear location selection');
      expect(clearButton).toBeInTheDocument();
    });

    it('should not show clear button when no location is selected', () => {
      const handleChange = jest.fn();
      render(
        <LocationSelector
          value={null}
          onChange={handleChange}
          locations={mockLocations}
        />
      );

      const clearButton = screen.queryByLabelText('Clear location selection');
      expect(clearButton).not.toBeInTheDocument();
    });

    it('should clear selection when clear button is clicked', async () => {
      const handleChange = jest.fn();
      render(
        <LocationSelector
          value="ny"
          onChange={handleChange}
          locations={mockLocations}
        />
      );

      const clearButton = screen.getByLabelText('Clear location selection');
      fireEvent.click(clearButton);

      expect(handleChange).toHaveBeenCalledWith(null);
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const handleChange = jest.fn();
      render(
        <LocationSelector
          value={null}
          onChange={handleChange}
          locations={mockLocations}
        />
      );

      const button = screen.getByRole('button', { name: /select a location/i });
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update aria-expanded when dropdown opens', async () => {
      const handleChange = jest.fn();
      render(
        <LocationSelector
          value={null}
          onChange={handleChange}
          locations={mockLocations}
        />
      );

      const button = screen.getByRole('button', { name: /select a location/i });
      expect(button).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveAttribute('aria-expanded', 'true');
      });
    });
  });
});

