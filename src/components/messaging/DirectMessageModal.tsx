import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Mail, 
  User, 
  MessageSquare, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  Clock,
  ShieldCheck,
  Award
} from 'lucide-react';
import { StudentProfile, DirectMessage } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { fetchDirectMessages, sendDirectMessage } from '../../services/supabaseClient';

interface DirectMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: StudentProfile | null;
  initialMessage?: string;
}

export const DirectMessageModal: React.FC<DirectMessageModalProps> = ({
  isOpen,
  onClose,
  recipient,
  initialMessage = ''
}) => {
  const { profile: currentUser } = useAuth();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialMessage) {
      setTextInput(initialMessage);
    }
  }, [initialMessage]);

  const loadMessages = async () => {
    if (!currentUser || !recipient) return;
    const chat = await fetchDirectMessages(currentUser.userId, recipient.userId);
    setMessages(chat);
  };

  useEffect(() => {
    if (isOpen && currentUser && recipient) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, currentUser, recipient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen || !recipient) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || !currentUser || !recipient) return;

    setIsSending(true);
    const content = textInput.trim();
    setTextInput('');

    const newMsg = await sendDirectMessage({
      senderId: currentUser.userId,
      senderName: currentUser.fullName,
      senderAvatar: currentUser.avatarUrl,
      recipientId: recipient.userId,
      recipientName: recipient.fullName,
      recipientAvatar: recipient.avatarUrl,
      content
    });

    setMessages((prev) => [...prev, newMsg]);
    setIsSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Chat Header */}
        <div className="p-4 bg-slate-850 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <img
                src={recipient.avatarUrl}
                alt={recipient.fullName}
                className="w-10 h-10 rounded-2xl object-cover ring-2 ring-indigo-500/40"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm font-bold text-white font-display truncate">
                  {recipient.fullName}
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60 whitespace-nowrap">
                  {recipient.grade}
                </span>
                {recipient.isPeerTutorCertified && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 flex items-center gap-0.5">
                    <Award className="w-3 h-3 text-emerald-400" />
                    Tutor
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {recipient.department} • {recipient.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <a
              href={`mailto:${recipient.email}`}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
              title="Send direct email"
            >
              <Mail className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Safety & Honor Code Banner */}
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="truncate">Direct Peer Exchange • Honor Code Protected</span>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[260px] bg-slate-900/50">
          {messages.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Start a Conversation</h4>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1">
                  Send a message to discuss study sessions, project collaboration, or ask for academic assistance.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = currentUser && msg.senderId === currentUser.userId;
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMine && (
                    <img
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-700 flex-shrink-0 mb-1"
                    />
                  )}
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed space-y-1 ${
                      isMine
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-none shadow-md'
                        : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p
                      className={`text-[9px] text-right font-mono ${
                        isMine ? 'text-indigo-200' : 'text-slate-400'
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Form */}
        <form onSubmit={handleSend} className="p-3 bg-slate-850 bg-slate-800/90 border-t border-slate-700/80 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={`Message ${recipient.fullName.split(' ')[0]} directly...`}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!textInput.trim() || isSending}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span>Direct Email: <a href={`mailto:${recipient.email}`} className="text-indigo-300 hover:underline">{recipient.email}</a></span>
            <span>Campus Location: {recipient.contactMethods.campusLocation || 'Library Commons'}</span>
          </div>
        </form>
      </div>
    </div>
  );
};
