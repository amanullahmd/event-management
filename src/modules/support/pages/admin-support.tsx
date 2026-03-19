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
import {
  HeadphonesIcon,
  Send,
  Search,
  UserCheck,
  CircleDot,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
  Inbox,
  TrendingUp,
  ArrowLeft,
  Filter,
} from 'lucide-react';

const statusConfig: Record<string, { color: string; bg: string; icon: typeof CircleDot; label: string }> = {
  OPEN: { color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', icon: CircleDot, label: 'Open' },
  IN_PROGRESS: { color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: Loader2, label: 'In Progress' },
  RESOLVED: { color: 'text-green-700 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', icon: CheckCircle2, label: 'Resolved' },
  CLOSED: { color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800', icon: AlertCircle, label: 'Closed' },
};

const priorityConfig: Record<string, { dot: string; badge: string; label: string }> = {
  LOW: { dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', label: 'Low' },
  MEDIUM: { dot: 'bg-blue-500', badge: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400', label: 'Medium' },
  HIGH: { dot: 'bg-orange-500', badge: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400', label: 'High' },
  URGENT: { dot: 'bg-red-500 animate-pulse', badge: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 font-bold', label: 'Urgent' },
};

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatFullTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const statCards = [
  { label: 'Total', key: 'total', icon: MessageSquare, color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800' },
  { label: 'Open', key: 'open', icon: Inbox, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  { label: 'In Progress', key: 'inProgress', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  { label: 'Resolved', key: 'resolved', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
  { label: 'Closed', key: 'closed', icon: AlertCircle, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' },
];

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [sendError, setSendError] = useState('');
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
    setSendError('');
    try {
      const msg = await sendSupportMessage(selectedTicket.id, newMessage);
      setNewMessage('');
      setSelectedTicket(prev => prev ? { ...prev, messages: [...(prev.messages || []), msg as SupportMessage] } : prev);
    } catch {
      setSendError('Failed to send. Try again.');
      setTimeout(() => setSendError(''), 4000);
    } finally { setSending(false); }
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedTicket) return;
    try {
      const updated = await updateSupportTicketStatus(selectedTicket.id, status);
      setSelectedTicket(prev => prev ? { ...prev, ...updated } : prev);
      setTickets(prev => prev.map(t => t.id === updated.id ? { ...t, status: updated.status } : t));
      await loadData();
    } catch { /* ignore */ }
  };

  const handleAssign = async () => {
    if (!selectedTicket) return;
    setAssigning(true);
    try {
      const updated = await assignSupportTicket(selectedTicket.id);
      setSelectedTicket(prev => prev ? { ...prev, ...updated } : prev);
      await loadData();
    } catch { /* ignore */ } finally {
      setAssigning(false);
    }
  };

  const filtered = tickets.filter((t) => {
    const matchSearch = !search || t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.userName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <HeadphonesIcon className="w-5 h-5 text-white" />
            </div>
            Support Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and respond to user support tickets</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {statCards.map(({ label, key, icon: Icon, color, bg }) => (
            <div key={key} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex items-center gap-3 hover:shadow-sm transition-shadow">
              <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{stats[key] ?? 0}</p>
              </div>
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
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-8 pr-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                >
                  <option value="">All</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 animate-pulse">
                      <div className="flex items-center gap-3 mb-2.5">
                        <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                      </div>
                      <div className="flex gap-2 ml-5">
                        <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-full w-16" />
                        <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-full w-20" />
                        <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-full w-14" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl p-10 text-center border border-slate-200 dark:border-slate-800">
                  <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No tickets found</p>
                </div>
              ) : (
                filtered.map((ticket) => {
                  const status = statusConfig[ticket.status];
                  const priority = priorityConfig[ticket.priority];
                  const StatusIcon = status?.icon || CircleDot;
                  const isSelected = selectedTicket?.id === ticket.id;

                  return (
                    <button
                      key={ticket.id}
                      onClick={() => openTicket(ticket)}
                      className={`w-full text-left bg-white dark:bg-slate-900 rounded-xl p-4 border transition-all group ${
                        isSelected
                          ? 'border-violet-500 ring-2 ring-violet-500/10 shadow-md'
                          : 'border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${priority?.dot || 'bg-slate-400'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <p className="font-medium text-slate-900 dark:text-white text-sm line-clamp-1">{ticket.subject}</p>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${priority?.badge || ''}`}>
                              {priority?.label || ticket.priority}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${status?.bg} ${status?.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {status?.label || ticket.status}
                            </span>
                            <span className="text-xs text-slate-400">{ticket.userName}</span>
                            <span className="text-xs text-slate-300 dark:text-slate-600">·</span>
                            <span className="text-xs text-slate-400 font-mono">{ticket.ticketNumber}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(ticket.createdAt)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat + Actions Panel */}
          <div className="lg:col-span-3">
            {selectedTicket ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[640px] shadow-sm">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 rounded-t-2xl">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => setSelectedTicket(null)}
                        className="lg:hidden mt-0.5 p-1 text-slate-400 hover:text-slate-600 rounded"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">{selectedTicket.subject}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {(() => {
                            const s = statusConfig[selectedTicket.status];
                            const SIcon = s?.icon || CircleDot;
                            return (
                              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${s?.bg} ${s?.color}`}>
                                <SIcon className="w-3 h-3" />
                                {s?.label || selectedTicket.status}
                              </span>
                            );
                          })()}
                          <span className="text-xs text-slate-400 font-mono">{selectedTicket.ticketNumber}</span>
                          <span className="text-xs text-slate-300 dark:text-slate-600">·</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{selectedTicket.userName}</span>
                          <span className="text-xs text-slate-300 dark:text-slate-600">·</span>
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                            <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig[selectedTicket.priority]?.dot || 'bg-slate-400'}`} />
                            {selectedTicket.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Quick actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!selectedTicket.assignedTo && (
                        <button
                          onClick={handleAssign}
                          disabled={assigning}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors disabled:opacity-50 font-medium border border-violet-200 dark:border-violet-800/50"
                        >
                          {assigning ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )}
                          {assigning ? 'Assigning...' : 'Assign to me'}
                        </button>
                      )}
                      {/* Status buttons - click to change */}
                      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                        {(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map(s => {
                          const cfg = statusConfig[s];
                          const isActive = selectedTicket.status === s;
                          return (
                            <button
                              key={s}
                              onClick={() => !isActive && handleStatusChange(s)}
                              disabled={isActive}
                              className={`px-2.5 py-1.5 text-xs rounded-md transition-all font-medium ${
                                isActive
                                  ? `${cfg.bg} ${cfg.color} shadow-sm`
                                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                              }`}
                              title={cfg.label}
                            >
                              {cfg.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  {selectedTicket.assignedToName && (
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      Assigned to <span className="font-medium text-slate-600 dark:text-slate-300">{selectedTicket.assignedToName}</span>
                    </p>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {(selectedTicket.messages || []).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <MessageSquare className="w-10 h-10 mb-2 text-slate-300 dark:text-slate-600" />
                      <p className="text-sm">No messages yet</p>
                    </div>
                  ) : (
                    (selectedTicket.messages || []).map((msg, i) => {
                      const isAdmin = msg.senderRole === 'ADMIN';
                      const prevMsg = i > 0 ? (selectedTicket.messages || [])[i - 1] : null;
                      const showSender = !prevMsg || prevMsg.senderRole !== msg.senderRole;
                      return (
                        <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] ${showSender ? 'mt-1' : ''}`}>
                            {!isAdmin && showSender && (
                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1">{msg.senderName}</p>
                            )}
                            {isAdmin && showSender && (
                              <p className="text-xs font-medium text-violet-500 dark:text-violet-400 mb-1 mr-1 text-right flex items-center gap-1 justify-end">
                                <HeadphonesIcon className="w-3 h-3" /> You
                              </p>
                            )}
                            <div className={`rounded-2xl px-4 py-2.5 ${
                              isAdmin
                                ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white rounded-br-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-sm'
                            }`}>
                              <p className="text-sm leading-relaxed">{msg.content}</p>
                              <p className={`text-xs mt-1 ${isAdmin ? 'text-violet-200' : 'text-slate-400'}`}>
                                {formatFullTime(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                  {sendError && (
                    <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 mb-2 p-2 bg-red-50 dark:bg-red-900/10 rounded-lg">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {sendError}
                    </div>
                  )}
                  {selectedTicket.status === 'CLOSED' ? (
                    <div className="flex items-center justify-center gap-2 py-3 text-sm text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <AlertCircle className="w-4 h-4" />
                      This ticket is closed
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        placeholder="Reply to user..."
                        className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                      />
                      <button
                        onClick={handleSend}
                        disabled={!newMessage.trim() || sending}
                        className="p-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-sm"
                      >
                        {sending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 h-[640px] flex items-center justify-center">
                <div className="text-center max-w-xs">
                  <div className="w-16 h-16 bg-violet-50 dark:bg-violet-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <HeadphonesIcon className="w-8 h-8 text-violet-400" />
                  </div>
                  <p className="text-slate-900 dark:text-white font-medium mb-1">Select a ticket</p>
                  <p className="text-slate-400 text-sm">Choose a ticket from the list to view and respond</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
