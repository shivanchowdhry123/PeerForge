import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  Sparkles,
  MessageSquare,
  HelpCircle,
  FolderKanban,
  Calendar,
  Bell,
  User,
  Settings,
  ShieldCheck,
  Compass,
  Info,
  Mail,
  LogIn,
  UserPlus
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    unreadNotifsCount,
    unreadMessagesCount,
    setSelectedStudentForProfile,
    isAuthenticated,
    openAuthModal
  } = useApp();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'discover', label: 'Student Directory', icon: Compass },
    { id: 'ai-finder', label: 'AI Match Finder', icon: Sparkles, accent: true },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadMessagesCount },
    { id: 'qa', label: 'Questions & Requests', icon: HelpCircle },
    { id: 'projects', label: 'Projects & Teams', icon: FolderKanban },
    { id: 'events', label: 'Campus Notices', icon: Calendar },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifsCount },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'settings', label: 'Settings & Privacy', icon: Settings },
    { id: 'about', label: 'About Us', icon: Info },
    { id: 'contact', label: 'Contact & Support', icon: Mail }
  ];

  if (currentUser?.role === 'teacher') {
    navItems.push({ id: 'admin', label: 'Faculty Console', icon: ShieldCheck });
  }

  const handleNavClick = (id: string) => {
    if (id === 'profile') {
      setSelectedStudentForProfile(currentUser);
    }
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-64 shrink-0 flex flex-col justify-between h-[calc(100vh-61px)] sticky top-[61px] border-r border-[var(--border-color)] bg-[var(--bg-surface)]/75 dark:bg-[var(--bg-surface)]/70 backdrop-blur-md p-3.5 overflow-y-auto transition-colors">
      <div className="space-y-5">
        {/* Navigation list */}
        <div className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all text-left group cursor-pointer ${
                  isActive
                    ? item.accent
                      ? 'bg-purple-600/10 text-purple-700 dark:text-purple-300 font-semibold border border-purple-500/20 shadow-xs'
                      : 'bg-blue-600/10 text-blue-700 dark:text-blue-300 font-semibold border border-blue-500/20 shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? item.accent
                          ? 'text-purple-600 dark:text-purple-400'
                          : 'text-blue-600 dark:text-blue-400'
                        : item.accent
                        ? 'text-purple-500/80 group-hover:text-purple-600'
                        : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 ? (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full num-tabular ${
                      item.accent
                        ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300'
                        : 'bg-blue-500/20 text-blue-700 dark:text-blue-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Auth / Status Card */}
        {!isAuthenticated || !currentUser ? (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 border border-blue-500/20 dark:border-blue-500/15 space-y-3">
            <div>
              <span className="text-xs font-bold text-[var(--text-primary)] block">
                School Member Access
              </span>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-relaxed">
                Log in to create projects, exchange peer doubt solutions, and collaborate.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 pt-0.5">
              <button
                onClick={() => openAuthModal('login')}
                className="w-full py-1.5 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="w-full py-1.5 px-3 text-xs font-semibold text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-color)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register Account</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-[var(--bg-subtle)]/70 border border-[var(--border-color)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-primary)]">
                {currentUser.role === 'teacher'
                  ? 'Faculty Mentor'
                  : currentUser.role === 'developer'
                  ? 'Dev Portal'
                  : 'Student Account'}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                Active
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              Signed in as <span className="font-semibold text-[var(--text-primary)]">{currentUser.name}</span>
            </p>
            <button
              onClick={() => setActiveTab('contact')}
              className="w-full py-1.5 px-3 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-[var(--bg-surface)] hover:bg-[var(--bg-muted)] rounded-xl border border-[var(--border-color)] transition-all text-center cursor-pointer shadow-2xs"
            >
              School Support
            </button>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="pt-3 border-t border-[var(--border-color)] text-[11px] text-[var(--text-muted)] flex items-center justify-between">
        <div>
          <p className="font-bold text-[var(--text-secondary)]">PeerForge</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
            OPG World School · Dwarka
          </p>
        </div>
        <span className="text-[10px] font-mono text-[var(--text-muted)]">v2.4</span>
      </div>
    </aside>
  );
};
