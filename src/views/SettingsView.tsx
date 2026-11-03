import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Lock,
  Eye,
  ShieldCheck,
  Download,
  Trash2,
  Moon,
  Sun,
  Monitor,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Mail,
  KeyRound,
  EyeOff,
  User,
  UserCheck,
  UserX
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    allStudents,
    approveFacultyAccount,
    rejectFacultyAccount,
    updateCurrentUserProfile,
    updatePassword,
    linkGmailAccount,
    themeMode,
    theme,
    setThemeMode,
    toggleTheme,
    exportMyData,
    deactivateOwnAccount,
    reactivateOwnAccount,
    openAuthModal
  } = useApp();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deactivationFeedback, setDeactivationFeedback] = useState<string | null>(null);

  // Faculty verification state
  const [approvingTeacherId, setApprovingTeacherId] = useState<string | null>(null);
  const [confirmRejectTeacherId, setConfirmRejectTeacherId] = useState<string | null>(null);
  const [rejectingTeacherId, setRejectingTeacherId] = useState<string | null>(null);
  const [facultyApprovalNotice, setFacultyApprovalNotice] = useState<string | null>(null);

  // Safe fallback for privacySettings
  const currentPrivacy = currentUser?.privacySettings || {
    showGradeToAll: true,
    allowDirectMessages: 'anyone' as const,
    showAchievements: true
  };

  // Account Identity, Gmail & Password states
  const [isEditingSettingsName, setIsEditingSettingsName] = useState(false);
  const [settingsNameInput, setSettingsNameInput] = useState(currentUser?.name || '');
  const [showSettingsPassword, setShowSettingsPassword] = useState(false);
  const [isEditingSettingsGmail, setIsEditingSettingsGmail] = useState(false);
  const [settingsGmailInput, setSettingsGmailInput] = useState(currentUser?.gmailAccount || currentUser?.email || '');
  const [isEditingSettingsPassword, setIsEditingSettingsPassword] = useState(false);
  const [settingsNewPassword, setSettingsNewPassword] = useState('');
  const [settingsConfirmPassword, setSettingsConfirmPassword] = useState('');
  const [credentialMessage, setCredentialMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.name) {
      setSettingsNameInput(currentUser.name);
    }
    if (currentUser?.gmailAccount || currentUser?.email) {
      setSettingsGmailInput(currentUser.gmailAccount || currentUser.email);
    }
  }, [currentUser?.id, currentUser?.name, currentUser?.gmailAccount, currentUser?.email]);

  if (!currentUser) {
    return (
      <div className="p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] max-w-lg mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mx-auto text-blue-500">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Settings Restricted</h2>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          Please sign in to access your account settings and privacy preferences.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-sm"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  const handleSettingsNameSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = settingsNameInput.trim();
    if (!cleanName || cleanName.length < 2) {
      setCredentialMessage('Please provide a valid account name (at least 2 characters).');
      return;
    }
    updateCurrentUserProfile({ name: cleanName });
    setCredentialMessage(`Account name updated to "${cleanName}"!`);
    setIsEditingSettingsName(false);
    setTimeout(() => setCredentialMessage(null), 3000);
  };

  const handleSettingsGmailSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsGmailInput.trim().includes('@')) {
      setCredentialMessage('Please provide a valid Gmail address.');
      return;
    }
    linkGmailAccount(settingsGmailInput.trim());
    setCredentialMessage('Gmail account linked successfully!');
    setIsEditingSettingsGmail(false);
    setTimeout(() => setCredentialMessage(null), 3000);
  };

  const handleSettingsPasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (settingsNewPassword.length < 6) {
      setCredentialMessage('Password must be at least 6 characters.');
      return;
    }
    if (settingsNewPassword !== settingsConfirmPassword) {
      setCredentialMessage('Passwords do not match.');
      return;
    }
    updatePassword(settingsNewPassword);
    setCredentialMessage('Profile password updated successfully!');
    setSettingsNewPassword('');
    setSettingsConfirmPassword('');
    setIsEditingSettingsPassword(false);
    setTimeout(() => setCredentialMessage(null), 3000);
  };

  const handlePrivacyToggle = (key: keyof typeof currentPrivacy, val: any) => {
    updateCurrentUserProfile({
      privacySettings: {
        ...currentPrivacy,
        [key]: val
      }
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const activeThemeSelection =
    themeMode ||
    currentUser.defaultTheme ||
    (currentUser as any).default_theme ||
    currentUser.privacySettings?.defaultTheme ||
    'system';

  const handleThemePreferenceChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const isApprovedFacultyOrAdmin =
    currentUser &&
    (currentUser.role === 'developer' ||
      currentUser.role === 'admin' ||
      (currentUser.role === 'teacher' && currentUser.isApproved));

  const pendingTeachers = isApprovedFacultyOrAdmin
    ? (allStudents || []).filter(s => s.role === 'teacher' && !s.isApproved)
    : [];

  const handleApproveTeacherAccount = async (teacher: typeof allStudents[0]) => {
    setApprovingTeacherId(teacher.id);
    try {
      const ok = await approveFacultyAccount(teacher.id);
      if (ok) {
        setFacultyApprovalNotice(`Faculty account for ${teacher.name} approved successfully!`);
        setTimeout(() => setFacultyApprovalNotice(null), 4000);
      }
    } finally {
      setApprovingTeacherId(null);
    }
  };

  const handleRejectTeacherAccount = async (teacher: typeof allStudents[0]) => {
    setRejectingTeacherId(teacher.id);
    try {
      const ok = await rejectFacultyAccount(teacher.id);
      if (ok) {
        setFacultyApprovalNotice(`Faculty application for ${teacher.name} rejected and converted into a standard Student account.`);
        setTimeout(() => setFacultyApprovalNotice(null), 4000);
      }
    } finally {
      setRejectingTeacherId(null);
      setConfirmRejectTeacherId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Settings & Student Privacy
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            Configure who can discover your skills and contact you on OPG Connect
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Preferences saved</span>
          </div>
        )}
      </div>

      {/* Faculty Console — Pending Teacher Approvals (Visible to approved faculty & admins) */}
      {isApprovedFacultyOrAdmin && (
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-amber-200 dark:border-amber-900/60 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-amber-600" />
                  <span>Pending Teacher Approvals</span>
                </h2>
                {pendingTeachers.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                    {pendingTeachers.length} Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Faculty verification console: review new faculty registrations. Once approved, teachers can publish campus notices, manage events, and access faculty tools.
              </p>
            </div>
          </div>

          {facultyApprovalNotice && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">{facultyApprovalNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setFacultyApprovalNotice(null)}
                className="text-[11px] underline font-semibold text-emerald-700 dark:text-emerald-300 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {pendingTeachers.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-center space-y-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
              <div className="text-xs font-bold text-[var(--text-primary)]">All Faculty Registrations Verified</div>
              <p className="text-[11px] text-[var(--text-muted)]">
                There are no pending teacher approvals requiring action at this time.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-color)] rounded-2xl border border-[var(--border-color)] bg-[var(--bg-subtle)] overflow-hidden">
              {pendingTeachers.map(teacher => (
                <div
                  key={teacher.id}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] transition-colors"
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
                    {confirmRejectTeacherId === teacher.id ? (
                      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800">
                        <span className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">Convert to Student account?</span>
                        <button
                          type="button"
                          onClick={() => handleRejectTeacherAccount(teacher)}
                          disabled={rejectingTeacherId === teacher.id}
                          className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {rejectingTeacherId === teacher.id ? 'Converting...' : 'Convert to Student'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmRejectTeacherId(null)}
                          className="px-2 py-1 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-main)] text-[var(--text-muted)] text-[10px] font-medium border border-[var(--border-color)] cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApproveTeacherAccount(teacher)}
                          disabled={approvingTeacherId === teacher.id}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{approvingTeacherId === teacher.id ? 'Approving...' : 'Approve Account'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmRejectTeacherId(teacher.id)}
                          disabled={approvingTeacherId === teacher.id}
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

      {/* Default Theme Appearance */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-500" />
          <span>Default Account Appearance (Light / Dark / System)</span>
        </h2>
        <p className="text-xs text-[var(--text-muted)]">
          Select whether your account loads in Light Mode, Dark Mode, or matches your System Default automatically when you log in.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleThemePreferenceChange('light')}
            className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeThemeSelection === 'light'
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                : 'border-[var(--border-color)] bg-[var(--bg-subtle)] hover:border-blue-400'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-[var(--text-primary)] block">Light Mode</span>
              <span className="text-[11px] text-[var(--text-muted)]">Clean, bright daytime UI</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleThemePreferenceChange('dark')}
            className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeThemeSelection === 'dark'
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                : 'border-[var(--border-color)] bg-[var(--bg-subtle)] hover:border-blue-400'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-[var(--text-primary)] block">Dark Mode</span>
              <span className="text-[11px] text-[var(--text-muted)]">Comfortable night interface</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleThemePreferenceChange('system')}
            className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeThemeSelection === 'system'
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                : 'border-[var(--border-color)] bg-[var(--bg-subtle)] hover:border-blue-400'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-[var(--text-primary)] block">System Default</span>
              <span className="text-[11px] text-[var(--text-muted)]">Auto ({theme === 'dark' ? 'Dark' : 'Light'})</span>
            </div>
          </button>
        </div>
      </div>

      {/* Profile Visibility Controls */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-500" />
          <span>Profile Field Visibility</span>
        </h2>
        <p className="text-xs text-[var(--text-muted)]">
          Control which parts of your school identity are shown to other verified students.
        </p>

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
            <div>
              <span className="text-xs font-bold text-[var(--text-primary)] block">
                Show Class Grade & Section on Directory
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">
                Allows students in your grade level to identify you for relevant class projects.
              </span>
            </div>
            <input
              type="checkbox"
              checked={currentPrivacy.showGradeToAll}
              onChange={e => handlePrivacyToggle('showGradeToAll', e.target.checked)}
              className="w-4 h-4 accent-blue-600 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
            <div>
              <span className="text-xs font-bold text-[var(--text-primary)] block">
                Show Verified Achievements & Medals
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">
                Displays school-approved certificates and Olympiad badges on your public card.
              </span>
            </div>
            <input
              type="checkbox"
              checked={currentPrivacy.showAchievements}
              onChange={e => handlePrivacyToggle('showAchievements', e.target.checked)}
              className="w-4 h-4 accent-blue-600 rounded"
            />
          </div>
        </div>
      </div>

      {/* Direct Messaging Permissions */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Lock className="w-4 h-4 text-purple-500" />
          <span>Direct Contact Controls</span>
        </h2>
        <p className="text-xs text-[var(--text-muted)]">
          Specify who can start a direct conversation with you on OPG Connect.
        </p>

        <div className="space-y-2">
          {[
            { id: 'anyone', title: 'Any Verified OPG Student', desc: 'Allows any student with an @opgworldschool.com account to message you.' },
            { id: 'project_partners', title: 'Project Team Partners Only', desc: 'Only students working on shared projects or approved applications.' },
            { id: 'verified_only', title: 'Faculty & Mentors Only', desc: 'Strict mode: disables peer direct messages; allows staff communication.' }
          ].map(opt => (
            <label
              key={opt.id}
              className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-colors ${
                currentPrivacy.allowDirectMessages === opt.id
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                  : 'border-[var(--border-color)] bg-[var(--bg-subtle)]'
              }`}
            >
              <input
                type="radio"
                name="dmPerm"
                checked={currentPrivacy.allowDirectMessages === opt.id}
                onChange={() => handlePrivacyToggle('allowDirectMessages', opt.id)}
                className="mt-0.5 accent-blue-600"
              />
              <div>
                <span className="text-xs font-bold text-[var(--text-primary)] block">{opt.title}</span>
                <span className="text-[11px] text-[var(--text-muted)]">{opt.desc}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Account Credentials & Security: Name, Gmail & Password */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-blue-500" />
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Account Identity & Credentials
            </h2>
          </div>
          {credentialMessage && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 animate-in fade-in">
              {credentialMessage}
            </span>
          )}
        </div>

        {/* Account Name / Username */}
        <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              <div>
                <span className="text-xs font-bold text-[var(--text-primary)] block">Account Name / Username</span>
                <span className="text-[11px] text-[var(--text-muted)]">Public display name shown on your profile, questions, and team projects</span>
              </div>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {currentUser.role === 'developer' ? 'Developer' : currentUser.role === 'teacher' ? 'Faculty' : 'Student'}
            </span>
          </div>

          {!isEditingSettingsName ? (
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-surface)] px-2 py-0.5 rounded border border-[var(--border-color)]">
                  ID: {currentUser.id.replace('user-', '')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSettingsNameInput(currentUser.name);
                  setIsEditingSettingsName(true);
                }}
                className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Change Name
              </button>
            </div>
          ) : (
            <form onSubmit={handleSettingsNameSave} className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1 animate-in fade-in">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={settingsNameInput}
                  onChange={e => setSettingsNameInput(e.target.value)}
                  placeholder="Enter your full name or preferred username..."
                  maxLength={60}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSettingsNameInput(currentUser.name);
                    setIsEditingSettingsName(false);
                  }}
                  className="px-3 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  Save Name
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Gmail Link / Switch */}
        <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-red-500" />
              <div>
                <span className="text-xs font-bold text-[var(--text-primary)] block">School Account Email</span>
                <span className="text-[11px] text-[var(--text-muted)]">Verified email for peer notifications and login</span>
              </div>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active
            </span>
          </div>

          {!isEditingSettingsGmail ? (
            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                {currentUser.gmailAccount || currentUser.email}
              </span>
              <button
                onClick={() => {
                  setSettingsGmailInput(currentUser.gmailAccount || currentUser.email);
                  setIsEditingSettingsGmail(true);
                }}
                className="px-3 py-1 text-xs font-medium text-blue-600 hover:underline"
              >
                Change Email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSettingsGmailSave} className="flex items-center gap-2 pt-1 animate-in fade-in">
              <input
                type="email"
                value={settingsGmailInput}
                onChange={e => setSettingsGmailInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setIsEditingSettingsGmail(false)}
                className="px-3 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
              >
                Save
              </button>
            </form>
          )}
        </div>

        {/* Profile Password Management */}
        <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-500" />
              <div>
                <span className="text-xs font-bold text-[var(--text-primary)] block">Profile Password</span>
                <span className="text-[11px] text-[var(--text-muted)]">Secure passcode for logging into your profile</span>
              </div>
            </div>
            <button
              onClick={() => setShowSettingsPassword(!showSettingsPassword)}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              title={showSettingsPassword ? 'Hide' : 'Reveal'}
            >
              {showSettingsPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {!isEditingSettingsPassword ? (
            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="text-xs font-mono font-bold tracking-wider text-[var(--text-primary)]">
                {showSettingsPassword ? (currentUser.password || '••••••••') : '••••••••••••'}
              </span>
              <button
                onClick={() => setIsEditingSettingsPassword(true)}
                className="px-3 py-1 text-xs font-medium text-blue-600 hover:underline"
              >
                Change Password
              </button>
            </div>
          ) : (
            <form onSubmit={handleSettingsPasswordSave} className="space-y-2 pt-1 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="password"
                  placeholder="New password (min 6 chars)"
                  value={settingsNewPassword}
                  onChange={e => setSettingsNewPassword(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={settingsConfirmPassword}
                  onChange={e => setSettingsConfirmPassword(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingSettingsPassword(false)}
                  className="px-3 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                >
                  Update Password
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Data Protection & Export (Indian DPDP Act) */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Student Data Protection & Compliance</span>
        </h2>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          In adherence to the Indian Digital Personal Data Protection (DPDP) Act and school safety protocols,
          OPG Connect does not collect personal phone numbers, physical residential addresses, or precise GPS
          coordinates. All conversations remain enclosed within school servers.
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
          <div>
            <span className="text-xs font-bold text-[var(--text-primary)] block">
              Download My Student Activity Archive
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">
              Export an official JSON copy of your profile, projects, and answers.
            </span>
          </div>
          <button
            onClick={exportMyData}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-[var(--text-primary)] border border-[var(--border-color)] hover:border-blue-400 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-blue-500" />
            <span>Export Data (JSON)</span>
          </button>
        </div>

        {/* Self-Deactivation Section */}
        <div className="pt-4 border-t border-[var(--border-color)] space-y-3">
          {deactivationFeedback && (
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs flex items-center justify-between gap-2 animate-in fade-in">
              <span>{deactivationFeedback}</span>
              <button
                onClick={() => setDeactivationFeedback(null)}
                className="text-xs font-semibold text-blue-700 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {currentUser.isDeactivated ? (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold">Your Account is Currently Deactivated</span>
              </div>
              <p className="text-xs text-amber-900/80 dark:text-amber-300/80 leading-relaxed">
                Your profile, skills, and projects are hidden from student directories and AI talent matching.
                All your past questions, answers, and messages remain saved. You can reactivate your account at any time.
              </p>
              <button
                onClick={() => {
                  reactivateOwnAccount();
                  setDeactivationFeedback('Welcome back! Your account has been reactivated and your profile is visible again.');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-2xs"
              >
                Reactivate My Account Now
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-red-700 dark:text-red-400 block">
                  Deactivate Your Account
                </span>
                <span className="text-[11px] text-[var(--text-muted)] block">
                  Instantly hide your profile from student searches and team rosters yourself. No approvals or requests required.
                </span>
              </div>

              <button
                onClick={() => setDeleteModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Deactivate Account</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Self-Deactivation Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] rounded-3xl max-w-md w-full p-6 border border-[var(--border-color)] shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Deactivate Account</span>
            </h3>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Your account will be deactivated immediately. You will no longer appear in the student directory,
              peer recommendations, or AI skill matching.
            </p>

            <div className="p-3 rounded-xl bg-[var(--bg-subtle)] text-[11px] text-[var(--text-muted)] space-y-1">
              <p className="font-semibold text-[var(--text-primary)]">Direct Self-Service Control:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Takes effect instantly without asking or waiting for anyone.</li>
                <li>Your account data remains securely saved.</li>
                <li>You can reactivate your account at any time with one click.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-xl"
              >
                Keep Account Active
              </button>
              <button
                onClick={() => {
                  deactivateOwnAccount();
                  setDeleteModalOpen(false);
                  setDeactivationFeedback('Your account has been deactivated. Your profile is now unlisted. You can reactivate anytime from this page.');
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
              >
                Deactivate Account Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
