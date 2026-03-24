'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/modules/shared-common/components/ui/card';
import { Button } from '@/modules/shared-common/components/ui/button';
import { Input } from '@/modules/shared-common/components/ui/input';
import { Label } from '@/modules/shared-common/components/ui/label';
import { AlertCircle, TrendingUp, Loader2 } from 'lucide-react';

interface MetricsData {
  clickThroughRate: number;
  conversionRate: number;
  ctrByCategory: Record<string, number>;
  conversionByRegion: Record<string, number>;
  reportDate: string;
}

interface RecommendationAnalyticsDashboardProps {
  adminOnly?: boolean;
}

export const RecommendationAnalyticsDashboard: React.FC<RecommendationAnalyticsDashboardProps> = ({
  adminOnly = true,
}) => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showAlert, setShowAlert] = useState(false);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        ...(selectedCategory && { category: selectedCategory }),
      });

      const response = await fetch(`/api/recommendations/metrics?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }

      const data = await response.json();
      setMetrics(data);
      setError(null);

      // Check if CTR is below 15%
      if (data.clickThroughRate < 15) {
        setShowAlert(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleDateRangeChange = () => {
    fetchMetrics();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">Error loading metrics</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
        <Button onClick={fetchMetrics} className="mt-4">
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert for Low CTR */}
      {showAlert && metrics && metrics.clickThroughRate < 15 && (
        <Card className="p-4 border-yellow-200 bg-yellow-50">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-yellow-900">Low Click-Through Rate</h3>
              <p className="text-sm text-yellow-700">
                CTR is {metrics.clickThroughRate.toFixed(2)}%, below the 15% threshold. Consider reviewing recommendation algorithm.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Date Range Filter */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Filter Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="category">Category (Optional)</Label>
            <Input
              id="category"
              type="text"
              placeholder="e.g., Music, Technology"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={handleDateRangeChange} className="mt-4 w-full">
          Apply Filters
        </Button>
      </Card>

      {/* Key Metrics */}
      {metrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CTR Card */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Click-Through Rate</p>
                  <p className="text-4xl font-bold text-blue-600">
                    {metrics.clickThroughRate.toFixed(2)}%
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-blue-200" />
              </div>
            </Card>

            {/* Conversion Rate Card */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Conversion Rate</p>
                  <p className="text-4xl font-bold text-green-600">
                    {metrics.conversionRate.toFixed(2)}%
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-green-200" />
              </div>
            </Card>
          </div>

          {/* Category Breakdown */}
          {Object.keys(metrics.ctrByCategory).length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">CTR by Category</h3>
              <div className="space-y-3">
                {Object.entries(metrics.ctrByCategory).map(([category, ctr]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-gray-700">{category}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(ctr, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 w-12 text-right">
                        {ctr.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Region Breakdown */}
          {Object.keys(metrics.conversionByRegion).length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Conversion Rate by Region</h3>
              <div className="space-y-3">
                {Object.entries(metrics.conversionByRegion).map(([region, conversion]) => (
                  <div key={region} className="flex items-center justify-between">
                    <span className="text-gray-700">{region}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${Math.min(conversion, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 w-12 text-right">
                        {conversion.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Report Date */}
          <Card className="p-4 bg-gray-50">
            <p className="text-sm text-gray-600">
              Report generated: {new Date(metrics.reportDate).toLocaleDateString()}
            </p>
          </Card>
        </>
      )}
    </div>
  );
};

export default RecommendationAnalyticsDashboard;

