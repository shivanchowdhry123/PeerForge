import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Users,
  FolderKanban,
  HelpCircle,
  GraduationCap
} from 'lucide-react';

export const AboutUsView: React.FC = () => {
  const { setActiveTab } = useApp();

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-surface)] p-8 sm:p-12 shadow-xs">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>OPG World School · Sector 19B, Dwarka</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
            About PeerForge
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            PeerForge is the dedicated student talent networking and collaboration platform for OPG World School.
            It unites students across Grades 9 to 12 to discover complementary skills, form interdisciplinary project
            teams, exchange academic insights, and showcase verified abilities.
          </p>
        </div>
      </div>

      {/* Core Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3 shadow-xs">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Our Mission</h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            To eliminate classroom silos by empowering students with an intelligent directory of peers. Whether you are
            looking for a Python programmer for an autonomous rover, a Figma designer for an exhibition poster, or a
            mathematics partner for Olympiad prep, PeerForge surfaces the right teammates based on authentic, declared
            skills.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3 shadow-xs">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Our Philosophy</h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            We prioritize real student achievement and peer mentorship over vanity popularity metrics. There are no
            public leaderboards, algorithmic engagement traps, or superficial badges. Every interaction focuses on
            practical learning, shared curiosity, and hands-on project creation.
          </p>
        </div>
      </div>

      {/* Four Pillars */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Platform Capabilities</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2.5 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">AI-Assisted Skill Discovery</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Describe your team needs in everyday language. The AI parses required proficiencies, explains match
              rationale, and proposes complementary student partners.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2.5 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FolderKanban className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Project Collaboration Hub</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Launch projects, define open roles, review peer applications, coordinate milestone checklists, and run team
              chats directly in the workspace.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2.5 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Academic Q&A Forum</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Get peer answers across Physics, Mathematics, Computer Science, and Humanities, backed by an AI Question
              Coach that detects existing queries and suggests precise tags.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2.5 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Direct Peer Messaging</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Connect directly with verified students to discuss project roles, plan presentations, and share resources
              with message replies and emoji reactions.
            </p>
          </div>
        </div>
      </div>


    </div>
  );
};
