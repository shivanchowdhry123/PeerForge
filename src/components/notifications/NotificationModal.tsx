import React from 'react';
import { 
  Bell, 
  X, 
  Check, 
  HelpCircle, 
  MessageSquare, 
  Award, 
  UserCheck, 
  ExternalLink,
  Trash2
} from 'lucide-react';
import { AppNotification } from '../../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onOpenDirectMessage?: (recipientId: string, recipientName: string) => void;
  onNavigateTab?: (tab: 'directory' | 'requests') => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onOpenDirectMessage,
  onNavigateTab
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'offer':
        return <HelpCircle className="w-4 h-4 text-amber-400" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-indigo-400" />;
      case 'endorsement':
        return <Award className="w-4 h-4 text-emerald-400" />;
      case 'session':
        return <UserCheck className="w-4 h-4 text-cyan-400" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden mt-12 sm:mt-14 animate-in slide-in-from-top-4 duration-200">
        {/* Header */}
        <div className="p-4 bg-slate-850 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-display">
                Notifications
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-slate-950 font-extrabold">
                    {unreadCount} New
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">Updates from study partners &amp; teachers</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-700/60 transition-colors"
                title="Mark all as read"
              >
                <Check className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Notification List */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-800/80 p-2">
          {notifications.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Bell className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-300">No Notifications Yet</p>
              <p className="text-[11px] text-slate-500">
                You will be notified when someone offers help on your request, sends a direct message, or endorses your skills.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  onMarkAsRead(notif.id);
                  if (notif.type === 'message' && notif.targetId && onOpenDirectMessage) {
                    onOpenDirectMessage(notif.targetId, notif.senderName);
                  } else if (notif.linkTab && onNavigateTab) {
                    onNavigateTab(notif.linkTab);
                  }
                }}
                className={`p-3.5 rounded-xl transition-all cursor-pointer flex items-start gap-3 ${
                  notif.read
                    ? 'bg-transparent hover:bg-slate-800/40 text-slate-300'
                    : 'bg-indigo-950/30 border border-indigo-800/40 hover:bg-indigo-950/50 text-white'
                }`}
              >
                <div className="relative flex-shrink-0 mt-0.5">
                  {notif.senderAvatar ? (
                    <img
                      src={notif.senderAvatar}
                      alt={notif.senderName}
                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-700"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                      {getIcon(notif.type)}
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-slate-900 border border-slate-800">
                    {getIcon(notif.type)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-white truncate">{notif.title}</h4>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    {notif.type === 'message' && (
                      <span className="text-[10px] font-semibold text-indigo-400 hover:underline flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        Reply in Direct Message
                      </span>
                    )}
                    {notif.type === 'offer' && (
                      <span className="text-[10px] font-semibold text-amber-400 hover:underline flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" />
                        View Request Ticket
                      </span>
                    )}
                    {!notif.read && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
