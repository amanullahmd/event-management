'use client';

import React, { useState, useMemo } from 'react';
import {
  getAllOrders,
  getUserById,
  getEventById,
  updateOrderStatus,
  getOrderById,
} from '@/lib/dummy-data';
import { Order } from '@/lib/types/order';
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
 * Admin Order Management Page
 * Displays list of all orders on the platform
 * Allows admin to view order details and process refunds
 */
export default function OrderManagementPage() {
  const [orders, setOrders] = useState<Order[]>(getAllOrders());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter orders based on search term
  const filteredOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.eventId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  // Paginate results
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // Handle order selection
  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  // Handle refund
  const handleRefund = (order: Order) => {
    setSelectedOrder(order);
    setShowRefundDialog(true);
  };

  // Confirm refund
  const confirmRefund = () => {
    if (!selectedOrder) return;

    // Update order status to refunded
    updateOrderStatus(selectedOrder.id, 'refunded');

    // Update local state
    const updatedOrders = orders.map((order) =>
      order.id === selectedOrder.id
        ? { ...order, status: 'refunded' as const }
        : order
    );
    setOrders(updatedOrders);

    // Close dialogs
    setShowRefundDialog(false);
    setShowDetailModal(false);
    setSelectedOrder(null);
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'refunded':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
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
          Order Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          View and manage all orders on the platform
        </p>
      </div>

      {/* Search bar */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by order ID, customer, or event..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="flex-1"
        />
      </div>

      {/* Orders table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-800/50">
              <TableHead className="text-slate-900 dark:text-white">Order ID</TableHead>
              <TableHead className="text-slate-900 dark:text-white">Customer</TableHead>
              <TableHead className="text-slate-900 dark:text-white">Event</TableHead>
              <TableHead className="text-slate-900 dark:text-white">Date</TableHead>
              <TableHead className="text-slate-900 dark:text-white">Amount</TableHead>
              <TableHead className="text-slate-900 dark:text-white">Status</TableHead>
              <TableHead className="text-slate-900 dark:text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order) => {
                const customer = getUserById(order.customerId);
                const event = getEventById(order.eventId);
                return (
                  <TableRow
                    key={order.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <TableCell className="font-medium text-slate-900 dark:text-white">
                      {order.id}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {customer?.name || 'Unknown'}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {event?.name || 'Unknown'}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900 dark:text-white">
                      {formatCurrency(order.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectOrder(order)}
                        >
                          View
                        </Button>
                        {order.status === 'completed' && (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleRefund(order)}
                          >
                            Refund
                          </Button>
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
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              View complete order information and ticket details
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Information */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                  Order Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-600 dark:text-slate-400">
                      Order ID
                    </label>
                    <p className="text-slate-900 dark:text-white font-medium">
                      {selectedOrder.id}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 dark:text-slate-400">
                      Status
                    </label>
                    <Badge className={getStatusBadgeColor(selectedOrder.status)}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 dark:text-slate-400">
                      Order Date
                    </label>
                    <p className="text-slate-900 dark:text-white font-medium">
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 dark:text-slate-400">
                      Payment Method
                    </label>
                    <p className="text-slate-900 dark:text-white font-medium capitalize">
                      {selectedOrder.paymentMethod.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                  Customer Information
                </h3>
                {(() => {
                  const customer = getUserById(selectedOrder.customerId);
                  return (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-slate-600 dark:text-slate-400">
                          Name
                        </label>
                        <p className="text-slate-900 dark:text-white font-medium">
                          {customer?.name || 'Unknown'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-slate-600 dark:text-slate-400">
                          Email
                        </label>
                        <p className="text-slate-900 dark:text-white font-medium">
                          {customer?.email || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Event Information */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                  Event Information
                </h3>
                {(() => {
                  const event = getEventById(selectedOrder.eventId);
                  return (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-slate-600 dark:text-slate-400">
                          Event Name
                        </label>
                        <p className="text-slate-900 dark:text-white font-medium">
                          {event?.name || 'Unknown'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-slate-600 dark:text-slate-400">
                          Event Date
                        </label>
                        <p className="text-slate-900 dark:text-white font-medium">
                          {event ? formatDate(event.date) : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Tickets */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                  Tickets ({selectedOrder.tickets.length})
                </h3>
                <div className="space-y-2">
                  {selectedOrder.tickets.map((ticket, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          Ticket {index + 1}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          QR: {ticket.qrCode}
                        </p>
                      </div>
                      <Badge
                        className={
                          ticket.checkedIn
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                        }
                      >
                        {ticket.checkedIn ? 'Checked In' : 'Valid'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Order Total
                  </span>
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedOrder.status === 'completed' && (
                <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => handleRefund(selectedOrder)}
                  >
                    Process Refund
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Confirmation Dialog */}
      <AlertDialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Process Refund</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to refund {formatCurrency(selectedOrder?.totalAmount || 0)} for
              order {selectedOrder?.id}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRefund}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Process Refund
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
