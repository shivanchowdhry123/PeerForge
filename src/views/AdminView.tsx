import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const {
    currentUser,
    allStudents,
    projects,
    questions
  } = useApp();

  const [activeTab, setActiveTab] = useState<'students' | 'audit'>('students');

  // Verify access
  if (currentUser.role !== 'admin' && currentUser.role !== 'moderator' && currentUser.role !== 'developer' && currentUser.role !== 'teacher') {
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
    { id: '1', action: 'Lead Developer Account Verification', actor: 'PeerForge System', target: 'Aakriti Narayan (Grade 11 Developer)', time: 'Oct 25, 2026' },
    { id: '2', action: 'Faculty Mentor Verification', actor: 'OPG Administration', target: 'Mr. Rajesh Sharma (Faculty Mentor)', time: 'Oct 24, 2026' },
    { id: '3', action: 'Project Architecture Review', actor: 'Aakriti Narayan', target: 'PeerForge Academic Portal & Doubt Solver', time: 'Today 10:15 AM' }
  ];

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
            Verify student rosters, manage project credentials, and audit platform activity
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

        <div className="p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1">
          <span className="text-xs text-[var(--text-muted)] font-medium">Verified Talents</span>
          <div className="text-2xl font-extrabold text-blue-600 num-tabular">
            {allStudents.reduce((acc, s) => acc + s.skills.filter(sk => sk.verified).length, 0)}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Faculty Approved</span>
        </div>
      </div>

      {/* Console Tab Selector */}
      <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('students')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'students'
              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Student Rosters & Verification
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'audit'
              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Audit Logs
        </button>
      </div>

      {/* Tab 2: Students List */}
      {activeTab === 'students' && (
        <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-primary)]">Verified Student Accounts</span>
            <span className="text-xs text-[var(--text-muted)] num-tabular">{allStudents.length} Students</span>
          </div>

          <div className="divide-y divide-[var(--border-color)]">
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
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)] truncate block">
                      {student.email} · {student.grade} · Section {student.section}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-emerald-600 font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200">
                    Active
                  </span>
                </div>
              </div>
            ))}
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
