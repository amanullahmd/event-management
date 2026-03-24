'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import {
  getOrgChatRoom,
  getAdminChatRoom,
  getMyOrganizations,
  getOrganizationMembers,
  getAdminTeamMembers,
  sendChatMessage,
  ChatRoom,
  ChatMessage,
} from '@/modules/shared-common/services/apiService';
import { MessageCircle, Send, Users, Hash, AtSign } from 'lucide-react';

function renderMessageContent(content: string) {
  const parts = content.split(/(@\w[\w\s]*?\b)/g);
  return parts.map((part, i) =>
    part.startsWith('@') ? (
      <span key={i} className="font-semibold text-violet-400 dark:text-violet-300 bg-violet-500/10 dark:bg-violet-400/10 px-0.5 rounded">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

interface TeamChatPageProps {
  mode?: 'organizer' | 'admin';
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function TeamChatPage({ mode = 'organizer' }: TeamChatPageProps) {
  const { user } = useAuth();
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<{ id: string; name: string }[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionIndex, setMentionIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadRoom = useCallback(async () => {
    try {
      if (mode === 'admin') {
        const r = await getAdminChatRoom(100);
        setRoom(r);
      } else {
        // Load organizer's first org
        const orgs = await getMyOrganizations();
        if (!orgs || orgs.length === 0) {
          setError('You need to create an organization first to access team chat.');
          setLoading(false);
          return;
        }
        const firstOrg = orgs[0];
        setOrgId(firstOrg.id);
        try {
          const r = await getOrgChatRoom(firstOrg.id, 100);
          setRoom(r);
        } catch {
          // Room doesn't exist yet, that's OK
          setError('');
          setRoom(null);
        }
      }
    } catch {
      setError('Failed to load chat room.');
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => { loadRoom(); }, [loadRoom]);

  // Load team members for @mentions
  useEffect(() => {
    (async () => {
      try {
        if (mode === 'admin') {
          const members = await getAdminTeamMembers();
          setTeamMembers(members.map(m => ({ id: m.userId, name: m.userName })));
        } else if (orgId) {
          const members = await getOrganizationMembers(orgId);
          setTeamMembers(members.map(m => ({ id: m.userId, name: m.userName || '' })));
        }
      } catch { /* ignore */ }
    })();
  }, [mode, orgId]);

  // Poll for new messages every 3s
  useEffect(() => {
    if (!room) return;
    const interval = setInterval(async () => {
      try {
        let updated: ChatRoom;
        if (mode === 'admin') {
          updated = await getAdminChatRoom(100);
        } else if (orgId) {
          updated = await getOrgChatRoom(orgId, 100);
        } else return;
        setRoom(updated);
      } catch { /* ignore */ }
    }, 3000);
    return () => clearInterval(interval);
  }, [room?.id, mode, orgId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [room?.messages?.length]);

  const handleSend = async () => {
    if (!newMessage.trim() || !room || sending) return;
    setSending(true);
    try {
      const msg = await sendChatMessage(room.id, newMessage);
      setNewMessage('');
      setRoom(prev => prev ? {
        ...prev,
        messages: [...(prev.messages || []), msg as ChatMessage],
      } : prev);
    } catch { /* ignore */ } finally { setSending(false); }
  };

  const filteredMentions = teamMembers.filter(m =>
    m.name.toLowerCase().includes(mentionQuery.toLowerCase()) && m.id !== user?.id
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNewMessage(val);
    // Detect @mention
    const cursor = e.target.selectionStart || 0;
    const textBeforeCursor = val.slice(0, cursor);
    const atMatch = textBeforeCursor.match(/@(\w*)$/);
    if (atMatch) {
      setMentionQuery(atMatch[1]);
      setShowMentions(true);
      setMentionIndex(0);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (memberName: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const cursor = textarea.selectionStart || 0;
    const textBeforeCursor = newMessage.slice(0, cursor);
    const textAfterCursor = newMessage.slice(cursor);
    const atPos = textBeforeCursor.lastIndexOf('@');
    const before = newMessage.slice(0, atPos);
    const mention = `@${memberName} `;
    setNewMessage(before + mention + textAfterCursor);
    setShowMentions(false);
    setTimeout(() => {
      textarea.focus();
      const pos = before.length + mention.length;
      textarea.setSelectionRange(pos, pos);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentions && filteredMentions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex(prev => Math.min(prev + 1, filteredMentions.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex(prev => Math.max(prev - 1, 0));
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(filteredMentions[mentionIndex].name);
        return;
      }
      if (e.key === 'Escape') {
        setShowMentions(false);
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const messages = room?.messages || [];
  const myId = user?.id;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-violet-600" />
            {mode === 'admin' ? 'Admin Team Chat' : 'Team Chat'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {mode === 'admin'
              ? 'Group chat for the admin team — full transparency, no private messages'
              : 'Group chat for your organization team'}
          </p>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400">
            Loading chat room...
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
            <MessageCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">{error}</p>
          </div>
        ) : !room ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
            <MessageCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 mb-4">Chat room will be created when you send your first message.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[600px]">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
                <Hash className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{room.name}</p>
                <p className="text-xs text-slate-400">{room.messageCount} messages</p>
              </div>
              <div className="ml-auto flex items-center gap-1 text-xs text-slate-400">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Live
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <MessageCircle className="w-10 h-10 mb-2" />
                  <p className="text-sm">No messages yet. Say hello! 👋</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isOwn = msg.senderId === myId;
                  const prevMsg = i > 0 ? messages[i - 1] : null;
                  const showSender = !prevMsg || prevMsg.senderId !== msg.senderId;

                  return (
                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${showSender ? 'mt-2' : ''}`}>
                        {!isOwn && showSender && (
                          <p className="text-xs font-medium text-violet-600 dark:text-violet-400 mb-1 ml-1">
                            {msg.senderName}
                          </p>
                        )}
                        <div className={`group relative rounded-2xl px-4 py-2.5 ${
                          isOwn
                            ? 'bg-violet-600 text-white rounded-br-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-sm'
                        }`}>
                          <p className="text-sm leading-relaxed">{renderMessageContent(msg.content)}</p>
                          <p className={`text-xs mt-0.5 ${isOwn ? 'text-violet-200' : 'text-slate-400'}`}>
                            {formatTime(msg.createdAt)}
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
              <div className="relative">
                {/* @mention popup */}
                {showMentions && filteredMentions.length > 0 && (
                  <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden z-10 max-h-48 overflow-y-auto">
                    <div className="px-3 py-1.5 text-xs text-slate-400 font-medium border-b border-slate-100 dark:border-slate-700 flex items-center gap-1.5">
                      <AtSign className="w-3 h-3" /> Mention a team member
                    </div>
                    {filteredMentions.map((member, idx) => (
                      <button
                        key={member.id}
                        onClick={() => insertMention(member.name)}
                        className={`w-full text-left px-3 py-2 flex items-center gap-2.5 text-sm transition-colors ${
                          idx === mentionIndex
                            ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-xs font-bold text-violet-600 dark:text-violet-400">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{member.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 items-end">
                  <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message... Use @ to mention"
                    rows={1}
                    className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-violet-500 resize-none max-h-32"
                    style={{ minHeight: '44px' }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sending}
                    className="p-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1.5 ml-1">
                Shift+Enter for new line · @ to mention · Enter to send
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
