'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Share2, Trash2, AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ReferralLink {
  referralCode: string;
  label?: string;
  createdAt: string;
  totalClicks: number;
  totalConversions: number;
  conversionRate: string;
  totalRevenue: number;
  status: string;
}

interface ReferralLinkListProps {
  eventId: string;
  refreshTrigger?: number;
}

export const ReferralLinkList: React.FC<ReferralLinkListProps> = ({ eventId, refreshTrigger }) => {
  const [links, setLinks] = useState<ReferralLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<'clicks' | 'conversions' | 'revenue'>('clicks');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    fetchLinks();
  }, [eventId, refreshTrigger]);

  const fetchLinks = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/events/${eventId}/referral-links?sortBy=${sortBy}&order=${order}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch referral links');
      }

      const data = await response.json();
      setLinks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (url: string, code: string) => {
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const handleShare = (url: string, label?: string) => {
    const shareText = `Check out this event: ${label || 'Event'} - ${url}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Event Referral',
        text: shareText,
        url: url,
      });
    } else {
      // Fallback: open share dialog
      const platforms = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      };

      // Show share options
      alert('Share via:\n- Facebook\n- Twitter\n- LinkedIn\n- WhatsApp');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading referral links...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Referral Links</CardTitle>
        <CardDescription>Manage and track your referral links</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm mb-4">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {links.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No referral links yet</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => {
                      setSortBy('clicks');
                      setOrder(order === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    Clicks {sortBy === 'clicks' && (order === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => {
                      setSortBy('conversions');
                      setOrder(order === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    Conversions {sortBy === 'conversions' && (order === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => {
                      setSortBy('revenue');
                      setOrder(order === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    Revenue {sortBy === 'revenue' && (order === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((link) => (
                  <TableRow key={link.referralCode}>
                    <TableCell>{link.label || '-'}</TableCell>
                    <TableCell className="font-mono text-sm">{link.referralCode}</TableCell>
                    <TableCell>{new Date(link.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{link.totalClicks}</TableCell>
                    <TableCell>{link.totalConversions}</TableCell>
                    <TableCell>{link.conversionRate}</TableCell>
                    <TableCell>${link.totalRevenue.toFixed(2)}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          link.status === 'Expired'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {link.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleCopyToClipboard(
                              `${window.location.origin}/events/${eventId}?ref=${link.referralCode}`,
                              link.referralCode
                            )
                          }
                        >
                          <Copy className="w-4 h-4" />
                          {copiedCode === link.referralCode ? 'Copied!' : 'Copy'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleShare(
                              `${window.location.origin}/events/${eventId}?ref=${link.referralCode}`,
                              link.label
                            )
                          }
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
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
