'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface ComplianceMetric {
  id: string;
  code: string;
  organizerId: string;
  organizerName: string;
  eventId: string;
  eventName: string;
  totalUsageCount: number;
  uniqueUsersCount: number;
  totalDiscountAmount: number;
  status: 'ACTIVE' | 'INACTIVE';
  flagged: boolean;
  flagReason?: string;
}

interface AdminComplianceViewProps {
  metrics: ComplianceMetric[];
  isLoading?: boolean;
}

export const AdminComplianceView: React.FC<AdminComplianceViewProps> = ({ metrics, isLoading = false }) => {
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'FLAGGED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMetrics = metrics.filter((metric) => {
    if (filterStatus === 'FLAGGED') {
      if (!metric.flagged) return false;
    } else if (filterStatus !== 'ALL') {
      if (metric.status !== filterStatus) return false;
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        metric.code.toLowerCase().includes(term) ||
        metric.organizerName.toLowerCase().includes(term) ||
        metric.eventName.toLowerCase().includes(term)
      );
    }

    return true;
  });

  const totalDiscountAmount = filteredMetrics.reduce((sum, m) => sum + m.totalDiscountAmount, 0);
  const totalUsageCount = filteredMetrics.reduce((sum, m) => sum + m.totalUsageCount, 0);
  const flaggedCount = filteredMetrics.filter((m) => m.flagged).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredMetrics.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsageCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Discount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalDiscountAmount.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className={flaggedCount > 0 ? 'border-red-200 bg-red-50' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Flagged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${flaggedCount > 0 ? 'text-red-600' : ''}`}>{flaggedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div>
              <CardTitle>Compliance Metrics</CardTitle>
              <CardDescription>Monitor promo code usage across all events</CardDescription>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="text-xs">
                  Search
                </Label>
                <Input
                  id="search"
                  placeholder="Search by code, organizer, or event..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="w-32">
                <Label htmlFor="filter" className="text-xs">
                  Filter
                </Label>
                <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
                  <SelectTrigger id="filter" disabled={isLoading}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="FLAGGED">Flagged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredMetrics.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No metrics found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Organizer</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Unique Users</TableHead>
                    <TableHead>Total Discount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Flags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMetrics.map((metric) => (
                    <TableRow key={metric.id} className={metric.flagged ? 'bg-red-50' : ''}>
                      <TableCell className="font-mono font-semibold">{metric.code}</TableCell>
                      <TableCell className="text-sm">{metric.organizerName}</TableCell>
                      <TableCell className="text-sm">{metric.eventName}</TableCell>
                      <TableCell className="text-sm">{metric.totalUsageCount}</TableCell>
                      <TableCell className="text-sm">{metric.uniqueUsersCount}</TableCell>
                      <TableCell className="text-sm font-medium">${metric.totalDiscountAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={metric.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {metric.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {metric.flagged ? (
                          <Alert className="border-red-200 bg-red-50 p-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-xs text-red-600 ml-2">
                              {metric.flagReason || 'Unusual activity detected'}
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <span className="text-xs text-gray-500">None</span>
                        )}
                      </TableCell>
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

