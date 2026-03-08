'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/modules/shared-common/components/ui/card';
import { Badge } from '@/modules/shared-common/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/modules/shared-common/components/ui/select';
import { Label } from '@/modules/shared-common/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/modules/shared-common/components/ui/table';
import { FileText, CheckCircle, XCircle } from 'lucide-react';
import type { ConsentAuditEntry, ConsentType } from '@/lib/types/gdpr';

interface ConsentAuditTrailViewerProps {
  apiBaseUrl?: string;
}

const CONSENT_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'ALL', label: 'All Types' },
  { value: 'MARKETING_EMAILS', label: 'Marketing Emails' },
  { value: 'ANALYTICS', label: 'Usage Analytics' },
  { value: 'PROFILING', label: 'Personalized Recommendations' },
  { value: 'THIRD_PARTY_SHARING', label: 'Third-Party Sharing' },
  { value: 'LOCATION_TRACKING', label: 'Location Features' },
];

export const ConsentAuditTrailViewer: React.FC<ConsentAuditTrailViewerProps> = ({ apiBaseUrl = '' }) => {
  const [entries, setEntries] = useState<ConsentAuditEntry[]>([]);
  const [filterType, setFilterType] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchAuditTrail = useCallback(async () => {
    try {
      setLoading(true);
      const params = filterType !== 'ALL' ? `?consentType=${filterType}` : '';
      const response = await fetch(`${apiBaseUrl}/gdpr/consent-audit-trail${params}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch audit trail');
      const data: ConsentAuditEntry[] = await response.json();
      setEntries(data);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, filterType]);

  useEffect(() => {
    fetchAuditTrail();
  }, [fetchAuditTrail]);

  const getConsentTypeLabel = (type: ConsentType) => {
    const option = CONSENT_TYPE_OPTIONS.find((o) => o.value === type);
    return option?.label || type;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" aria-hidden="true" />
            <div>
              <CardTitle>Consent Audit Trail</CardTitle>
              <CardDescription>
                Complete history of your consent decisions for compliance verification.
              </CardDescription>
            </div>
          </div>
          <div className="w-48">
            <Label htmlFor="audit-filter" className="text-xs">
              Filter by type
            </Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger id="audit-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONSENT_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading audit trail...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No consent changes recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Consent Type</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Previous</TableHead>
                  <TableHead>New</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm">
                      {getConsentTypeLabel(entry.consentType)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.action === 'GRANTED' ? 'default' : 'error'}>
                        {entry.action === 'GRANTED' ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" aria-hidden="true" /> Granted
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <XCircle className="h-3 w-3" aria-hidden="true" /> Revoked
                          </span>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {entry.previousState === null ? '—' : entry.previousState ? 'Granted' : 'Revoked'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {entry.newState ? 'Granted' : 'Revoked'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {entry.source.replace('_', ' ')}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {entry.reason || '—'}
                    </TableCell>
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

