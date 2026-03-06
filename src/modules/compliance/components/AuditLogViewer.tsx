'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AuditLogEntry {
  id: string;
  action: string;
  changedFields?: Record<string, any>;
  performedBy: string;
  performedAt: string;
}

interface AuditLogViewerProps {
  logs: AuditLogEntry[];
  isLoading?: boolean;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs, isLoading = false }) => {
  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'default';
      case 'UPDATE':
        return 'secondary';
      case 'DEACTIVATE':
        return 'destructive';
      case 'REACTIVATE':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const formatChangedFields = (fields?: Record<string, any>) => {
    if (!fields || Object.keys(fields).length === 0) {
      return 'No changes';
    }

    return Object.entries(fields)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(', ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Log</CardTitle>
        <CardDescription>History of all changes to this promo code</CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No audit logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Changes</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Date & Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(log.action)}>{log.action}</Badge>
                    </TableCell>
                    <TableCell className="text-sm max-w-xs truncate">
                      {formatChangedFields(log.changedFields)}
                    </TableCell>
                    <TableCell className="text-sm">{log.performedBy}</TableCell>
                    <TableCell className="text-sm">{new Date(log.performedAt).toLocaleString()}</TableCell>
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

