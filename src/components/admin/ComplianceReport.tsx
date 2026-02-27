import React, { useEffect, useState } from 'react';
import { AlertCircle, Download, Loader } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  changes: Record<string, any>;
  previousValues: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
}

interface ComplianceReport {
  period: string;
  totalRefunds: number;
  totalRefundAmount: number;
  disputes: number;
  auditLogEntries: number;
  complianceStatus: string;
}

interface ComplianceReportProps {}

export const ComplianceReport: React.FC<ComplianceReportProps> = () => {
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate]);

  useEffect(() => {
    fetchAuditLogs();
  }, [startDate, endDate, page, pageSize]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/v1/admin/compliance-report?startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) throw new Error('Failed to fetch compliance report');
      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load compliance report');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch(
        `/api/v1/admin/audit-logs?startDate=${startDate}&endDate=${endDate}&limit=${pageSize}&offset=${page * pageSize}`
      );
      if (!response.ok) throw new Error('Failed to fetch audit logs');
      const data = await response.json();
      setAuditLogs(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs');
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await fetch(
        `/api/v1/admin/compliance-report?startDate=${startDate}&endDate=${endDate}&format=csv`
      );
      if (!response.ok) throw new Error('Failed to export report');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-report-${startDate}-to-${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900">Error Loading Report</h3>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Compliance Report</h2>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          {exporting && <Loader className="w-4 h-4 animate-spin" />}
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(0);
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(0);
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Refunds</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{report.totalRefunds}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Refund Amount</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              ${report.totalRefundAmount.toFixed(2)}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Disputes</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{report.disputes}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Audit Log Entries</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{report.auditLogEntries}</p>
          </div>
        </div>
      )}

      {report && (
        <div
          className={`border rounded-lg p-4 ${
            report.complianceStatus === 'compliant'
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}
        >
          <p className="text-sm font-medium text-gray-700">Compliance Status</p>
          <p
            className={`text-lg font-semibold mt-1 ${
              report.complianceStatus === 'compliant'
                ? 'text-green-900'
                : 'text-yellow-900'
            }`}
          >
            {report.complianceStatus.charAt(0).toUpperCase() + report.complianceStatus.slice(1)}
          </p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Audit Logs</h3>
        {auditLogs.length === 0 ? (
          <p className="text-sm text-gray-600">No audit logs found for the selected period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Timestamp</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Action</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Entity Type</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">User ID</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-2 px-3 text-gray-900">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-gray-900">{log.action}</td>
                    <td className="py-2 px-3 text-gray-900">{log.entityType}</td>
                    <td className="py-2 px-3 text-gray-600">{log.userId.slice(0, 8)}...</td>
                    <td className="py-2 px-3 text-gray-600">{log.ipAddress || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {auditLogs.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-900 rounded transition"
            >
              Previous
            </button>
            <p className="text-sm text-gray-600">
              Page {page + 1} • Showing {auditLogs.length} entries
            </p>
            <button
              onClick={() => setPage(page + 1)}
              disabled={auditLogs.length < pageSize}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-900 rounded transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
