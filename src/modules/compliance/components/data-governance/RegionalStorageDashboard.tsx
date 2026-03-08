'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/modules/shared-common/components/ui/card';
import { Badge } from '@/modules/shared-common/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/modules/shared-common/components/ui/table';
import { Globe, Server } from 'lucide-react';
import type { RegionalStorageSummary } from '@/lib/types/data-residency';

interface RegionalStorageDashboardProps {
  apiBaseUrl?: string;
}

export const RegionalStorageDashboard: React.FC<RegionalStorageDashboardProps> = ({ apiBaseUrl = '' }) => {
  const [summary, setSummary] = useState<RegionalStorageSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/data-governance/regional-summary`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch regional summary');
      const data: RegionalStorageSummary = await response.json();
      setSummary(data);
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  if (loading) {
    return <Card><CardContent className="py-8 text-center text-gray-500">Loading regional storage data...</CardContent></Card>;
  }

  if (!summary) {
    return <Card><CardContent className="py-8 text-center text-gray-500">Unable to load regional storage data.</CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Regions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-500" aria-hidden="true" />
              <span className="text-2xl font-bold">{summary.totalRegions}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Regions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-green-500" aria-hidden="true" />
              <span className="text-2xl font-bold">{summary.activeRegions}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Residency Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{summary.totalResidencyPolicies}</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-green-600" aria-hidden="true" />
            <div>
              <CardTitle>Regional Data Storage</CardTitle>
              <CardDescription>Geographic regions and their data storage status.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Region</TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Primary</TableHead>
                  <TableHead>Replication Lag</TableHead>
                  <TableHead>Users</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.regions.map(region => (
                  <TableRow key={region.region}>
                    <TableCell className="font-mono text-sm">{region.region}</TableCell>
                    <TableCell>{region.displayName}</TableCell>
                    <TableCell>
                      <Badge className={region.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {region.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {region.isPrimary && <Badge className="bg-blue-100 text-blue-800">Primary</Badge>}
                    </TableCell>
                    <TableCell>
                      {region.replicationLagSeconds !== null ? `${region.replicationLagSeconds}s` : '-'}
                    </TableCell>
                    <TableCell>{region.userCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

