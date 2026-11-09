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
  HelpCircle,
  ShieldAlert,
  UserCheck,
  UserX
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const {
    currentUser,
    allStudents,
    projects,
    questions,
    deleteStudentAccount,
    approveFacultyAccount,
    rejectFacultyAccount,
    contactInquiries,
    resolveContactInquiry
  } = useApp();

  const pendingTeachers = (allStudents || []).filter(s => s.role === 'teacher' && !s.isApproved);

  const [activeTab, setActiveTab] = useState<'approvals' | 'students' | 'contact'>(() =>
    pendingTeachers.length > 0 ? 'approvals' : 'students'
  );
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [confirmRejectId, setConfirmRejectId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [approvalFeedback, setApprovalFeedback] = useState<string | null>(null);

  // Pending faculty verification banner for teachers awaiting approval
  if (currentUser?.role === 'teacher' && !currentUser?.isApproved) {
    return (
      <div className="p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-amber-300 dark:border-amber-800/60 max-w-lg mx-auto space-y-4 animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Faculty Verification in Progress</h2>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          Your faculty account is pending verification by school administration. You currently have full student access to explore projects, discussions, and events while awaiting approval.
        </p>
      </div>
    );
  }

  // Verify access for approved faculty, admins, or developers
  const isApprovedFacultyOrAdmin =
    currentUser &&
    (currentUser.role === 'admin' ||
      currentUser.role === 'moderator' ||
      currentUser.role === 'developer' ||
      (currentUser.role === 'teacher' && currentUser.isApproved));

  if (!isApprovedFacultyOrAdmin) {
    return (
      <div className="p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] max-w-lg mx-auto space-y-3">
        <ShieldCheck className="w-10 h-10 text-blue-500 mx-auto" />
        <h2 className="text-base font-bold text-[var(--text-primary)]">Developer & Faculty Restricted</h2>
        <p className="text-xs text-[var(--text-muted)]">
          The Administration and Verification console is reserved for verified Faculty Mentors and App Developers. Please sign in with your verified faculty or developer account.
        </p>
      </div>
    );
  }


  const handleSendReply = (inquiryId: string) => {
    const reply = replyTextMap[inquiryId];
    if (!reply || !reply.trim()) return;
    resolveContactInquiry(inquiryId, 'resolved', reply.trim());
    setReplyTextMap(prev => ({ ...prev, [inquiryId]: '' }));
  };

  const newInquiriesCount = (contactInquiries || []).filter(i => i.status === 'new').length;

  const handleApproveTeacher = async (teacher: typeof allStudents[0]) => {
    setApprovingId(teacher.id);
    try {
      const ok = await approveFacultyAccount(teacher.id);
      if (ok) {
        setApprovalFeedback(`Faculty account for ${teacher.name} approved successfully!`);
        setTimeout(() => setApprovalFeedback(null), 4000);
      }
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectTeacher = async (teacher: typeof allStudents[0]) => {
    setRejectingId(teacher.id);
    try {
      const ok = await rejectFacultyAccount(teacher.id);
      if (ok) {
        setApprovalFeedback(`Faculty application for ${teacher.name} rejected and converted into a standard Student account.`);
        setTimeout(() => setApprovalFeedback(null), 4000);
      }
    } finally {
      setRejectingId(null);
      setConfirmRejectId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-[11px] font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>OPG World School Faculty & Administration Console</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            School Community Administration
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Verify faculty registrations, manage student rosters, and review support inquiries
          </p>
        </div>

        <div className="text-right text-xs text-[var(--text-muted)] shrink-0">
          Signed in as: <strong className="text-[var(--text-primary)]">{currentUser.name}</strong> ({currentUser.role})
        </div>
      </div>

      {/* Aggregate Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1">
          <span className="text-xs text-[var(--text-muted)] font-medium">Pending Faculty</span>
          <div className="text-2xl font-extrabold text-amber-600 num-tabular">
            {pendingTeachers.length}
          </div>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
            {pendingTeachers.length > 0 ? 'Action Required' : 'All Verified'}
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1">
          <span className="text-xs text-[var(--text-muted)] font-medium">Verified Students</span>
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
      </div>

      {/* Console Tab Selector */}
      <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-2 text-xs font-semibold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'approvals'
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-bold'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Pending Teacher Approvals</span>
          {pendingTeachers.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-600 text-white text-[10px] font-bold shrink-0">
              {pendingTeachers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
            activeTab === 'students'
              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Student Rosters & Account Cleanup
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'contact'
              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Contact & Support Messages</span>
          {newInquiriesCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-bold shrink-0">
              {newInquiriesCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab 0: Pending Teacher Approvals */}
      {activeTab === 'approvals' && (
        <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] overflow-hidden space-y-4">
          <div className="p-4 border-b border-[var(--border-color)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--text-primary)] block">Pending Teacher Approvals</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                  {pendingTeachers.length} Pending
                </span>
              </div>
              <span className="text-[11px] text-[var(--text-muted)]">
                Review and verify new faculty registrations before they can publish campus notices, manage events, and access faculty administrative features.
              </span>
            </div>
          </div>

          {approvalFeedback && (
            <div className="mx-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">{approvalFeedback}</span>
              </div>
              <button
                type="button"
                onClick={() => setApprovalFeedback(null)}
                className="text-[11px] underline font-semibold text-emerald-700 dark:text-emerald-300 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {pendingTeachers.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-[var(--text-primary)]">All Faculty Verified</h3>
              <p className="text-[11px] text-[var(--text-muted)] max-w-sm mx-auto">
                There are no pending faculty applications requiring approval at this time. New faculty registrations will appear here for verification.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-color)]">
              {pendingTeachers.map(teacher => (
                <div
                  key={teacher.id}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[var(--bg-main)]/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={teacher.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.id}`}
                      alt={teacher.name}
                      className="w-10 h-10 rounded-2xl object-cover shrink-0 border border-[var(--border-color)]"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                          {teacher.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-[10px] font-semibold">
                          Pending Faculty
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {teacher.grade || 'Faculty Member'}
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)] truncate">
                        {teacher.email}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                        Registered: {teacher.joinedDate ? new Date(teacher.joinedDate).toLocaleDateString() : 'Recent'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {confirmRejectId === teacher.id ? (
                      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800">
                        <span className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">Convert to Student account?</span>
                        <button
                          type="button"
                          onClick={() => handleRejectTeacher(teacher)}
                          disabled={rejectingId === teacher.id}
                          className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {rejectingId === teacher.id ? 'Converting...' : 'Convert to Student'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmRejectId(null)}
                          className="px-2 py-1 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-main)] text-[var(--text-muted)] text-[10px] font-medium border border-[var(--border-color)] cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApproveTeacher(teacher)}
                          disabled={approvingId === teacher.id}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{approvingId === teacher.id ? 'Approving...' : 'Approve Account'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmRejectId(teacher.id)}
                          disabled={approvingId === teacher.id}
                          className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-[var(--text-muted)] border border-[var(--border-color)] hover:border-rose-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Reject / Remove</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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


    </div>
  );
};
