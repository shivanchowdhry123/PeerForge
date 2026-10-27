import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Message } from '../types';
import {
  Send,
  Search,
  Users,
  MoreVertical,
  Reply,
  Smile,
  ShieldAlert,
  VolumeX,
  UserX,
  CheckCheck,
  Check,
  FolderKanban,
  X
} from 'lucide-react';

export const MessagesView: React.FC = () => {
  const {
    currentUser,
    allStudents,
    conversations,
    messages,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    reactToMessage,
    submitContentReport
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [replyTarget, setReplyTarget] = useState<Message['replyTo'] | null>(null);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find(c => c.id === activeConversationId) || conversations[0];
  const activeMessages = messages.filter(m => m.conversationId === activeConv?.id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;
    sendMessage(activeConv.id, inputText, replyTarget || undefined);
    setInputText('');
    setReplyTarget(null);
  };

  // Determine conversation title and avatar
  const getConvDetails = (conv: typeof activeConv) => {
    if (!conv) return { name: 'Chat', subtitle: '', avatar: '' };
    if (conv.isGroup) {
      return {
        name: conv.name || 'Project Team Chat',
        subtitle: `${conv.participantIds.length} members`,
        avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=group'
      };
    }
    const otherId = conv.participantIds.find(id => id !== currentUser.id);
    const otherStudent = allStudents.find(s => s.id === otherId);
    return {
      name: otherStudent ? otherStudent.name : 'OPG Student',
      subtitle: otherStudent ? `${otherStudent.grade} · Section ${otherStudent.section}` : 'Student',
      avatar: otherStudent ? otherStudent.avatar : 'https://api.dicebear.com/7.x/bottts/svg?seed=Peer'
    };
  };

  const currentDetails = getConvDetails(activeConv);

  // Filter conversations
  const filteredConversations = conversations.filter(c => {
    if (!searchFilter.trim()) return true;
    const details = getConvDetails(c);
    return details.name.toLowerCase().includes(searchFilter.toLowerCase());
  });

  const availableEmojis = ['👍', '❤️', '💡', '🚀', '👏'];

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] overflow-hidden flex flex-col md:flex-row shadow-sm">
      {/* Left Column: Conversation List */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-[var(--border-color)] flex flex-col h-full bg-[var(--bg-surface)] shrink-0">
        <div className="p-4 border-b border-[var(--border-color)] space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-bold text-[var(--text-primary)]">Messages</h1>
            <span className="text-[11px] text-[var(--text-muted)] font-medium">
              Direct & Group
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
            />
          </div>
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-color)]/60">
          {filteredConversations.map(conv => {
            const details = getConvDetails(conv);
            const isSelected = conv.id === activeConv?.id;
            return (
              <button
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`w-full p-3.5 text-left flex items-center gap-3 transition-colors ${
                  isSelected
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-l-3 border-blue-600'
                    : 'hover:bg-[var(--bg-subtle)]'
                }`}
              >
                <img
                  src={details.avatar}
                  alt={details.name}
                  className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                      {details.name}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                      {conv.lastMessage?.timestamp || 'Active'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">
                    {conv.lastMessage?.text || 'No messages yet'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Active Conversation */}
      <div className="flex-1 flex flex-col h-full bg-[var(--bg-ivory)]">
        {/* Header */}
        <div className="px-5 py-3 border-b border-[var(--border-color)] bg-[var(--bg-surface)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={currentDetails.avatar}
              alt={currentDetails.name}
              className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 object-cover"
              referrerPolicy="no-referrer"
            />
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">{currentDetails.name}</h2>
              <p className="text-[10px] text-[var(--text-muted)]">{currentDetails.subtitle}</p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsOptionsOpen(!isOptionsOpen)}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isOptionsOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xl z-50 p-1">
                <button
                  onClick={() => {
                    setIsOptionsOpen(false);
                    alert('Conversation muted for 8 hours.');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] rounded-lg text-left"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Mute Notifications</span>
                </button>
                <button
                  onClick={() => {
                    setIsOptionsOpen(false);
                    setReportModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg text-left"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Report to School Admin</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5">
          {activeMessages.map(msg => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
              >
                {/* Reply quote banner if present */}
                {msg.replyTo && (
                  <div className="text-[10px] px-2.5 py-1 rounded-t-lg bg-slate-200/60 dark:bg-slate-800 text-[var(--text-muted)] max-w-sm mb-0.5 border border-b-0 border-[var(--border-color)]">
                    Replying to {msg.replyTo.senderName}: &quot;{msg.replyTo.text.slice(0, 30)}...&quot;
                  </div>
                )}

                <div className="flex items-end gap-2 max-w-lg">
                  {!isMe && (
                    <img
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      className="w-6 h-6 rounded-lg bg-blue-100 object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-2xs relative ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-br-xs'
                        : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-bl-xs'
                    }`}
                  >
                    {!isMe && (
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 block mb-0.5">
                        {msg.senderName}
                      </span>
                    )}

                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                    <div
                      className={`text-[9px] mt-1 text-right flex items-center justify-end gap-1 ${
                        isMe ? 'text-blue-100' : 'text-[var(--text-muted)]'
                      }`}
                    >
                      <span className="num-tabular">{msg.timestamp}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-blue-200" />}
                    </div>
                  </div>

                  {/* Reaction trigger on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button
                      onClick={() => setReplyTarget({ id: msg.id, text: msg.text, senderName: msg.senderName })}
                      className="p-1 rounded-md bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-blue-600 shadow-2xs"
                      title="Reply"
                    >
                      <Reply className="w-3 h-3" />
                    </button>
                    {availableEmojis.slice(0, 2).map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => reactToMessage(msg.id, emoji)}
                        className="p-1 rounded-md bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs hover:scale-110 transition-transform shadow-2xs"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Emoji reactions display */}
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    {Object.entries(msg.reactions).map(([emoji, userIds]) => (
                      <span
                        key={emoji}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] text-[10px] text-[var(--text-secondary)] shadow-2xs"
                      >
                        <span>{emoji}</span>
                        <span className="font-semibold num-tabular">{userIds.length}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[var(--bg-surface)] border-t border-[var(--border-color)] space-y-2">
          {/* Active Reply Banner */}
          {replyTarget && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300">
              <div className="truncate">
                <span className="font-bold">Replying to {replyTarget.senderName}: </span>
                <span className="italic">{replyTarget.text.slice(0, 45)}...</span>
              </div>
              <button onClick={() => setReplyTarget(null)} className="p-0.5 text-blue-600 hover:text-blue-800">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Type message to verified school peer..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-blue-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Safety Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] rounded-3xl max-w-md w-full p-6 border border-[var(--border-color)] shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <span>Report Conversation to Moderator</span>
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              OPG World School maintains a strict zero-tolerance policy against bullying, harassment, and
              academic dishonesty. Reports are reviewed by school administrators.
            </p>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-primary)]">Reason:</label>
              <select className="w-full p-2 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)]">
                <option>Harassment or Inappropriate Language</option>
                <option>Academic Dishonesty / Assessment Sharing</option>
                <option>Spam or Unsolicited Commercial Links</option>
                <option>Impersonation</option>
              </select>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setReportModalOpen(false)}
                className="px-4 py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  submitContentReport({
                    reportedUserName: currentDetails.name,
                    targetType: 'message',
                    reason: 'Harassment or Inappropriate Language'
                  });
                  setReportModalOpen(false);
                  alert('Thank you. Your report has been submitted to school moderation.');
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
