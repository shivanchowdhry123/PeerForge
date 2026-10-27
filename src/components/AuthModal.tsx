import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  GraduationCap,
  Sparkles,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookOpen
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    authRole,
    setAuthRole,
    loginWithGmail,
    signUpWithGmail
  } = useApp();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('Grade 11');
  const [section, setSection] = useState('A');
  const [department, setDepartment] = useState('Science & Computer Science');
  const [skillsInput, setSkillsInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  if (!isAuthModalOpen) return null;

  const handleModeSwitch = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setFeedback(null);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    try {
      if (authModalMode === 'login') {
        const res = await loginWithGmail(email, password);
        if (res.success) {
          setFeedback({ type: 'success', message: res.message });
          setTimeout(() => closeAuthModal(), 1200);
        } else {
          setFeedback({ type: 'error', message: res.message });
        }
      } else {
        const skillsArray = skillsInput
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);

        const res = await signUpWithGmail({
          name,
          email,
          role: authRole,
          grade: authRole === 'student' ? grade : department,
          section: authRole === 'student' ? section : 'Faculty',
          department: authRole === 'teacher' ? department : undefined,
          password,
          skills: skillsArray
        });

        if (res.success) {
          setFeedback({ type: 'success', message: res.message });
          setTimeout(() => closeAuthModal(), 1400);
        } else {
          setFeedback({ type: 'error', message: res.message });
        }
      }
    } catch {
      setFeedback({ type: 'error', message: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-2xl p-6 sm:p-8 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Branding Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>OPG World School · PeerForge</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
            {authModalMode === 'login' ? 'Sign In to PeerForge' : 'Create Account'}
          </h2>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
            {authModalMode === 'login'
              ? 'Access student projects, research collaboration, and faculty mentorship.'
              : 'Join PeerForge as a Student or Teacher with your school email.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex rounded-2xl bg-[var(--bg-subtle)] p-1 border border-[var(--border-color)] mb-5">
          <button
            type="button"
            onClick={() => handleModeSwitch('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              authModalMode === 'login'
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch('signup')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              authModalMode === 'signup'
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Role Selector (Student vs Teacher) */}
        <div className="space-y-2 mb-5">
          <label className="text-xs font-bold text-[var(--text-primary)] block">
            Account Type:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAuthRole('student')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                authRole === 'student'
                  ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/30'
                  : 'border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold">Student</span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] leading-tight">
                Classes 9–12 · Peer networks, doubt solving & tech projects
              </p>
            </button>

            <button
              type="button"
              onClick={() => setAuthRole('teacher')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                authRole === 'teacher'
                  ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/30'
                  : 'border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold">Teacher</span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] leading-tight">
                Faculty Mentor · Student guidance, research review & events
              </p>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3 rounded-2xl text-xs flex items-center gap-2 mb-4 animate-in fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-200 border border-red-200 dark:border-red-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authModalMode === 'signup' && (
            <div>
              <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                Full Name:
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder={authRole === 'teacher' ? 'e.g. Dr. Rajesh Kumar' : 'e.g. Aarav Sharma'}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-400"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
              Email Address:
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="email"
                placeholder="e.g. username@opgworldschool.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-400"
                required
              />
            </div>
          </div>

          {authModalMode === 'signup' && authRole === 'student' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                  Grade / Class:
                </label>
                <select
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-400"
                >
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                  Section:
                </label>
                <select
                  value={section}
                  onChange={e => setSection(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-400"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                  <option value="D">Section D</option>
                </select>
              </div>
            </div>
          )}

          {authModalMode === 'signup' && authRole === 'teacher' && (
            <div>
              <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                Department / Subject:
              </label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-400"
              >
                <option value="Science & IT">Science & IT (Physics, Chemistry, CS)</option>
                <option value="Mathematics & AI">Mathematics & Applied AI</option>
                <option value="Commerce & Economics">Commerce & Economics</option>
                <option value="Humanities & Model UN">Humanities, MUN & Political Science</option>
                <option value="Robotics & Innovation">Robotics & Tinkering Lab</option>
              </select>
            </div>
          )}

          {authModalMode === 'signup' && (
            <div>
              <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                {authRole === 'teacher' ? 'Mentorship Areas:' : 'Your Skills / Interests:'}
              </label>
              <input
                type="text"
                placeholder={authRole === 'teacher' ? 'e.g. STEM Projects, Physics, Paper Review' : 'e.g. Python, Robotics, MUN, Design'}
                value={skillsInput}
                onChange={e => setSkillsInput(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-400"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
              Password:
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password (min 6 chars)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all mt-2"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {authModalMode === 'login'
                    ? `Sign In as ${authRole === 'teacher' ? 'Teacher' : 'Student'}`
                    : `Register as ${authRole === 'teacher' ? 'Faculty Mentor' : 'Student'}`}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-5 text-center text-[11px] text-[var(--text-muted)]">
          {authModalMode === 'login' ? (
            <p>
              Don&apos;t have an account?{' '}
              <button
                onClick={() => handleModeSwitch('signup')}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                onClick={() => handleModeSwitch('login')}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
