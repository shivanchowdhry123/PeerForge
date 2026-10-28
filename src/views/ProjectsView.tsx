import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Project, ProjectRole } from '../types';
import {
  FolderKanban,
  Search,
  Plus,
  Users,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowLeft,
  CheckSquare,
  Square,
  Clock,
  UserPlus,
  MessageSquare,
  Award,
  Lightbulb,
  ShieldCheck
} from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const {
    currentUser,
    isAuthenticated,
    openAuthModal,
    projects,
    selectedProjectForDetail,
    setSelectedProjectForDetail,
    createProject,
    applyToProject,
    handleProjectApplication,
    developerAcceptApplication,
    toggleProjectTask,
    setActiveTab,
    setActiveConversationId
  } = useApp();

  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Collect all pending applications across all projects for Developer review
  const allPendingApplications = (projects || []).flatMap(p =>
    (p.applications || [])
      .filter(a => a && a.status === 'pending')
      .map(a => ({ app: a, project: p }))
  );

  // Create Project Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projCategory, setProjCategory] = useState('Robotics & Hardware');
  const [projSkills, setProjSkills] = useState('Python, Arduino, 3D CAD');
  const [projDeadline, setProjDeadline] = useState('2026-11-30');
  const [roleTitle1, setRoleTitle1] = useState('Hardware Engineer');
  const [roleTitle2, setRoleTitle2] = useState('UI / Poster Designer');

  // AI Brainstorming inside modal
  const [isBrainstorming, setIsBrainstorming] = useState(false);
  const [brainstormIdea, setBrainstormIdea] = useState('');

  // Apply to role modal
  const [applyModalRole, setApplyModalRole] = useState<{ role: ProjectRole; project: Project } | null>(null);
  const [applyNote, setApplyNote] = useState('');

  const categories = [
    'All',
    'Robotics & Hardware',
    'Environmental Science',
    'Computer Science & Web',
    'Arts & Media',
    'General Innovation'
  ];

  const handleBrainstormWithAI = async () => {
    if (!brainstormIdea.trim()) return;
    setIsBrainstorming(true);
    try {
      const res = await fetch('/api/ai/brainstorm-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: brainstormIdea, category: projCategory })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.projectTitle) setProjTitle(data.projectTitle);
        if (data.refinedDescription) setProjDesc(data.refinedDescription);
        if (data.recommendedRoles && data.recommendedRoles.length >= 2) {
          setRoleTitle1(data.recommendedRoles[0].roleTitle);
          setRoleTitle2(data.recommendedRoles[1].roleTitle);
          setProjSkills(data.recommendedRoles.map((r: any) => r.requiredSkill).join(', '));
        }
      }
    } catch (e) {
      console.warn('AI brainstorm error', e);
    } finally {
      setIsBrainstorming(false);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim() || !projDesc.trim()) return;

    const skillsArray = projSkills.split(',').map(s => s.trim()).filter(Boolean);
    createProject({
      title: projTitle.trim(),
      description: projDesc.trim(),
      category: projCategory,
      deadline: projDeadline,
      requiredSkills: skillsArray,
      openRoles: [
        {
          id: `role-${Date.now()}-1`,
          title: roleTitle1 || 'Core Developer',
          requiredSkill: skillsArray[0] || 'Technical',
          status: 'open'
        },
        {
          id: `role-${Date.now()}-2`,
          title: roleTitle2 || 'Designer / Documenter',
          requiredSkill: skillsArray[1] || 'Design',
          status: 'open'
        }
      ]
    });

    setIsCreateModalOpen(false);
    setProjTitle('');
    setProjDesc('');
    setBrainstormIdea('');
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyModalRole) return;
    applyToProject(applyModalRole.project.id, applyModalRole.role.id, applyModalRole.role.title, applyNote);
    setApplyModalRole(null);
    setApplyNote('');
    alert('Your application has been sent to the project lead!');
  };

  const filteredProjects = (projects || []).filter(p => {
    if (statusFilter !== 'All' && p.status !== statusFilter) return false;
    if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchSkill = p.requiredSkills.some(s => s.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchSkill) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Project Detail View */}
      {selectedProjectForDetail ? (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedProjectForDetail(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Projects</span>
          </button>

          {/* Project Header Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {selectedProjectForDetail.category}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      selectedProjectForDetail.status === 'recruiting'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    {selectedProjectForDetail.status === 'recruiting' ? 'Actively Recruiting' : 'In Progress'}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">
                  {selectedProjectForDetail.title}
                </h1>

                <div className="text-xs text-[var(--text-muted)] flex items-center gap-2 flex-wrap">
                  <span>Led by {selectedProjectForDetail.ownerName} ({selectedProjectForDetail.ownerGrade})</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Target Deadline: {selectedProjectForDetail.deadline}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setActiveTab('messages');
                  }}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--border-color)]/60 text-[var(--text-primary)] border border-[var(--border-color)] text-xs font-semibold flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Team Chat</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('ai-finder');
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Match Candidates</span>
                </button>
              </div>
            </div>

            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {selectedProjectForDetail.description}
            </p>

            {/* Required Skills tags */}
            <div className="pt-2 border-t border-[var(--border-color)]/70 flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-[var(--text-muted)] mr-1">Required Skills:</span>
              {selectedProjectForDetail.requiredSkills.map((sk, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-medium"
                >
                  {sk}
                </span>
              ))}
            </div>
          </div>

          {/* 2-Column Split: Open Roles & Applications on Left, Team & Tasks on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Open Roles */}
              <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-[var(--text-primary)]">
                    Team Roles ({selectedProjectForDetail.openRoles.length})
                  </h2>
                  <span className="text-xs text-[var(--text-muted)]">
                    Target Team Size: {selectedProjectForDetail.teamSize} students
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedProjectForDetail.openRoles.map(role => (
                    <div
                      key={role.id}
                      className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                            {role.title}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                              role.status === 'open'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {role.status === 'open' ? 'Open Role' : 'Filled'}
                          </span>
                        </div>
                        <div className="text-xs text-[var(--text-muted)] mt-0.5">
                          Required Ability: <span className="text-blue-600 dark:text-blue-400 font-medium">{role.requiredSkill}</span>
                          {role.assigneeName && <span> · Assigned to: {role.assigneeName}</span>}
                        </div>
                      </div>

                      {role.status === 'open' && (
                        <button
                          onClick={() => setApplyModalRole({ role, project: selectedProjectForDetail })}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shrink-0"
                        >
                          Apply for Role
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Owner & Developer Authority: Applicant Applications Queue */}
              {currentUser && (selectedProjectForDetail.ownerId === currentUser.id || currentUser.role === 'developer') && (
                <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-[var(--text-primary)]">
                          Incoming Candidate Applications ({selectedProjectForDetail.applications.length})
                        </h2>
                        {currentUser.role === 'developer' && selectedProjectForDetail.ownerId !== currentUser.id && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                            Developer Rights Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">
                        {currentUser.role === 'developer' && selectedProjectForDetail.ownerId !== currentUser.id
                          ? 'As a Platform Developer, you have rights to accept candidates for developers, teachers, and student roles.'
                          : 'Review submissions and accept peer teammates'}
                      </p>
                    </div>
                  </div>

                  {selectedProjectForDetail.applications.length === 0 ? (
                    <p className="text-xs text-[var(--text-muted)] italic">
                      No applications submitted yet. Use &quot;AI Match Candidates&quot; to invite matching peers!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {selectedProjectForDetail.applications.map(app => (
                        <div
                          key={app.id}
                          className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={app.studentAvatar}
                                alt={app.studentName}
                                className="w-9 h-9 rounded-xl bg-blue-100 object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <span className="text-xs font-bold text-[var(--text-primary)] block">
                                  {app.studentName} ({app.studentGrade})
                                </span>
                                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                                  Applied for: {app.roleTitle}
                                </span>
                              </div>
                            </div>

                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                app.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : app.status === 'accepted'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {app.status.toUpperCase()}
                            </span>
                          </div>

                          <p className="text-xs text-[var(--text-secondary)] italic bg-white dark:bg-slate-900/60 p-2.5 rounded-xl border border-[var(--border-color)]">
                            &quot;{app.note}&quot;
                          </p>

                          {app.approvedBy && (
                            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                              ✓ {app.approvedBy}
                            </p>
                          )}

                          {app.status === 'pending' && (
                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                onClick={() =>
                                  handleProjectApplication(
                                    selectedProjectForDetail.id,
                                    app.id,
                                    'rejected'
                                  )
                                }
                                className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() =>
                                  currentUser && currentUser.role === 'developer' && selectedProjectForDetail.ownerId !== currentUser.id
                                    ? developerAcceptApplication(selectedProjectForDetail.id, app.id)
                                    : handleProjectApplication(
                                        selectedProjectForDetail.id,
                                        app.id,
                                        'accepted'
                                      )
                                }
                                className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-2xs flex items-center gap-1.5"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>
                                  {currentUser && currentUser.role === 'developer' && selectedProjectForDetail.ownerId !== currentUser.id
                                    ? 'Accept as Developer'
                                    : 'Accept into Team'}
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Members & Task Checklist */}
            <div className="space-y-6">
              {/* Confirmed Team Members */}
              <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Current Team Members</h3>
                <div className="space-y-2.5">
                  {selectedProjectForDetail.members.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <img
                        src={m.avatar}
                        alt={m.name}
                        className="w-8 h-8 rounded-xl bg-blue-100 object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[var(--text-primary)] block truncate">
                          {m.name}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">{m.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks & Milestones */}
              <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Project Milestones</h3>
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 num-tabular">
                    {selectedProjectForDetail.tasks.filter(t => t.completed).length} /{' '}
                    {selectedProjectForDetail.tasks.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedProjectForDetail.tasks.map(task => (
                    <button
                      key={task.id}
                      onClick={() => toggleProjectTask(selectedProjectForDetail.id, task.id)}
                      className="w-full text-left flex items-start gap-2.5 p-2 rounded-xl hover:bg-[var(--bg-subtle)] transition-colors group"
                    >
                      {task.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-[var(--text-muted)] shrink-0 mt-0.5" />
                      )}
                      <span
                        className={`text-xs ${
                          task.completed
                            ? 'line-through text-[var(--text-muted)]'
                            : 'text-[var(--text-primary)] font-medium'
                        }`}
                      >
                        {task.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Project Directory */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
                Projects & Collaboration
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
                Join student innovation teams or launch your own inter-house initiative
              </p>
            </div>

            <button
              onClick={() => {
                if (!isAuthenticated) {
                  openAuthModal('login');
                } else {
                  setIsCreateModalOpen(true);
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          </div>

          {/* Developer Rights & Cross-Approval Console */}
          {currentUser?.role === 'developer' && (
            <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border-2 border-blue-500/30 shadow-sm space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-extrabold text-[var(--text-primary)]">
                        Developer Rights & Cross-Approval Console
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                        Cross-Role Authority Active
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">
                      As a Platform Developer, you have authority to accept and approve submissions and role applications for other developers, teachers, and student researchers.
                    </p>
                  </div>
                </div>
                <div className="text-xs text-[var(--text-secondary)] font-medium">
                  Pending Applications: <strong className="text-blue-600 dark:text-blue-400">{allPendingApplications.length}</strong>
                </div>
              </div>

              {allPendingApplications.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] text-center text-xs text-[var(--text-muted)]">
                  All pending candidate submissions for other developers and teachers have been reviewed and accepted.
                </div>
              ) : (
                <div className="space-y-3">
                  {allPendingApplications.map(({ app, project }) => {
                    const isDevRole =
                      app.roleTitle.toLowerCase().includes('dev') ||
                      app.roleTitle.toLowerCase().includes('firmware') ||
                      app.roleTitle.toLowerCase().includes('engineer');
                    const isTeacherRole =
                      app.roleTitle.toLowerCase().includes('faculty') ||
                      app.roleTitle.toLowerCase().includes('advisor') ||
                      app.roleTitle.toLowerCase().includes('mentor') ||
                      app.studentGrade.toLowerCase().includes('faculty');

                    return (
                      <div
                        key={app.id}
                        className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={app.studentAvatar}
                            alt={app.studentName}
                            className="w-10 h-10 rounded-xl bg-blue-100 object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-[var(--text-primary)]">
                                {app.studentName}
                              </span>
                              <span className="text-[11px] text-[var(--text-muted)]">
                                ({app.studentGrade})
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                Project: {project.title}
                              </span>
                              {isDevRole && (
                                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                                  Developer Role
                                </span>
                              )}
                              {isTeacherRole && (
                                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                  Faculty / Teacher Role
                                </span>
                              )}
                            </div>

                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                              Applied for: <strong>{app.roleTitle}</strong> · Project Lead: {project.ownerName}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)] italic mt-1 line-clamp-2">
                              &quot;{app.note}&quot;
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                          <button
                            onClick={() => handleProjectApplication(project.id, app.id, 'rejected')}
                            className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() =>
                              developerAcceptApplication(
                                project.id,
                                app.id,
                                'Approved via Developer Console'
                              )
                            }
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>
                              Accept for {isDevRole ? 'Developer' : isTeacherRole ? 'Teacher' : 'Role'}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Filters & Search */}
          <div className="p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search projects by title, description, or required skill..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[var(--text-secondary)]">Status:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-medium rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="recruiting">Actively Recruiting</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[var(--border-color)]/70 text-xs">
              <span className="text-[11px] font-semibold text-[var(--text-muted)] mr-1">Category:</span>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    categoryFilter === cat
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredProjects.map(project => (
              <div
                key={project.id}
                className="rounded-3xl p-6 bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-blue-300 dark:hover:border-blue-800 transition-all shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        {project.category}
                      </span>
                      <h3 className="text-base font-bold text-[var(--text-primary)] mt-0.5">
                        {project.title}
                      </h3>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Lead: {project.ownerName} ({project.ownerGrade})
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        project.status === 'recruiting'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {project.status === 'recruiting' ? 'Recruiting' : 'Active'}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] line-clamp-3 leading-relaxed mt-2.5">
                    {project.description}
                  </p>

                  {/* Open Roles preview */}
                  <div className="mt-4 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
                      Open Roles ({project.openRoles.filter(r => r.status === 'open').length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {project.openRoles.map(r => (
                        <span
                          key={r.id}
                          className={`text-[11px] px-2 py-0.5 rounded-md border font-medium ${
                            r.status === 'open'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border-[var(--border-color)] line-through'
                          }`}
                        >
                          {r.title}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span className="num-tabular">{project.members.length} Members</span>
                  </span>

                  <button
                    onClick={() => setSelectedProjectForDetail(project)}
                    className="py-1.5 px-4 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-colors"
                  >
                    View Project & Apply →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Project Modal with AI Brainstormer */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-[var(--border-color)] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Launch a Student Project
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {/* AI Brainstorming Helper Box */}
            <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-800 dark:text-purple-300">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>AI Project Brainstormer & Role Planner</span>
              </div>
              <p className="text-[11px] text-purple-900 dark:text-purple-200">
                Have a rough idea? Enter a few words and our AI will suggest project scope, required skills, and key roles!
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Solar powered hydroponic herbs garden for the school cafeteria..."
                  value={brainstormIdea}
                  onChange={e => setBrainstormIdea(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-700 text-[var(--text-primary)] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleBrainstormWithAI}
                  disabled={isBrainstorming || !brainstormIdea.trim()}
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shrink-0 disabled:opacity-50"
                >
                  {isBrainstorming ? 'Planning...' : 'Brainstorm'}
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                  Project Title:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Quadcopter Autonomous Obstacle Avoidance"
                  value={projTitle}
                  onChange={e => setProjTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                    Category:
                  </label>
                  <select
                    value={projCategory}
                    onChange={e => setProjCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                  >
                    <option value="Robotics & Hardware">Robotics & Hardware</option>
                    <option value="Environmental Science">Environmental Science</option>
                    <option value="Computer Science & Web">Computer Science & Web</option>
                    <option value="Arts & Media">Arts & Media</option>
                    <option value="General Innovation">General Innovation</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                    Target Exhibition Date:
                  </label>
                  <input
                    type="date"
                    value={projDeadline}
                    onChange={e => setProjDeadline(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                  Project Description & Goals:
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail the problem you want to solve, what equipment is involved, and what your team aims to construct..."
                  value={projDesc}
                  onChange={e => setProjDesc(e.target.value)}
                  className="w-full p-3 text-xs sm:text-sm rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                  Required Skills (comma separated):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Python, OpenCV, Arduino, 3D CAD"
                  value={projSkills}
                  onChange={e => setProjSkills(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                    Open Role #1:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hardware Lead"
                    value={roleTitle1}
                    onChange={e => setRoleTitle1(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                    Open Role #2:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Graphic Designer"
                    value={roleTitle2}
                    onChange={e => setRoleTitle2(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                >
                  Publish Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply to Role Modal */}
      {applyModalRole && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] rounded-3xl max-w-md w-full p-6 border border-[var(--border-color)] shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Apply for Role: {applyModalRole.role.title}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Project: <span className="font-semibold text-[var(--text-primary)]">{applyModalRole.project.title}</span>
            </p>

            <form onSubmit={handleApplySubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                  Introduce your skills & interest:
                </label>
                <textarea
                  rows={4}
                  placeholder="Share your experience with the required skill, past projects, or why you want to contribute..."
                  value={applyNote}
                  onChange={e => setApplyNote(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyModalRole(null)}
                  className="px-4 py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
