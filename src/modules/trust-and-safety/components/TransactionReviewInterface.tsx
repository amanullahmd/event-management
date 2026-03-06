import React, { useState, useEffect } from 'react';

interface Transaction {
  transactionId: string;
  userId: number;
  amount: string;
  currency: string;
  paymentMethod: string;
  ipAddress: string;
  email: string;
  fraudScore: number;
  riskLevel: string;
  decision: string;
  riskFactors: string[];
  status: string;
  createdAt: string;
}

export const TransactionReviewInterface: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewDecision, setReviewDecision] = useState('ALLOW');

  useEffect(() => {
    fetchPendingTransactions();
  }, []);

  const fetchPendingTransactions = async () => {
    try {
      const response = await fetch('/api/admin/fraud/transactions/pending');
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setTransactions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewTransaction = async () => {
    if (!selectedTransaction) return;

    try {
      const response = await fetch(
        `/api/admin/fraud/transactions/${selectedTransaction.transactionId}/review`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            decision: reviewDecision,
            notes: reviewNotes,
            adminId: 1, // Should come from auth context
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to review transaction');
      
      setSelectedTransaction(null);
      setReviewNotes('');
      setReviewDecision('ALLOW');
      fetchPendingTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-4">Loading transactions...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6">Transaction Review</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction List */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <p className="text-gray-500">No pending transactions</p>
            ) : (
              transactions.map((txn) => (
                <div
                  key={txn.transactionId}
                  className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedTransaction(txn)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{txn.transactionId}</p>
                      <p className="text-sm text-gray-600">{txn.email}</p>
                      <p className="text-sm text-gray-600">${txn.amount} {txn.currency}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRiskLevelColor(txn.riskLevel)}`}>
                        {txn.riskLevel}
                      </span>
                      <p className="text-sm text-gray-600 mt-2">Score: {txn.fraudScore.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Transaction Details */}
        {selectedTransaction && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Transaction Details</h2>
            
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm text-gray-600">Transaction ID</p>
                <p className="font-semibold">{selectedTransaction.transactionId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">User ID</p>
                <p className="font-semibold">{selectedTransaction.userId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{selectedTransaction.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="font-semibold">${selectedTransaction.amount} {selectedTransaction.currency}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">IP Address</p>
                <p className="font-semibold text-xs">{selectedTransaction.ipAddress}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Risk Factors</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedTransaction.riskFactors.map((factor, idx) => (
                    <span key={idx} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Review Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Decision</label>
                <select
                  value={reviewDecision}
                  onChange={(e) => setReviewDecision(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="ALLOW">Allow</option>
                  <option value="VERIFY_2FA">Verify 2FA</option>
                  <option value="MANUAL_REVIEW">Manual Review</option>
                  <option value="BLOCK">Block</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Notes</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  rows={4}
                  placeholder="Enter review notes..."
                />
              </div>

              <button
                onClick={handleReviewTransaction}
                className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700"
              >
                Submit Review
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

