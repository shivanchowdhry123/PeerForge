import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  Sun,
  Moon,
  Search,
  Sparkles,
  Shield,
  LogIn,
  UserPlus,
  LogOut,
  ChevronDown,
  User,
  GraduationCap,
  PanelLeft
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    theme,
    toggleTheme,
    notifications,
    unreadNotifsCount,
    markNotificationsAsRead,
    activeSearchQuery,
    setActiveSearchQuery,
    currentUser,
    isAuthenticated,
    openAuthModal,
    logout,
    isSidebarVisible,
    toggleSidebar
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSearchQuery.trim()) {
      setActiveTab('discover');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-color)] bg-[var(--bg-surface)]/85 dark:bg-[var(--bg-surface)]/80 backdrop-blur-md px-4 sm:px-6 py-2.5 transition-colors">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 text-left group focus-visible:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform duration-200">
              PF
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-[var(--text-primary)]">
                  PeerForge
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hidden md:inline-block">
                  OPG
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] hidden sm:block leading-none">
                Talent & Peer Network · Dwarka
              </p>
            </div>
          </button>
        </div>

        {/* Desktop Sidebar Toggle Button */}
        <button
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="hidden md:flex p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] border border-transparent hover:border-[var(--border-color)] transition-all cursor-pointer items-center justify-center shrink-0"
          title={isSidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}
        >
          <PanelLeft className={`w-4 h-4 ${isSidebarVisible ? 'text-blue-600 dark:text-blue-400' : 'text-[var(--text-muted)]'}`} />
        </button>

        {/* Zone 2: Navigation Links or Global Search */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search students, skills (e.g. Python, MUN, Robotics)..."
              value={activeSearchQuery}
              onChange={e => setActiveSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 transition-all"
            />
          </div>
        </form>

        {/* Zone 3: Actions & Auth */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Quick AI Matcher button */}
          <button
            onClick={() => setActiveTab('ai-finder')}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              activeTab === 'ai-finder'
                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                : 'bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-purple-600 dark:hover:text-purple-400 border-[var(--border-color)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>Match Finder</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] border border-transparent hover:border-[var(--border-color)] transition-all cursor-pointer"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                if (!isNotifOpen) markNotificationsAsRead();
              }}
              aria-label="Notifications"
              className="relative p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] border border-transparent hover:border-[var(--border-color)] transition-all cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-[var(--bg-surface)]" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-2xl z-50 p-3.5 overflow-hidden animate-in fade-in zoom-in-95 backdrop-blur-xl">
                <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--text-primary)]">Notifications</span>
                    {unreadNotifsCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-bold">
                        {unreadNotifsCount} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setIsNotifOpen(false);
                      setActiveTab('notifications');
                    }}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    View all
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-[var(--border-color)]/60 my-1">
                  {notifications.slice(0, 5).map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setIsNotifOpen(false);
                        if (n.actionTab) setActiveTab(n.actionTab);
                      }}
                      className="py-2.5 px-2 hover:bg-[var(--bg-subtle)] rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-[var(--text-primary)]">{n.title}</p>
                        <span className="text-[10px] text-[var(--text-muted)] shrink-0 num-tabular">{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 line-clamp-2">
                        {n.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Help Desk Link */}
          <button
            onClick={() => setActiveTab('contact')}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              activeTab === 'contact'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--border-color)]'
            }`}
            title="School Support & Contact Desk"
          >
            <Shield className="w-3.5 h-3.5 text-blue-500" />
            <span>Help Desk</span>
          </button>

          {/* Authentication State */}
          {(!isAuthenticated || !currentUser) ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] border border-[var(--border-color)] transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] border border-[var(--border-color)] hover:border-[var(--border-hover)] transition-all text-left"
                title="Account Settings"
              >
                <img
                  src={currentUser?.avatar}
                  alt={currentUser?.name}
                  className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="hidden sm:block text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-[var(--text-primary)] leading-none truncate max-w-[110px]">
                      {currentUser?.name}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold border border-blue-500/20">
                      {currentUser?.role === 'teacher' ? 'Faculty' : currentUser?.role === 'developer' ? 'Dev' : 'Student'}
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] leading-tight block truncate max-w-[120px] mt-0.5">
                    {currentUser?.email}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              </button>

              {isUserMenuOpen && currentUser && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-2xl z-50 p-2 overflow-hidden animate-in fade-in zoom-in-95 backdrop-blur-xl">
                  <div className="px-3 py-2.5 border-b border-[var(--border-color)]">
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)] truncate">{currentUser.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <GraduationCap className="w-3 h-3 text-blue-500" />
                      <span className="text-[10px] font-semibold text-[var(--text-secondary)]">
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
