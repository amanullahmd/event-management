'use client';

import { useState, useMemo, useCallback } from 'react';
import { getAllUsers, updateUserStatus, updateUserRole } from '@/lib/dummy-data';
import type { User } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>(getAllUsers());
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'block' | 'unblock' | 'promote';
    userId: string;
  } | null>(null);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // Paginate filtered users
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const handleViewDetails = useCallback((user: User) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  }, []);

  const handleBlockUser = useCallback((userId: string) => {
    setPendingAction({ type: 'block', userId });
    setShowConfirmDialog(true);
  }, []);

  const handleUnblockUser = useCallback((userId: string) => {
    setPendingAction({ type: 'unblock', userId });
    setShowConfirmDialog(true);
  }, []);

  const handlePromoteUser = useCallback((userId: string) => {
    setPendingAction({ type: 'promote', userId });
    setShowConfirmDialog(true);
  }, []);

  const confirmAction = () => {
    if (!pendingAction) return;

    const updatedUsers = users.map((user) => {
      if (user.id === pendingAction.userId) {
        if (pendingAction.type === 'block') {
          updateUserStatus(user.id, 'blocked');
          return { ...user, status: 'blocked' as const };
        } else if (pendingAction.type === 'unblock') {
          updateUserStatus(user.id, 'active');
          return { ...user, status: 'active' as const };
        } else if (pendingAction.type === 'promote') {
          updateUserRole(user.id, 'organizer');
          return { ...user, role: 'organizer' as const };
        }
      }
      return user;
    });

    setUsers(updatedUsers);
    if (selectedUser && selectedUser.id === pendingAction.userId) {
      const updatedUser = updatedUsers.find((u) => u.id === pendingAction.userId);
      if (updatedUser) {
        setSelectedUser(updatedUser);
      }
    }

    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  const getActionMessage = () => {
    if (!pendingAction) return '';
    const user = users.find((u) => u.id === pendingAction.userId);
    if (!user) return '';

    switch (pendingAction.type) {
      case 'block':
        return `Are you sure you want to block ${user.name}? They will not be able to access the platform.`;
      case 'unblock':
        return `Are you sure you want to unblock ${user.name}? They will regain access to the platform.`;
      case 'promote':
        return `Are you sure you want to promote ${user.name} to organizer? They will be able to create events.`;
      default:
        return '';
    }
  };

  const getStatusBadge = useCallback((status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-green-600">
        Active
      </Badge>
    ) : (
      <Badge variant="destructive">Blocked</Badge>
    );
  }, []);

  const getRoleBadge = useCallback((role: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      admin: 'destructive',
      organizer: 'default',
      customer: 'secondary',
    };
    return <Badge variant={variants[role] || 'secondary'}>{role}</Badge>;
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-gray-600 mt-2">
          Manage all platform users, view details, and control access
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="max-w-md"
        />
        <div className="text-sm text-gray-600 flex items-center">
          {filteredUsers.length} users found
        </div>
      </div>

      {/* Users Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell>{getStatusBadge(user.status)}</TableCell>
                <TableCell className="text-sm text-gray-600">
                  {user.createdAt.toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Dialog open={showDetailModal && selectedUser?.id === user.id} onOpenChange={setShowDetailModal}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(user)}
                        >
                          View
                        </Button>
                      </DialogTrigger>
                      {selectedUser && (
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>User Details</DialogTitle>
                            <DialogDescription>
                              Detailed information about {selectedUser.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Name</label>
                              <p className="text-gray-700">{selectedUser.name}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Email</label>
                              <p className="text-gray-700">{selectedUser.email}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Role</label>
                              <p className="text-gray-700">{selectedUser.role}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Status</label>
                              <p className="text-gray-700">{selectedUser.status}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">
                                Registered
                              </label>
                              <p className="text-gray-700">
                                {selectedUser.createdAt.toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2 pt-4">
                              {selectedUser.status === 'active' ? (
                                <Button
                                  variant="destructive"
                                  onClick={() => {
                                    handleBlockUser(selectedUser.id);
                                    setShowDetailModal(false);
                                  }}
                                >
                                  Block User
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    handleUnblockUser(selectedUser.id);
                                    setShowDetailModal(false);
                                  }}
                                >
                                  Unblock User
                                </Button>
                              )}
                              {selectedUser.role === 'customer' && (
                                <Button
                                  onClick={() => {
                                    handlePromoteUser(selectedUser.id);
                                    setShowDetailModal(false);
                                  }}
                                >
                                  Promote to Organizer
                                </Button>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      )}
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages || 1}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>{getActionMessage()}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              Confirm
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
