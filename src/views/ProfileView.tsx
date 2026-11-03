import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Skill, StudentProfile } from '../types';
import {
  CheckCircle2,
  Award,
  Plus,
  Trash2,
  Edit3,
  Lock,
  MessageSquare,
  Sparkles,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  User,
  FolderKanban,
  Edit2,
  X
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    selectedStudentForProfile,
    setSelectedStudentForProfile,
    updateCurrentUserProfile,
    updatePassword,
    linkGmailAccount,
    addSkillToCurrent,
    removeSkillFromCurrent,
    openDirectMessageWith,
    setIsOnboardingOpen,
    openAuthModal,
    questions,
    answers,
    projects,
    setSelectedQuestionForDetail,
    setSelectedProjectForDetail,
    setActiveTab
  } = useApp();

  const student = selectedStudentForProfile || currentUser;
  const isOwnProfile = student && currentUser ? student.id === currentUser.id : false;

  // Answered questions and contributions
  const studentAnswers = (answers || []).filter(a => a.authorId === student?.id);
  const studentAnsweredQuestions = studentAnswers
    .map(ans => ({
      answer: ans,
      question: (questions || []).find(q => q.id === ans.questionId)
    }))
    .filter((item): item is { answer: typeof studentAnswers[0]; question: NonNullable<typeof questions>[0] } => item.question !== undefined);

  // Projects & Initiatives where student is owner or member
  const allStudentInitiatives = (() => {
    const map = new Map<string, {
      id: string;
      title: string;
      description: string;
      role: string;
      status: 'completed' | 'in-progress';
      category?: string;
      isOwner: boolean;
      rawProject?: typeof projects[0];
    }>();

    // 1. Add platform projects where student is owner or member
    (projects || []).forEach(p => {
      if (p.ownerId === student?.id) {
        map.set(p.id, {
          id: p.id,
          title: p.title,
          description: p.description,
          role: 'Project Leader & Creator',
          status: p.status === 'completed' ? 'completed' : 'in-progress',
          category: p.category,
          isOwner: true,
          rawProject: p
        });
      } else {
        const member = p.members.find(m => m.studentId === student?.id);
        if (member) {
          map.set(p.id, {
            id: p.id,
            title: p.title,
            description: p.description,
            role: member.role || 'Team Member',
            status: p.status === 'completed' ? 'completed' : 'in-progress',
            category: p.category,
            isOwner: false,
            rawProject: p
          });
        }
      }
    });

    // 2. Fallback to student.projects for static entries
    (student?.projects || []).forEach((proj, idx) => {
      const key = proj.id || `static-proj-${idx}`;
      if (!map.has(key) && !Array.from(map.values()).some(item => item.title.toLowerCase() === proj.title.toLowerCase())) {
        map.set(key, {
          id: key,
          title: proj.title,
          description: proj.description,
          role: proj.role || 'Contributor',
          status: proj.status === 'completed' ? 'completed' : 'in-progress',
          isOwner: proj.role?.toLowerCase().includes('owner') || proj.role?.toLowerCase().includes('lead') || false
        });
      }
    });

    return Array.from(map.values());
  })();

  // Add skill local form
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<Skill['category']>('Technical');
  const [newSkillLevel, setNewSkillLevel] = useState<Skill['level']>('Intermediate');

  // Password management states
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState<string | null>(null);

  // Gmail account states
  const [isEditingGmail, setIsEditingGmail] = useState(false);
  const [gmailInput, setGmailInput] = useState(currentUser?.gmailAccount || currentUser?.email || '');
  const [gmailFeedback, setGmailFeedback] = useState<string | null>(null);

  if (!student) {
    return (
      <div className="p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] max-w-lg mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mx-auto text-blue-500">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Profile Not Found</h2>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          Please sign in to view your school profile or select a student from the directory to learn about their skills.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => openAuthModal('login')}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-sm"
          >
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordFeedback('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback('Passwords do not match.');
      return;
    }
    updatePassword(newPassword);
    setPasswordFeedback('Password updated successfully!');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      setIsChangingPassword(false);
      setPasswordFeedback(null);
    }, 2000);
  };

  const handleGmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = gmailInput.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setGmailFeedback('Please enter a valid Gmail address.');
      return;
    }
    linkGmailAccount(trimmed);
    setGmailFeedback('Gmail account linked successfully!');
    setTimeout(() => {
      setIsEditingGmail(false);
      setGmailFeedback(null);
    }, 2000);
  };

  const handleAddSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    addSkillToCurrent({
      name: newSkillName.trim(),
      category: newSkillCategory,
      level: newSkillLevel,
      verified: false
    });

    setNewSkillName('');
    setIsAddingSkill(false);
  };

  const PREDETERMINED_STATUSES = [
    'Active & Seeking Projects',
    'Open to Collaborate',
    'Focusing on Studies / Busy'
  ];
  const [isEditingCustomStatus, setIsEditingCustomStatus] = useState(false);
  const [customStatusInput, setCustomStatusInput] = useState('');

  const handleAvailabilityChange = (av: string) => {
    if (isOwnProfile) {
      updateCurrentUserProfile({ availability: av });
    }
  };

  const handleSaveCustomStatus = () => {
    const trimmed = customStatusInput.trim();
    if (!trimmed) return;
    updateCurrentUserProfile({ availability: trimmed });
    setIsEditingCustomStatus(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Bar for viewing another student */}
      {!isOwnProfile && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <span>Viewing student profile:</span>
            <span className="font-semibold text-[var(--text-primary)]">{student.name}</span>
          </div>
          <button
            onClick={() => setSelectedStudentForProfile(currentUser)}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to My Profile
          </button>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative">
              <img
                src={student.avatar}
                alt={student.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-blue-100 dark:bg-blue-950/60 object-cover shadow-sm"
                referrerPolicy="no-referrer"
              />
              {student.isVerified && (
                <div
                  className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-slate-900 rounded-full shadow-xs"
                  title="Verified Student"
                >
                  <CheckCircle2 className="w-5 h-5 text-blue-500 fill-blue-50" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">
                  {student.name}
                </h1>
                {student.role === 'developer' && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span>App Developer</span>
                  </span>
                )}
                {student.role === 'teacher' && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-700 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                    <span>Faculty Mentor</span>
                  </span>
                )}
                {student.role === 'moderator' && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200">
                    Student Moderator
                  </span>
                )}
                {student.role === 'admin' && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200">
                    Faculty / Admin
                  </span>
                )}
              </div>

              <div className="text-xs text-[var(--text-muted)] flex items-center gap-2 flex-wrap">
                <span>{student.grade} · Section {student.section}</span>
                <span>·</span>
                <span>OPG World School</span>
                <span>·</span>
                <span>Joined {student.joinedDate}</span>
              </div>

              {/* Availability selector or badge */}
              <div className="pt-2 flex items-center gap-2 flex-wrap">
                {isOwnProfile ? (
                  isEditingCustomStatus ? (
                    <div className="flex items-center gap-1.5 flex-wrap animate-in fade-in">
                      <span className="text-xs font-medium text-[var(--text-secondary)]">Custom Status:</span>
                      <input
                        type="text"
                        placeholder="e.g. Building an autonomous rover..."
                        value={customStatusInput}
                        onChange={e => setCustomStatusInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSaveCustomStatus();
                          } else if (e.key === 'Escape') {
                            setIsEditingCustomStatus(false);
                          }
                        }}
                        maxLength={60}
                        className="px-2.5 py-1 text-xs rounded-lg bg-[var(--bg-subtle)] border border-blue-500 text-[var(--text-primary)] focus:outline-none w-52 sm:w-64"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleSaveCustomStatus}
                        disabled={!customStatusInput.trim()}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                        title="Set Custom Status"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Set</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingCustomStatus(false)}
                        className="p-1 rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs transition-all cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            currentUser?.availability === 'Active & Seeking Projects'
                              ? 'bg-emerald-500'
                              : currentUser?.availability === 'Open to Collaborate'
                              ? 'bg-blue-500'
                              : currentUser?.availability === 'Focusing on Studies / Busy'
                              ? 'bg-amber-500'
                              : 'bg-purple-500'
                          }`}
                        />
                        <span className="text-xs font-medium text-[var(--text-secondary)]">Status:</span>
                      </div>
                      <select
                        value={
                          PREDETERMINED_STATUSES.includes(currentUser?.availability || '')
                            ? currentUser?.availability
                            : '__custom_active__'
                        }
                        onChange={e => {
                          if (e.target.value === '__custom_new__') {
                            setCustomStatusInput('');
                            setIsEditingCustomStatus(true);
                          } else if (e.target.value === '__custom_active__') {
                            setCustomStatusInput(currentUser?.availability || '');
                            setIsEditingCustomStatus(true);
                          } else {
                            handleAvailabilityChange(e.target.value);
                          }
                        }}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none cursor-pointer max-w-[220px] truncate"
                      >
                        <option value="Active & Seeking Projects">Active & Seeking Projects</option>
                        <option value="Open to Collaborate">Open to Collaborate</option>
                        <option value="Focusing on Studies / Busy">Focusing on Studies / Busy</option>
                        {!PREDETERMINED_STATUSES.includes(currentUser?.availability || '') && currentUser?.availability && (
                          <option value="__custom_active__">
                            Custom: {currentUser.availability}
                          </option>
                        )}
                        <option value="__custom_new__">
                          + Add Custom Status...
                        </option>
                      </select>

                      <button
                        type="button"
                        onClick={() => {
                          setCustomStatusInput(
                            PREDETERMINED_STATUSES.includes(currentUser?.availability || '')
                              ? ''
                              : currentUser?.availability || ''
                          );
                          setIsEditingCustomStatus(true);
                        }}
                        className="p-1.5 rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--border-color)] text-[var(--text-muted)] hover:text-blue-600 transition-colors cursor-pointer"
                        title="Type a custom status"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-subtle)] text-xs font-medium text-[var(--text-secondary)] border border-[var(--border-color)]">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        student.availability === 'Active & Seeking Projects'
                          ? 'bg-emerald-500'
                          : student.availability === 'Open to Collaborate'
                          ? 'bg-blue-500'
                          : student.availability === 'Focusing on Studies / Busy'
                          ? 'bg-amber-500'
                          : 'bg-purple-500'
                      }`}
                    />
                    <span>{student.availability}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            {isOwnProfile ? (
              <button
                onClick={() => setIsOnboardingOpen(true)}
                className="w-full sm:w-auto py-2 px-4 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={() => openDirectMessageWith(student)}
                className="w-full sm:w-auto py-2 px-4 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </button>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="mt-6 pt-6 border-t border-[var(--border-color)]/70">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
            About Me
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {student.bio || 'No bio entered yet.'}
          </p>
        </div>
      </div>

      {/* Grid: Skills on Left (2 cols), Details on Right (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Skills & Projects */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skills Management */}
          <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  Skills & Proficiencies
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Self-reported proficiencies and verified talents
                </p>
              </div>

              {isOwnProfile && (
                <button
                  onClick={() => setIsAddingSkill(!isAddingSkill)}
                  className="py-1 px-3 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Skill</span>
                </button>
              )}
            </div>

            {/* Add Skill Form Inline */}
            {isAddingSkill && isOwnProfile && (
              <form
                onSubmit={handleAddSkillSubmit}
                className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-3 animate-in fade-in"
              >
                <div className="text-xs font-bold text-[var(--text-primary)]">Add New Skill</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Skill name (e.g. Python, Blender)..."
                    value={newSkillName}
                    onChange={e => setNewSkillName(e.target.value)}
                    className="sm:col-span-1 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                    required
                  />

                  <select
                    value={newSkillCategory}
                    onChange={e => setNewSkillCategory(e.target.value as any)}
                    className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Creative">Creative</option>
                    <option value="Academic">Academic</option>
                    <option value="Leadership & Sports">Leadership & Sports</option>
                    <option value="Other">Other</option>
                  </select>

                  <select
                    value={newSkillLevel}
                    onChange={e => setNewSkillLevel(e.target.value as any)}
                    className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingSkill(false)}
                    className="px-3 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                  >
                    Save Skill
                  </button>
                </div>
              </form>
            )}

            {/* Categorized Skills display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(student.skills || []).map((skill, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                        {skill.name}
                      </span>
                      {skill.verified ? (
                        <span
                          className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold"
                        >
                          Verified
                        </span>
                      ) : (
                        <span className="text-[9px] text-[var(--text-muted)] opacity-70">
                          (Self-Reported)
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                      <span className="font-medium text-blue-600 dark:text-blue-400">{skill.level}</span>
                      <span>·</span>
                      <span>{skill.category}</span>
                    </div>
                  </div>

                  {isOwnProfile && (
                    <button
                      onClick={() => removeSkillFromCurrent(skill.name)}
                      className="text-[var(--text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="Remove skill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Projects & Peer Contributions */}
          <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-5 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Projects & Peer Contributions
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Collaborative initiatives and answered peer academic solutions
              </p>
            </div>

            {/* Listed Projects & Initiatives */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <FolderKanban className="w-3.5 h-3.5 text-blue-500" />
                  <span>Initiatives & Led Projects ({allStudentInitiatives.length})</span>
                </h3>
                {allStudentInitiatives.some(p => p.isOwner) && (
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                    Project Leader
                  </span>
                )}
              </div>

              {allStudentInitiatives.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] italic">
                  No project initiatives listed yet. {isOwnProfile && 'Click "Create Project" in the Projects section to launch your own initiative!'}
                </p>
              ) : (
                allStudentInitiatives.map(proj => (
                  <div
                    key={proj.id}
                    onClick={() => {
                      if (proj.rawProject) {
                        setSelectedProjectForDetail(proj.rawProject);
                        setActiveTab('projects');
                      }
                    }}
                    className={`p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-2 transition-all ${
                      proj.rawProject ? 'hover:border-blue-400/60 cursor-pointer group' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {proj.title}
                          </h3>
                          {proj.isOwner && (
                            <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
                              👑 Project Owner & Lead
                            </span>
                          )}
                          {proj.category && (
                            <span className="text-[10px] font-semibold px-2 py-0.2 rounded-md bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-color)]">
                              {proj.category}
                            </span>
                          )}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                          proj.status === 'completed'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {proj.status === 'completed' ? 'Completed' : 'Active Initiative'}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{proj.description}</p>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="font-semibold text-purple-700 dark:text-purple-300">
                        Role: {proj.role}
                      </span>
                      {proj.rawProject && (
                        <span className="font-medium text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                          Manage & View Team →
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Answered Peer Questions & Contributions */}
            <div className="space-y-3 pt-3 border-t border-[var(--border-color)]/70">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                  <span>Answered Forum Questions ({studentAnsweredQuestions.length})</span>
                </h3>
                {studentAnsweredQuestions.length > 0 && (
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                    Peer Helper
                  </span>
                )}
              </div>

              {studentAnsweredQuestions.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] italic">
                  No answered questions yet. Visit the Q&A Peer Forum to contribute solutions!
                </p>
              ) : (
                <div className="space-y-3">
                  {studentAnsweredQuestions.map(({ answer, question }) => (
                    <div
                      key={answer.id}
                      onClick={() => {
                        setSelectedQuestionForDetail(question);
                        setActiveTab('qa');
                      }}
                      className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] hover:border-blue-400/60 transition-all cursor-pointer space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {question.title}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.2 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {question.topic}
                          </span>
                        </div>

                        {answer.isAccepted ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Accepted Solution</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-[var(--text-muted)] shrink-0">
                            ▲ {answer.upvotes} {answer.upvotes === 1 ? 'Upvote' : 'Upvotes'}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[var(--text-secondary)] italic bg-[var(--bg-surface)] p-2.5 rounded-xl border border-[var(--border-color)] line-clamp-2">
                        &quot;{answer.body}&quot;
                      </p>

                      <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-between">
                        <span>Answered by {student.name} · {answer.createdAt}</span>
                        <span className="group-hover:translate-x-0.5 transition-transform">View Solution →</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Achievements, Academic Strengths, Interests */}
        <div className="space-y-6">
          {/* Achievements */}
          <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  School Achievements & Recognition
                </h2>
              </div>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                {(student.achievements || []).length + (studentAnswers.length > 0 ? 1 : 0) + studentAnswers.filter(a => a.isAccepted).length} Total
              </span>
            </div>

            <div className="space-y-3">
              {/* Dynamic Q&A Peer Forum Contributor Badge */}
              {studentAnswers.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/5 to-transparent border border-amber-500/30 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>Peer Forum Knowledge Contributor</span>
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)]">
                    Answered {studentAnswers.length} peer academic {studentAnswers.length === 1 ? 'question' : 'questions'} on OPG Connect
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] flex items-center justify-between pt-0.5">
                    <span>Issuer: OPG World School Q&A</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">Verified Contributor</span>
                  </div>
                </div>
              )}

              {/* Dynamic Accepted Solution Badges */}
              {studentAnsweredQuestions
                .filter(item => item.answer.isAccepted)
                .map(({ answer, question }) => (
                  <div
                    key={`ach-ans-${answer.id}`}
                    onClick={() => {
                      setSelectedQuestionForDetail(question);
                      setActiveTab('qa');
                    }}
                    className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1 cursor-pointer hover:border-emerald-500/60 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Accepted Solution: &quot;{question.title}&quot;</span>
                      </span>
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] flex items-center justify-between">
                      <span>Issuer: OPG Academic Peer Forum</span>
                      <span className="num-tabular font-medium text-emerald-600 dark:text-emerald-400">Verified Solution</span>
                    </div>
                  </div>
                ))}

              {/* Static School Achievements */}
              {(student.achievements || []).map((ach, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      {ach.title}
                    </span>
                    {ach.verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    )}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] flex items-center justify-between">
                    <span>{ach.issuer}</span>
                    <span className="num-tabular">{ach.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Strengths */}
          <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Academic Strengths
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {(student.academicStrengths || []).map((sub, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-800"
                >
                  {sub}
                </span>
              ))}
            </div>
          </div>

          {/* Interests & Hobbies */}
          <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Interests & Hobbies
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {(student.interests || []).map((int, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-medium border border-purple-200 dark:border-purple-800"
                >
                  {int}
                </span>
              ))}
            </div>
          </div>

          {/* Gmail Account Management (Own Profile) */}
          {isOwnProfile && (
            <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[var(--text-primary)]">
                      School Email Account
                    </h2>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      Verified Primary Email
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Linked ✓
                </span>
              </div>

              {!isEditingGmail ? (
                <div className="space-y-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-[var(--text-primary)] truncate block">
                        {currentUser?.gmailAccount || currentUser?.email}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">Primary school communication & auth</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setGmailInput(currentUser?.gmailAccount || currentUser?.email || '');
                      setIsEditingGmail(true);
                    }}
                    className="w-full py-1.5 px-3 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 bg-[var(--bg-subtle)] hover:bg-[var(--border-color)]/60 border border-[var(--border-color)] transition-colors"
                  >
                    Change / Update Gmail Address
                  </button>
                </div>
              ) : (
                <form onSubmit={handleGmailSubmit} className="space-y-2 pt-1 animate-in fade-in">
                  <input
                    type="email"
                    value={gmailInput}
                    onChange={e => setGmailInput(e.target.value)}
                    placeholder="e.g. yourname@gmail.com"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                    required
                  />
                  {gmailFeedback && (
                    <p className={`text-[11px] ${gmailFeedback.includes('successfully') ? 'text-emerald-600' : 'text-red-500'}`}>
                      {gmailFeedback}
                    </p>
                  )}
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingGmail(false);
                        setGmailFeedback(null);
                      }}
                      className="px-3 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                    >
                      Save Gmail
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Password in Profile (Own Profile) */}
          {isOwnProfile && (
            <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[var(--text-primary)]">
                      Profile Password
                    </h2>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      Credential security & login passcode
                    </p>
                  </div>
                </div>
              </div>

              {!isChangingPassword ? (
                <div className="space-y-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] block">Current Passcode</span>
                      <span className="text-xs font-mono font-bold tracking-wider text-[var(--text-primary)]">
                        {showPassword ? (currentUser?.password || '••••••••') : '••••••••••••'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-surface)]"
                      title={showPassword ? 'Hide password' : 'View password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setIsChangingPassword(true);
                      setPasswordFeedback(null);
                    }}
                    className="w-full py-1.5 px-3 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 bg-[var(--bg-subtle)] hover:bg-[var(--border-color)]/60 border border-[var(--border-color)] transition-colors"
                  >
                    Change Password
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-2 pt-1 animate-in fade-in">
                  <div>
                    <label className="text-[10px] text-[var(--text-muted)] block mb-0.5">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--text-muted)] block mb-0.5">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  {passwordFeedback && (
                    <p className={`text-[11px] ${passwordFeedback.includes('successfully') ? 'text-emerald-600' : 'text-red-500'}`}>
                      {passwordFeedback}
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordFeedback(null);
                      }}
                      className="px-3 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                    >
                      Save Password
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
