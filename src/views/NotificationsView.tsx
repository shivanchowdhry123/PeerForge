import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  CheckCheck,
  MessageSquare,
  HelpCircle,
  FolderKanban,
  Users,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    currentUser,
    markNotificationsAsRead,
    setActiveTab
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const userNotifications = (notifications || []).filter(
    n => n && (n.userId === currentUser?.id || n.userId === 'all')
  );

  const filtered = userNotifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'invite':
        return <FolderKanban className="w-4 h-4 text-purple-500" />;
      case 'answer':
        return <HelpCircle className="w-4 h-4 text-emerald-500" />;
      case 'community':
        return <Users className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            Real-time updates on project applications, question answers, and messages
          </p>
        </div>

        <button
          onClick={markNotificationsAsRead}
          className="px-4 py-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--border-color)]/60 text-[var(--text-primary)] border border-[var(--border-color)] text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === 'all'
              ? 'bg-white dark:bg-slate-800 text-[var(--text-primary)] shadow-2xs'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          All ({userNotifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === 'unread'
              ? 'bg-white dark:bg-slate-800 text-[var(--text-primary)] shadow-2xs'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Unread ({userNotifications.filter(n => !n.read).length})
        </button>
      </div>

      {/* Notifications list */}
      <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] divide-y divide-[var(--border-color)]/70 overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Bell className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              No notifications to display.
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              You are completely caught up with your school collaborations.
            </p>
          </div>
        ) : (
          filtered.map(notif => (
            <div
              key={notif.id}
              onClick={() => {
                if (notif.actionTab) setActiveTab(notif.actionTab);
              }}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors cursor-pointer hover:bg-[var(--bg-subtle)] ${
                !notif.read ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                      {notif.title}
                    </span>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {notif.description}
                  </p>
                  <span className="text-[10px] text-[var(--text-muted)] block pt-1 num-tabular">
                    {notif.timestamp}
                  </span>
                </div>
              </div>

              {notif.actionTab && (
                <div className="text-[var(--text-muted)] shrink-0 self-center">
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
