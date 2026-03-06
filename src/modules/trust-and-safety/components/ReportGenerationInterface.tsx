import React, { useState } from 'react';

interface FraudReport {
  reportId: number;
  reportType: string;
  startDate: string;
  endDate: string;
  totalTransactions: number;
  fraudulentTransactions: number;
  blockedTransactions: number;
  fraudLossAmount: string;
  fraudDetectionRate: number;
  falsePositiveRate: number;
  riskLevelDistribution: Record<string, number>;
  decisionDistribution: Record<string, number>;
  topRiskFactors: string[];
  topAffectedCountries: string[];
  generatedAt: string;
  generatedBy: string;
}

export const ReportGenerationInterface: React.FC = () => {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState<FraudReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentReports, setRecentReports] = useState<FraudReport[]>([]);

  React.useEffect(() => {
    fetchRecentReports();
  }, []);

  const fetchRecentReports = async () => {
    try {
      const response = await fetch('/api/admin/fraud/reports/recent?limit=5');
      if (!response.ok) throw new Error('Failed to fetch recent reports');
      const data = await response.json();
      setRecentReports(data);
    } catch (err) {
      console.error('Error fetching recent reports:', err);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = '';
      if (reportType === 'daily') {
        url = `/api/admin/fraud/reports/daily?date=${startDate}T00:00:00`;
      } else if (reportType === 'weekly') {
        url = `/api/admin/fraud/reports/weekly?startDate=${startDate}T00:00:00`;
      } else if (reportType === 'monthly') {
        url = `/api/admin/fraud/reports/monthly?startDate=${startDate}T00:00:00`;
      } else {
        url = `/api/admin/fraud/reports/custom?startDate=${startDate}T00:00:00&endDate=${endDate}T23:59:59`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to generate report');
      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;

    const csv = generateCSV(report);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fraud-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const generateCSV = (report: FraudReport): string => {
    const lines = [
      ['Fraud Detection Report'],
      ['Report Type', report.reportType],
      ['Generated At', new Date(report.generatedAt).toLocaleString()],
      [''],
      ['Summary Metrics'],
      ['Total Transactions', report.totalTransactions],
      ['Fraudulent Transactions', report.fraudulentTransactions],
      ['Blocked Transactions', report.blockedTransactions],
      ['Fraud Detection Rate', `${report.fraudDetectionRate.toFixed(2)}%`],
      ['False Positive Rate', `${report.falsePositiveRate.toFixed(2)}%`],
      ['Fraud Loss Amount', report.fraudLossAmount],
      [''],
      ['Risk Level Distribution'],
      ...Object.entries(report.riskLevelDistribution).map(([level, count]) => [level, count]),
      [''],
      ['Decision Distribution'],
      ...Object.entries(report.decisionDistribution).map(([decision, count]) => [decision, count]),
    ];

    return lines.map(line => line.join(',')).join('\n');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6">Report Generation</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Generator */}
        <div className="lg:col-span-2">
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-4">Generate Report</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom Date Range</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              {reportType === 'custom' && (
                <div>
                  <label className="block text-sm font-semibold mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              )}

              <button
                onClick={generateReport}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>

          {/* Report Display */}
          {error && <div className="p-4 text-red-600 mb-4">Error: {error}</div>}

          {report && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">{report.reportType} Report</h2>
                <button
                  onClick={downloadReport}
                  className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700"
                >
                  Download CSV
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-3 rounded">
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold">{report.totalTransactions}</p>
                </div>
                <div className="bg-white p-3 rounded">
                  <p className="text-sm text-gray-600">Fraudulent</p>
                  <p className="text-2xl font-bold text-red-600">{report.fraudulentTransactions}</p>
                </div>
                <div className="bg-white p-3 rounded">
                  <p className="text-sm text-gray-600">Blocked</p>
                  <p className="text-2xl font-bold text-red-600">{report.blockedTransactions}</p>
                </div>
                <div className="bg-white p-3 rounded">
                  <p className="text-sm text-gray-600">Detection Rate</p>
                  <p className="text-2xl font-bold">{report.fraudDetectionRate.toFixed(2)}%</p>
                </div>
                <div className="bg-white p-3 rounded">
                  <p className="text-sm text-gray-600">False Positive Rate</p>
                  <p className="text-2xl font-bold">{report.falsePositiveRate.toFixed(2)}%</p>
                </div>
                <div className="bg-white p-3 rounded">
                  <p className="text-sm text-gray-600">Fraud Loss</p>
                  <p className="text-2xl font-bold">${report.fraudLossAmount}</p>
                </div>
              </div>

              {report.topRiskFactors && report.topRiskFactors.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Top Risk Factors</h3>
                  <div className="flex flex-wrap gap-2">
                    {report.topRiskFactors.map((factor, idx) => (
                      <span key={idx} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Reports */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Recent Reports</h2>
          <div className="space-y-3">
            {recentReports.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent reports</p>
            ) : (
              recentReports.map((r) => (
                <div key={r.reportId} className="bg-white p-3 rounded border">
                  <p className="font-semibold text-sm">{r.reportType}</p>
                  <p className="text-xs text-gray-600">
                    {new Date(r.generatedAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Transactions: {r.totalTransactions}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

