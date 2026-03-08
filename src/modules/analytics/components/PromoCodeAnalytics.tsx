'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/modules/shared-common/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
  totalUsageCount: number;
  uniqueUsersCount: number;
  totalDiscountAmount: number;
  averageDiscountPerUse: number;
  usageByDate: Record<string, number>;
  usageByTicketType: Record<string, number>;
}

interface PromoCodeAnalyticsProps {
  data: AnalyticsData;
  isLoading?: boolean;
}

export const PromoCodeAnalytics: React.FC<PromoCodeAnalyticsProps> = ({ data, isLoading = false }) => {
  const usageByDateArray = Object.entries(data.usageByDate || {}).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString(),
    usage: count,
  }));

  const usageByTicketTypeArray = Object.entries(data.usageByTicketType || {}).map(([type, count]) => ({
    type,
    usage: count,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsageCount}</div>
            <p className="text-xs text-gray-500 mt-1">times applied</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Unique Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.uniqueUsersCount}</div>
            <p className="text-xs text-gray-500 mt-1">different users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Discount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.totalDiscountAmount.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">given away</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Discount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.averageDiscountPerUse.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">per use</p>
          </CardContent>
        </Card>
      </div>

      {usageByDateArray.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Usage Over Time</CardTitle>
            <CardDescription>Daily usage breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageByDateArray}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="usage" stroke="#3b82f6" name="Usage Count" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {usageByTicketTypeArray.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Usage by Ticket Type</CardTitle>
            <CardDescription>Distribution across ticket types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usageByTicketTypeArray}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="usage" fill="#3b82f6" name="Usage Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

