'use client';

import React, { useState, useMemo } from 'react';
import { getAllEvents, updateEventStatus, getOrganizerById } from '@/lib/dummy-data';
import { Event } from '@/lib/types/event';
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
 * Admin Event Management Page
 * Displays list of all events on the platform
 * Allows admin to feature, suspend, or cancel events
 */
export default function EventManagementPage() {
  const [events, setEvents] = useState<Event[]>(getAllEvents());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<'feature' | 'suspend' | 'cancel' | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter events based on search term
  const filteredEvents = useMemo(() => {
    return events.filter(
      (event) =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [events, searchTerm]);

  // Paginate results
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEvents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEvents, currentPage]);

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  // Handle event selection
  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
  };

  // Handle event action
  const handleEventAction = (
    event: Event,
    action: 'feature' | 'suspend' | 'cancel'
  ) => {
    setSelectedEvent(event);
    setActionType(action);
    setShowActionDialog(true);
  };

  // Confirm event action
  const confirmAction = () => {
    if (!selectedEvent || !actionType) return;

    let newStatus: 'active' | 'inactive' | 'cancelled' = 'active';
    if (actionType === 'suspend') {
      newStatus = 'inactive';
    } else if (actionType === 'cancel') {
      newStatus = 'cancelled';
    }

    // Update event in dummy data
    updateEventStatus(selectedEvent.id, newStatus);

    // Update local state
    const updatedEvents = events.map((event) =>
      event.id === selectedEvent.id
        ? { ...event, status: newStatus }
        : event
    );
    setEvents(updatedEvents);

    // Close dialogs
    setShowActionDialog(false);
    setShowDetailModal(false);
    setSelectedEvent(null);
    setActionType(null);
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'cancelled':
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

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Event Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Manage all events on the platform
        </p>
      </div>

      {/* Search bar */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by name, location, or category..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="flex-1"
        />
      </div>

      {/* Events table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-800/50">
              <TableHead className="text-slate-900 dark:text-white">Event Name</TableHead>
              <TableHead className="text-slate-900 dark:text-white">Organizer</TableHead>
              <TableHead className="text-slate-900 dark:text-white">Date</TableHead>
              <TableHead className="text-slate-900 dark:text-white">Location</TableHead>
              <TableHead className="text-slate-900 dark:text-white">Sales</TableHead>
              <TableHead className="text-slate-900 dark:text-white">Status</TableHead>
              <TableHead className="text-slate-900 dark:text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  No events found
                </TableCell>
              </TableRow>
            ) : (
              paginatedEvents.map((event) => {
                const organizer = getOrganizerById(event.organizerId);
                return (
                  <TableRow
                    key={event.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <TableCell className="font-medium text-slate-900 dark:text-white">
                      {event.name}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {organizer?.name || 'Unknown'}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {formatDate(event.date)}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {event.location}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {event.totalAttendees} tickets
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(event.status)}>
                        {event.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectEvent(event)}
                        >
                          View
                        </Button>
                        {event.status === 'active' && (
                          <>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleEventAction(event, 'suspend')}
                            >
                              Suspend
                            </Button>
                            <Button
                              size="sm"
                              className="bg-red-700 hover:bg-red-800 text-white"
                              onClick={() => handleEventAction(event, 'cancel')}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
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
            <DialogTitle>Event Details</DialogTitle>
            <DialogDescription>
              View comprehensive event information and sales data
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                  Event Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-600 dark:text-slate-400">Name</label>
                    <p className="text-slate-900 dark:text-white font-medium">
                      {selectedEvent.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 dark:text-slate-400">Category</label>
                    <p className="text-slate-900 dark:text-white font-medium">
                      {selectedEvent.category}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 dark:text-slate-400">Date</label>
                    <p className="text-slate-900 dark:text-white font-medium">
                      {formatDate(selectedEvent.date)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 dark:text-slate-400">Location</label>
                    <p className="text-slate-900 dark:text-white font-medium">
                      {selectedEvent.location}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Description
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {selectedEvent.description}
                </p>
              </div>

              {/* Ticket Types */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                  Ticket Types
                </h3>
                <div className="space-y-2">
                  {selectedEvent.ticketTypes.map((ticketType) => (
                    <div
                      key={ticketType.id}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {ticketType.name}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {ticketType.sold} / {ticketType.quantity} sold
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {formatCurrency(ticketType.price)}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {((ticketType.sold / ticketType.quantity) * 100).toFixed(0)}% sold
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sales Summary */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                  Sales Summary
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Attendees</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {selectedEvent.totalAttendees}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(
                        selectedEvent.ticketTypes.reduce(
                          (sum, tt) => sum + tt.price * tt.sold,
                          0
                        )
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Status</h3>
                <Badge className={getStatusBadgeColor(selectedEvent.status)}>
                  {selectedEvent.status}
                </Badge>
              </div>

              {/* Action Buttons */}
              {selectedEvent.status === 'active' && (
                <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={() => handleEventAction(selectedEvent, 'suspend')}
                  >
                    Suspend Event
                  </Button>
                  <Button
                    className="flex-1 bg-red-700 hover:bg-red-800 text-white"
                    onClick={() => handleEventAction(selectedEvent, 'cancel')}
                  >
                    Cancel Event
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
              {actionType === 'suspend'
                ? 'Suspend Event'
                : actionType === 'cancel'
                ? 'Cancel Event'
                : 'Feature Event'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'suspend'
                ? `Are you sure you want to suspend "${selectedEvent?.name}"? The event will be hidden from the platform.`
                : actionType === 'cancel'
                ? `Are you sure you want to cancel "${selectedEvent?.name}"? This action cannot be undone.`
                : `Are you sure you want to feature "${selectedEvent?.name}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={
                actionType === 'cancel'
                  ? 'bg-red-700 hover:bg-red-800'
                  : 'bg-blue-600 hover:bg-blue-700'
              }
            >
              {actionType === 'suspend'
                ? 'Suspend'
                : actionType === 'cancel'
                ? 'Cancel Event'
                : 'Feature'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
