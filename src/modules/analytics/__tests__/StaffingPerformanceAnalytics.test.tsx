import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { StaffingPerformanceAnalytics } from '../StaffingPerformanceAnalytics';

global.fetch = jest.fn();

const mockStaffMetrics = [
  {
    staffId: 'staff-1',
    staffName: 'John Doe',
    totalCheckIns: 150,
    successRate: 98.5,
    averageProcessingTime: 8.2,
    lastCheckInTime: new Date().toISOString(),
    failedAttempts: 2,
    flaggedForReview: false
  },
  {
    staffId: 'staff-2',
    staffName: 'Jane Smith',
    totalCheckIns: 120,
    successRate: 95.0,
    averageProcessingTime: 9.1,
    lastCheckInTime: new Date().toISOString(),
    failedAttempts: 6,
    flaggedForReview: false
  },
  {
    staffId: 'staff-3',
    staffName: 'Bob Johnson',
    totalCheckIns: 85,
    successRate: 88.0,
    averageProcessingTime: 10.5,
    lastCheckInTime: new Date().toISOString(),
    failedAttempts: 10,
    flaggedForReview: true
  }
];

describe('StaffingPerformanceAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockStaffMetrics
    });
  });

  it('should render staffing analytics', async () => {
    render(
      <BrowserRouter>
        <StaffingPerformanceAnalytics eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Staffing Performance Analytics')).toBeInTheDocument();
    });
  });

  it('should display total staff count', async () => {
    render(
      <BrowserRouter>
        <StaffingPerformanceAnalytics eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Total Staff')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('should display average success rate', async () => {
    render(
      <BrowserRouter>
        <StaffingPerformanceAnalytics eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Average Success Rate')).toBeInTheDocument();
      // Average of 98.5, 95.0, 88.0 = 93.83%
      expect(screen.getByText(/93\./)).toBeInTheDocument();
    });
  });

  it('should display top performer', async () => {
    render(
      <BrowserRouter>
        <StaffingPerformanceAnalytics eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Top Performer')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should display staff metrics in table', async () => {
    render(
      <BrowserRouter>
        <StaffingPerformanceAnalytics eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument(); // John's check-ins
      expect(screen.getByText('120')).toBeInTheDocument(); // Jane's check-ins
      expect(screen.getByText('85')).toBeInTheDocument(); // Bob's check-ins
    });
  });

  it('should highlight top performer', async () => {
    render(
      <BrowserRouter>
        <StaffingPerformanceAnalytics eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('⭐')).toBeInTheDocument();
    });
  });

  it('should flag below-average performers', async () => {
    render(
      <BrowserRouter>
        <StaffingPerformanceAnalytics eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });
  });

  it('should filter by top performer', async () => {
    render(
      <BrowserRouter>
        <StaffingPerformanceAnalytics eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const topPerformerButton = screen.getByText('Top Performer');
    fireEvent.click(topPerformerButton);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  it('should filter by below average performers', async () => {
    render(
      <BrowserRouter>
        <StaffingPerformanceAnalytics eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    const belowAverageButton = screen.getByText('Below Average');
    fireEvent.click(belowAverageButton);

    await waitFor(() => {
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });
  });

  it('should sort by throughput', async () => {
    render(
      <BrowserRouter>
        <StaffingPerformanceAnalytics eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const sortSelect = screen.getByDisplayValue('Sort by Throughput');
    expect(sortSelect).toBeInTheDocument();
  });

  it('should handle error on fetch failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false
    });

    render(
      <BrowserRouter>
        <StaffingPerformanceAnalytics eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  it('should accept metrics as prop', () => {
    render(
      <BrowserRouter>
        <StaffingPerformanceAnalytics eventId="test-event-1" staffMetrics={mockStaffMetrics} />
      </BrowserRouter>
    );

    expect(screen.getByText('Staffing Performance Analytics')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should display failed attempts', async () => {
    render(
      <BrowserRouter>
        <StaffingPerformanceAnalytics eventId="test-event-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // John's failed attempts
      expect(screen.getByText('10')).toBeInTheDocument(); // Bob's failed attempts
    });
  });
});

