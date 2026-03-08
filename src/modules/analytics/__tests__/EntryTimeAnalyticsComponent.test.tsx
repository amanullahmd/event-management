import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { EntryTimeAnalyticsComponent } from '../EntryTimeAnalyticsComponent';

global.fetch = jest.fn();

const mockEntryTimeData = {
  eventId: 'test-event-1',
  hourlyDistribution: {
    9: 10,
    10: 25,
    11: 40,
    12: 35,
    13: 20,
    14: 15
  },
  peakHour: 11,
  peakHourPercentage: 22.5,
  checkInRatePerHour: {
    9: 0.17,
    10: 0.42,
    11: 0.67,
    12: 0.58,
    13: 0.33,
    14: 0.25
  },
  flowAnomalies: [
    {
      time: '11:30',
      type: 'SPIKE' as const,
      magnitude: 45.5
    }
  ],
  averageTimeBetweenCheckIns: 12.5,
  ticketTypeDistribution: {
    'General Admission': 100,
    'VIP': 45,
    'Student': 33
  }
};

describe('EntryTimeAnalyticsComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockEntryTimeData
    });
  });

  it('should render entry time analytics', async () => {
    render(
      <BrowserRouter>
        <EntryTimeAnalyticsComponent eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Entry Time Analytics')).toBeInTheDocument();
    });
  });

  it('should display peak hour information', async () => {
    render(
      <BrowserRouter>
        <EntryTimeAnalyticsComponent eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Peak Entry Hour')).toBeInTheDocument();
      expect(screen.getByText('11:00 - 12:00')).toBeInTheDocument();
      expect(screen.getByText(/22\.5%/)).toBeInTheDocument();
    });
  });

  it('should display hourly distribution', async () => {
    render(
      <BrowserRouter>
        <EntryTimeAnalyticsComponent eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Hourly Check-in Distribution')).toBeInTheDocument();
      expect(screen.getByText('9:00')).toBeInTheDocument();
      expect(screen.getByText('11:00')).toBeInTheDocument();
    });
  });

  it('should display average time between check-ins', async () => {
    render(
      <BrowserRouter>
        <EntryTimeAnalyticsComponent eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Average Time Between Check-ins')).toBeInTheDocument();
      expect(screen.getByText(/12\.1s/)).toBeInTheDocument();
    });
  });

  it('should display entry flow anomalies', async () => {
    render(
      <BrowserRouter>
        <EntryTimeAnalyticsComponent eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Entry Flow Anomalies')).toBeInTheDocument();
      expect(screen.getByText(/Spike/)).toBeInTheDocument();
      expect(screen.getByText('11:30')).toBeInTheDocument();
    });
  });

  it('should display ticket type distribution', async () => {
    render(
      <BrowserRouter>
        <EntryTimeAnalyticsComponent eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Ticket Type Distribution')).toBeInTheDocument();
      expect(screen.getByText('General Admission')).toBeInTheDocument();
      expect(screen.getByText('VIP')).toBeInTheDocument();
      expect(screen.getByText('Student')).toBeInTheDocument();
    });
  });

  it('should handle data with no anomalies', async () => {
    const dataNoAnomalies = { ...mockEntryTimeData, flowAnomalies: [] };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => dataNoAnomalies
    });

    render(
      <BrowserRouter>
        <EntryTimeAnalyticsComponent eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Entry Flow Anomalies')).not.toBeInTheDocument();
    });
  });

  it('should handle error on fetch failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false
    });

    render(
      <BrowserRouter>
        <EntryTimeAnalyticsComponent eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  it('should accept data as prop', () => {
    render(
      <BrowserRouter>
        <EntryTimeAnalyticsComponent eventId="test-event-1" data={mockEntryTimeData} />
      </BrowserRouter>
    );

    expect(screen.getByText('Entry Time Analytics')).toBeInTheDocument();
    expect(screen.getByText('11:00 - 12:00')).toBeInTheDocument();
  });

  it('should display check-in rates per hour', async () => {
    render(
      <BrowserRouter>
        <EntryTimeAnalyticsComponent eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Check that rates are displayed
      expect(screen.getByText(/\/min/)).toBeInTheDocument();
    });
  });
});

