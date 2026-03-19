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
import { ShieldCheck, Plus, Trash2, X, Loader2 } from 'lucide-react';

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
  const [addForm, setAddForm] = useState({ userEmail: '', ...defaultPerms() });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [togglingPerm, setTogglingPerm] = useState<string | null>(null); // "memberId:permKey"

  const showSuccess = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3500); };
  const showError = (msg: string) => { setError(msg); setTimeout(() => setError(''), 5000); };

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminTeamMembers();
      setMembers(data);
    } catch {
      showError('Failed to load team members');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  const handleAdd = async () => {
    if (!addForm.userEmail.trim()) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addForm.userEmail.trim())) {
      showError('Please enter a valid email address');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await addAdminTeamMember(addForm);
      setShowAddModal(false);
      setAddForm({ userEmail: '', ...defaultPerms() });
      await loadMembers();
      showSuccess('Team member added successfully');
    } catch {
      showError('Failed to add member. User may already be in the team.');
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = async (member: AdminTeamMember, permKey: PermKey) => {
    const toggling = `${member.id}:${permKey}`;
    setTogglingPerm(toggling);
    const updatedPerms = Object.fromEntries(
      PERMISSIONS.map((p) => [p.key, p.key === permKey ? !member[p.key] : member[p.key]])
    ) as Record<PermKey, boolean>;
    // Optimistic update
    setMembers(prev => prev.map(m =>
      m.id === member.id ? { ...m, [permKey]: !member[permKey] } : m
    ));
    try {
      await updateAdminMemberPermissions(member.id, updatedPerms);
      showSuccess(`${PERMISSIONS.find(p => p.key === permKey)?.label} ${updatedPerms[permKey] ? 'enabled' : 'disabled'}`);
    } catch {
      // Revert optimistic update
      setMembers(prev => prev.map(m =>
        m.id === member.id ? { ...m, [permKey]: member[permKey] } : m
      ));
      showError('Failed to update permission');
    } finally {
      setTogglingPerm(null);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm('Remove this admin team member?')) return;
    try {
      await removeAdminTeamMember(memberId);
      await loadMembers();
      showSuccess('Team member removed');
    } catch {
      showError('Cannot remove this member');
    }
  };

  const isSuperAdmin = members.some((m) => m.role === 'SUPER_ADMIN' && (m.userId === user?.id || m.userEmail === user?.email));

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
        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> {success}
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
            <div className="p-4 space-y-3 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/4" />
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3].map(j => <div key={j} className="w-4 h-4 bg-slate-100 dark:bg-slate-800 rounded" />)}
                  </div>
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="p-12 text-center">
              <ShieldCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">No admin team members yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {members.map((member) => (
                <div key={member.id} className="p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  {/* Member info row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        member.role === 'SUPER_ADMIN'
                          ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      }`}>
                        {member.userName ? member.userName.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                          {member.userName}
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            member.role === 'SUPER_ADMIN'
                              ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {member.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Member'}
                          </span>
                        </p>
                        <p className="text-xs text-slate-400">{member.userEmail}</p>
                      </div>
                    </div>
                    {isSuperAdmin && member.role !== 'SUPER_ADMIN' && (
                      <button
                        onClick={() => handleRemove(member.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    )}
                  </div>

                  {/* Permissions grid */}
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {PERMISSIONS.map((p) => {
                      const isToggling = togglingPerm === `${member.id}:${p.key}`;
                      const enabled = member[p.key];
                      const isSuper = member.role === 'SUPER_ADMIN';
                      const canToggle = isSuperAdmin && !isSuper;

                      return (
                        <button
                          key={p.key}
                          onClick={() => canToggle && togglePermission(member, p.key)}
                          disabled={!canToggle || togglingPerm !== null}
                          title={canToggle ? `Click to ${enabled ? 'disable' : 'enable'} ${p.label}` : p.description}
                          className={`relative flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl text-xs font-medium transition-all ${
                            canToggle ? 'cursor-pointer' : 'cursor-default'
                          } ${
                            isSuper || enabled
                              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50'
                              : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700/50'
                          } ${
                            canToggle && enabled ? 'hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-800/50 dark:hover:text-red-400' : ''
                          } ${
                            canToggle && !enabled ? 'hover:bg-green-50 hover:border-green-200 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:border-green-800/50 dark:hover:text-green-400' : ''
                          } disabled:opacity-60`}
                        >
                          {isToggling ? (
                            <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />
                          ) : (
                            <div className={`w-8 h-4.5 rounded-full relative transition-colors ${
                              isSuper || enabled
                                ? 'bg-green-500 dark:bg-green-600'
                                : 'bg-slate-300 dark:bg-slate-600'
                            }`}>
                              <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-all ${
                                isSuper || enabled ? 'left-[calc(100%-16px)]' : 'left-0.5'
                              }`} />
                            </div>
                          )}
                          <span>{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
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
