'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '@/lib/hooks';
import {
  getMyEvents,
  updateTicketCheckIn,
  getTicketsByEventId,
  getEventById,
  getUserById,
  getTicketByQrCode,
  getTicketByNumber
} from '@/modules/shared-common/services/apiService';
import { Button } from '@/modules/shared-common/components/ui/button';
import { Input } from '@/modules/shared-common/components/ui/input';

type Event = Awaited<ReturnType<typeof getMyEvents>>[number];
type Ticket = Awaited<ReturnType<typeof getTicketsByEventId>>[number];

interface CheckInResult {
  success: boolean;
  message: string;
  ticket?: Ticket;
  event?: Event;
  attendeeName?: string;
  ticketNumber?: string;
}

type CheckInMode = 'qr' | 'ticket';

export default function CheckinPage() {
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [checkInResult, setCheckInResult] = useState<CheckInResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckInResult[]>([]);
  const [organizerEvents, setOrganizerEvents] = useState<Event[]>([]);
  const [checkInStats, setCheckInStats] = useState({ total: 0, checkedIn: 0, percentage: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<CheckInMode>('qr');

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const events = await getMyEvents();
        setOrganizerEvents(events.filter(e => ['active', 'ACTIVE', 'published', 'PUBLISHED'].includes(e.status)));
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [user]);

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

  const handleCheckIn = useCallback(async () => {
    if (!inputValue.trim() || !selectedEventId) {
      setCheckInResult({
        success: false,
        message: mode === 'qr'
          ? 'Please select an event and enter a QR code'
          : 'Please select an event and enter a ticket number',
      });
      return;
    }

    setIsProcessing(true);

    try {
      let ticket: Ticket | undefined;

      if (mode === 'qr') {
        ticket = await getTicketByQrCode(inputValue);
      } else {
        ticket = await getTicketByNumber(inputValue.trim().toUpperCase());
      }

      if (!ticket) {
        setCheckInResult({
          success: false,
          message: mode === 'qr'
            ? 'Invalid QR code. Ticket not found.'
            : 'Ticket number not found. Please check and try again.',
        });
        setIsProcessing(false);
        return;
      }

      if (ticket.checkedIn) {
        setCheckInResult({
          success: false,
          message: `This ticket has already been checked in.${ticket.ticketNumber ? ' (' + ticket.ticketNumber + ')' : ''}`,
        });
        setIsProcessing(false);
        return;
      }

      await updateTicketCheckIn(ticket.id, true);

      const event = await getEventById(ticket.eventId);

      const result: CheckInResult = {
        success: true,
        message: 'Check-in successful!',
        ticket,
        event,
        attendeeName: ticket.attendeeName || 'Guest',
        ticketNumber: ticket.ticketNumber,
      };

      setCheckInResult(result);
      setRecentCheckIns(prev => [result, ...prev].slice(0, 10));
      setInputValue('');

      // Refresh stats
      const tickets = await getTicketsByEventId(selectedEventId);
      const checkedInCount = tickets.filter(t => t.checkedIn).length;
      setCheckInStats({
        total: tickets.length,
        checkedIn: checkedInCount,
        percentage: tickets.length > 0 ? Math.round((checkedInCount / tickets.length) * 100) : 0,
      });
    } catch (error) {
      setCheckInResult({
        success: false,
        message: 'Error processing check-in. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [inputValue, selectedEventId, mode]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCheckIn();
    }
  }, [handleCheckIn]);

  const switchMode = (newMode: CheckInMode) => {
    setMode(newMode);
    setInputValue('');
    setCheckInResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Attendee Check-in
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Check in attendees via QR code scan or ticket number
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
                {event.title || event.name}
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

        {/* Mode Toggle */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-4 w-fit">
            <button
              type="button"
              onClick={() => switchMode('qr')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'qr'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              QR Code
            </button>
            <button
              type="button"
              onClick={() => switchMode('ticket')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'ticket'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Ticket Number
            </button>
          </div>

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {mode === 'qr' ? 'Scan QR Code' : 'Enter Ticket Number'}
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={mode === 'qr' ? 'Scan QR code here...' : 'e.g. PF-20260312-0001'}
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
            {checkInResult.success && (
              <div className="mt-2 space-y-1">
                {checkInResult.attendeeName && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Attendee: {checkInResult.attendeeName}
                  </p>
                )}
                {checkInResult.ticketNumber && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ticket: {checkInResult.ticketNumber}
                  </p>
                )}
              </div>
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
                      {checkIn.event?.title || checkIn.event?.name}
                      {checkIn.ticketNumber && (
                        <span className="ml-2 text-indigo-600 dark:text-indigo-400">
                          {checkIn.ticketNumber}
                        </span>
                      )}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      checkIn.success
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {checkIn.success ? 'Checked In' : 'Failed'}
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
