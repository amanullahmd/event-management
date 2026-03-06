import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TicketTypeDistributionAnalytics } from '../TicketTypeDistributionAnalytics';

global.fetch = jest.fn();

const mockDistribution = [
  {
    ticketTypeName: 'General Admission',
    totalSold: 500,
    checkedIn: 480,
    checkInPercentage: 96.0,
    noShowCount: 20,
    flaggedForInvestigation: false
  },
  {
    ticketTypeName: 'VIP',
    totalSold: 100,
    checkedIn: 98,
    checkInPercentage: 98.0,
    noShowCount: 2,
    flaggedForInvestigation: false
  },
  {
    ticketTypeName: 'Student',
    totalSold: 150,
    checkedIn: 120,
    checkInPercentage: 80.0,
    noShowCount: 30,
    flaggedForInvestigation: true
  }
];

describe('TicketTypeDistributionAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockDistribution
    });
  });

  it('should render ticket type analytics', async () => {
    render(
      <BrowserRouter>
        <TicketTypeDistributionAnalytics eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Ticket Type Distribution Analytics')).toBeInTheDocument();
    });
  });

  it('should display total tickets sold', async () => {
    render(
      <BrowserRouter>
        <TicketTypeDistributionAnalytics eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Total Sold')).toBeInTheDocument();
      expect(screen.getByText('750')).toBeInTheDocument(); // 500 + 100 + 150
    });
  });

  it('should display total checked in', async () => {
    render(
      <BrowserRouter>
        <TicketTypeDistributionAnalytics eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Checked In')).toBeInTheDocument();
      expect(screen.getByText('698')).toBeInTheDocument(); // 480 + 98 + 120
    });
  });

  it('should display total no-shows', async () => {
    render(
      <BrowserRouter>
        <TicketTypeDistributionAnalytics eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No-Shows')).toBeInTheDocument();
      expect(screen.getByText('52')).toBeInTheDocument(); // 20 + 2 + 30
    });
  });

  it('should display average check-in rate', async () => {
    render(
      <BrowserRouter>
        <TicketTypeDistributionAnalytics eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Avg Check-in Rate')).toBeInTheDocument();
      // Average of 96.0, 98.0, 80.0 = 91.33%
      expect(screen.getByText(/91\./)).toBeInTheDocument();
    });
  });

  it('should display ticket type details in table', async () => {
    render(
      <BrowserRouter>
        <TicketTypeDistributionAnalytics eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('General Admission')).toBeInTheDocument();
      expect(screen.getByText('VIP')).toBeInTheDocument();
      expect(screen.getByText('Student')).toBeInTheDocument();
      expect(screen.getByText('500')).toBeInTheDocument(); // GA total sold
      expect(screen.getByText('100')).toBeInTheDocument(); // VIP total sold
      expect(screen.getByText('150')).toBeInTheDocument(); // Student total sold
    });
  });

  it('should display check-in percentages', async () => {
    render(
      <BrowserRouter>
        <TicketTypeDistributionAnalytics eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/96\.0%/)).toBeInTheDocument();
      expect(screen.getByText(/98\.0%/)).toBeInTheDocument();
      expect(screen.getByText(/80\.0%/)).toBeInTheDocument();
    });
  });

  it('should flag low check-in rate ticket types', async () => {
    render(
      <BrowserRouter>
        <TicketTypeDistributionAnalytics eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('🚩')).toBeInTheDocument();
    });
  });

  it('should display flagged ticket types section', async () => {
    render(
      <BrowserRouter>
        <TicketTypeDistributionAnalytics eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Ticket Types Flagged for Investigation')).toBeInTheDocument();
      expect(screen.getByText('Student')).toBeInTheDocument();
    });
  });

  it('should display check-in rate visualization', async () => {
    render(
      <BrowserRouter>
        <TicketTypeDistributionAnalytics eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Check-in Rate by Ticket Type')).toBeInTheDocument();
    });
  });

  it('should handle error on fetch failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false
    });

    render(
      <BrowserRouter>
        <TicketTypeDistributionAnalytics eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  it('should accept distribution as prop', () => {
    render(
      <BrowserRouter>
        <TicketTypeDistributionAnalytics eventId="test-event-1" distribution={mockDistribution} />
      </BrowserRouter>
    );

    expect(screen.getByText('Ticket Type Distribution Analytics')).toBeInTheDocument();
    expect(screen.getByText('General Admission')).toBeInTheDocument();
  });

  it('should display no-show counts', async () => {
    render(
      <BrowserRouter>
        <TicketTypeDistributionAnalytics eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('20')).toBeInTheDocument(); // GA no-shows
      expect(screen.getByText('2')).toBeInTheDocument(); // VIP no-shows
      expect(screen.getByText('30')).toBeInTheDocument(); // Student no-shows
    });
  });

  it('should handle empty distribution', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => []
    });

    render(
      <BrowserRouter>
        <TicketTypeDistributionAnalytics eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No ticket type data available')).toBeInTheDocument();
    });
  });
});

