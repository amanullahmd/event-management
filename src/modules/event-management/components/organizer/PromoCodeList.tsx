'use client';

import React, { useState } from 'react';
import { Button } from '@/modules/shared-common/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/modules/shared-common/components/ui/card';
import { Badge } from '@/modules/shared-common/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/modules/shared-common/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/modules/shared-common/components/ui/table';
import { Eye, Edit2, Trash2 } from 'lucide-react';

interface PromoCode {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  maxTotalUses: number;
  maxUsesPerUser: number;
  currentTotalUses: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface PromoCodeListProps {
  promoCodes: PromoCode[];
  isLoading?: boolean;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDeactivate?: (id: string) => Promise<void>;
  onReactivate?: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const PromoCodeList: React.FC<PromoCodeListProps> = ({
  promoCodes,
  isLoading = false,
  onView,
  onEdit,
  onDeactivate,
  onReactivate,
  onDelete,
}) => {
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filteredCodes = promoCodes.filter((code) => {
    if (filterStatus === 'ALL') return true;
    return code.status === filterStatus;
  });

  const handleDeactivate = async (id: string) => {
    if (!onDeactivate) return;
    setActionLoading(id);
    try {
      await onDeactivate(id);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivate = async (id: string) => {
    if (!onReactivate) return;
    setActionLoading(id);
    try {
      await onReactivate(id);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!onDelete) return;
    if (!confirm('Are you sure you want to delete this promo code?')) return;
    setActionLoading(id);
    try {
      await onDelete(id);
    } finally {
      setActionLoading(null);
    }
  };

  const getDiscountDisplay = (code: PromoCode) => {
    if (code.discountType === 'PERCENTAGE') {
      return `${code.discountValue}% off`;
    }
    return `$${code.discountValue.toFixed(2)} off`;
  };

  const getUsagePercentage = (code: PromoCode) => {
    return Math.round((code.currentTotalUses / code.maxTotalUses) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Promo Codes</CardTitle>
            <CardDescription>Manage your promotional codes</CardDescription>
          </div>
          <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredCodes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No promo codes found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Valid Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCodes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell className="font-mono font-semibold">{code.code}</TableCell>
                    <TableCell>{getDiscountDisplay(code)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {code.currentTotalUses} / {code.maxTotalUses}
                        </div>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${getUsagePercentage(code)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(code.startDate).toLocaleDateString()} -{' '}
                      {new Date(code.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={code.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {code.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {onView && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(code.id)}
                            disabled={isLoading || actionLoading === code.id}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(code.id)}
                            disabled={isLoading || actionLoading === code.id}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                        {code.status === 'ACTIVE' && onDeactivate && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeactivate(code.id)}
                            disabled={isLoading || actionLoading === code.id}
                          >
                            Deactivate
                          </Button>
                        )}
                        {code.status === 'INACTIVE' && onReactivate && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReactivate(code.id)}
                            disabled={isLoading || actionLoading === code.id}
                          >
                            Reactivate
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(code.id)}
                            disabled={isLoading || actionLoading === code.id}
                            className="text-red-600 hover:text-red-700"
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
        )}
      </CardContent>
    </Card>
  );
};

