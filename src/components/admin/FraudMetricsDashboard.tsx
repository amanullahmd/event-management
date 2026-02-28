import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const FraudMetricsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<FraudMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/admin/fraud/metrics');
      if (!response.ok) throw new Error('Failed to fetch metrics');
      const data = await response.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading fraud metrics...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!metrics) return <div className="p-4">No metrics available</div>;

  const riskLevelData = Object.entries(metrics.riskLevelDistribution).map(([level, count]) => ({
    name: level,
    value: count,
  }));

  const decisionData = Object.entries(metrics.decisionDistribution).map(([decision, count]) => ({
    name: decision,
    value: count,
  }));

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6">Fraud Detection Dashboard</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Fraud Detection Rate</p>
          <p className="text-2xl font-bold text-blue-600">{metrics.fraudDetectionRate.toFixed(2)}%</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">False Positive Rate</p>
          <p className="text-2xl font-bold text-red-600">{metrics.falsePositiveRate.toFixed(2)}%</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Average Fraud Score</p>
          <p className="text-2xl font-bold text-yellow-600">{metrics.averageFraudScore.toFixed(2)}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Blocked Transactions</p>
          <p className="text-2xl font-bold text-green-600">{metrics.blockedTransactions}</p>
        </div>
      </div>

      {/* Transaction Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Total Transactions</p>
          <p className="text-2xl font-bold">{metrics.totalTransactionsAnalyzed}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Fraudulent Detected</p>
          <p className="text-2xl font-bold text-red-600">{metrics.fraudulentTransactionsDetected}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Fraud Loss Amount</p>
          <p className="text-2xl font-bold">${metrics.fraudLossAmount}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Risk Level Distribution */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Risk Level Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskLevelData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {riskLevelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Decision Distribution */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Decision Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={decisionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-sm text-gray-500 text-right">
        Last updated: {new Date(metrics.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
};
