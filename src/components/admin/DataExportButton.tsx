'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Download, Loader } from 'lucide-react';

interface DataExportButtonProps {
  onExport: () => Promise<Blob>;
  fileName?: string;
  isLoading?: boolean;
}

export const DataExportButton: React.FC<DataExportButtonProps> = ({
  onExport,
  fileName = 'promo-codes-export.csv',
  isLoading = false,
}) => {
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleExport = async () => {
    setLocalLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const blob = await onExport();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setLocalLoading(false);
    }
  };

  const isProcessing = isLoading || localLoading;

  return (
    <div className="space-y-3">
      <Button onClick={handleExport} disabled={isProcessing} className="w-full">
        {isProcessing ? (
          <>
            <Loader className="h-4 w-4 mr-2 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Export Data (CSV)
          </>
        )}
      </Button>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">Export completed successfully!</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
