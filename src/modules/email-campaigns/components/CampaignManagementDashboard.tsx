'use client';

import React, { useState } from 'react';
import { Button } from '@/modules/shared-common/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/modules/shared-common/components/ui/card';
import { Badge } from '@/modules/shared-common/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/modules/shared-common/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/modules/shared-common/components/ui/table';
import { Input } from '@/modules/shared-common/components/ui/input';
import { Eye, Edit2, Trash2, Pause, Play } from 'lucide-react';

export interface Campaign {
  id: string;
  name: string;
  type: 'REMINDER' | 'ABANDONED_CHECKOUT';
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DRAFT';
  eventId: string;
  eventName: string;
  createdAt: string;
  updatedAt: string;
  sendTime?: string;
  timezone?: string;
}

export interface CampaignManagementDashboardProps {
  campaigns: Campaign[];
  isLoading?: boolean;
  error?: string;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onPause?: (id: string) => Promise<void>;
  onResume?: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onCreateNew?: () => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const getCampaignTypeLabel = (type: string): string => {
  switch (type) {
    case 'REMINDER':
      return 'Reminder Email';
    case 'ABANDONED_CHECKOUT':
      return 'Abandoned Checkout';
    default:
      return type;
  }
};

const getStatusColor = (status: string): 'default' | 'secondary' | 'error' | 'outline' => {
  switch (status) {
    case 'ACTIVE':
      return 'default';
    case 'PAUSED':
      return 'secondary';
    case 'ARCHIVED':
      return 'outline';
    case 'DRAFT':
      return 'secondary';
    default:
      return 'outline';
  }
};

const getStatusIndicator = (status: string): React.ReactNode => {
  switch (status) {
    case 'ACTIVE':
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Active</span>
        </div>
      );
    case 'PAUSED':
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
          <span>Paused</span>
        </div>
      );
    case 'ARCHIVED':
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gray-500 rounded-full" />
          <span>Archived</span>
        </div>
      );
    case 'DRAFT':
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <span>Draft</span>
        </div>
      );
    default:
      return status;
  }
};

export const CampaignManagementDashboard: React.FC<CampaignManagementDashboardProps> = ({
  campaigns,
  isLoading = false,
  error,
  onView,
  onEdit,
  onPause,
  onResume,
  onDelete,
  onCreateNew,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'REMINDER' | 'ABANDONED_CHECKOUT'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DRAFT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesType = filterType === 'ALL' || campaign.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || campaign.status === filterStatus;
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const handlePause = async (id: string) => {
    if (!onPause) return;
    setActionLoading(id);
    try {
      await onPause(id);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResume = async (id: string) => {
    if (!onResume) return;
    setActionLoading(id);
    try {
      await onResume(id);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!onDelete) return;
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) return;
    setActionLoading(id);
    try {
      await onDelete(id);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-800">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle>Email Campaigns</CardTitle>
            <CardDescription>Manage your automated email campaigns</CardDescription>
          </div>
          {onCreateNew && (
            <Button onClick={onCreateNew} className="bg-blue-600 hover:bg-blue-700">
              Create Campaign
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Search campaigns by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="flex gap-2">
            <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="REMINDER">Reminder Email</SelectItem>
                <SelectItem value="ABANDONED_CHECKOUT">Abandoned Checkout</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PAUSED">Paused</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No campaigns found</p>
            <p className="text-sm mt-1">
              {campaigns.length === 0
                ? 'Create your first campaign to get started'
                : 'Try adjusting your filters or search query'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.map((campaign) => (
                    <TableRow key={campaign.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getCampaignTypeLabel(campaign.type)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(campaign.status)}>
                          {getStatusIndicator(campaign.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{campaign.eventName}</TableCell>
                      <TableCell className="text-sm text-gray-600">{formatDate(campaign.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {onView && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onView(campaign.id)}
                              disabled={isLoading || actionLoading === campaign.id}
                              title="View campaign details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(campaign.id)}
                              disabled={isLoading || actionLoading === campaign.id}
                              title="Edit campaign"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          )}
                          {campaign.status === 'ACTIVE' && onPause && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePause(campaign.id)}
                              disabled={isLoading || actionLoading === campaign.id}
                              title="Pause campaign"
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          )}
                          {campaign.status === 'PAUSED' && onResume && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResume(campaign.id)}
                              disabled={isLoading || actionLoading === campaign.id}
                              title="Resume campaign"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(campaign.id)}
                              disabled={isLoading || actionLoading === campaign.id}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete campaign"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange?.(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange?.(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

