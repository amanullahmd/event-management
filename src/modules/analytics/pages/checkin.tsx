'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '@/lib/hooks';
import { 
  getEventsByOrganizerId, 
  updateTicketCheckIn, 
  getTicketsByEventId,
  getEventById,
  getUserById
} from '@/modules/shared-common/services/apiService';
import { getTicketByQrCode } from '@/modules/shared-common/services/apiService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Event = Awaited<ReturnType<typeof getEventsByOrganizerId>>[number];
type Ticket = Awaited<ReturnType<typeof getTicketsByEventId>>[number];

interface CheckInResult {
  success: boolean;
  message: string;
  ticket?: Ticket;
  event?: Event;
  attendeeName?: string;
}

/**
 * QR Code Check-in Page for Organizers
 * Allows organizers to scan QR codes and check in attendees
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */
export default function CheckinPage() {
  const { user } = useAuth();
  const [qrInput, setQrInput] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [checkInResult, setCheckInResult] = useState<CheckInResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckInResult[]>([]);
  const [organizerEvents, setOrganizerEvents] = useState<Event[]>([]);
  const [checkInStats, setCheckInStats] = useState({ total: 0, checkedIn: 0, percentage: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch organizer's events
  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const events = await getEventsByOrganizerId(user.id);
        setOrganizerEvents(events.filter(e => e.status === 'active'));
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [user]);

  // Fetch check-in statistics for selected event
  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedEventId) {
        setCheckInStats({ total: 0, checkedIn: 0, percentage: 0 });
        return;
      }
      
      try {
        const tickets = await getTicketsByEventId(selectedEventId);
        const checkedIn = tickets.filter(t => t.checkedIn).length;
        const total = tickets.length;
        
        setCheckInStats({
          total,
          checkedIn,
          percentage: total > 0 ? Math.round((checkedIn / total) * 100) : 0,
        });
      } catch (error) {
        console.error('Failed to fetch check-in stats:', error);
      }
    };

    fetchStats();
  }, [selectedEventId]);

  // Handle QR code scan
  const handleCheckIn = useCallback(async () => {
    if (!qrInput.trim() || !selectedEventId) {
      setCheckInResult({
        success: false,
        message: 'Please select an event and enter a QR code',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const ticket = await getTicketByQrCode(qrInput);
      
      if (!ticket) {
        setCheckInResult({
          success: false,
          message: 'Invalid QR code. Ticket not found.',
        });
        setIsProcessing(false);
        return;
      }

      if (ticket.checkedIn) {
        setCheckInResult({
          success: false,
          message: 'This ticket has already been checked in.',
        });
        setIsProcessing(false);
        return;
      }

      await updateTicketCheckIn(ticket.id, true);

      const [event, ticketUser] = await Promise.all([
        getEventById(ticket.eventId),
        getUserById(ticket.id)
      ]);

      const result: CheckInResult = {
        success: true,
        message: 'Check-in successful!',
        ticket,
        event,
        attendeeName: ticketUser?.name || 'Guest',
      };

      setCheckInResult(result);
      setRecentCheckIns(prev => [result, ...prev].slice(0, 10));
      setQrInput('');
    } catch (error) {
      setCheckInResult({
        success: false,
        message: 'Error processing check-in. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [qrInput, selectedEventId]);

  // Handle Enter key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCheckIn();
    }
  }, [handleCheckIn]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            QR Code Check-in
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Scan attendee QR codes to check them in
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Event
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
          >
            <option value="">Choose an event...</option>
            {organizerEvents.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>

        {selectedEventId && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {checkInStats.total}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Checked In</p>
              <p className="text-2xl font-bold text-green-600">
                {checkInStats.checkedIn}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Percentage</p>
              <p className="text-2xl font-bold text-blue-600">
                {checkInStats.percentage}%
              </p>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Scan QR Code
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Scan QR code here..."
              disabled={!selectedEventId || isProcessing}
              autoFocus
            />
            <Button
              onClick={handleCheckIn}
              disabled={!selectedEventId || isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Check In'}
            </Button>
          </div>
        </div>

        {checkInResult && (
          <div
            className={`rounded-lg shadow-sm p-4 mb-6 ${
              checkInResult.success
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}
          >
            <p
              className={`font-medium ${
                checkInResult.success
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-red-800 dark:text-red-200'
              }`}
            >
              {checkInResult.message}
            </p>
            {checkInResult.success && checkInResult.attendeeName && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Attendee: {checkInResult.attendeeName}
              </p>
            )}
          </div>
        )}

        {recentCheckIns.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Check-ins
            </h2>
            <div className="space-y-2">
              {recentCheckIns.map((checkIn, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {checkIn.attendeeName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {checkIn.event?.name}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      checkIn.success
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {checkIn.success ? '✓ Checked In' : '✗ Failed'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

