import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { FraudMetricsDashboard } from '../FraudMetricsDashboard';

describe('FraudMetricsDashboard', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(<FraudMetricsDashboard />);
    expect(screen.getByText('Loading fraud metrics...')).toBeInTheDocument();
  });

  it('should render metrics when data is loaded', async () => {
    const mockMetrics = {
      fraudDetectionRate: 95.5,
      falsePositiveRate: 2.3,
      averageFraudScore: 45.2,
      riskLevelDistribution: { LOW: 100, MEDIUM: 50, HIGH: 20, CRITICAL: 5 },
      decisionDistribution: { ALLOW: 100, VERIFY_2FA: 50, MANUAL_REVIEW: 20, BLOCK: 5 },
      totalTransactionsAnalyzed: 175,
      fraudulentTransactionsDetected: 25,
      blockedTransactions: 5,
      fraudLossAmount: '5000.00',
      fraudLossPercentage: '2.85',
      lastUpdated: new Date().toISOString(),
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMetrics,
    });

    render(<FraudMetricsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Fraud Detection Dashboard')).toBeInTheDocument();
      expect(screen.getByText('95.50%')).toBeInTheDocument();
      expect(screen.getByText('2.30%')).toBeInTheDocument();
    });
  });

  it('should display error message on fetch failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    render(<FraudMetricsDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  it('should display key metrics cards', async () => {
    const mockMetrics = {
      fraudDetectionRate: 95.5,
      falsePositiveRate: 2.3,
      averageFraudScore: 45.2,
      riskLevelDistribution: {},
      decisionDistribution: {},
      totalTransactionsAnalyzed: 175,
      fraudulentTransactionsDetected: 25,
      blockedTransactions: 5,
      fraudLossAmount: '5000.00',
      fraudLossPercentage: '2.85',
      lastUpdated: new Date().toISOString(),
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMetrics,
    });

    render(<FraudMetricsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Fraud Detection Rate')).toBeInTheDocument();
      expect(screen.getByText('False Positive Rate')).toBeInTheDocument();
      expect(screen.getByText('Average Fraud Score')).toBeInTheDocument();
      expect(screen.getByText('Blocked Transactions')).toBeInTheDocument();
    });
  });

  it('should refresh metrics every minute', async () => {
    jest.useFakeTimers();
    const mockMetrics = {
      fraudDetectionRate: 95.5,
      falsePositiveRate: 2.3,
      averageFraudScore: 45.2,
      riskLevelDistribution: {},
      decisionDistribution: {},
      totalTransactionsAnalyzed: 175,
      fraudulentTransactionsDetected: 25,
      blockedTransactions: 5,
      fraudLossAmount: '5000.00',
      fraudLossPercentage: '2.85',
      lastUpdated: new Date().toISOString(),
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockMetrics,
    });

    render(<FraudMetricsDashboard />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    jest.advanceTimersByTime(60000);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    jest.useRealTimers();
  });
});

