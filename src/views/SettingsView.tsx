import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Lock,
  Eye,
  ShieldCheck,
  Download,
  Trash2,
  Moon,
  Sun,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Mail,
  KeyRound,
  EyeOff
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    updateCurrentUserProfile,
    updatePassword,
    linkGmailAccount,
    theme,
    toggleTheme,
    exportMyData,
    deactivateOwnAccount,
    reactivateOwnAccount
  } = useApp();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deactivationFeedback, setDeactivationFeedback] = useState<string | null>(null);

  // Safe fallback for privacySettings
  const currentPrivacy = currentUser.privacySettings || {
    showGradeToAll: true,
    allowDirectMessages: 'anyone' as const,
    showAchievements: true
  };

  // Gmail & Password states
  const [showSettingsPassword, setShowSettingsPassword] = useState(false);
  const [isEditingSettingsGmail, setIsEditingSettingsGmail] = useState(false);
  const [settingsGmailInput, setSettingsGmailInput] = useState(currentUser.gmailAccount || currentUser.email);
  const [isEditingSettingsPassword, setIsEditingSettingsPassword] = useState(false);
  const [settingsNewPassword, setSettingsNewPassword] = useState('');
  const [settingsConfirmPassword, setSettingsConfirmPassword] = useState('');
  const [credentialMessage, setCredentialMessage] = useState<string | null>(null);

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

      {/* Account Credentials & Security: Gmail & Password */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-blue-500" />
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Account Credentials & Security
            </h2>
          </div>
          {credentialMessage && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 animate-in fade-in">
              {credentialMessage}
            </span>
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
                Change Gmail
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
