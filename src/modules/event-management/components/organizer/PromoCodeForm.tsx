'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface PromoCodeFormProps {
  eventId: string;
  onSubmit: (data: PromoCodeFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export interface PromoCodeFormData {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  maxTotalUses: number;
  maxUsesPerUser: number;
  startDate: string;
  endDate: string;
  ticketTypeIds?: string[];
}

export const PromoCodeForm: React.FC<PromoCodeFormProps> = ({
  eventId,
  onSubmit,
  isLoading = false,
  error,
}) => {
  const [formData, setFormData] = useState<PromoCodeFormData>({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    maxTotalUses: 100,
    maxUsesPerUser: 5,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    ticketTypeIds: [],
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.code || formData.code.length < 3 || formData.code.length > 50) {
      errors.code = 'Code must be between 3 and 50 characters';
    }

    if (formData.discountValue <= 0) {
      errors.discountValue = 'Discount value must be greater than 0';
    }

    if (formData.discountType === 'PERCENTAGE' && formData.discountValue > 100) {
      errors.discountValue = 'Percentage discount cannot exceed 100%';
    }

    if (formData.maxTotalUses <= 0) {
      errors.maxTotalUses = 'Max total uses must be greater than 0';
    }

    if (formData.maxUsesPerUser <= 0) {
      errors.maxUsesPerUser = 'Max uses per user must be greater than 0';
    }

    if (formData.maxUsesPerUser > formData.maxTotalUses) {
      errors.maxUsesPerUser = 'Max uses per user cannot exceed max total uses';
    }

    if (new Date(formData.startDate) < new Date()) {
      errors.startDate = 'Start date cannot be in the past';
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      errors.endDate = 'End date must be after start date';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        maxTotalUses: 100,
        maxUsesPerUser: 5,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ticketTypeIds: [],
      });
      setValidationErrors({});
    } catch (err) {
      // Error is handled by parent component
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Promo Code</CardTitle>
        <CardDescription>Create a new promotional code for your event</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="code">Promo Code</Label>
            <Input
              id="code"
              placeholder="e.g., SUMMER20"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              disabled={isLoading}
              className={validationErrors.code ? 'border-red-500' : ''}
            />
            {validationErrors.code && <p className="text-sm text-red-500">{validationErrors.code}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discountType">Discount Type</Label>
              <Select
                value={formData.discountType}
                onValueChange={(value) =>
                  setFormData({ ...formData, discountType: value as 'PERCENTAGE' | 'FIXED_AMOUNT' })
                }
              >
                <SelectTrigger id="discountType" disabled={isLoading}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                  <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountValue">
                {formData.discountType === 'PERCENTAGE' ? 'Discount %' : 'Discount Amount ($)'}
              </Label>
              <Input
                id="discountValue"
                type="number"
                step="0.01"
                min="0"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                disabled={isLoading}
                className={validationErrors.discountValue ? 'border-red-500' : ''}
              />
              {validationErrors.discountValue && (
                <p className="text-sm text-red-500">{validationErrors.discountValue}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxTotalUses">Max Total Uses</Label>
              <Input
                id="maxTotalUses"
                type="number"
                min="1"
                value={formData.maxTotalUses}
                onChange={(e) => setFormData({ ...formData, maxTotalUses: parseInt(e.target.value) })}
                disabled={isLoading}
                className={validationErrors.maxTotalUses ? 'border-red-500' : ''}
              />
              {validationErrors.maxTotalUses && (
                <p className="text-sm text-red-500">{validationErrors.maxTotalUses}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxUsesPerUser">Max Uses Per User</Label>
              <Input
                id="maxUsesPerUser"
                type="number"
                min="1"
                value={formData.maxUsesPerUser}
                onChange={(e) => setFormData({ ...formData, maxUsesPerUser: parseInt(e.target.value) })}
                disabled={isLoading}
                className={validationErrors.maxUsesPerUser ? 'border-red-500' : ''}
              />
              {validationErrors.maxUsesPerUser && (
                <p className="text-sm text-red-500">{validationErrors.maxUsesPerUser}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                disabled={isLoading}
                className={validationErrors.startDate ? 'border-red-500' : ''}
              />
              {validationErrors.startDate && (
                <p className="text-sm text-red-500">{validationErrors.startDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                disabled={isLoading}
                className={validationErrors.endDate ? 'border-red-500' : ''}
              />
              {validationErrors.endDate && (
                <p className="text-sm text-red-500">{validationErrors.endDate}</p>
              )}
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Creating...' : 'Create Promo Code'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

