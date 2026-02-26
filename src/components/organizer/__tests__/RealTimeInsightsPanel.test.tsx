import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RealTimeInsightsPanel } from '../RealTimeInsightsPanel';

global.fetch = jest.fn();

const mockInsights = {
  eventId: 'test-event-1',
  flowStatus: 'HIGH' as const,
  activeAlerts: [
    {
      type: 'HIGH_ENTRY_FLOW',
      message: 'Check-in rate is 45% above expected',
      severity: 'WARNING' as const,
      timestamp: new Date().toISOString(),
      metadata: { rate: 1.45 }
    },
    {
      type: 'CAPACITY_WARNING',
      message: 'Event is at 85% capacity',
      severity: 'CRITICAL' as const,
      timestamp: new Date().toISOString(),
      metadata: { occupancy: 85 }
    }
  ],
  estimatedTimeToCapacity: 300000, // 5 minutes
  stationMetrics: [
    {
      stationId: 'station-1',
      stationName: 'Main Entrance',
      throughputRate: 2.5,
      status: 'ACTIVE' as const
    },
    {
      stationId: 'station-2',
      stationName: 'Side Entrance',
      throughputRate: 1.8,
      status: 'ACTIVE' as const
    }
  ],
  recommendations: [
    {
      id: 'rec-1',
      recommendation: 'Add 2 more staff members',
      reasoning: 'Current throughput cannot handle peak flow',
      priority: 'HIGH' as const
    }
  ]
};

describe('RealTimeInsightsPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockInsights
    });
  });

  it('should render insights panel', async () => {
    render(
      <BrowserRouter>
        <RealTimeInsightsPanel eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Real-time Insights')).toBeInTheDocument();
    });
  });

  it('should display entry flow status', async () => {
    render(
      <BrowserRouter>
        <RealTimeInsightsPanel eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Entry Flow Status')).toBeInTheDocument();
      expect(screen.getByText('High Flow')).toBeInTheDocument();
    });
  });

  it('should display estimated time to capacity', async () => {
    render(
      <BrowserRouter>
        <RealTimeInsightsPanel eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Estimated Time to Capacity')).toBeInTheDocument();
      expect(screen.getByText(/5m/)).toBeInTheDocument();
    });
  });

  it('should display active alerts', async () => {
    render(
      <BrowserRouter>
        <RealTimeInsightsPanel eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Active Alerts')).toBeInTheDocument();
      expect(screen.getByText('HIGH_ENTRY_FLOW')).toBeInTheDocument();
      expect(screen.getByText('CAPACITY_WARNING')).toBeInTheDocument();
    });
  });

  it('should display check-in stations', async () => {
    render(
      <BrowserRouter>
        <RealTimeInsightsPanel eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Active Check-in Stations')).toBeInTheDocument();
      expect(screen.getByText('Main Entrance')).toBeInTheDocument();
      expect(screen.getByText('Side Entrance')).toBeInTheDocument();
    });
  });

  it('should display staffing recommendations', async () => {
    render(
      <BrowserRouter>
        <RealTimeInsightsPanel eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Staffing Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Add 2 more staff members')).toBeInTheDocument();
      expect(screen.getByText('HIGH Priority')).toBeInTheDocument();
    });
  });

  it('should allow dismissing alerts', async () => {
    render(
      <BrowserRouter>
        <RealTimeInsightsPanel eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('HIGH_ENTRY_FLOW')).toBeInTheDocument();
    });

    const dismissButtons = screen.getAllByText('✕');
    fireEvent.click(dismissButtons[0]);

    // Alert should be removed from display
    await waitFor(() => {
      const alerts = screen.queryAllByText('HIGH_ENTRY_FLOW');
      expect(alerts.length).toBe(0);
    });
  });

  it('should handle different flow statuses', async () => {
    const normalFlowInsights = { ...mockInsights, flowStatus: 'NORMAL' as const };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => normalFlowInsights
    });

    render(
      <BrowserRouter>
        <RealTimeInsightsPanel eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Normal Flow')).toBeInTheDocument();
    });
  });

  it('should handle low flow status', async () => {
    const lowFlowInsights = { ...mockInsights, flowStatus: 'LOW' as const };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => lowFlowInsights
    });

    render(
      <BrowserRouter>
        <RealTimeInsightsPanel eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Low Flow')).toBeInTheDocument();
    });
  });

  it('should handle error on fetch failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false
    });

    render(
      <BrowserRouter>
        <RealTimeInsightsPanel eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  it('should accept insights as prop', () => {
    render(
      <BrowserRouter>
        <RealTimeInsightsPanel eventId="test-event-1" insights={mockInsights} />
      </BrowserRouter>
    );

    expect(screen.getByText('Real-time Insights')).toBeInTheDocument();
    expect(screen.getByText('High Flow')).toBeInTheDocument();
  });
});
