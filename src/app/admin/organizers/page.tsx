'use client';

import React, { useState, useMemo } from 'react';
import { getAllOrganizers, updateOrganizerVerificationStatus } from '@/lib/dummy-data';
import { OrganizerProfile } from '@/lib/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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

/**
 * Admin Organizer Management Page
 * Displays list of all organizers with verification status
 * Allows admin to approve, reject, or request additional information
 */
export default function OrganizerManagementPage() {
  const [organizers, setOrganizers] = useState<OrganizerProfile[]>(getAllOrganizers());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrganizer, setSelectedOrganizer] = useState<OrganizerProfile | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'request-info' | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter organizers based on search term
  const filteredOrganizers = useMemo(() => {
    return organizers.filter(
      (org) =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.businessName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [organizers, searchTerm]);

  // Paginate results
  const paginatedOrganizers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrganizers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrganizers, currentPage]);

  const totalPages = Math.ceil(filteredOrganizers.length / itemsPerPage);

  // Handle organizer selection
  const handleSelectOrganizer = (organizer: OrganizerProfile) => {
    setSelectedOrganizer(organizer);
    setShowDetailModal(true);
  };

  // Handle verification action
  const handleVerificationAction = (
    organizer: OrganizerProfile,
    action: 'approve' | 'reject' | 'request-info'
  ) => {
    setSelectedOrganizer(organizer);
    setActionType(action);
    setShowActionDialog(true);
  };

  // Confirm verification action
  const confirmAction = () => {
    if (!selectedOrganizer || !actionType) return;

    let newStatus: 'verified' | 'rejected' | 'pending' = 'pending';
    if (actionType === 'approve') {
      newStatus = 'verified';
    } else if (actionType === 'reject') {
      newStatus = 'rejected';
    }

    // Update organizer in dummy data
    updateOrganizerVerificationStatus(selectedOrganizer.id, newStatus);

    // Update local state
    const updatedOrganizers = organizers.map((org) =>
      org.id === selectedOrganizer.id
        ? { ...org, verificationStatus: newStatus }
        : org
    );
    setOrganizers(updatedOrganizers);

    // Close dialogs
    setShowActionDialog(false);
    setShowDetailModal(false);
    setSelectedOrganizer(null);
    setActionType(null);
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Organizer Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Manage organizer accounts and verify their credentials
        </p>
      </div>

      {/* Search bar */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by name, email, or business..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="flex-1"
        />
      </div>

      {/* Organizers table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-800/50">
              <TableHead className="text-slate-900 dark:text-white">Name</TableHead>
              <TableHead className="text-slate-900 dark:text-white">Email</TableHead>
              <TableHead className="text-slate-900 dark:text-white">Business</TableHead>
              <TableHead className="text-slate-900 dark:text-white">Status</TableHead>
              <TableHead className="text-slate-900 dark:text-white">Submitted</TableHead>
              <TableHead className="text-slate-900 dark:text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrganizers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  No organizers found
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrganizers.map((organizer) => (
                <TableRow
                  key={organizer.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <TableCell className="font-medium text-slate-900 dark:text-white">
                    {organizer.name}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {organizer.email}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {organizer.businessName}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(organizer.verificationStatus)}>
                      {organizer.verificationStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {formatDate(organizer.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectOrganizer(organizer)}
                      >
                        View
                      </Button>
                      {organizer.verificationStatus === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleVerificationAction(organizer, 'approve')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleVerificationAction(organizer, 'reject')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Organizer Details</DialogTitle>
            <DialogDescription>
              Review organizer information and verification documents
            </DialogDescription>
          </DialogHeader>

          {selectedOrganizer && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-600 dark:text-slate-400">Name</label>
                    <p className="text-slate-900 dark:text-white font-medium">
                      {selectedOrganizer.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 dark:text-slate-400">Email</label>
                    <p className="text-slate-900 dark:text-white font-medium">
                      {selectedOrganizer.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 dark:text-slate-400">
                      Business Name
                    </label>
                    <p className="text-slate-900 dark:text-white font-medium">
                      {selectedOrganizer.businessName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 dark:text-slate-400">
                      Commission Rate
                    </label>
                    <p className="text-slate-900 dark:text-white font-medium">
                      {(selectedOrganizer.commissionRate * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Verification Status */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                  Verification Status
                </h3>
                <div className="flex items-center gap-4">
                  <Badge className={getStatusBadgeColor(selectedOrganizer.verificationStatus)}>
                    {selectedOrganizer.verificationStatus}
                  </Badge>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Submitted on {formatDate(selectedOrganizer.createdAt)}
                  </p>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                  Verification Documents
                </h3>
                <div className="space-y-2">
                  {selectedOrganizer.documents.length === 0 ? (
                    <p className="text-slate-600 dark:text-slate-400">No documents uploaded</p>
                  ) : (
                    selectedOrganizer.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                      >
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {doc.name}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {doc.type} • {formatDate(doc.uploadedAt)}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {selectedOrganizer.verificationStatus === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleVerificationAction(selectedOrganizer, 'approve')}
                  >
                    Approve Organizer
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={() => handleVerificationAction(selectedOrganizer, 'reject')}
                  >
                    Reject Application
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <AlertDialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve'
                ? 'Approve Organizer'
                : actionType === 'reject'
                ? 'Reject Application'
                : 'Request Additional Information'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'approve'
                ? `Are you sure you want to approve ${selectedOrganizer?.name} as an organizer? They will be able to create events immediately.`
                : actionType === 'reject'
                ? `Are you sure you want to reject ${selectedOrganizer?.name}'s application? They will be notified of the rejection.`
                : `Are you sure you want to request additional information from ${selectedOrganizer?.name}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={
                actionType === 'reject'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }
            >
              {actionType === 'approve'
                ? 'Approve'
                : actionType === 'reject'
                ? 'Reject'
                : 'Request Info'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
