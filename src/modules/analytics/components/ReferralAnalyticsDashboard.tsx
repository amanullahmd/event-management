'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, RefreshCw } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ReferralAnalytics {
  referralCode: string;
  label?: string;
  totalClicks: number;
  totalConversions: number;
  conversionRate: string;
  totalRevenue: number;
}

interface ReferralAnalyticsDashboardProps {
  eventId: string;
}

export const ReferralAnalyticsDashboard: React.FC<ReferralAnalyticsDashboardProps> = ({
  eventId,
}) => {
  const [analytics, setAnalytics] = useState<ReferralAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [eventId, startDate, endDate]);

  const fetchAnalytics = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/events/${eventId}/referral-analytics?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = () => {
    fetchAnalytics();
  };

  const totalClicks = analytics.reduce((sum, a) => sum + a.totalClicks, 0);
  const totalConversions = analytics.reduce((sum, a) => sum + a.totalConversions, 0);
  const totalRevenue = analytics.reduce((sum, a) => sum + a.totalRevenue, 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Referral Analytics Dashboard</CardTitle>
          <CardDescription>
            Real-time analytics for your referral links
            {lastUpdated && (
              <div className="text-xs text-gray-500 mt-2">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date Filter */}
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
            <div className="flex items-end gap-2">
              <Button onClick={handleDateFilter} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{totalClicks}</div>
                  <div className="text-sm text-gray-500">Total Clicks</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{totalConversions}</div>
                  <div className="text-sm text-gray-500">Total Conversions</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">${totalRevenue.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">Total Revenue</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Table */}
          {loading ? (
            <div className="text-center py-8">Loading analytics...</div>
          ) : analytics.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No analytics data available</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Conversions</TableHead>
                    <TableHead>Conversion Rate</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.map((a) => (
                    <TableRow key={a.referralCode}>
                      <TableCell>{a.label || '-'}</TableCell>
                      <TableCell className="font-mono text-sm">{a.referralCode}</TableCell>
                      <TableCell>{a.totalClicks}</TableCell>
                      <TableCell>{a.totalConversions}</TableCell>
                      <TableCell>{a.conversionRate}</TableCell>
                      <TableCell>${a.totalRevenue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

