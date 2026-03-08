'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared-common/components/ui/card';
import { Badge } from '@/modules/shared-common/components/ui/badge';
import { Spinner } from '@/modules/shared-common/components/ui/spinner';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

interface FraudMetrics {
  fraudDetectionRate: number;
  falsePositiveRate: number;
  averageFraudScore: number;
  riskLevelDistribution: Record<string, number>;
  decisionDistribution: Record<string, number>;
  totalTransactionsAnalyzed: number;
  fraudulentTransactionsDetected: number;
  blockedTransactions: number;
  fraudLossAmount: string;
  fraudLossPercentage: string;
  lastUpdated: string;
}

// Design system chart colors
const CHART_COLORS = [
  'var(--color-primary)',
  'var(--color-success)',
  'var(--color-warning)',
  'var(--color-error)',
];

export const FraudMetricsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<FraudMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/admin/fraud/metrics');
      if (!response.ok) throw new Error('Failed to fetch metrics');
      setMetrics(await response.json());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Spinner size="lg" label="Loading fraud metrics..." />
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="outlined" className="border-(--color-error)">
        <CardContent className="p-6 text-(--color-error)">Error: {error}</CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card variant="outlined">
        <CardContent className="p-6 text-(--color-text-secondary)">No metrics available</CardContent>
      </Card>
    );
  }

  const riskLevelData = Object.entries(metrics.riskLevelDistribution).map(([level, count]) => ({
    name: level,
    value: count,
  }));

  const decisionData = Object.entries(metrics.decisionDistribution).map(([decision, count]) => ({
    name: decision,
    value: count,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-(--color-text-primary)">Fraud Detection Dashboard</h1>
        <Badge variant="info" dot>Live</Badge>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Detection Rate', value: `${metrics.fraudDetectionRate.toFixed(2)}%`, variant: 'info' as const },
          { label: 'False Positive Rate', value: `${metrics.falsePositiveRate.toFixed(2)}%`, variant: 'error' as const },
          { label: 'Avg Fraud Score', value: metrics.averageFraudScore.toFixed(2), variant: 'warning' as const },
          { label: 'Blocked Transactions', value: String(metrics.blockedTransactions), variant: 'success' as const },
        ].map(({ label, value, variant }) => (
          <Card key={label} variant="elevated">
            <CardContent className="p-4">
              <p className="text-sm text-(--color-text-secondary)">{label}</p>
              <p className="text-2xl font-bold text-(--color-text-primary) mt-1">{value}</p>
              <Badge variant={variant} size="sm" className="mt-2">{variant.toUpperCase()}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Transaction stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Transactions', value: String(metrics.totalTransactionsAnalyzed) },
          { label: 'Fraudulent Detected', value: String(metrics.fraudulentTransactionsDetected) },
          { label: 'Fraud Loss', value: `$${metrics.fraudLossAmount}` },
        ].map(({ label, value }) => (
          <Card key={label} variant="outlined">
            <CardContent className="p-4">
              <p className="text-sm text-(--color-text-secondary)">{label}</p>
              <p className="text-2xl font-bold text-(--color-text-primary) mt-1">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Risk Level Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={riskLevelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={90}
                  dataKey="value"
                >
                  {riskLevelData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Decision Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={decisionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-text-primary)',
                  }}
                />
                <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-(--color-text-tertiary) text-right">
        Last updated: {new Date(metrics.lastUpdated).toLocaleString()}
      </p>
    </div>
  );
};
