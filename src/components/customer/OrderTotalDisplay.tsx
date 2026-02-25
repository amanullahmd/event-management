'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OrderTotalDisplayProps {
  subtotal: number;
  discount?: number;
  total: number;
  currency?: string;
}

export const OrderTotalDisplay: React.FC<OrderTotalDisplayProps> = ({
  subtotal,
  discount = 0,
  total,
  currency = 'USD',
}) => {
  const currencySymbol = currency === 'USD' ? '$' : currency;

  return (
    <Card className="border-2 border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">{currencySymbol}{subtotal.toFixed(2)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <span className="font-medium text-green-600">-{currencySymbol}{discount.toFixed(2)}</span>
          </div>
        )}

        <div className="border-t pt-3 flex justify-between">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-gray-900">
            {currencySymbol}{total.toFixed(2)}
          </span>
        </div>

        {discount > 0 && (
          <div className="text-xs text-green-600 text-center pt-2">
            You're saving {currencySymbol}{discount.toFixed(2)}!
          </div>
        )}
      </CardContent>
    </Card>
  );
};
