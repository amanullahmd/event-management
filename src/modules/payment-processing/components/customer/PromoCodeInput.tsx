'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface PromoCodeInputProps {
  onApply: (code: string) => Promise<void>;
  onRemove?: () => Promise<void>;
  appliedCode?: string;
  isLoading?: boolean;
  error?: string;
  success?: string;
}

export const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  onApply,
  onRemove,
  appliedCode,
  isLoading = false,
  error,
  success,
}) => {
  const [code, setCode] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;

    setLocalLoading(true);
    try {
      await onApply(code);
      setCode('');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!onRemove) return;

    setLocalLoading(true);
    try {
      await onRemove();
    } finally {
      setLocalLoading(false);
    }
  };

  const isProcessing = isLoading || localLoading;

  if (appliedCode) {
    return (
      <div className="space-y-3">
        <Label>Applied Promo Code</Label>
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="font-mono font-semibold text-green-700">{appliedCode}</span>
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={isProcessing}
              className="ml-auto text-red-600 hover:text-red-700"
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label htmlFor="promo-code">Promo Code (Optional)</Label>
      <div className="flex gap-2">
        <Input
          id="promo-code"
          placeholder="Enter promo code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          disabled={isProcessing}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleApply();
            }
          }}
        />
        <Button onClick={handleApply} disabled={isProcessing || !code.trim()} className="whitespace-nowrap">
          {isProcessing ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Applying...
            </>
          ) : (
            'Apply'
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

