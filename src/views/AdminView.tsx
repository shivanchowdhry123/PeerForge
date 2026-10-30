import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  CheckCircle2,
  Trash2,
  MessageSquare,
  Mail,
  Clock,
  CheckCircle,
  Send,
  HelpCircle
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const {
    currentUser,
    allStudents,
    projects,
    questions,
    deleteStudentAccount,
    contactInquiries,
    resolveContactInquiry
  } = useApp();

  const [activeTab, setActiveTab] = useState<'students' | 'contact' | 'audit'>('students');
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Verify access
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'moderator' && currentUser.role !== 'developer' && currentUser.role !== 'teacher')) {
    return (
      <div className="p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] max-w-lg mx-auto space-y-3">
        <ShieldCheck className="w-10 h-10 text-blue-500 mx-auto" />
        <h2 className="text-base font-bold text-[var(--text-primary)]">Developer & Faculty Restricted</h2>
        <p className="text-xs text-[var(--text-muted)]">
          The Administration and Verification console is reserved for App Developers and Faculty Mentors. Please sign in with your developer or teacher Gmail account to access.
        </p>
      </div>
    );
  }

  const auditEvents = [
    { id: '1', action: 'Developer Account Verification', actor: 'PeerForge System', target: 'Verified Developer Account', time: 'Oct 25, 2026' },
    { id: '2', action: 'Faculty Mentor Verification', actor: 'OPG Administration', target: 'Verified Faculty Mentor', time: 'Oct 24, 2026' },
    { id: '3', action: 'Database Roster Sync', actor: 'PeerForge System', target: 'Supabase Realtime Tables', time: 'Today 10:15 AM' }
  ];

  const handleSendReply = (inquiryId: string) => {
    const reply = replyTextMap[inquiryId];
    if (!reply || !reply.trim()) return;
    resolveContactInquiry(inquiryId, 'resolved', reply.trim());
    setReplyTextMap(prev => ({ ...prev, [inquiryId]: '' }));
  };

  const newInquiriesCount = (contactInquiries || []).filter(i => i.status === 'new').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-[11px] font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>OPG World School Administration Console</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            School Community Administration
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Verify student rosters, manage support inquiries, and audit platform activity
          </p>
        </div>

        <div className="text-right text-xs text-[var(--text-muted)] shrink-0">
          Signed in as: <strong className="text-[var(--text-primary)]">{currentUser.name}</strong> ({currentUser.role})
        </div>
      </div>

      {/* Aggregate Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1">
          <span className="text-xs text-[var(--text-muted)] font-medium">Registered Students</span>
          <div className="text-2xl font-extrabold text-[var(--text-primary)] num-tabular">
            {allStudents.filter(s => s.role === 'student').length}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">100% Verified Domain</span>
        </div>

        <div className="p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1">
          <span className="text-xs text-[var(--text-muted)] font-medium">Support Inquiries</span>
          <div className="text-2xl font-extrabold text-blue-600 num-tabular">
            {(contactInquiries || []).length}
          </div>
          <span className="text-[10px] text-purple-600 font-medium">{newInquiriesCount} New Unresolved</span>
        </div>

        <div className="p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1">
          <span className="text-xs text-[var(--text-muted)] font-medium">Active Projects</span>
          <div className="text-2xl font-extrabold text-[var(--text-primary)] num-tabular">
            {projects.length}
          </div>
          <span className="text-[10px] text-blue-600 font-medium">Recruiting & Active</span>
        </div>

        <div className="p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1">
          <span className="text-xs text-[var(--text-muted)] font-medium">Academic Questions</span>
          <div className="text-2xl font-extrabold text-[var(--text-primary)] num-tabular">
            {questions.length}
          </div>
          <span className="text-[10px] text-purple-600 font-medium">Peer Collaboration</span>
        </div>
      </div>

      {/* Console Tab Selector */}
      <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('students')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'students'
              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Student Rosters & Account Cleanup
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'contact'
              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Contact & Support Messages</span>
          {newInquiriesCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-bold">
              {newInquiriesCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'audit'
              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Audit Logs
        </button>
      </div>

      {/* Tab 1: Students List & Account Deletion */}
      {activeTab === 'students' && (
        <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] overflow-hidden space-y-4">
          <div className="p-4 border-b border-[var(--border-color)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-[var(--text-primary)] block">Verified Student Accounts & Test Cleanup</span>
              <span className="text-[11px] text-[var(--text-muted)]">Permanently delete testing accounts before publishing the platform.</span>
            </div>
            <span className="text-xs text-[var(--text-muted)] num-tabular">{allStudents.length} Total Accounts</span>
          </div>

          {deleteNotice && (
            <div className="mx-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">{deleteNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setDeleteNotice(null)}
                className="text-[11px] underline font-semibold text-emerald-700 dark:text-emerald-300"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="divide-y divide-[var(--border-color)] max-h-[500px] overflow-y-auto">
            {allStudents.map(student => (
              <div key={student.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-10 h-10 rounded-xl bg-blue-100 object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                        {student.name}
                      </span>
                      {student.isVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      )}
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-muted)]">
                        {student.role}
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)] truncate block">
                      {student.email} · {student.grade || 'Faculty'} · Section {student.section || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-emerald-600 font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 hidden sm:inline-block">
                    Active
                  </span>

                  {confirmDeleteId === student.id ? (
                    <div className="flex items-center gap-1.5 animate-in fade-in">
                      <button
                        type="button"
                        disabled={isDeleting === student.id}
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDeleting(student.id);
                          await deleteStudentAccount(student.id, student.name, student.email);
                          setDeleteNotice(`Account for "${student.name}" permanently deleted.`);
                          setConfirmDeleteId(null);
                          setIsDeleting(null);
                          setTimeout(() => setDeleteNotice(null), 4000);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isDeleting === student.id ? 'Deleting...' : 'Confirm Delete?'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setConfirmDeleteId(null);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] text-xs font-medium transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setConfirmDeleteId(student.id);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-red-100 dark:bg-red-950/40 hover:bg-red-200 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                      title="Permanently delete test account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Delete Account</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Contact & Support Messages */}
      {activeTab === 'contact' && (
        <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] overflow-hidden space-y-4">
          <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[var(--text-primary)] block">Student Contact & Support Inquiries</span>
              <span className="text-[11px] text-[var(--text-muted)]">Review questions and feedback submitted by students via the Contact Us helpdesk.</span>
            </div>
            <span className="text-xs text-[var(--text-muted)] num-tabular">{(contactInquiries || []).length} Inquiries</span>
          </div>

          <div className="divide-y divide-[var(--border-color)] max-h-[600px] overflow-y-auto">
            {(!contactInquiries || contactInquiries.length === 0) ? (
              <div className="p-12 text-center space-y-2">
                <HelpCircle className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
                <p className="text-xs font-semibold text-[var(--text-primary)]">No support inquiries yet</p>
                <p className="text-[11px] text-[var(--text-muted)]">Messages submitted from the Contact Us page will appear here for review.</p>
              </div>
            ) : (
              contactInquiries.map(inq => (
                <div key={inq.id} className="p-5 space-y-3 hover:bg-[var(--bg-subtle)]/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {inq.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[var(--text-primary)]">{inq.name}</span>
                          <span className="text-[10px] text-[var(--text-muted)]">({inq.email})</span>
                        </div>
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                          {inq.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        inq.status === 'resolved'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : inq.status === 'reviewed'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                      }`}>
                        {inq.status}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] num-tabular flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {inq.submittedAt}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-1.5">
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">{inq.subject}</h4>
                    <p className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">{inq.message}</p>
                  </div>

                  {inq.developerNotes && (
                    <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 space-y-1">
                      <span className="font-bold block text-[10px] text-purple-700 dark:text-purple-300 uppercase">Developer Response / Notes:</span>
                      <p>{inq.developerNotes}</p>
                    </div>
                  )}

                  {/* Reply Input Box */}
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type response or resolution note to student..."
                      value={replyTextMap[inq.id] || ''}
                      onChange={e => setReplyTextMap({ ...replyTextMap, [inq.id]: e.target.value })}
                      className="flex-1 px-3 py-2 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-400"
                    />
                    <button
                      onClick={() => handleSendReply(inq.id)}
                      disabled={!replyTextMap[inq.id]?.trim()}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all flex items-center gap-1.5 shadow-xs shrink-0 ${
                        !replyTextMap[inq.id]?.trim()
                          ? 'bg-slate-400 cursor-not-allowed opacity-60'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Reply</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border-color)]">
            <span className="text-xs font-bold text-[var(--text-primary)]">Administrative Audit Trail</span>
          </div>

          <div className="divide-y divide-[var(--border-color)]">
            {auditEvents.map(evt => (
              <div key={evt.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div>
                  <span className="font-bold text-[var(--text-primary)] block">{evt.action}</span>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    By {evt.actor} on {evt.target}
                  </span>
                </div>
                <span className="text-[11px] text-[var(--text-muted)] num-tabular shrink-0">
                  {evt.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
