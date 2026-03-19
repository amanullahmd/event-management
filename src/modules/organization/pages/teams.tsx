'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import {
  createOrganization,
  getMyOrganizations,
  getOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationMembers,
  inviteMember,
  getPendingInvitations,
  cancelInvitation,
  removeMember,
  updateMemberRole,
  Organization,
  OrganizationMember,
  OrganizationInvitation,
} from '@/modules/shared-common/services/apiService';
import {
  Building2,
  Users,
  Plus,
  Trash2,
  Edit3,
  Mail,
  Shield,
  UserX,
  ChevronRight,
  Copy,
  Check,
  Globe,
  Crown,
  X,
  UserMinus,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/modules/shared-common/components/ui/button';

const ROLE_COLORS: Record<string, string> = {
  OWNER:   'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  ADMIN:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  MANAGER: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  STAFF:   'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  VIEWER:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
};

const ROLES = ['ADMIN', 'MANAGER', 'STAFF', 'VIEWER'];

export default function TeamsPage() {
  const { user } = useAuth();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [invitations, setInvitations] = useState<OrganizationInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Forms
  const [createForm, setCreateForm] = useState({ name: '', description: '', websiteUrl: '' });
  const [editForm, setEditForm] = useState({ name: '', description: '', websiteUrl: '' });
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'STAFF' });
  const [formLoading, setFormLoading] = useState(false);

  // Invitation token display
  const [lastInviteToken, setLastInviteToken] = useState<string | null>(null);
  const [tokenCopied, setTokenCopied] = useState(false);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const loadOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      const orgs = await getMyOrganizations();
      setOrganizations(orgs);
      if (orgs.length > 0 && !selectedOrg) {
        selectOrg(orgs[0]);
      }
    } catch (e) {
      setError('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  const selectOrg = async (org: Organization) => {
    setSelectedOrg(org);
    try {
      const [fullOrg, orgMembers, orgInvitations] = await Promise.all([
        getOrganization(org.id),
        getOrganizationMembers(org.id),
        getPendingInvitations(org.id).catch(() => []),
      ]);
      setSelectedOrg(fullOrg);
      setMembers(orgMembers);
      setInvitations(orgInvitations);
    } catch {
      // ignore
    }
  };

  useEffect(() => { loadOrganizations(); }, [loadOrganizations]);

  // ─── Create Organization ─────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!createForm.name.trim()) return;
    setFormLoading(true);
    try {
      const org = await createOrganization(createForm);
      setOrganizations(prev => [org, ...prev]);
      await selectOrg(org);
      setShowCreateModal(false);
      setCreateForm({ name: '', description: '', websiteUrl: '' });
      showSuccess(`Organization "${org.name}" created!`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create organization');
    } finally {
      setFormLoading(false);
    }
  };

  // ─── Update Organization ─────────────────────────────────────────────────

  const handleUpdate = async () => {
    if (!selectedOrg) return;
    setFormLoading(true);
    try {
      const updated = await updateOrganization(selectedOrg.id, editForm);
      setSelectedOrg(updated);
      setOrganizations(prev => prev.map(o => o.id === updated.id ? updated : o));
      setShowEditModal(false);
      showSuccess('Organization updated!');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update organization');
    } finally {
      setFormLoading(false);
    }
  };

  // ─── Delete Organization ─────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!selectedOrg) return;
    setFormLoading(true);
    try {
      await deleteOrganization(selectedOrg.id);
      const remaining = organizations.filter(o => o.id !== selectedOrg.id);
      setOrganizations(remaining);
      setSelectedOrg(remaining.length > 0 ? remaining[0] : null);
      setMembers([]);
      setInvitations([]);
      setShowDeleteConfirm(false);
      showSuccess('Organization deleted');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete organization');
    } finally {
      setFormLoading(false);
    }
  };

  // ─── Invite Member ───────────────────────────────────────────────────────

  const handleInvite = async () => {
    if (!selectedOrg || !inviteForm.email.trim()) return;
    setFormLoading(true);
    try {
      const result = await inviteMember(selectedOrg.id, inviteForm);
      setLastInviteToken(result.invitationToken);
      setInvitations(prev => [...prev, {
        id: result.invitationId,
        invitedEmail: result.invitedEmail,
        role: result.role,
        invitedAt: new Date().toISOString(),
        expiresAt: result.expiresAt,
        status: 'pending',
      }]);
      setInviteForm({ email: '', role: 'STAFF' });
      showSuccess(`Invitation sent to ${result.invitedEmail}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to send invitation');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelInvitation = async (invId: string) => {
    if (!selectedOrg) return;
    try {
      await cancelInvitation(selectedOrg.id, invId);
      setInvitations(prev => prev.filter(i => i.id !== invId));
      showSuccess('Invitation cancelled');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to cancel invitation');
    }
  };

  // ─── Member Actions ──────────────────────────────────────────────────────

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedOrg) return;
    try {
      await removeMember(selectedOrg.id, memberId);
      setMembers(prev => prev.filter(m => m.id !== memberId));
      showSuccess('Member removed');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to remove member');
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    if (!selectedOrg) return;
    try {
      const updated = await updateMemberRole(selectedOrg.id, memberId, newRole);
      setMembers(prev => prev.map(m => m.id === memberId ? updated : m));
      showSuccess('Role updated');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update role');
    }
  };

  const copyToken = () => {
    if (!lastInviteToken) return;
    navigator.clipboard.writeText(lastInviteToken);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
  };

  const isOwner = selectedOrg && user && selectedOrg.ownerId === user.id;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Team</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create organizations and collaborate with your team
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Organization
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-center justify-between">
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}
      {successMsg && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span className="text-sm">{successMsg}</span>
        </div>
      )}

      {/* Invitation Token Display */}
      {lastInviteToken && (
        <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl p-4">
          <p className="text-sm font-medium text-violet-800 dark:text-violet-200 mb-2">
            📨 Invitation created! Share this token with the invitee:
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white dark:bg-slate-800 border border-violet-200 dark:border-violet-700 rounded-lg px-3 py-2 text-xs font-mono text-violet-700 dark:text-violet-300 break-all">
              {lastInviteToken}
            </code>
            <Button size="sm" variant="outline" onClick={copyToken}>
              {tokenCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-violet-600 dark:text-violet-400 mt-2">
            They can accept at: <strong>/organizer/teams/accept</strong> using this token
          </p>
          <button
            onClick={() => setLastInviteToken(null)}
            className="text-xs text-violet-500 mt-1 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {organizations.length === 0 ? (
        /* Empty State */
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
          <div className="w-20 h-20 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-10 h-10 text-violet-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Organizations Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Create an organization to collaborate with your team. Invite co-organizers,
            assign roles, and manage events together.
          </p>
          <Button onClick={() => setShowCreateModal(true)} className="bg-violet-600 hover:bg-violet-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Organization
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Organization List */}
          <div className="lg:col-span-1 space-y-2">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Organizations
            </h2>
            {organizations.map(org => (
              <button
                key={org.id}
                onClick={() => selectOrg(org)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                  selectedOrg?.id === org.id
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                    : 'bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${
                    selectedOrg?.id === org.id ? 'bg-white/20 text-white' : 'bg-violet-100 dark:bg-violet-900/30 text-violet-600'
                  }`}>
                    {org.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{org.name}</p>
                    <p className={`text-xs ${selectedOrg?.id === org.id ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
                      {org.memberCount} member{org.memberCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 ${selectedOrg?.id === org.id ? 'text-white/70' : 'text-gray-400'}`} />
                </div>
              </button>
            ))}
          </div>

          {/* Organization Detail */}
          {selectedOrg && (
            <div className="lg:col-span-3 space-y-5">
              {/* Org Header Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                      {selectedOrg.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedOrg.name}</h2>
                      {selectedOrg.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{selectedOrg.description}</p>
                      )}
                      {selectedOrg.websiteUrl && (
                        <a href={selectedOrg.websiteUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-violet-500 hover:underline mt-1">
                          <Globe className="w-3 h-3" />{selectedOrg.websiteUrl}
                        </a>
                      )}
                    </div>
                  </div>
                  {isOwner && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm" variant="outline"
                        onClick={() => {
                          setEditForm({
                            name: selectedOrg.name,
                            description: selectedOrg.description || '',
                            websiteUrl: selectedOrg.websiteUrl || '',
                          });
                          setShowEditModal(true);
                        }}
                      >
                        <Edit3 className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100 dark:border-slate-800">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{members.length}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Members</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{invitations.length}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Pending Invites</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-violet-600">{selectedOrg.status}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                  </div>
                </div>
              </div>

              {/* Members Section */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Team Members</h3>
                    <span className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                      {members.length}
                    </span>
                  </div>
                  {isOwner && (
                    <Button
                      size="sm"
                      onClick={() => setShowInviteModal(true)}
                      className="bg-violet-600 hover:bg-violet-700 text-white"
                    >
                      <Mail className="w-4 h-4 mr-1.5" />
                      Invite Member
                    </Button>
                  )}
                </div>

                <div className="divide-y divide-gray-50 dark:divide-slate-800">
                  {members.map(member => (
                    <div key={member.id} className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {member.userName ? member.userName.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm text-gray-900 dark:text-white">{member.userName || 'Unknown'}</p>
                            {member.role === 'OWNER' && <Crown className="w-3.5 h-3.5 text-yellow-500" />}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{member.userEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {isOwner && member.role !== 'OWNER' ? (
                          <select
                            value={member.role}
                            onChange={e => handleRoleChange(member.id, e.target.value)}
                            className="text-xs border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 cursor-pointer"
                          >
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        ) : (
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[member.role] || ROLE_COLORS.STAFF}`}>
                            {member.role}
                          </span>
                        )}
                        {isOwner && member.role !== 'OWNER' && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Remove member"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Invitations Section */}
              {invitations.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 p-5 border-b border-gray-100 dark:border-slate-800">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Pending Invitations</h3>
                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full">
                      {invitations.length}
                    </span>
                  </div>
                  <div className="divide-y divide-gray-50 dark:divide-slate-800">
                    {invitations.map(inv => (
                      <div key={inv.id} className="flex items-center justify-between px-5 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{inv.invitedEmail}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Role: {inv.role} · Expires: {new Date(inv.expiresAt).toLocaleDateString()}
                          </p>
                        </div>
                        {isOwner && (
                          <button
                            onClick={() => handleCancelInvitation(inv.id)}
                            className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── Create Organization Modal ──────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create Organization</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Organization Name *
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Pulse Events Co."
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="What does your organization do?"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Website URL</label>
                <input
                  type="url"
                  value={createForm.websiteUrl}
                  onChange={e => setCreateForm(f => ({ ...f, websiteUrl: e.target.value }))}
                  placeholder="https://yourcompany.com"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                onClick={handleCreate}
                disabled={formLoading || !createForm.name.trim()}
              >
                {formLoading ? 'Creating...' : 'Create Organization'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Edit Organization Modal ─────────────────────────────────────────── */}
      {showEditModal && selectedOrg && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Organization</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Website URL</label>
                <input
                  type="url"
                  value={editForm.websiteUrl}
                  onChange={e => setEditForm(f => ({ ...f, websiteUrl: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button className="flex-1 bg-violet-600 hover:bg-violet-700 text-white" onClick={handleUpdate} disabled={formLoading}>
                {formLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Invite Member Modal ──────────────────────────────────────────────── */}
      {showInviteModal && selectedOrg && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Invite Team Member</h2>
              <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address *</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="colleague@company.com"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Role</label>
                <select
                  value={inviteForm.role}
                  onChange={e => setInviteForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                >
                  {ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                  ADMIN = full access · MANAGER = events & tickets · STAFF = check-in only · VIEWER = read-only
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowInviteModal(false)}>Cancel</Button>
              <Button
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                onClick={async () => { await handleInvite(); setShowInviteModal(false); }}
                disabled={formLoading || !inviteForm.email.trim()}
              >
                {formLoading ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm Modal ─────────────────────────────────────────────── */}
      {showDeleteConfirm && selectedOrg && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Organization</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
              Are you sure you want to delete <strong>{selectedOrg.name}</strong>?
              This will remove all members and pending invitations. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDelete}
                disabled={formLoading}
              >
                {formLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
