/**
 * Tests for TabFilter component
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TabFilter } from '../TabFilter';

describe('TabFilter', () => {
  describe('rendering', () => {
    it('should render all filter tabs', () => {
      const handleTabChange = jest.fn();
      render(
        <TabFilter activeTab="all" onTabChange={handleTabChange} />
      );

      expect(screen.getByRole('tab', { name: /All/ })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /For You/ })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Online/ })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Today/ })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /This Weekend/ })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Music/ })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Food & Drink/ })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Free/ })).toBeInTheDocument();
    });

    it('should display tab labels', () => {
      const handleTabChange = jest.fn();
      render(
        <TabFilter activeTab="all" onTabChange={handleTabChange} />
      );

      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('For You')).toBeInTheDocument();
      expect(screen.getByText('Today')).toBeInTheDocument();
      expect(screen.getByText('This Weekend')).toBeInTheDocument();
      expect(screen.getByText('Free')).toBeInTheDocument();
    });
  });

  describe('active state', () => {
    it('should mark active tab with aria-selected', () => {
      const handleTabChange = jest.fn();
      render(
        <TabFilter activeTab="today" onTabChange={handleTabChange} />
      );

      const todayTab = screen.getByRole('tab', { name: /Today/ });
      expect(todayTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should mark inactive tabs with aria-selected false', () => {
      const handleTabChange = jest.fn();
      render(
        <TabFilter activeTab="today" onTabChange={handleTabChange} />
      );

      const allTab = screen.getByRole('tab', { name: /All/ });
      expect(allTab).toHaveAttribute('aria-selected', 'false');
    });

    it('should apply active styling to active tab', () => {
      const handleTabChange = jest.fn();
      render(
        <TabFilter activeTab="today" onTabChange={handleTabChange} />
      );

      const todayTab = screen.getByRole('tab', { name: /Today/ });
      expect(todayTab).toHaveClass('bg-gradient-to-r');
      expect(todayTab).toHaveClass('from-violet-600');
    });

    it('should apply inactive styling to inactive tabs', () => {
      const handleTabChange = jest.fn();
      render(
        <TabFilter activeTab="today" onTabChange={handleTabChange} />
      );

      const allTab = screen.getByRole('tab', { name: /All/ });
      expect(allTab).toHaveClass('bg-white/10');
      expect(allTab).toHaveClass('border');
    });
  });

  describe('tab interaction', () => {
    it('should call onTabChange when tab is clicked', () => {
      const handleTabChange = jest.fn();
      render(
        <TabFilter activeTab="all" onTabChange={handleTabChange} />
      );

      const todayTab = screen.getByRole('tab', { name: /Today/ });
      fireEvent.click(todayTab);

      expect(handleTabChange).toHaveBeenCalledWith('today');
    });

    it('should call onTabChange with correct tab ID', () => {
      const handleTabChange = jest.fn();
      render(
        <TabFilter activeTab="all" onTabChange={handleTabChange} />
      );

      const freeTab = screen.getByRole('tab', { name: /Free/ });
      fireEvent.click(freeTab);

      expect(handleTabChange).toHaveBeenCalledWith('free');
    });

    it('should handle multiple tab clicks', () => {
      const handleTabChange = jest.fn();
      render(
        <TabFilter activeTab="all" onTabChange={handleTabChange} />
      );

      const todayTab = screen.getByRole('tab', { name: /Today/ });
      const freeTab = screen.getByRole('tab', { name: /Free/ });

      fireEvent.click(todayTab);
      fireEvent.click(freeTab);

      expect(handleTabChange).toHaveBeenCalledTimes(2);
      expect(handleTabChange).toHaveBeenNthCalledWith(1, 'today');
      expect(handleTabChange).toHaveBeenNthCalledWith(2, 'free');
    });
  });

  describe('accessibility', () => {
    it('should have proper tablist role', () => {
      const handleTabChange = jest.fn();
      const { container } = render(
        <TabFilter activeTab="all" onTabChange={handleTabChange} />
      );

      const tablist = container.querySelector('[role="tablist"]');
      expect(tablist).toBeInTheDocument();
    });

    it('should have proper tab roles', () => {
      const handleTabChange = jest.fn();
      render(
        <TabFilter activeTab="all" onTabChange={handleTabChange} />
      );

      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBeGreaterThan(0);
    });

    it('should have aria-label for tablist', () => {
      const handleTabChange = jest.fn();
      const { container } = render(
        <TabFilter activeTab="all" onTabChange={handleTabChange} />
      );

      const tablist = container.querySelector('[role="tablist"]');
      expect(tablist).toHaveAttribute('aria-label', 'Event filters');
    });

    it('should have descriptive aria-labels for tabs', () => {
      const handleTabChange = jest.fn();
      render(
        <TabFilter activeTab="all" onTabChange={handleTabChange} />
      );

      const todayTab = screen.getByRole('tab', { name: /Today/ });
      expect(todayTab).toHaveAttribute('aria-label', 'Happening today');
    });

    it('should have focus styles', () => {
      const handleTabChange = jest.fn();
      render(
        <TabFilter activeTab="all" onTabChange={handleTabChange} />
      );

      const todayTab = screen.getByRole('tab', { name: /Today/ });
      expect(todayTab).toHaveClass('focus:outline-none');
      expect(todayTab).toHaveClass('focus:ring-2');
    });
  });

  describe('styling', () => {
    it('should apply custom className', () => {
      const handleTabChange = jest.fn();
      const { container } = render(
        <TabFilter activeTab="all" onTabChange={handleTabChange} className="custom-class" />
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-class');
    });

    it('should have scrollable container', () => {
      const handleTabChange = jest.fn();
      const { container } = render(
        <TabFilter activeTab="all" onTabChange={handleTabChange} />
      );

      const scrollContainer = container.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();
    });

    it('should have snap-scroll for smooth scrolling', () => {
      const handleTabChange = jest.fn();
      const { container } = render(
        <TabFilter activeTab="all" onTabChange={handleTabChange} />
      );

      const scrollContainer = container.querySelector('.snap-x');
      expect(scrollContainer).toBeInTheDocument();
    });
  });

  describe('responsive design', () => {
    it('should have touch-pan-x for mobile scrolling', () => {
      const handleTabChange = jest.fn();
      const { container } = render(
        <TabFilter activeTab="all" onTabChange={handleTabChange} />
      );

      const scrollContainer = container.querySelector('.touch-pan-x');
      expect(scrollContainer).toBeInTheDocument();
    });

    it('should have pill-style buttons', () => {
      const handleTabChange = jest.fn();
      render(
        <TabFilter activeTab="all" onTabChange={handleTabChange} />
      );

      const todayTab = screen.getByRole('tab', { name: /Today/ });
      expect(todayTab).toHaveClass('rounded-full');
    });
  });
});

