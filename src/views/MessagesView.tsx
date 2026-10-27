import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Message, Conversation, StudentProfile } from '../types';
import {
  Send,
  Search,
  Users,
  User,
  Plus,
  Smile,
  Reply,
  MoreVertical,
  X,
  ArrowLeft,
  Check,
  CheckCheck,
  ShieldAlert,
  Sparkles,
  Info,
  Lock,
  LogIn,
  UserPlus
} from 'lucide-react';

export const MessagesView: React.FC = () => {
  const {
    currentUser,
    isAuthenticated,
    openAuthModal,
    allStudents,
    conversations,
    messages,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    reactToMessage,
    openDirectMessageWith,
    createGroupConversation
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'direct' | 'groups'>('all');
  const [replyTarget, setReplyTarget] = useState<Message['replyTo'] | null>(null);

  // Mobile navigation state: showing list vs active chat pane
  const [mobileViewActive, setMobileViewActive] = useState<boolean>(false);

  // Modal for new Chat / Group Creation
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'direct' | 'group'>('direct');
  const [groupName, setGroupName] = useState('');
  const [groupTopic, setGroupTopic] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [modalSearch, setModalSearch] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // PRIVACY RULE: Logged-in user ONLY sees conversations where they are a participant
  const userConversations = isAuthenticated && conversations && currentUser
    ? conversations.filter(c => c.participantIds && c.participantIds.includes(currentUser.id))
    : [];

  const activeConv = userConversations.find(c => c.id === activeConversationId) || userConversations[0];
  const activeMessages = activeConv && messages ? messages.filter(m => m.conversationId === activeConv.id) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length, activeConversationId]);

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setMobileViewActive(true);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    sendMessage(activeConv.id, inputText.trim(), replyTarget || undefined);
    setInputText('');
    setReplyTarget(null);
  };

  // Helper to format conversation header info
  const getConvDetails = (conv: Conversation | undefined) => {
    if (!conv) return { name: 'Chat', subtitle: 'Select a conversation', avatar: '', isGroup: false };
    if (conv.isGroup) {
      return {
        name: conv.name || 'Group Channel',
        subtitle: `${conv.participantIds.length} members`,
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(conv.name || 'group')}`,
        isGroup: true
      };
    }
    if (!currentUser) return { name: 'Chat', subtitle: '', avatar: '', isGroup: false };
    const otherId = conv.participantIds.find(id => id !== currentUser.id) || conv.participantIds[0];
    const otherStudent = allStudents.find(s => s.id === otherId);
    return {
      name: otherStudent ? otherStudent.name : 'OPG Student',
      subtitle: otherStudent ? `${otherStudent.grade} • ${otherStudent.role === 'teacher' ? 'Faculty Mentor' : 'Student'}` : 'Student',
      avatar: otherStudent ? otherStudent.avatar : 'https://api.dicebear.com/7.x/adventurer/svg?seed=Peer',
      isGroup: false,
      otherStudent
    };
  };

  const currentDetails = getConvDetails(activeConv);

  // Filter conversations for active search and tabs
  const filteredConversations = userConversations.filter(c => {
    const details = getConvDetails(c);
    const matchesSearch =
      details.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (details.subtitle && details.subtitle.toLowerCase().includes(searchFilter.toLowerCase()));

    if (filterType === 'direct') return matchesSearch && !c.isGroup;
    if (filterType === 'groups') return matchesSearch && c.isGroup;
    return matchesSearch;
  });

  // Handle New Group Submit
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedStudentIds.length === 0) return;

    createGroupConversation(groupName.trim(), selectedStudentIds, groupTopic.trim() || undefined);
    setIsNewChatModalOpen(false);
    setGroupName('');
    setGroupTopic('');
    setSelectedStudentIds([]);
    setMobileViewActive(true);
  };

  // Toggle student selection for group creation
  const toggleStudentSelection = (id: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleStartDirectChat = (student: StudentProfile) => {
    openDirectMessageWith(student);
    setIsNewChatModalOpen(false);
    setMobileViewActive(true);
  };

  const availableEmojis = ['👍', '❤️', '💡', '🚀', '👏'];

  // AUTHENTICATION GATE RENDER
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xl space-y-6 animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Authentication Required
          </h2>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            PeerForge messaging is encrypted and restricted to verified OPG World School students and faculty mentors. Please sign in or register to view your chats.
          </p>
        </div>

        <div className="pt-2 space-y-2.5">
          <button
            onClick={() => openAuthModal('login')}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Access Messages</span>
          </button>

          <button
            onClick={() => openAuthModal('signup', 'student')}
            className="w-full py-2.5 px-4 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-semibold text-xs border border-[var(--border-color)] transition-all flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-blue-600" />
            <span>Create New Student Account</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Top Messaging Control Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-color)] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
              Peer & Team Messaging Hub
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Logged in as <span className="font-semibold text-blue-600 dark:text-blue-400">{currentUser.name}</span> ({currentUser.role === 'teacher' ? 'Teacher' : 'Student'})
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsNewChatModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat / Create Group</span>
        </button>
      </div>

      {/* Main Messaging Window */}
      <div className="h-[620px] rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] overflow-hidden flex shadow-xs relative">
        
        {/* LEFT COLUMN: Conversation List */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-[var(--border-color)] flex flex-col h-full bg-[var(--bg-surface)] shrink-0 transition-all ${
            mobileViewActive ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Search & Tabs */}
          <div className="p-3.5 border-b border-[var(--border-color)] space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search chats or members..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-[var(--bg-subtle)] p-1 rounded-xl">
              <button
                onClick={() => setFilterType('all')}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                  filterType === 'all'
                    ? 'bg-[var(--bg-surface)] text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                All ({userConversations.length})
              </button>
              <button
                onClick={() => setFilterType('direct')}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                  filterType === 'direct'
                    ? 'bg-[var(--bg-surface)] text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Direct
              </button>
              <button
                onClick={() => setFilterType('groups')}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                  filterType === 'groups'
                    ? 'bg-[var(--bg-surface)] text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Groups
              </button>
            </div>
          </div>

          {/* Conversation Cards List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-color)]/50">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center space-y-3 my-auto">
                <Users className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
                <p className="text-xs text-[var(--text-muted)] font-medium">No active chats for {currentUser.name}</p>
                <button
                  onClick={() => setIsNewChatModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-2xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Start New Conversation</span>
                </button>
              </div>
            ) : (
              filteredConversations.map(conv => {
                const details = getConvDetails(conv);
                const isActive = activeConv?.id === conv.id;

                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors ${
                      isActive
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-l-4 border-blue-600'
                        : 'hover:bg-[var(--bg-subtle)]'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={details.avatar}
                        alt={details.name}
                        className="w-10 h-10 rounded-xl object-cover bg-[var(--bg-subtle)] border border-[var(--border-color)]"
                      />
                      {details.isGroup && (
                        <span className="absolute -bottom-1 -right-1 bg-purple-600 text-white p-0.5 rounded-full text-[9px]">
                          <Users className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">
                          {details.name}
                        </h4>
                        <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                          {conv.lastMessage?.timestamp || 'Active'}
                        </span>
                      </div>

                      <p className="text-[11px] text-[var(--text-secondary)] truncate">
                        {conv.lastMessage?.text || 'Start chatting...'}
                      </p>

                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="text-[10px] text-[var(--text-muted)] font-medium">
                          {details.subtitle}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Chat Window */}
        <div
          className={`flex-1 flex flex-col h-full bg-[var(--bg-surface)] ${
            !mobileViewActive ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConv ? (
            <>
              {/* Active Conversation Top Navigation Bar */}
              <div className="p-3.5 border-b border-[var(--border-color)] bg-[var(--bg-surface)] flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setMobileViewActive(false)}
                    className="md:hidden p-1.5 rounded-xl hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)]"
                    title="Back to conversations"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <img
                    src={currentDetails.avatar}
                    alt={currentDetails.name}
                    className="w-9 h-9 rounded-xl object-cover bg-[var(--bg-subtle)] border border-[var(--border-color)] shrink-0"
                  />

                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">
                      {currentDetails.name}
                    </h3>
                    <p className="text-[11px] text-[var(--text-muted)] truncate">
                      {currentDetails.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Messages Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[var(--bg-subtle)]/30">
                {activeMessages.length === 0 ? (
                  <div className="p-12 text-center space-y-2 my-auto">
                    <Sparkles className="w-8 h-8 text-blue-500 mx-auto opacity-60" />
                    <p className="text-xs font-semibold text-[var(--text-primary)]">
                      Start of conversation in {currentDetails.name}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] max-w-sm mx-auto">
                      Send a message to coordinate project roles, solve peer doubts, or share competition files.
                    </p>
                  </div>
                ) : (
                  activeMessages.map(msg => {
                    const isOwn = msg.senderId === currentUser!.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-2.5 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        {!isOwn && (
                          <img
                            src={msg.senderAvatar}
                            alt={msg.senderName}
                            className="w-7 h-7 rounded-xl object-cover shrink-0 mt-0.5"
                          />
                        )}

                        <div className={`max-w-[82%] sm:max-w-[70%] space-y-1 ${isOwn ? 'items-end' : 'items-start'}`}>
                          {/* Sender Name in Group */}
                          {!isOwn && currentDetails.isGroup && (
                            <span className="text-[10px] font-bold text-[var(--text-secondary)] px-1">
                              {msg.senderName}
                            </span>
                          )}

                          {/* Message Bubble */}
                          <div
                            className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs relative group ${
                              isOwn
                                ? 'bg-blue-600 text-white rounded-tr-xs'
                                : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-tl-xs'
                            }`}
                          >
                            {/* Reply Quote Banner */}
                            {msg.replyTo && (
                              <div
                                className={`p-2 mb-2 rounded-xl text-[11px] border-l-2 ${
                                  isOwn
                                    ? 'bg-blue-700/60 border-white/60 text-blue-100'
                                    : 'bg-[var(--bg-subtle)] border-blue-500 text-[var(--text-secondary)]'
                                }`}
                              >
                                <span className="font-bold block text-[10px]">{msg.replyTo.senderName}</span>
                                <span className="line-clamp-1">{msg.replyTo.text}</span>
                              </div>
                            )}

                            <p className="whitespace-pre-wrap break-words">{msg.text}</p>

                            {/* Message Footer: Time + Reaction Bar */}
                            <div
                              className={`flex items-center gap-2 mt-1 text-[10px] ${
                                isOwn ? 'text-blue-100 justify-end' : 'text-[var(--text-muted)] justify-start'
                              }`}
                            >
                              <span>{msg.timestamp}</span>
                            </div>

                            {/* Hover Reaction Emojis Trigger */}
                            <div
                              className={`absolute -bottom-3 ${
                                isOwn ? 'right-2' : 'left-2'
                              } flex items-center gap-1 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-full px-2 py-0.5 shadow-xs opacity-0 group-hover:opacity-100 transition-opacity z-10`}
                            >
                              {availableEmojis.map(emoji => (
                                <button
                                  key={emoji}
                                  onClick={() => reactToMessage(msg.id, emoji)}
                                  className="text-xs hover:scale-125 transition-transform"
                                >
                                  {emoji}
                                </button>
                              ))}
                              <button
                                onClick={() => setReplyTarget({ id: msg.id, text: msg.text, senderName: msg.senderName })}
                                className="text-[10px] text-[var(--text-muted)] hover:text-blue-600 ml-1"
                                title="Reply to message"
                              >
                                <Reply className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Rendered Reaction Emojis Badges */}
                          {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 pt-0.5">
                              {Object.entries(msg.reactions).map(([emoji, users]) => (
                                <span
                                  key={emoji}
                                  onClick={() => reactToMessage(msg.id, emoji)}
                                  className="px-1.5 py-0.5 rounded-full text-[10px] bg-[var(--bg-surface)] border border-[var(--border-color)] cursor-pointer hover:border-blue-400 font-medium"
                                >
                                  {emoji} {users.length}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Controls */}
              <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-surface)] space-y-2">
                {/* Reply Banner */}
                {replyTarget && (
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 block">
                        Replying to {replyTarget.senderName}
                      </span>
                      <p className="text-[11px] text-[var(--text-secondary)] truncate">{replyTarget.text}</p>
                    </div>
                    <button
                      onClick={() => setReplyTarget(null)}
                      className="p-1 text-[var(--text-muted)] hover:text-rose-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    placeholder={`Message ${currentDetails.name}...`}
                    className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-primary)] placeholder-[var(--border-color)] focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className={`px-4 py-2 rounded-xl text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5 shrink-0 ${
                      !inputText.trim()
                        ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-60'
                        : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
                    }`}
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="p-12 text-center space-y-3 my-auto">
              <Users className="w-12 h-12 text-blue-500 mx-auto opacity-50" />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">No active chat selected</h3>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                Select a direct message or project group from the left panel, or start a new group chat.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: New Chat / Group Creation */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[var(--bg-surface)] w-full max-w-md rounded-3xl border border-[var(--border-color)] shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {modalType === 'direct' ? 'Start Direct Message' : 'Create Group Channel'}
                </h3>
              </div>
              <button
                onClick={() => setIsNewChatModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-[var(--bg-subtle)] text-[var(--text-muted)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Type Switcher */}
            <div className="flex bg-[var(--bg-subtle)] p-1 rounded-2xl border border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setModalType('direct')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  modalType === 'direct'
                    ? 'bg-[var(--bg-surface)] text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-[var(--text-muted)]'
                }`}
              >
                Direct Message (1-on-1)
              </button>
              <button
                type="button"
                onClick={() => setModalType('group')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  modalType === 'group'
                    ? 'bg-[var(--bg-surface)] text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-[var(--text-muted)]'
                }`}
              >
                Group Channel
              </button>
            </div>

            {modalType === 'group' ? (
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                    Group Channel Name
                  </label>
                  <input
                    type="text"
                    required
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    placeholder="e.g. Science Fair Physics Team, Robotics Lab 2026"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                    Channel Topic / Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={groupTopic}
                    onChange={e => setGroupTopic(e.target.value)}
                    placeholder="e.g. PCB circuit design & CAD reviews"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                    Select Participants ({selectedStudentIds.length} chosen)
                  </label>
                  <div className="max-h-44 overflow-y-auto space-y-1 rounded-2xl border border-[var(--border-color)] p-2 bg-[var(--bg-subtle)]/50">
                    {allStudents.filter(s => s.id !== currentUser!.id).map(student => {
                      const isSelected = selectedStudentIds.includes(student.id);

                      return (
                        <div
                          key={student.id}
                          onClick={() => toggleStudentSelection(student.id)}
                          className={`p-2 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800'
                              : 'hover:bg-[var(--bg-surface)]'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img src={student.avatar} alt={student.name} className="w-6 h-6 rounded-full shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[var(--text-primary)] truncate">{student.name}</p>
                              <p className="text-[10px] text-[var(--text-muted)] truncate">{student.grade} • {student.role}</p>
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-[var(--border-color)]'}`}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!groupName.trim() || selectedStudentIds.length === 0}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white transition-all shadow-xs ${
                    !groupName.trim() || selectedStudentIds.length === 0
                      ? 'bg-slate-400 cursor-not-allowed opacity-60'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Create Group Channel
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    placeholder="Search students or faculty..."
                    value={modalSearch}
                    onChange={e => setModalSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-primary)]"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1.5 pt-1">
                  {allStudents
                    .filter(s => s.id !== currentUser!.id && s.name.toLowerCase().includes(modalSearch.toLowerCase()))
                    .map(student => (
                      <div
                        key={student.id}
                        onClick={() => handleStartDirectChat(student)}
                        className="p-2.5 rounded-2xl bg-[var(--bg-subtle)] hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-[var(--border-color)] hover:border-blue-300 flex items-center justify-between gap-3 cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img src={student.avatar} alt={student.name} className="w-8 h-8 rounded-xl object-cover shrink-0" />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">{student.name}</h4>
                            <p className="text-[10px] text-[var(--text-muted)] truncate">{student.grade} • {student.role === 'teacher' ? 'Faculty Mentor' : 'Student'}</p>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-xl bg-blue-600 text-white text-[11px] font-semibold shrink-0">
                          Message
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
