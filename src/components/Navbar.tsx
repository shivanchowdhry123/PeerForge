import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  MessageSquare,
  Sun,
  Moon,
  Monitor,
  Search,
  Sparkles,
  Shield,
  LogIn,
  UserPlus,
  LogOut,
  ChevronDown,
  User,
  GraduationCap,
  Trash2
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    themeMode,
    theme,
    toggleTheme,
    notifications,
    unreadNotifsCount,
    unreadMessagesCount,
    markNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    currentUser,
    isAuthenticated,
    openAuthModal,
    logout
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const handleSearchRedirect = () => {
    setActiveTab('discover');
    setTimeout(() => {
      const input = document.getElementById('discover-search-input');
      if (input) {
        input.focus();
      }
    }, 100);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-color)] bg-[var(--bg-surface)]/85 dark:bg-[var(--bg-surface)]/80 backdrop-blur-md px-3 sm:px-6 py-2 sm:py-2.5 transition-colors overflow-visible relative">
      <div className="flex items-center justify-between gap-2 sm:gap-4 w-full">
        {/* Zone 1: Brand Wordmark (Left) */}
        <div className="flex items-center shrink-0">
          <button
            onClick={() => setActiveTab('home')}
            aria-label="PeerForge Home"
            title="PeerForge Home"
            className="flex items-center text-left group focus-visible:outline-none"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs group-hover:scale-105 transition-transform duration-200 shrink-0">
              PF
            </div>
          </button>
        </div>

        {/* Zone 2: Centered Header Actions */}
        <div className="flex-1 min-w-0 flex items-center justify-center flex-wrap sm:flex-nowrap gap-1.5 sm:gap-2 py-0.5">
          {/* Directory Search Button (Redirects & Auto-focuses on PC, Tablet & Mobile) */}
          <button
            onClick={handleSearchRedirect}
            aria-label="Search Student Directory"
            className={`relative p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center group shrink-0 ${
              activeTab === 'discover'
                ? 'text-blue-600 bg-blue-500/10 border border-blue-500/20 shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20'
            }`}
          >
            <Search className="w-4 h-4 transition-transform group-hover:scale-110 shrink-0" />

            {/* Hover Tooltip showing Search */}
            <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] dark:bg-slate-900 text-[var(--text-primary)] text-[11px] font-semibold tracking-tight shadow-xl border border-[var(--border-color)] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 z-50">
              Search Directory
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[var(--bg-surface)] dark:bg-slate-900 border-t border-l border-[var(--border-color)]" />
            </span>
          </button>

          {/* Quick AI Matcher button (Icon-Only with Tooltip on Hover) */}
          <button
            onClick={() => setActiveTab('ai-finder')}
            aria-label="Match Finder"
            className={`relative p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center group shrink-0 ${
              activeTab === 'ai-finder'
                ? 'text-purple-600 bg-purple-500/10 border border-purple-500/20 shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/20'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 transition-transform group-hover:scale-110 shrink-0" />

            {/* Hover Tooltip showing Match Finder */}
            <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] dark:bg-slate-900 text-[var(--text-primary)] text-[11px] font-semibold tracking-tight shadow-xl border border-[var(--border-color)] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 z-50">
              Match Finder
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[var(--bg-surface)] dark:bg-slate-900 border-t border-l border-[var(--border-color)]" />
            </span>
          </button>

          {/* Theme Toggle Button (Icon-Only with Tooltip on Hover) */}
          <div className="relative shrink-0">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme mode"
              className={`relative p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center group shrink-0 ${
                themeMode === 'light'
                  ? 'text-amber-500 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20'
                  : themeMode === 'dark'
                  ? 'text-indigo-400 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20'
                  : 'text-blue-500 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20'
              }`}
            >
              {themeMode === 'light' && <Sun className="w-4 h-4 text-amber-500 transition-transform group-hover:scale-110 shrink-0" />}
              {themeMode === 'dark' && <Moon className="w-4 h-4 text-indigo-400 transition-transform group-hover:scale-110 shrink-0" />}
              {themeMode === 'system' && (
                <div className="relative flex items-center justify-center transition-transform group-hover:scale-110 shrink-0">
                  <Monitor className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-[var(--bg-surface)]" />
                </div>
              )}

              {/* Hover Tooltip showing Theme */}
              <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] dark:bg-slate-900 text-[var(--text-primary)] text-[11px] font-semibold tracking-tight shadow-xl border border-[var(--border-color)] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 z-50">
                {themeMode === 'light' ? 'Light Mode' : themeMode === 'dark' ? 'Dark Mode' : `Auto (${theme})`}
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[var(--bg-surface)] dark:bg-slate-900 border-t border-l border-[var(--border-color)]" />
              </span>
            </button>
          </div>

          {/* Messages Quick Button (Icon-Only with Tooltip on Hover) */}
          <button
            onClick={() => setActiveTab('messages')}
            aria-label="Messages"
            className={`relative p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center group shrink-0 ${
              activeTab === 'messages'
                ? 'text-blue-600 bg-blue-500/10 border border-blue-500/20 shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] border border-transparent hover:border-[var(--border-color)]'
            }`}
          >
            <MessageSquare className="w-4 h-4 transition-transform group-hover:scale-110 shrink-0" />
            {unreadMessagesCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-[var(--bg-surface)] shrink-0" />
            )}

            {/* Hover Tooltip showing Messages */}
            <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] dark:bg-slate-900 text-[var(--text-primary)] text-[11px] font-semibold tracking-tight shadow-xl border border-[var(--border-color)] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 z-50">
              {unreadMessagesCount > 0 ? `Messages (${unreadMessagesCount})` : 'Messages'}
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[var(--bg-surface)] dark:bg-slate-900 border-t border-l border-[var(--border-color)]" />
            </span>
          </button>

          {/* Notifications Popover (Icon-Only with Tooltip on Hover) */}
          <div className="relative shrink-0">
            <button
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                if (!isNotifOpen) markNotificationsAsRead();
              }}
              aria-label="Notifications"
              className={`relative p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center group shrink-0 ${
                isNotifOpen || activeTab === 'notifications'
                  ? 'text-blue-600 bg-blue-500/10 border border-blue-500/20 shadow-2xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] border border-transparent hover:border-[var(--border-color)]'
              }`}
            >
              <Bell className="w-4 h-4 transition-transform group-hover:scale-110 shrink-0" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-[var(--bg-surface)] shrink-0" />
              )}

              {/* Hover Tooltip showing Notifications (hidden when dropdown is open) */}
              {!isNotifOpen && (
                <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] dark:bg-slate-900 text-[var(--text-primary)] text-[11px] font-semibold tracking-tight shadow-xl border border-[var(--border-color)] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 z-50">
                  {unreadNotifsCount > 0 ? `Notifications (${unreadNotifsCount})` : 'Notifications'}
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[var(--bg-surface)] dark:bg-slate-900 border-t border-l border-[var(--border-color)]" />
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] sm:w-96 max-w-sm rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-2xl z-50 p-3 sm:p-3.5 overflow-hidden animate-in fade-in zoom-in-95 backdrop-blur-xl">
                <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--text-primary)]">Notifications</span>
                    {unreadNotifsCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-bold">
                        {unreadNotifsCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => {
                        setIsNotifOpen(false);
                        setActiveTab('notifications');
                      }}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    >
                      View all
                    </button>
                    {notifications.length > 0 && isAuthenticated && currentUser && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearAllNotifications();
                        }}
                        className="text-[11px] text-[var(--text-muted)] hover:text-red-500 transition-colors font-medium"
                        title="Clear all notifications"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-[var(--border-color)]/60 my-1">
                  {(!isAuthenticated || !currentUser) ? (
                    <div className="py-6 text-center text-xs text-[var(--text-muted)]">
                      Please sign in to view your notifications.
                    </div>
                  ) : (() => {
                    const userNotifs = (notifications || []).filter(n => {
                      if (!n) return false;
                      if (n.userId === currentUser.id) return true;
                      if (n.userId === 'developer' && (currentUser.role === 'developer' || currentUser.role === 'admin')) return true;
                      if (n.userId === 'teacher' && currentUser.role === 'teacher') return true;
                      if (n.userId === 'all') return true;
                      return false;
                    });

                    if (userNotifs.length === 0) {
                      return (
                        <div className="py-6 text-center text-xs text-[var(--text-muted)]">
                          No notifications yet.
                        </div>
                      );
                    }

                    return userNotifs.slice(0, 5).map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          setIsNotifOpen(false);
                          if (n.actionTab) setActiveTab(n.actionTab);
                        }}
                        className="group/notif py-2.5 px-2 hover:bg-[var(--bg-subtle)] rounded-xl cursor-pointer transition-colors relative"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-[var(--text-primary)] pr-2">{n.title}</p>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] text-[var(--text-muted)] num-tabular">{n.timestamp}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(n.id);
                              }}
                              aria-label="Delete notification"
                              title="Delete notification"
                              className="opacity-70 sm:opacity-0 group-hover/notif:opacity-100 p-1 rounded-md text-[var(--text-muted)] hover:text-red-600 hover:bg-red-500/10 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 line-clamp-2">
                          {n.description}
                        </p>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Help Desk Button (Icon-Only with Tooltip on Hover) */}
          <button
            onClick={() => setActiveTab('contact')}
            aria-label="Help Desk"
            className={`relative p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center group shrink-0 ${
              activeTab === 'contact'
                ? 'text-blue-600 bg-blue-500/10 border border-blue-500/20 shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] border border-transparent hover:border-[var(--border-color)]'
            }`}
          >
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110 shrink-0" />

            {/* Hover Tooltip showing Help Desk */}
            <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] dark:bg-slate-900 text-[var(--text-primary)] text-[11px] font-semibold tracking-tight shadow-xl border border-[var(--border-color)] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 z-50">
              Help Desk
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[var(--bg-surface)] dark:bg-slate-900 border-t border-l border-[var(--border-color)]" />
            </span>
          </button>
        </div>

        {/* Zone 3: Account & Auth (Right) */}
        <div className="flex items-center shrink-0">
          {/* Authentication State */}
          {(!isAuthenticated || !currentUser) ? (
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                onClick={() => openAuthModal('login')}
                className="px-2 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] border border-[var(--border-color)] transition-all flex items-center gap-1 shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Log In</span>
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all flex items-center gap-1 shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Sign Up</span>
              </button>
            </div>
          ) : (
            <div className="relative shrink-0">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-label="Account Menu"
                className={`relative p-1 rounded-xl transition-all cursor-pointer flex items-center justify-center group shrink-0 ${
                  isUserMenuOpen
                    ? 'ring-2 ring-blue-500/50 bg-blue-500/10'
                    : 'hover:bg-[var(--bg-subtle)] border border-transparent hover:border-[var(--border-color)]'
                }`}
              >
                <img
                  src={currentUser?.avatar}
                  alt={currentUser?.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-100 dark:bg-blue-900 object-cover transition-transform group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                {/* Hover Tooltip showing Account */}
                {!isUserMenuOpen && (
                  <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] dark:bg-slate-900 text-[var(--text-primary)] text-[11px] font-semibold tracking-tight shadow-xl border border-[var(--border-color)] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 z-50">
                    {currentUser?.name || 'Account'}
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[var(--bg-surface)] dark:bg-slate-900 border-t border-l border-[var(--border-color)]" />
                  </span>
                )}
              </button>

              {isUserMenuOpen && currentUser && (
                <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-2xl z-50 p-2 overflow-hidden animate-in fade-in zoom-in-95 backdrop-blur-xl">
                  <div className="px-3 py-2.5 border-b border-[var(--border-color)]">
                    <div className="flex items-center gap-2.5 mb-2">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900 object-cover border border-[var(--border-color)] shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-[var(--text-primary)] truncate">{currentUser.name}</p>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold border border-blue-500/20 shrink-0">
                            {currentUser.role === 'teacher'
                              ? currentUser.isApproved
                                ? 'Faculty'
                                : 'Pending'
                              : currentUser.role === 'developer'
                              ? 'Dev'
                              : 'Student'}
                          </span>
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)] truncate">{currentUser.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1.5 border-t border-[var(--border-color)]/60">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="text-[10px] font-semibold text-[var(--text-secondary)] truncate">
                        {currentUser.role === 'teacher'
                          ? 'Faculty Mentor'
                          : currentUser.role === 'developer'
                          ? 'App Developer'
                          : `${currentUser.grade || 'Grade 11'}`}
                      </span>
                    </div>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setActiveTab('profile');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] rounded-lg transition-colors text-left"
                    >
                      <User className="w-3.5 h-3.5 text-blue-500" />
                      <span>My Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        openAuthModal('signup');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] rounded-lg transition-colors text-left"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Register Another Account</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        openAuthModal('login');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] rounded-lg transition-colors text-left"
                    >
                      <LogIn className="w-3.5 h-3.5 text-purple-500" />
                      <span>Switch Account</span>
                    </button>
                  </div>
                  <div className="pt-1 border-t border-[var(--border-color)]">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
