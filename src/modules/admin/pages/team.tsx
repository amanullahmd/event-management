'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import {
  getAdminTeamMembers,
  addAdminTeamMember,
  updateAdminMemberPermissions,
  removeAdminTeamMember,
  AdminTeamMember,
} from '@/modules/shared-common/services/apiService';
import { ShieldCheck, Plus, Trash2, Edit2, Save, X } from 'lucide-react';

const PERMISSIONS = [
  { key: 'permSupport', label: 'Support', description: 'Manage support tickets' },
  { key: 'permUsers', label: 'Users', description: 'Manage user accounts' },
  { key: 'permEvents', label: 'Events', description: 'Manage platform events' },
  { key: 'permOrganizers', label: 'Organizers', description: 'Manage organizers' },
  { key: 'permContent', label: 'Content', description: 'Moderate content' },
  { key: 'permAnalytics', label: 'Analytics', description: 'View analytics' },
  { key: 'permSettings', label: 'Settings', description: 'System settings' },
] as const;

type PermKey = typeof PERMISSIONS[number]['key'];

const defaultPerms = () =>
  Object.fromEntries(PERMISSIONS.map((p) => [p.key, false])) as Record<PermKey, boolean>;

export default function AdminTeamPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<AdminTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPerms, setEditPerms] = useState<Record<PermKey, boolean>>(defaultPerms());
  const [addForm, setAddForm] = useState({ userEmail: '', ...defaultPerms() });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminTeamMembers();
      setMembers(data);
    } catch {
      setError('Failed to load team members');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  const handleAdd = async () => {
    if (!addForm.userEmail.trim()) return;
    setSaving(true);
    setError('');
    try {
      await addAdminTeamMember(addForm);
      setShowAddModal(false);
      setAddForm({ userEmail: '', ...defaultPerms() });
      await loadMembers();
    } catch {
      setError('Failed to add member. User may already be in the team.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (member: AdminTeamMember) => {
    setEditingId(member.id);
    setEditPerms(
      Object.fromEntries(PERMISSIONS.map((p) => [p.key, member[p.key]])) as Record<PermKey, boolean>
    );
  };

  const handleSavePerms = async (memberId: string) => {
    setSaving(true);
    try {
      await updateAdminMemberPermissions(memberId, editPerms);
      setEditingId(null);
      await loadMembers();
    } catch {
      setError('Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm('Remove this admin team member?')) return;
    try {
      await removeAdminTeamMember(memberId);
      await loadMembers();
    } catch {
      setError('Cannot remove this member');
    }
  };

  const isSuperAdmin = members.find((m) => m.role === 'SUPER_ADMIN')?.userId === user?.id;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-violet-600" />
              Admin Team
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage admin team members and their platform permissions
            </p>
          </div>
          {isSuperAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" /> Add Member
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Members</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{members.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {members.filter((m) => m.status === 'active').length}
            </p>
          </div>
        </div>

        {/* Team Members Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading team members...</div>
          ) : members.length === 0 ? (
            <div className="p-12 text-center">
              <ShieldCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">No admin team members yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="text-left px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">Member</th>
                    <th className="text-left px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">Role</th>
                    {PERMISSIONS.map((p) => (
                      <th key={p.key} className="text-center px-2 py-3 text-slate-600 dark:text-slate-300 font-medium text-xs">
                        {p.label}
                      </th>
                    ))}
                    {isSuperAdmin && (
                      <th className="text-right px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                            {member.userName}
                            {member.role === 'SUPER_ADMIN' && (
                              <span className="px-1.5 py-0.5 text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded font-medium">
                                Super Admin
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-400">{member.userEmail}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          member.role === 'SUPER_ADMIN'
                            ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {member.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin Member'}
                        </span>
                      </td>
                      {PERMISSIONS.map((p) => {
                        const isEditing = editingId === member.id;
                        const value = isEditing ? editPerms[p.key] : member[p.key];
                        return (
                          <td key={p.key} className="px-2 py-3 text-center">
                            {member.role === 'SUPER_ADMIN' ? (
                              <span className="text-green-600 dark:text-green-400">✓</span>
                            ) : isEditing ? (
                              <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => setEditPerms(prev => ({ ...prev, [p.key]: e.target.checked }))}
                                className="w-4 h-4 rounded text-violet-600 cursor-pointer"
                              />
                            ) : value ? (
                              <span className="text-green-600 dark:text-green-400">✓</span>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-600">—</span>
                            )}
                          </td>
                        );
                      })}
                      {isSuperAdmin && (
                        <td className="px-4 py-3">
                          {member.role !== 'SUPER_ADMIN' && (
                            <div className="flex items-center justify-end gap-2">
                              {editingId === member.id ? (
                                <>
                                  <button
                                    onClick={() => handleSavePerms(member.id)}
                                    disabled={saving}
                                    className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded hover:bg-green-200 transition-colors"
                                  >
                                    <Save className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded hover:bg-slate-200 transition-colors"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startEdit(member)}
                                    className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 transition-colors"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleRemove(member.id)}
                                    className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Admin Team Member</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  User Email
                </label>
                <input
                  type="email"
                  value={addForm.userEmail}
                  onChange={(e) => setAddForm(prev => ({ ...prev, userEmail: e.target.value }))}
                  placeholder="admin@example.com"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Permissions</p>
                <div className="space-y-2">
                  {PERMISSIONS.map((p) => (
                    <label key={p.key} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addForm[p.key]}
                        onChange={(e) => setAddForm(prev => ({ ...prev, [p.key]: e.target.checked }))}
                        className="w-4 h-4 rounded text-violet-600"
                      />
                      <div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{p.label}</span>
                        <span className="text-xs text-slate-400 ml-2">{p.description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={saving || !addForm.userEmail.trim()}
                className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors font-medium"
              >
                {saving ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
