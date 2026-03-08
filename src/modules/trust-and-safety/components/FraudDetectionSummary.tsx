'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/modules/shared-common/components/ui/card';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/modules/shared-common/components/ui/table';

interface FlaggedReferral {
  referralCode: string;
  suspiciousClickCount: number;
  fraudType: string;
}

interface FraudDetectionSummaryResponse {
  flaggedReferrals: FlaggedReferral[];
  totalFraudulentClicks: number;
}

interface FraudDetectionSummaryProps {
  eventId: string;
}

export const FraudDetectionSummary: React.FC<FraudDetectionSummaryProps> = ({ eventId }) => {
  const [fraudData, setFraudData] = useState<FraudDetectionSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFraudData();
    const interval = setInterval(fetchFraudData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [eventId]);

  const fetchFraudData = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/referral-analytics/fraud-summary`);

      if (!response.ok) {
        throw new Error('Failed to fetch fraud detection summary');
      }

      const data = await response.json();
      setFraudData(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading fraud detection data...</div>;
  }

  if (!fraudData) {
    return null;
  }

  const hasFraud = fraudData.flaggedReferrals.length > 0;

  return (
    <Card className={hasFraud ? 'border-red-200 bg-red-50' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {hasFraud ? (
            <>
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Fraud Detection Alert
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-green-600" />
              Fraud Detection Status
            </>
          )}
        </CardTitle>
        <CardDescription>
          {hasFraud
            ? `${fraudData.totalFraudulentClicks} suspicious clicks detected`
            : 'No suspicious activity detected'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm mb-4">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {fraudData.flaggedReferrals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No fraudulent activity detected</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referral Code</TableHead>
                  <TableHead>Fraud Type</TableHead>
                  <TableHead>Suspicious Clicks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fraudData.flaggedReferrals.map((referral) => (
                  <TableRow key={referral.referralCode} className="bg-red-50">
                    <TableCell className="font-mono text-sm">{referral.referralCode}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-red-200 text-red-800">
                        {referral.fraudType}
                      </span>
                    </TableCell>
                    <TableCell>{referral.suspiciousClickCount}</TableCell>
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

