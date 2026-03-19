'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getAllSupportTickets,
  getSupportTicket,
  sendSupportMessage,
  updateSupportTicketStatus,
  assignSupportTicket,
  getSupportStats,
  SupportTicket,
  SupportMessage,
} from '@/modules/shared-common/services/apiService';
import { HeadphonesIcon, Send, Filter, Search, UserCheck } from 'lucide-react';

const statusColors: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  RESOLVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CLOSED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const priorityBadge: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-blue-100 text-blue-600',
  HIGH: 'bg-orange-100 text-orange-600',
  URGENT: 'bg-red-100 text-red-700 font-bold',
};

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ticketsData, statsData] = await Promise.all([getAllSupportTickets(), getSupportStats()]);
      setTickets(ticketsData);
      setStats(statsData);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openTicket = async (ticket: SupportTicket) => {
    try {
      const full = await getSupportTicket(ticket.id);
      setSelectedTicket(full);
    } catch {
      setSelectedTicket(ticket);
    }
  };

  // Poll for new messages
  useEffect(() => {
    if (!selectedTicket) return;
    const interval = setInterval(async () => {
      try {
        const full = await getSupportTicket(selectedTicket.id);
        setSelectedTicket(full);
      } catch { /* ignore */ }
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedTicket?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTicket?.messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    setSending(true);
    try {
      const msg = await sendSupportMessage(selectedTicket.id, newMessage);
      setNewMessage('');
      setSelectedTicket(prev => prev ? { ...prev, messages: [...(prev.messages || []), msg as SupportMessage] } : prev);
    } catch { /* ignore */ } finally { setSending(false); }
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedTicket) return;
    const updated = await updateSupportTicketStatus(selectedTicket.id, status);
    setSelectedTicket(prev => prev ? { ...prev, ...updated } : prev);
    setTickets(prev => prev.map(t => t.id === updated.id ? { ...t, status: updated.status } : t));
    await loadData();
  };

  const handleAssign = async () => {
    if (!selectedTicket) return;
    const updated = await assignSupportTicket(selectedTicket.id);
    setSelectedTicket(prev => prev ? { ...prev, ...updated } : prev);
    await loadData();
  };

  const filtered = tickets.filter((t) => {
    const matchSearch = !search || t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.userName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <HeadphonesIcon className="w-8 h-8 text-violet-600" />
            Support Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage user support tickets</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Total', key: 'total', color: 'text-slate-700 dark:text-slate-300' },
            { label: 'Open', key: 'open', color: 'text-blue-600' },
            { label: 'In Progress', key: 'inProgress', color: 'text-yellow-600' },
            { label: 'Resolved', key: 'resolved', color: 'text-green-600' },
            { label: 'Closed', key: 'closed', color: 'text-gray-500' },
          ].map(({ label, key, color }) => (
            <div key={key} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-400 mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{stats[key] ?? 0}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Ticket List */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tickets..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="">All</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {loading ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl p-8 text-center text-slate-400">Loading...</div>
              ) : filtered.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl p-8 text-center text-slate-400">No tickets found</div>
              ) : (
                filtered.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => openTicket(ticket)}
                    className={`w-full text-left bg-white dark:bg-slate-900 rounded-xl p-3.5 border transition-all ${
                      selectedTicket?.id === ticket.id
                        ? 'border-violet-500 ring-1 ring-violet-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-violet-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="font-medium text-slate-900 dark:text-white text-sm line-clamp-1">{ticket.subject}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${priorityBadge[ticket.priority] || ''}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[ticket.status] || ''}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400">{ticket.userName}</span>
                      <span className="text-xs text-slate-300 dark:text-slate-600">·</span>
                      <span className="text-xs text-slate-400">{ticket.ticketNumber}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{formatTime(ticket.createdAt)}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat + Actions Panel */}
          <div className="lg:col-span-3">
            {selectedTicket ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col h-[640px]">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{selectedTicket.subject}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[selectedTicket.status] || ''}`}>
                          {selectedTicket.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-400">{selectedTicket.ticketNumber}</span>
                        <span className="text-xs text-slate-400">· {selectedTicket.userName}</span>
                      </div>
                    </div>
                    {/* Quick actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {!selectedTicket.assignedTo && (
                        <button
                          onClick={handleAssign}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <UserCheck className="w-3.5 h-3.5" /> Assign to me
                        </button>
                      )}
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </div>
                  </div>
                  {selectedTicket.assignedToName && (
                    <p className="text-xs text-slate-400 mt-1">Assigned to: {selectedTicket.assignedToName}</p>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {(selectedTicket.messages || []).map((msg) => {
                    const isAdmin = msg.senderRole === 'ADMIN';
                    return (
                      <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                          isAdmin
                            ? 'bg-violet-600 text-white rounded-br-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-sm'
                        }`}>
                          {!isAdmin && (
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">{msg.senderName}</p>
                          )}
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isAdmin ? 'text-violet-200' : 'text-slate-400'}`}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                  {selectedTicket.status === 'CLOSED' ? (
                    <p className="text-center text-sm text-slate-400">This ticket is closed.</p>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        placeholder="Reply to user..."
                        className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-violet-500"
                      />
                      <button
                        onClick={handleSend}
                        disabled={!newMessage.trim() || sending}
                        className="p-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 h-[640px] flex items-center justify-center">
                <div className="text-center">
                  <HeadphonesIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 dark:text-slate-500">Select a ticket to start replying</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
