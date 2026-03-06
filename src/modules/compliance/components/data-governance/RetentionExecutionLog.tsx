'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock } from 'lucide-react';
import type { RetentionExecutionLog as ExecutionLog } from '@/lib/types/data-residency';

interface RetentionExecutionLogProps {
  apiBaseUrl?: string;
}

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-800',
  RUNNING: 'bg-yellow-100 text-yellow-800',
  FAILED: 'bg-red-100 text-red-800',
  PENDING: 'bg-gray-100 text-gray-800',
};

export const RetentionExecutionLogViewer: React.FC<RetentionExecutionLogProps> = ({ apiBaseUrl = '' }) => {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/api/data-governance/retention-executions`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch execution logs');
      const data: ExecutionLog[] = await response.json();
      setLogs(data);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString();
  };

  if (loading) {
    return <Card><CardContent className="py-8 text-center text-gray-500">Loading execution logs...</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-purple-600" aria-hidden="true" />
          <div>
            <CardTitle>Retention Execution History</CardTitle>
            <CardDescription>Recent retention policy execution results.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No execution logs yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policy</TableHead>
                  <TableHead>Data Type</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Processed</TableHead>
                  <TableHead>Deleted</TableHead>
                  <TableHead>Archived</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Executed By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.policyName}</TableCell>
                    <TableCell><Badge variant="outline">{log.dataType}</Badge></TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.recordsProcessed}</TableCell>
                    <TableCell>{log.recordsDeleted}</TableCell>
                    <TableCell>{log.recordsArchived}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[log.status] || 'bg-gray-100 text-gray-800'}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(log.startedAt)}</TableCell>
                    <TableCell className="text-sm text-gray-500">{log.executedBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

