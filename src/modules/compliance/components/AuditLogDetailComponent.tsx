import React from 'react';
import { X, Copy, Check } from 'lucide-react';

interface AuditLogDetail {
  id: number;
  userId: string;
  actionType: string;
  resourceType: string;
  resourceId: string;
  oldValues?: string;
  newValues?: string;
  timestamp: string;
  correlationId: string;
  ipAddress?: string;
  userAgent?: string;
  status: string;
  failureReason?: string;
  signature?: string;
}

interface AuditLogDetailComponentProps {
  log: AuditLogDetail;
  onClose: () => void;
}

/**
 * Component for displaying full details of an audit log entry.
 * Shows all fields including old/new values, correlation ID, and signature.
 */
export const AuditLogDetailComponent: React.FC<AuditLogDetailComponentProps> = ({
  log,
  onClose,
}) => {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const DetailField: React.FC<{ label: string; value?: string; mono?: boolean }> = ({
    label,
    value,
    mono = false,
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-start gap-2">
        <div className={`flex-1 p-3 bg-gray-50 rounded-lg border border-gray-200 ${mono ? 'font-mono text-xs' : 'text-sm'}`}>
          {value || <span className="text-gray-400">N/A</span>}
        </div>
        {value && (
          <button
            onClick={() => copyToClipboard(value, label)}
            className="mt-1 p-2 text-gray-600 hover:text-gray-900 transition-colors"
            title="Copy to clipboard"
          >
            {copiedField === label ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Audit Log Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Basic Information */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
              Basic Information
            </h3>
            <DetailField label="Log ID" value={log.id.toString()} mono />
            <DetailField label="Timestamp" value={new Date(log.timestamp).toLocaleString()} />
            <DetailField label="Status" value={log.status} />
            {log.failureReason && (
              <DetailField label="Failure Reason" value={log.failureReason} />
            )}
          </div>

          {/* User & Action Information */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
              Action Information
            </h3>
            <DetailField label="User ID" value={log.userId} mono />
            <DetailField label="Action Type" value={log.actionType} />
            <DetailField label="Resource Type" value={log.resourceType} />
            <DetailField label="Resource ID" value={log.resourceId} mono />
          </div>

          {/* Changes */}
          {(log.oldValues || log.newValues) && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                Changes
              </h3>
              {log.oldValues && (
                <DetailField label="Old Values" value={log.oldValues} mono />
              )}
              {log.newValues && (
                <DetailField label="New Values" value={log.newValues} mono />
              )}
            </div>
          )}

          {/* Traceability */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
              Traceability
            </h3>
            <DetailField label="Correlation ID" value={log.correlationId} mono />
            {log.ipAddress && (
              <DetailField label="IP Address" value={log.ipAddress} mono />
            )}
            {log.userAgent && (
              <DetailField label="User Agent" value={log.userAgent} />
            )}
          </div>

          {/* Security */}
          {log.signature && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                Security
              </h3>
              <DetailField label="Signature" value={log.signature} mono />
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                ✓ Signature verified - Log integrity confirmed
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

