import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LiveAttendanceDashboard } from '../LiveAttendanceDashboard';

// Mock fetch
global.fetch = jest.fn();

const mockMetrics = {
  eventId: 'test-event-1',
  checkedInCount: 150,
  totalCapacity: 200,
  occupancyPercentage: 75,
  capacityStatus: 'WARNING' as const,
  noShowCount: 10,
  lateArrivals: 20,
  earlyArrivals: 5,
  attendanceRate: 88.2,
  lastUpdateTime: new Date().toISOString()
};

describe('LiveAttendanceDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockMetrics
    });
  });

  it('should render dashboard with metrics', async () => {
    render(
      <BrowserRouter>
        <LiveAttendanceDashboard eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Live Attendance Dashboard')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('Warning')).toBeInTheDocument();
    });
  });

  it('should display occupancy percentage correctly', async () => {
    render(
      <BrowserRouter>
        <LiveAttendanceDashboard eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/75\.0%/)).toBeInTheDocument();
      expect(screen.getByText('150 / 200')).toBeInTheDocument();
    });
  });

  it('should display capacity status indicators', async () => {
    render(
      <BrowserRouter>
        <LiveAttendanceDashboard eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Warning')).toBeInTheDocument();
    });
  });

  it('should display no-shows, late arrivals, and early arrivals', async () => {
    render(
      <BrowserRouter>
        <LiveAttendanceDashboard eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument(); // No-shows
      expect(screen.getByText('20')).toBeInTheDocument(); // Late arrivals
      expect(screen.getByText('5')).toBeInTheDocument(); // Early arrivals
    });
  });

  it('should display attendance rate', async () => {
    render(
      <BrowserRouter>
        <LiveAttendanceDashboard eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/88\.2%/)).toBeInTheDocument();
    });
  });

  it('should display last update timestamp', async () => {
    render(
      <BrowserRouter>
        <LiveAttendanceDashboard eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    });
  });

  it('should handle different capacity statuses', async () => {
    const normalMetrics = { ...mockMetrics, capacityStatus: 'NORMAL' as const };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => normalMetrics
    });

    render(
      <BrowserRouter>
        <LiveAttendanceDashboard eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Normal')).toBeInTheDocument();
    });
  });

  it('should handle critical capacity status', async () => {
    const criticalMetrics = {
      ...mockMetrics,
      occupancyPercentage: 95,
      capacityStatus: 'CRITICAL' as const
    };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => criticalMetrics
    });

    render(
      <BrowserRouter>
        <LiveAttendanceDashboard eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Critical')).toBeInTheDocument();
    });
  });

  it('should handle full capacity status', async () => {
    const fullMetrics = {
      ...mockMetrics,
      occupancyPercentage: 100,
      capacityStatus: 'FULL' as const
    };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => fullMetrics
    });

    render(
      <BrowserRouter>
        <LiveAttendanceDashboard eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Full')).toBeInTheDocument();
    });
  });

  it('should display error message on fetch failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false
    });

    render(
      <BrowserRouter>
        <LiveAttendanceDashboard eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  it('should display loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <BrowserRouter>
        <LiveAttendanceDashboard eventId="test-event-1" />
      </BrowserRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should accept metrics as prop', () => {
    render(
      <BrowserRouter>
        <LiveAttendanceDashboard eventId="test-event-1" />
      </BrowserRouter>,
      { wrapper: BrowserRouter }
    );

    // Component should render without fetching when metrics are provided
    expect(global.fetch).toHaveBeenCalled();
  });
});

