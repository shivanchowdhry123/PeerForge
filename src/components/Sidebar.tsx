import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  HelpCircle,
  FolderKanban,
  Calendar,
  Settings,
  ShieldCheck,
  Compass,
  Info,
  LogIn,
  UserPlus,
  PanelLeftClose,
  PanelLeftOpen,
  User
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
  isMobileDrawer?: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile, isMobileDrawer = false }) => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    setSelectedStudentForProfile,
    isAuthenticated,
    openAuthModal
  } = useApp();

  const [isCompact, setIsCompact] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('peerforge_sidebar_compact');
      if (stored === 'false') return false;
      if (stored === 'true') return true;
    }
    return true;
  });

  const effectiveCompact = isMobileDrawer ? false : isCompact;

  const toggleCompact = () => {
    if (isMobileDrawer) return;
    setIsCompact(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('peerforge_sidebar_compact', String(next));
      }
      return next;
    });
  };

  // Primary 5 Core Navigation Items
  const primaryNavItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'discover', label: 'Student Directory', icon: Compass },
    { id: 'projects', label: 'Projects & Teams', icon: FolderKanban },
    { id: 'qa', label: 'Questions & Doubts', icon: HelpCircle },
    { id: 'events', label: 'Campus Notices', icon: Calendar }
  ];

  // Secondary Utility Footer Links
  const secondaryNavItems: NavItem[] = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'contact', label: 'About & Support', icon: Info }
  ];

  if (currentUser?.role === 'developer' || currentUser?.role === 'admin' || (currentUser?.role === 'teacher' && currentUser?.isApproved)) {
    secondaryNavItems.push({
      id: 'admin',
      label: 'Faculty Console',
      icon: ShieldCheck
    });
  }

  const handleNavClick = (id: string) => {
    if (id === 'profile') {
      setSelectedStudentForProfile(currentUser);
    }
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside
      className={`${
        isMobileDrawer
          ? 'w-full h-full p-1 bg-transparent border-0'
          : effectiveCompact
          ? 'w-16 p-2 h-[calc(100dvh-53px)] sticky top-[53px] border-r border-[var(--border-color)] bg-[var(--bg-surface)]/75 dark:bg-[var(--bg-surface)]/70 backdrop-blur-md'
          : 'w-64 p-2.5 h-[calc(100dvh-53px)] sticky top-[53px] border-r border-[var(--border-color)] bg-[var(--bg-surface)]/75 dark:bg-[var(--bg-surface)]/70 backdrop-blur-md'
      } shrink-0 flex flex-col justify-between overflow-hidden transition-all duration-300 ease-in-out`}
    >
      <div className="space-y-2">
        {/* Sidebar Header & Compact Toggle */}
        {!isMobileDrawer && (
          <div className="flex items-center justify-between pb-1.5 border-b border-[var(--border-color)]/60">
            {!effectiveCompact && (
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-1">
                Menu
              </span>
            )}
            <button
              onClick={toggleCompact}
              className={`p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer ${
                effectiveCompact ? 'mx-auto' : 'ml-auto'
              }`}
              title={effectiveCompact ? 'Expand Sidebar' : 'Collapse Sidebar to Icon Rail'}
              aria-label={effectiveCompact ? 'Expand Sidebar' : 'Collapse Sidebar to Icon Rail'}
            >
              {effectiveCompact ? (
                <PanelLeftOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>
        )}

        {/* Primary Core Menu (5 Clean Buttons) */}
        <div className="space-y-0.5">
          {primaryNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={item.label}
                className={`w-full flex items-center ${
                  effectiveCompact ? 'justify-center p-2' : 'justify-start gap-2.5 px-2.5 py-1.5'
                } rounded-xl text-xs sm:text-sm font-medium transition-all text-left group cursor-pointer ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-700 dark:text-blue-300 font-semibold border border-blue-500/20 shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] border border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'
                  }`}
                />
                {!effectiveCompact && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Utility Links & Auth Section */}
      <div className="pt-2 border-t border-[var(--border-color)] mt-2 space-y-2">
        {/* Secondary Links */}
        <div className="space-y-0.5">
          {!effectiveCompact && (
            <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-2 block mb-1">
              Account & Help
            </span>
          )}
          {secondaryNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={item.label}
                className={`w-full flex items-center ${
                  effectiveCompact ? 'justify-center p-2' : 'justify-start gap-2.5 px-2.5 py-1.5'
                } rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-semibold bg-[var(--bg-subtle)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {!effectiveCompact && <span className="truncate text-xs">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* User Session / Auth Banner */}
        {!isAuthenticated || !currentUser ? (
          effectiveCompact ? (
            <button
              onClick={() => openAuthModal('login')}
              className="w-full p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all shadow-xs cursor-pointer"
              title="Sign In / Register"
            >
              <LogIn className="w-4 h-4" />
            </button>
          ) : (
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 border border-blue-500/20 dark:border-blue-500/15 space-y-1.5">
              <span className="text-xs font-bold text-[var(--text-primary)] block">
                School Member Access
              </span>
              <div className="flex items-center gap-1.5 pt-0.5">
                <button
                  onClick={() => openAuthModal('login')}
                  className="flex-1 py-1.5 px-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="flex-1 py-1.5 px-2 text-xs font-semibold text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] rounded-lg border border-[var(--border-color)] transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>Register</span>
                </button>
              </div>
            </div>
          )
        ) : effectiveCompact ? (
          <button
            onClick={() => handleNavClick('profile')}
            className="w-full p-1 rounded-xl hover:bg-[var(--bg-subtle)] transition-all flex items-center justify-center cursor-pointer group shrink-0"
            title={`Signed in as ${currentUser.name}`}
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 object-cover ring-2 ring-blue-500/30 group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
          </button>
        ) : (
          <button
            onClick={() => handleNavClick('profile')}
            className="w-full p-1.5 rounded-xl bg-[var(--bg-subtle)]/70 hover:bg-[var(--bg-subtle)] border border-[var(--border-color)] flex items-center justify-between gap-2 transition-colors cursor-pointer group text-left"
            title={`View profile of ${currentUser.name}`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900 object-cover ring-1 ring-[var(--border-color)] shrink-0 group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                {currentUser.name}
              </span>
            </div>
            <span
              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-md shrink-0 ${
                currentUser.role === 'teacher' && !currentUser.isApproved
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {currentUser.role === 'teacher' && !currentUser.isApproved
                ? 'Pending'
                : currentUser.role === 'teacher'
                ? 'Faculty'
                : currentUser.role === 'developer'
                ? 'Dev'
                : 'Student'}
            </span>
          </button>
        )}

        {!effectiveCompact && (
          <div className="pt-1 text-[10px] text-[var(--text-muted)] flex items-center justify-between px-1">
            <p className="font-bold text-[var(--text-secondary)]">PeerForge OPG</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
