import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Users,
  FolderKanban,
  HelpCircle,
  Calendar,
  Clock,
  MessageSquare,
  ChevronRight,
  Compass,
  Info,
  Plus,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  LogIn,
  UserPlus
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    currentUser,
    allStudents,
    projects,
    questions,
    events,
    setActiveTab,
    setSelectedStudentForProfile,
    setSelectedProjectForDetail,
    setSelectedQuestionForDetail,
    isAuthenticated,
    openAuthModal
  } = useApp();

  const activeProfiles = allStudents.filter(s => !s.isDeactivated);
  const totalActiveProfiles = activeProfiles.length;
  const developerCount = activeProfiles.filter(s => s.role === 'developer').length;
  const teacherCount = activeProfiles.filter(s => s.role === 'teacher' || s.role === 'admin').length;
  const studentCount = activeProfiles.filter(s => s.role === 'student' || s.role === 'moderator').length;
  const canAddEvents = currentUser.role === 'developer' || currentUser.role === 'teacher' || currentUser.role === 'admin';

  // Peers with complementary skills
  const suggestedPeers = allStudents
    .filter(s => s.id !== currentUser.id && !s.isDeactivated)
    .slice(0, 3);

  // Active projects recruiting
  const recruitingProjects = projects.filter(p => p.status === 'recruiting').slice(0, 2);

  // Recent questions
  const recentQuestions = questions.slice(0, 3);

  // Upcoming events
  const upcomingEvents = events.slice(0, 2);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Hero Welcome & Campus Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs">
        <div className="relative min-h-[240px] sm:min-h-[270px] w-full overflow-hidden flex flex-col justify-end p-5 sm:p-7">
          <img
            src="/src/assets/images/opg_campus_hero_1792943472157.jpg"
            alt="OPG World School Campus"
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />

          {/* Banner Text */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-blue-500/80 text-white backdrop-blur-xs">
                  Student Innovation & Talent Network
                </span>
                <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/80 text-white backdrop-blur-xs">
                  OPG World School · Dwarka
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
                PeerForge
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 mt-2 max-w-2xl leading-relaxed">
                Welcome to a dynamic peer-to-peer network designed by Class 11 students at OPG World School for students in Classes 9 through 12.
                <span className="block mt-1.5 text-slate-200/95">
                  Our platform bridges the gap between classrooms, making it seamless to connect with fellow students for academic competitions, collaborative projects, and peer doubt-solving. Foster growth, share knowledge, and build a supportive community beyond school hours.
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('ai-finder')}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Talent Match</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gmail Authentication Portal Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-purple-50/90 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-purple-950/30 border border-blue-200/80 dark:border-blue-900/50 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-[11px] font-bold text-blue-700 dark:text-blue-300 shadow-2xs">
                {/* Google G icon */}
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                Gmail Sign-In & Registration
              </span>
              {isAuthenticated ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-800">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  Authenticated as {currentUser.role === 'developer' ? 'App Developer' : currentUser.role === 'teacher' ? 'Faculty Mentor' : 'Student'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-[10px] font-bold border border-amber-300 dark:border-amber-800">
                  Visitor Mode
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
              {isAuthenticated
                ? `Logged in: ${currentUser.name} (${currentUser.gmailAccount || currentUser.email})`
                : 'Join OPG World School PeerForge with your Gmail ID'}
            </h3>
            <p className="text-xs text-[var(--text-muted)] max-w-2xl leading-relaxed">
              {isAuthenticated
                ? 'You have full access to create projects, ask peer questions, apply for developer cross-approvals, and add school events.'
                : 'Students (Classes 9–12) and Faculty Mentors can register or sign in with their Gmail credentials to start collaborating.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => openAuthModal('signup', 'student')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Student Sign-Up</span>
                </button>
                <button
                  onClick={() => openAuthModal('signup', 'teacher')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Teacher Portal</span>
                </button>
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold text-xs transition-all flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In with Gmail</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => openAuthModal('signup', 'student')}
                  className="px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold text-xs transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register Another Gmail</span>
                </button>
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Switch Account</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Profile Counter Widget */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-sm shrink-0">
              {totalActiveProfiles}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)]">
                  Registered Profiles on PeerForge
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Directory Count
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Active school profiles across Classes 9–12, App Developers, and Faculty Mentors
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
              <strong className="text-[var(--text-primary)]">{developerCount}</strong> Developer{developerCount === 1 ? '' : 's'}
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
              <strong className="text-[var(--text-primary)]">{teacherCount}</strong> Faculty Mentor{teacherCount === 1 ? '' : 's'}
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
              <strong className="text-[var(--text-primary)]">{studentCount}</strong> Student{studentCount === 1 ? '' : 's'}
            </div>
            <button
              onClick={() => setActiveTab('discover')}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
            >
              <span>Explore Directory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveTab('ai-finder')}
          className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-purple-300 dark:hover:border-purple-700 transition-all text-left shadow-2xs group"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Find Teammates</h2>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Natural-language skill query</p>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-blue-300 dark:hover:border-blue-700 transition-all text-left shadow-2xs group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <FolderKanban className="w-5 h-5" />
          </div>
          <h2 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Start Project</h2>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Recruit students & open roles</p>
        </button>

        <button
          onClick={() => setActiveTab('qa')}
          className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-emerald-300 dark:hover:border-emerald-700 transition-all text-left shadow-2xs group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h2 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Ask Question</h2>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Academics & research advice</p>
        </button>

        <button
          onClick={() => setActiveTab('discover')}
          className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-blue-300 dark:hover:border-blue-700 transition-all text-left shadow-2xs group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <h2 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Student Directory</h2>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Browse verified skills</p>
        </button>
      </div>

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Projects & Discussions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Open Collaboration Opportunities */}
          <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  Open Project Opportunities
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Collaborate on upcoming science fairs, hackathons, and research
                </p>
              </div>
              <button
                onClick={() => setActiveTab('projects')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {recruitingProjects.map(project => (
                <div
                  key={project.id}
                  className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] hover:border-blue-300 dark:hover:border-blue-800 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                          {project.category}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">·</span>
                        <span className="text-xs text-[var(--text-muted)]">
                          Lead: {project.ownerName} ({project.ownerGrade})
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)] mt-0.5">
                        {project.title}
                      </h3>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shrink-0">
                      Recruiting
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                    {project.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]/60 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-medium text-[var(--text-muted)]">Open Roles:</span>
                      {project.openRoles
                        .filter(r => r.status === 'open')
                        .slice(0, 2)
                        .map(r => (
                          <span
                            key={r.id}
                            className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[11px] font-medium text-[var(--text-primary)] border border-[var(--border-color)]"
                          >
                            {r.title}
                          </span>
                        ))}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedProjectForDetail(project);
                        setActiveTab('projects');
                      }}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Q&A Feed */}
          <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  Recent Questions & Answers
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Peer problem solving and resource recommendations
                </p>
              </div>
              <button
                onClick={() => setActiveTab('qa')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Browse forum</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[var(--border-color)]">
              {recentQuestions.map(q => (
                <div
                  key={q.id}
                  onClick={() => {
                    setSelectedQuestionForDetail(q);
                    setActiveTab('qa');
                  }}
                  className="py-3 first:pt-0 last:pb-0 cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <span>{q.authorName} ({q.authorGrade})</span>
                        <span>·</span>
                        <span>{q.topic}</span>
                        <span>·</span>
                        <span>{q.createdAt}</span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] group-hover:text-blue-600 transition-colors">
                        {q.title}
                      </h3>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)] num-tabular">
                        <MessageSquare className="w-3 h-3" />
                        <span>{q.answersCount} answers</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Suggested Peers & School Notices */}
        <div className="space-y-6">
          {/* Suggested Student Peers */}
          <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)]">Suggested Peers</h2>
                <p className="text-[11px] text-[var(--text-muted)]">Based on complementary abilities</p>
              </div>
              <button
                onClick={() => setActiveTab('discover')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Explore All
              </button>
            </div>

            <div className="space-y-3">
              {suggestedPeers.map(student => (
                <div
                  key={student.id}
                  className="p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[var(--text-primary)] truncate block">
                        {student.name}
                      </span>
                      <p className="text-[10px] text-[var(--text-muted)] truncate">
                        {student.grade} · {student.skills[0]?.name || 'Student'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedStudentForProfile(student);
                      setActiveTab('profile');
                    }}
                    className="py-1 px-2.5 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-50 transition-colors shrink-0"
                  >
                    Profile
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* School Events & Announcements */}
          <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)]">Upcoming Events</h2>
                <p className="text-[11px] text-[var(--text-muted)]">Academic calendar</p>
              </div>
              <div className="flex items-center gap-2">
                {canAddEvents && (
                  <button
                    onClick={() => setActiveTab('events')}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 flex items-center gap-1 transition-colors"
                    title="Add upcoming event as App Developer or Teacher"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Event</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('events')}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Calendar
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {upcomingEvents.map(event => (
                <div
                  key={event.id}
                  className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100/70 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                      {event.category}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)] font-medium num-tabular">
                      {event.date}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-[var(--text-primary)] line-clamp-2">
                    {event.title}
                  </h3>
                  <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>{event.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
