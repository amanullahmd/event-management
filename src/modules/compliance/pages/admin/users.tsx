'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { getAllUsers, updateUserStatus, updateUserRole } from '@/modules/shared-common/services/apiService';
import type { User } from '@/modules/shared-common/services/apiService';
import { Button } from '@/modules/shared-common/components/ui/button';
import { Input } from '@/modules/shared-common/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/modules/shared-common/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/modules/shared-common/components/ui/alert-dialog';
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Ban,
  CheckCircle,
  Shield,
  UserPlus,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

function getUserDisplayName(user: User): string {
  if (user.name && user.name.trim()) return user.name;
  if (user.firstName || user.lastName) {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  }
  return user.email;
}

function getUserInitial(user: User): string {
  return getUserDisplayName(user).charAt(0).toUpperCase();
}

function isUserActive(user: User): boolean {
  return (user.status || '').toUpperCase() === 'ACTIVE';
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'block' | 'unblock' | 'promote';
    userId: string;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const displayName = getUserDisplayName(user).toLowerCase();
      const matchesSearch =
        displayName.includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        user.status?.toUpperCase() === statusFilter.toUpperCase();
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const handleAction = useCallback(
    (type: 'block' | 'unblock' | 'promote', userId: string) => {
      setPendingAction({ type, userId });
      setShowConfirmDialog(true);
    },
    []
  );

  const confirmAction = async () => {
    if (!pendingAction) return;
    setActionLoading(true);
    try {
      if (pendingAction.type === 'block') {
        await updateUserStatus(pendingAction.userId, 'blocked');
      } else if (pendingAction.type === 'unblock') {
        await updateUserStatus(pendingAction.userId, 'active');
      } else if (pendingAction.type === 'promote') {
        await updateUserRole(pendingAction.userId, 'ORGANIZER');
      }
      await fetchUsers();
    } catch (err) {
      console.error('Action failed:', err);
    } finally {
      setActionLoading(false);
      setShowConfirmDialog(false);
      setShowDetailModal(false);
      setPendingAction(null);
    }
  };

  const getActionMessage = () => {
    if (!pendingAction) return '';
    const user = users.find((u) => u.id === pendingAction.userId);
    if (!user) return '';
    const name = getUserDisplayName(user);
    switch (pendingAction.type) {
      case 'block':
        return `Are you sure you want to block ${name}? They will not be able to access the platform.`;
      case 'unblock':
        return `Are you sure you want to unblock ${name}? They will regain access.`;
      case 'promote':
        return `Are you sure you want to promote ${name} to Organizer? They will be able to create events.`;
      default:
        return '';
    }
  };

  const getRoleBadge = (role: string) => {
    const r = role?.toUpperCase();
    if (r === 'ADMIN')
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          <Shield className="w-3 h-3" /> Admin
        </span>
      );
    if (r === 'ORGANIZER')
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          <UserPlus className="w-3 h-3" /> Organizer
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        <Users className="w-3 h-3" /> Customer
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    if ((status || '').toUpperCase() === 'ACTIVE')
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle className="w-3 h-3" /> Active
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
        <Ban className="w-3 h-3" /> Blocked
      </span>
    );
  };

  const roleCounts = useMemo(() => ({
    all: users.length,
    ADMIN: users.filter((u) => u.role === 'ADMIN').length,
    ORGANIZER: users.filter((u) => u.role === 'ORGANIZER').length,
    CUSTOMER: users.filter((u) => u.role === 'CUSTOMER').length,
  }), [users]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        <div className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-3 w-56 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-red-50 dark:bg-red-900/10 p-8 rounded-2xl border border-red-200 dark:border-red-800 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Failed to Load Users</h2>
          <p className="text-red-500 mb-6">{error}</p>
          <Button onClick={fetchUsers} className="bg-red-600 hover:bg-red-700 text-white">
            <RefreshCw className="w-4 h-4 mr-2" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">User Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">{filteredUsers.length} users found</p>
        </div>
        <Button onClick={fetchUsers} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="pl-10"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"
        >
          <option value="all">All Roles ({roleCounts.all})</option>
          <option value="ADMIN">Admin ({roleCounts.ADMIN})</option>
          <option value="ORGANIZER">Organizer ({roleCounts.ORGANIZER})</option>
          <option value="CUSTOMER">Customer ({roleCounts.CUSTOMER})</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="BLOCKED">Blocked</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                    <p className="font-medium">No users found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                          {getUserInitial(user)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{getUserDisplayName(user)}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(user.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => { setSelectedUser(user); setShowDetailModal(true); }}>
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                        {isUserActive(user) ? (
                          <Button variant="destructive" size="sm" onClick={() => handleAction('block', user.id)}>
                            <Ban className="w-4 h-4 mr-1" /> Block
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => handleAction('unblock', user.id)}>
                            <CheckCircle className="w-4 h-4 mr-1" /> Unblock
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400">Page {currentPage} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              {selectedUser ? getUserDisplayName(selectedUser) : ''}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {getUserInitial(selectedUser)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{getUserDisplayName(selectedUser)}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Role</p>
                  {getRoleBadge(selectedUser.role)}
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Status</p>
                  {getStatusBadge(selectedUser.status)}
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Registered</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">User ID</p>
                  <p className="text-sm font-mono text-slate-900 dark:text-white truncate">{selectedUser.id}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                {isUserActive(selectedUser) ? (
                  <Button variant="destructive" className="flex-1" onClick={() => handleAction('block', selectedUser.id)}>
                    <Ban className="w-4 h-4 mr-2" /> Block User
                  </Button>
                ) : (
                  <Button variant="outline" className="flex-1" onClick={() => handleAction('unblock', selectedUser.id)}>
                    <CheckCircle className="w-4 h-4 mr-2" /> Unblock User
                  </Button>
                )}
                {selectedUser.role === 'CUSTOMER' && (
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleAction('promote', selectedUser.id)}>
                    <UserPlus className="w-4 h-4 mr-2" /> Promote to Organizer
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>{getActionMessage()}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction} disabled={actionLoading}>
              {actionLoading ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
