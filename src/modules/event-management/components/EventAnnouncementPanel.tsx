'use client';

import React, { useState } from 'react';
import { Button } from '@/modules/shared-common/components/ui/button';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnnouncementRecord {
  id: string;
  title: string;
  message: string;
  sentAt: string;
  sentCount: number;
}

interface EventAnnouncementPanelProps {
  eventId: string;
  eventTitle: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * KAN-164: In-event Communication
 * Allows organizers to broadcast announcements to all confirmed attendees of an event.
 * Sends in-app notifications via POST /api/events/{eventId}/announcements
 */
export default function EventAnnouncementPanel({ eventId, eventTitle }: EventAnnouncementPanelProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [history, setHistory] = useState<AnnouncementRecord[]>([]);

  const charLimit = 500;

  const handleSend = async () => {
    setError('');
    setSuccessMsg('');

    if (!title.trim()) { setError('Please provide an announcement title.'); return; }
    if (!message.trim()) { setError('Please write an announcement message.'); return; }
    if (message.length > charLimit) { setError(`Message exceeds ${charLimit} character limit.`); return; }

    setIsSending(true);
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}/api/events/${eventId}/announcements`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ title: title.trim(), message: message.trim() }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Request failed (${res.status})`);
      }

      const data = await res.json();
      const sentCount: number = data.sentCount ?? 0;

      // Add to local history
      setHistory((prev) => [
        {
          id: crypto.randomUUID(),
          title: title.trim(),
          message: message.trim(),
          sentAt: new Date().toLocaleString(),
          sentCount,
        },
        ...prev,
      ]);

      setSuccessMsg(`Announcement sent to ${sentCount} attendee${sentCount !== 1 ? 's' : ''}!`);
      setTitle('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send announcement');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Send Announcement</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Broadcast a message to all confirmed attendees of <span className="font-medium text-slate-700 dark:text-slate-300">{eventTitle}</span>.
            Each attendee will receive an in-app notification.
          </p>
        </div>
      </div>

      {/* Compose Form */}
      <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-6 space-y-4">
        <div>
          <label htmlFor="ann-title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Announcement Title <span className="text-red-500">*</span>
          </label>
          <input
            id="ann-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder="e.g. Important Update about Tomorrow's Event"
            className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="text-xs text-slate-400 mt-1">{title.length}/100</p>
        </div>

        <div>
          <label htmlFor="ann-message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            id="ann-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Write your announcement here. All confirmed ticket holders will receive this message..."
            className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none ${
              message.length > charLimit
                ? 'border-red-400 dark:border-red-500'
                : 'border-slate-300 dark:border-slate-600'
            }`}
          />
          <div className="flex justify-between mt-1">
            <span className={`text-xs ${message.length > charLimit ? 'text-red-500' : 'text-slate-400'}`}>
              {message.length}/{charLimit}
            </span>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-green-700 dark:text-green-300 font-medium">{successMsg}</p>
          </div>
        )}

        {/* Info Banner */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-800 rounded-lg">
          <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            This will send an in-app notification to all attendees with confirmed ticket orders. They will see it the next time they log in.
          </p>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSend}
            disabled={isSending || !title.trim() || !message.trim() || message.length > charLimit}
            className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
          >
            {isSending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sending...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send to All Attendees
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Announcement History */}
      {history.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Sent Announcements (this session)</h4>
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="font-medium text-slate-900 dark:text-white text-sm">{item.title}</p>
                  <span className="text-xs text-slate-400 ml-4 flex-shrink-0">{item.sentAt}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">{item.message}</p>
                <span className="inline-flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Sent to {item.sentCount} attendee{item.sentCount !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {history.length === 0 && (
        <div className="text-center py-6 text-slate-400 dark:text-slate-500">
          <svg className="w-8 h-8 mx-auto mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <p className="text-sm">No announcements sent yet</p>
        </div>
      )}
    </div>
  );
}
