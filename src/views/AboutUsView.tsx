import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Users,
  FolderKanban,
  HelpCircle,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Compass,
  ArrowRight,
  HeartHandshake,
  Lightbulb,
  Award
} from 'lucide-react';

export const AboutUsView: React.FC = () => {
  const { setActiveTab } = useApp();

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Hero Header with Campus Scrim & High Contrast Typography */}
      <div className="relative rounded-3xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-md group">
        <div className="relative min-h-[280px] sm:min-h-[320px] w-full overflow-hidden flex flex-col justify-end p-6 sm:p-10">
          <img
            src="/src/assets/images/opg_stem_collaboration_1792943471637.jpg"
            alt="OPG World School STEM Collaboration"
            className="absolute inset-0 w-full h-full object-cover transform-gpu transition-transform duration-700 group-hover:scale-[1.02]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-slate-950/25" />

          <div className="relative z-10 max-w-3xl space-y-3 text-white">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-blue-300">
              <GraduationCap className="w-4 h-4" />
              <span>OPG World School · Sector 19B, Dwarka</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              About PeerForge
            </h1>

            <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed max-w-2xl">
              PeerForge is the internal student talent directory and interdisciplinary collaboration network engineered specifically for OPG World School.
            </p>
          </div>
        </div>
      </div>

      {/* Quantitative Impact Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)]/85 border border-[var(--border-color)] backdrop-blur-md shadow-xs">
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 num-tabular">
            Classes 9–12
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">Inter-grade Collaboration</p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-surface)]/85 border border-[var(--border-color)] backdrop-blur-md shadow-xs">
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400 num-tabular">
            100%
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">Student-Built & Maintained</p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-surface)]/85 border border-[var(--border-color)] backdrop-blur-md shadow-xs">
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 num-tabular">
            20+
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">Curated Skill Domains</p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-surface)]/85 border border-[var(--border-color)] backdrop-blur-md shadow-xs">
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 num-tabular">
            Privacy-First
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">Verified School Community</p>
        </div>
      </div>

      {/* Core Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)]/85 border border-[var(--border-color)] space-y-3.5 shadow-xs backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">Our Mission</h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            To eliminate classroom silos by empowering students with an intelligent directory of peers. Whether you are looking for a Python programmer for an autonomous rover, a graphic designer for an exhibition poster, or a debate research partner for a national MUN, PeerForge surfaces the right teammates based on authentic, declared abilities.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)]/85 border border-[var(--border-color)] space-y-3.5 shadow-xs backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">Our Philosophy</h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            We prioritize real student achievement and peer mentorship over vanity popularity metrics. There are no algorithmic engagement traps, superficial follower counts, or paywalls. Every feature focuses on practical learning, shared curiosity, and hands-on project creation.
          </p>
        </div>
      </div>

      {/* Four Platform Capabilities */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-1">
            <span>Features</span>
            <span>·</span>
            <span>Core Modules</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            How PeerForge Works
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-6 rounded-3xl bg-[var(--bg-surface)]/85 border border-[var(--border-color)] space-y-3 shadow-xs hover:border-purple-400/40 transition-all backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">AI-Assisted Skill Discovery</h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Describe your team needs in natural language. The intelligent matcher parses required proficiencies, explains match rationale, and proposes complementary student partners.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--bg-surface)]/85 border border-[var(--border-color)] space-y-3 shadow-xs hover:border-blue-400/40 transition-all backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FolderKanban className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Project Collaboration Hub</h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Launch projects, define open roles, review peer applications, coordinate milestone checklists, and manage team communication directly in one unified workspace.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--bg-surface)]/85 border border-[var(--border-color)] space-y-3 shadow-xs hover:border-emerald-400/40 transition-all backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Academic Q&A & Doubts</h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Receive verified solutions from classmates across Physics, Mathematics, Computer Science, and Humanities, guided by our automated question clarity coach.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--bg-surface)]/85 border border-[var(--border-color)] space-y-3 shadow-xs hover:border-amber-400/40 transition-all backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Direct Peer Messaging</h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Safely message verified classmates to discuss project openings, prepare presentations, and share resources with quick responses and rich reaction feedback.
            </p>
          </div>
        </div>
      </div>

      {/* Student Leadership & Heritage Spotlight */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 border border-blue-500/20 backdrop-blur-md shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">
          <Award className="w-4 h-4" />
          <span>Student Engineering Initiative</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">
          Built by Students, for Students
        </h3>

        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-3xl">
          PeerForge was initiated by Class 11 students at OPG World School with guidance from the Computer Science and Atal Tinkering Lab (ATL) faculty mentors. Designed to nurture collaboration and academic integrity, the platform operates under school conduct guidelines with privacy controls that keep student data protected.
        </p>

        <div className="pt-2 flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setActiveTab('discover')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Student Directory</span>
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className="px-5 py-2.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Contact Support Desk</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
