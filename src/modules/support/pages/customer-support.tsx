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
import { HeadphonesIcon, Plus, Send, X, ChevronRight, Clock } from 'lucide-react';

const CATEGORIES = ['BILLING', 'TECHNICAL', 'EVENT', 'ACCOUNT', 'OTHER'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const statusColors: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  RESOLVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CLOSED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const priorityColors: Record<string, string> = {
  LOW: 'text-slate-500',
  MEDIUM: 'text-blue-600',
  HIGH: 'text-orange-600',
  URGENT: 'text-red-600',
};

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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

  // Poll for new messages every 5s when a ticket is open
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
    try {
      const ticket = await createSupportTicket(createForm);
      setShowCreate(false);
      setCreateForm({ subject: '', category: 'TECHNICAL', priority: 'MEDIUM', description: '' });
      await loadTickets();
      await openTicket(ticket);
    } catch {
      /* ignore */
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
      setSelectedTicket(prev => prev ? {
        ...prev,
        messages: [...(prev.messages || []), msg as SupportMessage],
      } : prev);
    } catch { /* ignore */ } finally {
      setSending(false);
    }
  };

  const isClosed = selectedTicket?.status === 'CLOSED' || selectedTicket?.status === 'RESOLVED';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <HeadphonesIcon className="w-8 h-8 text-violet-600" />
              Support Center
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Get help from our support team
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" /> New Ticket
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket List */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              My Tickets
            </h2>
            {loading ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-8 text-center text-slate-400">Loading...</div>
            ) : tickets.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-800">
                <HeadphonesIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400 text-sm">No tickets yet</p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="mt-3 text-violet-600 dark:text-violet-400 text-sm hover:underline"
                >
                  Create your first ticket
                </button>
              </div>
            ) : (
              tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => openTicket(ticket)}
                  className={`w-full text-left bg-white dark:bg-slate-900 rounded-xl p-4 border transition-all ${
                    selectedTicket?.id === ticket.id
                      ? 'border-violet-500 dark:border-violet-500 ring-1 ring-violet-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-medium text-slate-900 dark:text-white text-sm line-clamp-1">{ticket.subject}</p>
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[ticket.status] || ''}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400">{ticket.ticketNumber}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(ticket.createdAt)}
                  </p>
                </button>
              ))
            )}
          </div>

          {/* Chat Panel */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col h-[600px]">
                {/* Ticket Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{selectedTicket.subject}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[selectedTicket.status] || ''}`}>
                          {selectedTicket.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-400">{selectedTicket.ticketNumber}</span>
                        <span className={`text-xs font-medium ${priorityColors[selectedTicket.priority] || ''}`}>
                          {selectedTicket.priority}
                        </span>
                        <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded">
                          {selectedTicket.category}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-slate-600 lg:hidden">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  {selectedTicket.assignedToName && (
                    <p className="text-xs text-slate-400 mt-1">Assigned to: {selectedTicket.assignedToName}</p>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {(selectedTicket.messages || []).map((msg) => {
                    const isOwn = msg.senderRole === 'USER';
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                          isOwn
                            ? 'bg-violet-600 text-white rounded-br-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-sm'
                        }`}>
                          {!isOwn && (
                            <p className="text-xs font-medium text-violet-600 dark:text-violet-400 mb-0.5">
                              {msg.senderName} · Support
                            </p>
                          )}
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isOwn ? 'text-violet-200' : 'text-slate-400'}`}>
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
                  {isClosed ? (
                    <p className="text-center text-sm text-slate-400">
                      This ticket is {selectedTicket.status.toLowerCase()}. No further replies are needed.
                    </p>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-violet-500"
                      />
                      <button
                        onClick={handleSendMessage}
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
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <HeadphonesIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 dark:text-slate-500">Select a ticket to view the conversation</p>
                  <button
                    onClick={() => setShowCreate(true)}
                    className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium"
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">New Support Ticket</h2>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject *</label>
                <input
                  type="text"
                  value={createForm.subject}
                  onChange={(e) => setCreateForm(p => ({ ...p, subject: e.target.value }))}
                  placeholder="Briefly describe your issue"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm(p => ({ ...p, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  >
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description *</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm(p => ({ ...p, description: e.target.value }))}
                  rows={4}
                  placeholder="Please describe your issue in detail..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !createForm.subject.trim() || !createForm.description.trim()}
                className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors font-medium"
              >
                {creating ? 'Creating...' : 'Submit Ticket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
