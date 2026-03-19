'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import {
  createSupportTicket,
  getMySupportTickets,
  getSupportTicket,
  sendSupportMessage,
  SupportTicket,
  SupportMessage,
} from '@/modules/shared-common/services/apiService';
import {
  HeadphonesIcon,
  Plus,
  Send,
  X,
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  CircleDot,
  Loader2,
  MessageSquare,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

const CATEGORIES = [
  { value: 'BILLING', label: 'Billing', icon: '💳', desc: 'Payments & invoices' },
  { value: 'TECHNICAL', label: 'Technical', icon: '🔧', desc: 'Bugs & issues' },
  { value: 'EVENT', label: 'Event', icon: '🎫', desc: 'Event-related help' },
  { value: 'ACCOUNT', label: 'Account', icon: '👤', desc: 'Account settings' },
  { value: 'OTHER', label: 'Other', icon: '💬', desc: 'General questions' },
];

const PRIORITIES = [
  { value: 'LOW', label: 'Low', color: 'text-slate-500 bg-slate-100 dark:bg-slate-800' },
  { value: 'MEDIUM', label: 'Medium', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
  { value: 'HIGH', label: 'High', color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
  { value: 'URGENT', label: 'Urgent', color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
];

const statusConfig: Record<string, { color: string; icon: typeof CircleDot; label: string }> = {
  OPEN: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: CircleDot, label: 'Open' },
  IN_PROGRESS: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Loader2, label: 'In Progress' },
  RESOLVED: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2, label: 'Resolved' },
  CLOSED: { color: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400', icon: AlertCircle, label: 'Closed' },
};

const priorityDot: Record<string, string> = {
  LOW: 'bg-slate-400',
  MEDIUM: 'bg-blue-500',
  HIGH: 'bg-orange-500',
  URGENT: 'bg-red-500 animate-pulse',
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

export default function CustomerSupportPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [createForm, setCreateForm] = useState({
    subject: '',
    category: 'TECHNICAL',
    priority: 'MEDIUM',
    description: '',
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [sendError, setSendError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadTickets = useCallback(async () => {
    try {
      const data = await getMySupportTickets();
      setTickets(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTickets(); }, [loadTickets]);

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

  const handleCreate = async () => {
    if (!createForm.subject.trim() || !createForm.description.trim()) return;
    setCreating(true);
    setCreateError('');
    try {
      const ticket = await createSupportTicket(createForm);
      setShowCreate(false);
      setCreateForm({ subject: '', category: 'TECHNICAL', priority: 'MEDIUM', description: '' });
      await loadTickets();
      await openTicket(ticket);
    } catch {
      setCreateError('Failed to create ticket. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    setSending(true);
    try {
      const msg = await sendSupportMessage(selectedTicket.id, newMessage);
      setNewMessage('');
      setSendError('');
      setSelectedTicket(prev => prev ? {
        ...prev,
        messages: [...(prev.messages || []), msg as SupportMessage],
      } : prev);
    } catch {
      setSendError('Message failed to send. Please try again.');
      setTimeout(() => setSendError(''), 4000);
    } finally {
      setSending(false);
    }
  };

  const isClosed = selectedTicket?.status === 'CLOSED' || selectedTicket?.status === 'RESOLVED';
  const openCount = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <HeadphonesIcon className="w-5 h-5 text-white" />
              </div>
              Support Center
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              We&apos;re here to help — typical response time under 24h
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all font-medium shadow-lg shadow-violet-500/20"
          >
            <Plus className="w-4 h-4" /> New Ticket
          </button>
        </div>

        {/* Quick stats */}
        {tickets.length > 0 && (
          <div className="flex gap-3 mb-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Total</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{tickets.length}</p>
              </div>
            </div>
            {openCount > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-xl px-4 py-3 border border-blue-200 dark:border-blue-800/50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <CircleDot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Active</p>
                  <p className="text-lg font-bold text-blue-600">{openCount}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket List */}
          <div className="lg:col-span-1">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" /> My Tickets
            </h2>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                      <div className="flex-1">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-1.5" />
                        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-full w-16" />
                      <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-full w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : tickets.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800">
                <div className="w-16 h-16 bg-violet-50 dark:bg-violet-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-violet-400" />
                </div>
                <p className="text-slate-900 dark:text-white font-medium mb-1">No tickets yet</p>
                <p className="text-slate-400 text-sm mb-4">Need help? Create your first support ticket.</p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium"
                >
                  Create Ticket
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {tickets.map((ticket) => {
                  const status = statusConfig[ticket.status];
                  const StatusIcon = status?.icon || CircleDot;
                  const isSelected = selectedTicket?.id === ticket.id;
                  return (
                    <button
                      key={ticket.id}
                      onClick={() => openTicket(ticket)}
                      className={`w-full text-left bg-white dark:bg-slate-900 rounded-xl p-4 border transition-all group ${
                        isSelected
                          ? 'border-violet-500 dark:border-violet-500 ring-2 ring-violet-500/10 shadow-md'
                          : 'border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${priorityDot[ticket.priority] || 'bg-slate-400'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white text-sm line-clamp-1 mb-1.5">
                            {ticket.subject}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${status?.color || ''}`}>
                              <StatusIcon className="w-3 h-3" />
                              {status?.label || ticket.status}
                            </span>
                            <span className="text-xs text-slate-400">{ticket.ticketNumber}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(ticket.createdAt)}
                          </p>
                        </div>
                        <ChevronRight className={`w-4 h-4 mt-1 flex-shrink-0 transition-colors ${
                          isSelected ? 'text-violet-500' : 'text-slate-300 group-hover:text-violet-400'
                        }`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chat Panel */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[600px] shadow-sm">
                {/* Ticket Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 rounded-t-2xl">
                  <div className="flex items-start justify-between">
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
                              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${s?.color || ''}`}>
                                <SIcon className="w-3 h-3" />
                                {s?.label || selectedTicket.status}
                              </span>
                            );
                          })()}
                          <span className="text-xs text-slate-400 font-mono">{selectedTicket.ticketNumber}</span>
                          <span className="text-xs text-slate-300 dark:text-slate-600">·</span>
                          <span className="text-xs text-slate-400">{selectedTicket.category}</span>
                          <span className="text-xs text-slate-300 dark:text-slate-600">·</span>
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                            <span className={`w-1.5 h-1.5 rounded-full ${priorityDot[selectedTicket.priority] || 'bg-slate-400'}`} />
                            {selectedTicket.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {selectedTicket.assignedToName && (
                    <p className="text-xs text-slate-400 mt-2 ml-0 lg:ml-0 flex items-center gap-1.5">
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
                      <p className="text-sm">Waiting for a support agent to respond...</p>
                    </div>
                  ) : (
                    (selectedTicket.messages || []).map((msg, i) => {
                      const isOwn = msg.senderRole === 'USER';
                      const prevMsg = i > 0 ? (selectedTicket.messages || [])[i - 1] : null;
                      const showSender = !prevMsg || prevMsg.senderRole !== msg.senderRole;
                      return (
                        <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] ${showSender ? 'mt-1' : ''}`}>
                            {!isOwn && showSender && (
                              <p className="text-xs font-medium text-violet-600 dark:text-violet-400 mb-1 ml-1 flex items-center gap-1">
                                <HeadphonesIcon className="w-3 h-3" />
                                {msg.senderName} · Support
                              </p>
                            )}
                            <div className={`rounded-2xl px-4 py-2.5 ${
                              isOwn
                                ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white rounded-br-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-sm'
                            }`}>
                              <p className="text-sm leading-relaxed">{msg.content}</p>
                              <p className={`text-xs mt-1 ${isOwn ? 'text-violet-200' : 'text-slate-400'}`}>
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
                  {isClosed ? (
                    <div className="flex items-center justify-center gap-2 py-3 text-sm text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <CheckCircle2 className="w-4 h-4" />
                      This ticket is {selectedTicket.status.toLowerCase().replace('_', ' ')}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                      />
                      <button
                        onClick={handleSendMessage}
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
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 h-[600px] flex items-center justify-center">
                <div className="text-center max-w-xs">
                  <div className="w-16 h-16 bg-violet-50 dark:bg-violet-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <HeadphonesIcon className="w-8 h-8 text-violet-400" />
                  </div>
                  <p className="text-slate-900 dark:text-white font-medium mb-1">Select a conversation</p>
                  <p className="text-slate-400 text-sm mb-5">Choose a ticket from the list or create a new one</p>
                  <button
                    onClick={() => setShowCreate(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all text-sm font-medium shadow-lg shadow-violet-500/20"
                  >
                    Create New Ticket
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-6 pb-0">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">New Support Ticket</h2>
                <p className="text-sm text-slate-400 mt-0.5">We&apos;ll get back to you as soon as possible</p>
              </div>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Subject *</label>
                <input
                  type="text"
                  value={createForm.subject}
                  onChange={(e) => setCreateForm(p => ({ ...p, subject: e.target.value }))}
                  placeholder="Briefly describe your issue"
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
              </div>

              {/* Category selector - card style */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
                <div className="grid grid-cols-5 gap-2">
                  {CATEGORIES.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCreateForm(p => ({ ...p, category: c.value }))}
                      className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl text-xs font-medium transition-all border ${
                        createForm.category === c.value
                          ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 ring-1 ring-violet-500/20'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-violet-300 dark:hover:border-violet-700'
                      }`}
                    >
                      <span className="text-lg">{c.icon}</span>
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority selector - pill style */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Priority</label>
                <div className="flex gap-2">
                  {PRIORITIES.map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setCreateForm(prev => ({ ...prev, priority: p.value }))}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all border ${
                        createForm.priority === p.value
                          ? `${p.color} border-current ring-1 ring-current/20`
                          : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description *</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm(p => ({ ...p, description: e.target.value }))}
                  rows={4}
                  placeholder="Please describe your issue in detail..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
              </div>
            </div>

            {createError && (
              <div className="mx-6 mb-4 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {createError}
              </div>
            )}

            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => { setShowCreate(false); setCreateError(''); }}
                className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !createForm.subject.trim() || !createForm.description.trim()}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 transition-all font-medium flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Submit Ticket'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
