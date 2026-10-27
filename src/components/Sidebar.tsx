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
  UserPlus,
  Users,
  HardDriveUpload
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
    uploadedFiles,
    setSelectedStudentForProfile,
    setIsOnboardingOpen,
    isAuthenticated,
    openAuthModal,
    logout
  } = useApp();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'discover', label: 'Discover Students', icon: Compass },
    { id: 'ai-finder', label: 'Match Finder', icon: Sparkles, accent: true },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadMessagesCount },
    { id: 'qa', label: 'Questions & Answers', icon: HelpCircle },
    { id: 'projects', label: 'Projects & Team', icon: FolderKanban },
    { id: 'communities', label: 'Societies & Clubs', icon: Users },
    { id: 'uploads', label: 'Files & Uploads Hub', icon: HardDriveUpload, badge: uploadedFiles.length },
    { id: 'events', label: 'Events & Notices', icon: Calendar },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifsCount },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'settings', label: 'Settings & Privacy', icon: Settings },
    { id: 'about', label: 'About Us', icon: Info },
    { id: 'contact', label: 'Contact Us', icon: Mail }
  ];

  if (currentUser.role === 'teacher') {
    navItems.push({ id: 'admin', label: 'Staff Console', icon: ShieldCheck });
  }

  const handleNavClick = (id: string) => {
    if (id === 'profile') {
      setSelectedStudentForProfile(currentUser);
    }
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-64 shrink-0 flex flex-col justify-between h-[calc(100vh-61px)] sticky top-[61px] border-r border-[var(--border-color)] bg-[var(--bg-surface)] p-3 overflow-y-auto">
      <div className="space-y-6">
        {/* Navigation list */}
        <div className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all text-left ${
                  isActive
                    ? item.accent
                      ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-semibold shadow-xs'
                      : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? item.accent
                          ? 'text-purple-600 dark:text-purple-400'
                          : 'text-blue-600 dark:text-blue-400'
                        : item.accent
                        ? 'text-purple-500'
                        : 'text-[var(--text-muted)]'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      item.accent
                        ? 'bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Auth & School Hub Card */}
        {!isAuthenticated ? (
          <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                Sign In Required
              </span>
            </div>
            <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
              Log in or register as a Student or Teacher to join projects, Q&A, and campus events.
            </p>
            <div className="flex flex-col gap-1.5 pt-1">
              <button
                onClick={() => openAuthModal('login')}
                className="w-full py-1.5 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-2xs text-center flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="w-full py-1.5 px-3 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-800 rounded-xl border border-blue-200 dark:border-blue-800 hover:bg-blue-50 transition-colors text-center flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register Account</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  {currentUser.role === 'teacher'
                    ? 'Faculty Mentor'
                    : currentUser.role === 'developer'
                    ? 'Developer Portal'
                    : 'Student Portal'}
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Online
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              Signed in as <strong className="text-[var(--text-primary)]">{currentUser.name}</strong> ({currentUser.gmailAccount || currentUser.email})
            </p>
            <button
              onClick={() => setActiveTab('contact')}
              className="w-full py-1.5 px-3 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-800/80 rounded-lg border border-blue-200 dark:border-blue-800/60 hover:bg-blue-50 transition-colors shadow-2xs text-center"
            >
              Contact Developers
            </button>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="pt-4 border-t border-[var(--border-color)]/80 text-[11px] text-[var(--text-muted)]">
        <p className="font-semibold text-[var(--text-secondary)]">PeerForge</p>
        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
          OPG World School · Dwarka
        </p>
      </div>
    </aside>
  );
};
