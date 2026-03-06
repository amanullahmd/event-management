import React, { useState } from 'react';

interface UserRiskProfile {
  userId: number;
  email: string;
  overallRiskScore: number;
  riskLevel: string;
  totalTransactions: number;
  fraudulentTransactions: number;
  blockedTransactions: number;
  riskFactors: string[];
  suspiciousActivities: string[];
  lastTransactionAt: string;
  lastReviewAt: string;
  status: string;
}

export const UserRiskProfileViewer: React.FC = () => {
  const [highRiskUsers, setHighRiskUsers] = useState<UserRiskProfile[]>([]);
  const [recentlyFlaggedUsers, setRecentlyFlaggedUsers] = useState<UserRiskProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserRiskProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'high-risk' | 'flagged'>('high-risk');

  const fetchHighRiskUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/fraud/users/high-risk?limit=20');
      if (!response.ok) throw new Error('Failed to fetch high-risk users');
      const data = await response.json();
      setHighRiskUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentlyFlaggedUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/fraud/users/recently-flagged?limit=20');
      if (!response.ok) throw new Error('Failed to fetch flagged users');
      const data = await response.json();
      setRecentlyFlaggedUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchHighRiskUsers();
    fetchRecentlyFlaggedUsers();
  }, []);

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const users = activeTab === 'high-risk' ? highRiskUsers : recentlyFlaggedUsers;

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6">User Risk Profiles</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('high-risk')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'high-risk'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          High Risk Users
        </button>
        <button
          onClick={() => setActiveTab('flagged')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'flagged'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Recently Flagged
        </button>
      </div>

      {error && <div className="p-4 text-red-600 mb-4">Error: {error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User List */}
        <div className="lg:col-span-2">
          {loading ? (
            <p className="text-gray-500">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-gray-500">No users found</p>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.userId}
                  className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">User #{user.userId}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Transactions: {user.totalTransactions} | Fraudulent: {user.fraudulentTransactions} | Blocked: {user.blockedTransactions}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRiskLevelColor(user.riskLevel)}`}>
                        {user.riskLevel}
                      </span>
                      <p className="text-sm text-gray-600 mt-2">Score: {user.overallRiskScore.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Details */}
        {selectedUser && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">User Details</h2>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm text-gray-600">User ID</p>
                <p className="font-semibold">{selectedUser.userId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-sm">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Risk Level</p>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRiskLevelColor(selectedUser.riskLevel)}`}>
                  {selectedUser.riskLevel}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Overall Risk Score</p>
                <p className="font-semibold">{selectedUser.overallRiskScore.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold">{selectedUser.status}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="font-semibold">{selectedUser.totalTransactions}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fraudulent Transactions</p>
                <p className="font-semibold text-red-600">{selectedUser.fraudulentTransactions}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Blocked Transactions</p>
                <p className="font-semibold text-red-600">{selectedUser.blockedTransactions}</p>
              </div>
            </div>

            {selectedUser.riskFactors && selectedUser.riskFactors.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Risk Factors</p>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.riskFactors.map((factor, idx) => (
                    <span key={idx} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedUser.lastTransactionAt && (
              <div className="text-xs text-gray-500">
                <p>Last Transaction: {new Date(selectedUser.lastTransactionAt).toLocaleString()}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

