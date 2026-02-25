'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';

interface PromoCodeDetailsProps {
  code: {
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
    createdAt: string;
    updatedAt: string;
  };
  onEdit?: () => void;
  onDelete?: () => void;
  isLoading?: boolean;
}

export const PromoCodeDetails: React.FC<PromoCodeDetailsProps> = ({ code, onEdit, onDelete, isLoading = false }) => {
  const getDiscountDisplay = () => {
    if (code.discountType === 'PERCENTAGE') {
      return `${code.discountValue}% off`;
    }
    return `$${code.discountValue.toFixed(2)} off`;
  };

  const usagePercentage = Math.round((code.currentTotalUses / code.maxTotalUses) * 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-mono text-2xl">{code.code}</CardTitle>
            <CardDescription>Promo code details</CardDescription>
          </div>
          <Badge variant={code.status === 'ACTIVE' ? 'default' : 'secondary'}>{code.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Discount</p>
            <p className="text-lg font-semibold">{getDiscountDisplay()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Type</p>
            <p className="text-lg font-semibold">{code.discountType === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Valid From</p>
            <p className="text-lg font-semibold">{new Date(code.startDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Valid Until</p>
            <p className="text-lg font-semibold">{new Date(code.endDate).toLocaleDateString()}</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">Usage</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{code.currentTotalUses} / {code.maxTotalUses} total uses</span>
              <span>{usagePercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${usagePercentage}%` }} />
            </div>
            <p className="text-xs text-gray-500">Max {code.maxUsesPerUser} uses per user</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Created</p>
            <p className="font-medium">{new Date(code.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Last Updated</p>
            <p className="font-medium">{new Date(code.updatedAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          {onEdit && (
            <Button variant="outline" onClick={onEdit} disabled={isLoading}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" onClick={onDelete} disabled={isLoading}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
