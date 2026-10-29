import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Users,
  FolderKanban,
  HelpCircle,
  Calendar,
  ChevronRight,
  Compass,
  Plus,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  LogIn,
  UserPlus,
  ArrowUpRight,
  MessageSquare
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

  const activeProfiles = (allStudents || []).filter(s => s && !s.isDeactivated);
  const totalActiveProfiles = activeProfiles.length;
  const developerCount = activeProfiles.filter(s => s.role === 'developer').length;
  const teacherCount = activeProfiles.filter(s => s.role === 'teacher' || s.role === 'admin').length;
  const studentCount = activeProfiles.filter(s => s.role === 'student' || s.role === 'moderator').length;

  // Peers with complementary skills
  const suggestedPeers = activeProfiles
    .filter(s => s.id !== currentUser?.id)
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
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 dark:border-white/10 bg-[var(--bg-surface)] shadow-lg dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.7)] ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-md group transition-all duration-300 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:z-20">
        <div className="relative min-h-[260px] sm:min-h-[300px] w-full overflow-hidden flex flex-col justify-end p-6 sm:p-8">
          <img
            src="/src/assets/images/opg_campus_hero_1792943472157.jpg"
            alt="OPG World School Campus"
            className="absolute inset-0 w-full h-full object-cover transform-gpu transition-transform duration-700 group-hover:scale-[1.02]"
            referrerPolicy="no-referrer"
          />
          {/* Multi-layer atmospheric scrim tailored for dual-mode depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-950/20 dark:from-[#0B0F19]/95 dark:via-[#0B0F19]/60 dark:to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent opacity-80 dark:opacity-100 pointer-events-none" />

          {/* Banner Text with Sleek Glass Accent & Anti-Slop Typography */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 text-white">
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-md text-[11px] font-semibold tracking-wider uppercase text-blue-200 dark:text-blue-300 shadow-2xs">
                <span>OPG World School · Dwarka</span>
                <span aria-hidden="true" className="text-white/40">/</span>
                <span>Talent Network</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight drop-shadow-xs">
                PeerForge Directory
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 dark:text-slate-300/90 max-w-2xl leading-relaxed">
                A collaborative student directory designed by Class 11 students at OPG World School for Classes 9 through 12. Connect for STEM projects, national Olympiads, MUN debate teams, and peer doubt-solving.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setActiveTab('ai-finder')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-purple-600/30 dark:shadow-purple-900/40 border border-purple-400/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-purple-200" />
                <span>AI Talent Match</span>
              </button>
              <button
                onClick={() => setActiveTab('discover')}
                className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 dark:bg-slate-900/60 dark:hover:bg-slate-800/80 text-white font-semibold text-xs sm:text-sm backdrop-blur-md border border-white/25 dark:border-white/15 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
              >
                Browse Directory
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Student & Faculty Authentication Portal Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-500/8 via-indigo-500/5 to-purple-500/8 border border-blue-500/20 dark:border-blue-500/15 backdrop-blur-md shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium">
              <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                Verified School Portal
              </span>
              <span>·</span>
              <span>
                {isAuthenticated && currentUser
                  ? `Authenticated as ${currentUser.role === 'developer' ? 'App Developer' : currentUser.role === 'teacher' ? 'Faculty Mentor' : 'Student'}`
                  : 'Classes 9–12 & Faculty'}
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
              {isAuthenticated && currentUser
                ? `Welcome back, ${currentUser.name}`
                : 'Join OPG World School PeerForge'}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              {isAuthenticated
                ? 'Your verified profile is active. You can create projects, ask peer questions, and collaborate with classmates.'
                : 'Register or sign in with your school email to create project requests, ask academic doubts, and join campus activities.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => openAuthModal('signup', 'student')}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Student Sign-Up</span>
                </button>
                <button
                  onClick={() => openAuthModal('signup', 'teacher')}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Faculty Portal</span>
                </button>
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-[var(--text-muted)]" />
                  <span>Log In</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => openAuthModal('signup', 'student')}
                  className="px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>New Profile</span>
                </button>
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Switch User</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Directory Metrics Strip */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)]/85 border border-[var(--border-color)] shadow-xs backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-sm shrink-0 num-tabular">
              {totalActiveProfiles}
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active Directory</span>
                <span>·</span>
                <span>Classes 9–12 & Mentors</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mt-0.5">
                Registered Student & Mentor Profiles
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="px-3.5 py-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] num-tabular">
              <strong className="text-[var(--text-primary)]">{developerCount}</strong> Developers
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] num-tabular">
              <strong className="text-[var(--text-primary)]">{teacherCount}</strong> Mentors
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] num-tabular">
              <strong className="text-[var(--text-primary)]">{studentCount}</strong> Students
            </div>
            <button
              onClick={() => setActiveTab('discover')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0"
            >
              <span>Explore All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveTab('ai-finder')}
          className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)]/80 hover:bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-purple-400/50 dark:hover:border-purple-500/50 transition-all text-left shadow-xs hover:shadow-md hover:-translate-y-0.5 group cursor-pointer backdrop-blur-md"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Find Teammates</h3>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">AI skill matchmaking</p>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)]/80 hover:bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-blue-400/50 dark:hover:border-blue-500/50 transition-all text-left shadow-xs hover:shadow-md hover:-translate-y-0.5 group cursor-pointer backdrop-blur-md"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <FolderKanban className="w-5 h-5" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Start Project</h3>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">Recruit peer roles</p>
        </button>

        <button
          onClick={() => setActiveTab('qa')}
          className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)]/80 hover:bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-emerald-400/50 dark:hover:border-emerald-500/50 transition-all text-left shadow-xs hover:shadow-md hover:-translate-y-0.5 group cursor-pointer backdrop-blur-md"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Ask Doubt</h3>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">Questions & answers</p>
        </button>

        <button
          onClick={() => setActiveTab('discover')}
          className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)]/80 hover:bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-indigo-400/50 dark:hover:border-indigo-500/50 transition-all text-left shadow-xs hover:shadow-md hover:-translate-y-0.5 group cursor-pointer backdrop-blur-md"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Browse Directory</h3>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">Verified abilities & grades</p>
        </button>
      </div>

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Projects & Discussions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Open Collaboration Opportunities */}
          <div className="p-6 rounded-3xl bg-[var(--bg-surface)]/85 border border-[var(--border-color)] space-y-4 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Open Project Opportunities
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Collaborate on upcoming science fairs, hackathons, and research teams
                </p>
              </div>
              <button
                onClick={() => setActiveTab('projects')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {recruitingProjects.length === 0 ? (
                <div className="py-8 text-center text-xs text-[var(--text-muted)]">
                  No active projects currently recruiting. Start one today!
                </div>
              ) : (
                recruitingProjects.map(project => (
                  <div
                    key={project.id}
                    onClick={() => {
                      setSelectedProjectForDetail(project);
                      setActiveTab('projects');
                    }}
                    className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-subtle)]/60 hover:bg-[var(--bg-subtle)] border border-[var(--border-color)] hover:border-blue-400/40 transition-all cursor-pointer group space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{project.category}</span>
                        <span>·</span>
                        <span>Lead: {project.ownerName}</span>
                        <span>·</span>
                        <span className="num-tabular">{project.members?.length || 1}/{project.teamSize} Members</span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-blue-600 transition-colors" />
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {project.title}
                    </h4>

                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]/60 text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {project.requiredSkills.slice(0, 3).map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded-md bg-[var(--bg-surface)] text-[10px] font-medium text-[var(--text-secondary)] border border-[var(--border-color)]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {project.openRoles.length} Open {project.openRoles.length === 1 ? 'Role' : 'Roles'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Q&A Discussions */}
          <div className="p-6 rounded-3xl bg-[var(--bg-surface)]/85 border border-[var(--border-color)] space-y-4 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Academic Q&A & Doubts
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Peer discussions and doubt solving across Class 9–12 subjects
                </p>
              </div>
              <button
                onClick={() => setActiveTab('qa')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {recentQuestions.map(q => (
                <div
                  key={q.id}
                  onClick={() => {
                    setSelectedQuestionForDetail(q);
                    setActiveTab('qa');
                  }}
                  className="p-4 rounded-2xl bg-[var(--bg-subtle)]/60 hover:bg-[var(--bg-subtle)] border border-[var(--border-color)] hover:border-blue-400/40 transition-all cursor-pointer group space-y-2"
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{q.topic}</span>
                      <span>·</span>
                      <span>{q.authorName} ({q.authorGrade})</span>
                    </div>
                    <span className="num-tabular">{q.createdAt}</span>
                  </div>

                  <h4 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {q.title}
                  </h4>

                  <p className="text-xs text-[var(--text-secondary)] line-clamp-1 leading-relaxed">
                    {q.body}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-xs text-[var(--text-muted)]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {q.tags.slice(0, 2).map((t, idx) => (
                        <span key={idx} className="text-[11px] text-[var(--text-secondary)]">
                          #{t}
                        </span>
                      ))}
                    </div>
                    <span className="flex items-center gap-1 font-semibold num-tabular">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{q.answersCount} answers</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Suggested Peers & Upcoming Campus Notices */}
        <div className="space-y-6">
          {/* Suggested Peers Spotlight */}
          <div className="p-6 rounded-3xl bg-[var(--bg-surface)]/85 border border-[var(--border-color)] space-y-4 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Peers to Connect
                </h3>
                <p className="text-xs text-[var(--text-muted)]">Verified skills in your grade</p>
              </div>
              <button
                onClick={() => setActiveTab('discover')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Directory</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {suggestedPeers.map(peer => (
                <div
                  key={peer.id}
                  onClick={() => {
                    setSelectedStudentForProfile(peer);
                    setActiveTab('profile');
                  }}
                  className="p-3.5 rounded-2xl bg-[var(--bg-subtle)]/60 hover:bg-[var(--bg-subtle)] border border-[var(--border-color)] hover:border-blue-400/40 transition-all cursor-pointer group flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={peer.avatar}
                      alt={peer.name}
                      className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate group-hover:text-blue-600 transition-colors">
                        {peer.name}
                      </h4>
                      <p className="text-[11px] text-[var(--text-muted)] truncate">
                        {peer.grade} · {peer.skills[0]?.name || 'Student'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedStudentForProfile(peer);
                      setActiveTab('profile');
                    }}
                    className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-500/10 transition-colors shrink-0"
                    title="View Profile"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming School Events & Competitions */}
          <div className="p-6 rounded-3xl bg-[var(--bg-surface)]/85 border border-[var(--border-color)] space-y-4 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Notices & Events
                </h3>
                <p className="text-xs text-[var(--text-muted)]">OPG campus calendar</p>
              </div>
              <button
                onClick={() => setActiveTab('events')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>All notices</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {upcomingEvents.map(evt => (
                <div
                  key={evt.id}
                  onClick={() => setActiveTab('events')}
                  className="p-3.5 rounded-2xl bg-[var(--bg-subtle)]/60 hover:bg-[var(--bg-subtle)] border border-[var(--border-color)] transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
                    <span className="font-semibold text-purple-600 dark:text-purple-400">{evt.category}</span>
                    <span className="num-tabular">{evt.date}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] line-clamp-1">
                    {evt.title}
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2">
                    {evt.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
