'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface DiscountBreakdownProps {
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  discountDisplay: string;
  promoCode: string;
  onRemove?: () => void;
  isLoading?: boolean;
}

export const DiscountBreakdown: React.FC<DiscountBreakdownProps> = ({
  originalPrice,
  discountAmount,
  finalPrice,
  discountDisplay,
  promoCode,
  onRemove,
  isLoading = false,
}) => {
  const savingsPercentage = ((discountAmount / originalPrice) * 100).toFixed(1);

  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Promo Code Applied</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-green-700">{promoCode}</span>
              {onRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRemove}
                  disabled={isLoading}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="border-t border-green-200 pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Original Price</span>
              <span className="font-medium">${originalPrice.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount ({discountDisplay})</span>
              <span className="font-medium text-green-600">-${discountAmount.toFixed(2)}</span>
            </div>

            <div className="border-t border-green-200 pt-2 flex justify-between">
              <span className="font-semibold text-gray-900">Final Price</span>
              <span className="font-bold text-lg text-green-700">${finalPrice.toFixed(2)}</span>
            </div>

            <div className="text-xs text-green-600 text-right">
              You save {savingsPercentage}% ({discountDisplay})
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
