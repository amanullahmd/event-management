import React, { useState, useEffect } from 'react';

interface FraudRule {
  id: number;
  name: string;
  description: string;
  ruleType: string;
  condition: string;
  action: string;
  enabled: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export const RuleManagementInterface: React.FC = () => {
  const [rules, setRules] = useState<FraudRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<FraudRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ruleType: 'VELOCITY',
    condition: '',
    action: 'BLOCK',
    priority: 1,
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await fetch('/api/admin/fraud/rules');
      if (!response.ok) throw new Error('Failed to fetch rules');
      const data = await response.json();
      setRules(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async () => {
    try {
      const response = await fetch('/api/admin/fraud/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create rule');
      
      setShowForm(false);
      setFormData({
        name: '',
        description: '',
        ruleType: 'VELOCITY',
        condition: '',
        action: 'BLOCK',
        priority: 1,
      });
      fetchRules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleUpdateRule = async () => {
    if (!editingRule) return;

    try {
      const response = await fetch(`/api/admin/fraud/rules/${editingRule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update rule');
      
      setEditingRule(null);
      setShowForm(false);
      setFormData({
        name: '',
        description: '',
        ruleType: 'VELOCITY',
        condition: '',
        action: 'BLOCK',
        priority: 1,
      });
      fetchRules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) return;

    try {
      const response = await fetch(`/api/admin/fraud/rules/${ruleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete rule');
      fetchRules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleToggleRule = async (ruleId: number, enabled: boolean) => {
    try {
      const endpoint = enabled ? 'disable' : 'enable';
      const response = await fetch(`/api/admin/fraud/rules/${ruleId}/${endpoint}`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to toggle rule');
      fetchRules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleEditRule = (rule: FraudRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description,
      ruleType: rule.ruleType,
      condition: rule.condition,
      action: rule.action,
      priority: rule.priority,
    });
    setShowForm(true);
  };

  if (loading) return <div className="p-4">Loading rules...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Fraud Rules Management</h1>
        <button
          onClick={() => {
            setEditingRule(null);
            setFormData({
              name: '',
              description: '',
              ruleType: 'VELOCITY',
              condition: '',
              action: 'BLOCK',
              priority: 1,
            });
            setShowForm(!showForm);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Create Rule'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Rule Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g., High Velocity Detection"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Rule Type</label>
              <select
                value={formData.ruleType}
                onChange={(e) => setFormData({ ...formData, ruleType: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="VELOCITY">Velocity</option>
                <option value="LOCATION">Location</option>
                <option value="DEVICE">Device</option>
                <option value="BEHAVIORAL">Behavioral</option>
                <option value="PAYMENT">Payment</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border rounded px-3 py-2"
              rows={3}
              placeholder="Describe the rule..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Condition</label>
            <textarea
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              className="w-full border rounded px-3 py-2"
              rows={3}
              placeholder="e.g., transactions_per_hour > 10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Action</label>
              <select
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="ALLOW">Allow</option>
                <option value="VERIFY_2FA">Verify 2FA</option>
                <option value="MANUAL_REVIEW">Manual Review</option>
                <option value="BLOCK">Block</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Priority</label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                className="w-full border rounded px-3 py-2"
                min="1"
                max="100"
              />
            </div>
          </div>

          <button
            onClick={editingRule ? handleUpdateRule : handleCreateRule}
            className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700"
          >
            {editingRule ? 'Update Rule' : 'Create Rule'}
          </button>
        </div>
      )}

      {/* Rules List */}
      <div className="space-y-4">
        {rules.length === 0 ? (
          <p className="text-gray-500">No rules configured</p>
        ) : (
          rules.map((rule) => (
            <div key={rule.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{rule.name}</h3>
                  <p className="text-sm text-gray-600">{rule.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleRule(rule.id, rule.enabled)}
                    className={`px-3 py-1 rounded text-sm font-semibold ${
                      rule.enabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {rule.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                <div>
                  <p className="text-gray-600">Type</p>
                  <p className="font-semibold">{rule.ruleType}</p>
                </div>
                <div>
                  <p className="text-gray-600">Action</p>
                  <p className="font-semibold">{rule.action}</p>
                </div>
                <div>
                  <p className="text-gray-600">Priority</p>
                  <p className="font-semibold">{rule.priority}</p>
                </div>
                <div>
                  <p className="text-gray-600">Updated</p>
                  <p className="font-semibold text-xs">{new Date(rule.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditRule(rule)}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-semibold hover:bg-blue-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm font-semibold hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
