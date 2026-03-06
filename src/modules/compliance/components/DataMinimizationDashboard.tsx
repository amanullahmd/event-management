'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Database, Lock, Unlock } from 'lucide-react';
import type { DataMinimizationReport, FieldPolicy } from '@/lib/types/gdpr';

interface DataMinimizationDashboardProps {
  apiBaseUrl?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  IDENTITY: 'bg-blue-100 text-blue-800',
  CREDENTIAL: 'bg-red-100 text-red-800',
  CONTACT: 'bg-green-100 text-green-800',
  LOCATION: 'bg-yellow-100 text-yellow-800',
  PREFERENCE: 'bg-purple-100 text-purple-800',
};

export const DataMinimizationDashboard: React.FC<DataMinimizationDashboardProps> = ({ apiBaseUrl = '' }) => {
  const [report, setReport] = useState<DataMinimizationReport | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/gdpr/data-minimization-report`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch report');
      const data: DataMinimizationReport = await response.json();
      setReport(data);
    } catch {
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          Loading data minimization report...
        </CardContent>
      </Card>
    );
  }

  if (!report) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          Unable to load data minimization report.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.totalPolicies}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Required Fields</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-red-500" aria-hidden="true" />
              <span className="text-2xl font-bold">{report.requiredFields}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Optional (Consent-Based)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Unlock className="h-4 w-4 text-green-500" aria-hidden="true" />
              <span className="text-2xl font-bold">{report.optionalFields}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" aria-hidden="true" />
            <div>
              <CardTitle>Data Collection Policies</CardTitle>
              <CardDescription>
                Overview of what personal data is collected, why, and for how long.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Retention</TableHead>
                  <TableHead>Legal Basis</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.policies.map((policy: FieldPolicy, index: number) => (
                  <TableRow key={`${policy.fieldName}-${policy.purpose}-${index}`}>
                    <TableCell className="font-mono text-sm">{policy.fieldName}</TableCell>
                    <TableCell>
                      <Badge className={CATEGORY_COLORS[policy.dataCategory] || 'bg-gray-100 text-gray-800'}>
                        {policy.dataCategory}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{policy.purpose}</TableCell>
                    <TableCell>
                      {policy.required ? (
                        <Badge variant="destructive">Required</Badge>
                      ) : (
                        <Badge variant="outline">Optional</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {policy.retentionDays ? `${policy.retentionDays} days` : 'Indefinite'}
                    </TableCell>
                    <TableCell className="text-sm">{policy.legalBasis}</TableCell>
                    <TableCell className="text-sm text-gray-500 max-w-xs truncate">
                      {policy.description}
                    </TableCell>
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

