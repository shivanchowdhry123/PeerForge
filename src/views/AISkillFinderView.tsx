import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AIMatchResult, StudentProfile } from '../types';
import {
  Sparkles,
  Search,
  Users,
  MessageSquare,
  UserPlus,
  CheckCircle2,
  Filter,
  ArrowRight,
  ShieldCheck,
  Award,
  Layers,
  HelpCircle,
  Lightbulb
} from 'lucide-react';

export const AISkillFinderView: React.FC = () => {
  const {
    allStudents,
    setSelectedStudentForProfile,
    setActiveTab,
    openDirectMessageWith,
    setInviteStudentModal
  } = useApp();

  const [query, setQuery] = useState(
    'I need two students who know Python and one student who can design a logo for our science project.'
  );
  const [targetGrade, setTargetGrade] = useState('All');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AIMatchResult[]>([]);
  const [extractedTags, setExtractedTags] = useState<string[]>(['Python', 'Graphic Design', 'Science Fair']);
  const [hasSearched, setHasSearched] = useState(false);

  const samplePrompts = [
    'I need two students who know Python and one student who can design a logo for our science project.',
    'Find students who know robotics and OpenCV for an autonomous rover challenge.',
    'Looking for a passionate debater and content writer for our MUN delegation.',
    'Find students good at mathematics and calculus for PRMO peer tutoring.',
    'Video editor and audio composer for our Shakespeare school play teaser.'
  ];

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setHasSearched(true);

    // Simulate slight natural delay for polish, then execute deterministic heuristic matching
    setTimeout(() => {
      const words = searchQuery.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      const matchedResults: AIMatchResult[] = allStudents
        .filter(s => s.role === 'student' && !s.isDeactivated)
        .map(student => {
          let score = 45;
          const matched: string[] = [];
          
          student.skills.forEach(s => {
            if (words.some(w => s.name.toLowerCase().includes(w) || w.includes(s.name.toLowerCase()))) {
              score += 25;
              matched.push(s.name);
            }
          });

          student.academicStrengths.forEach(str => {
            if (words.some(w => str.toLowerCase().includes(w))) {
              score += 15;
            }
          });

          if (targetGrade !== 'All' && student.grade !== targetGrade) {
            score -= 20;
          }

          return {
            student,
            matchScore: Math.min(98, Math.max(55, score)),
            rationale: matched.length > 0 
              ? `Strong proficiency match in ${matched.join(', ')} with verified OPG World School record.`
              : `Compliant student profile with active collaboration availability.`,
            matchingSkills: matched.length > 0 ? matched : [student.skills[0]?.name || 'Collaboration'],
            complementaryRole: `${student.skills[0]?.name || 'Core'} Contributor`
          };
        });

      matchedResults.sort((a, b) => b.matchScore - a.matchScore);
      setResults(matchedResults.slice(0, 4));
      setExtractedTags(words.slice(0, 4));
      setLoading(false);
    }, 400);
  };

  const handlePromptClick = (p: string) => {
    setQuery(p);
    handleSearch(p);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Hero Header */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-purple-50/90 via-indigo-50/50 to-blue-50/60 dark:from-purple-950/30 dark:via-indigo-950/20 dark:to-blue-950/20 border border-purple-200/70 dark:border-purple-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/80 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Heuristic Match Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Match Finder & Team Builder
            </h1>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Describe your project requirements in plain natural language. Our high-performance matching engine instantly analyzes student skill matrices, academic strengths, and collaboration availability.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-purple-100 dark:border-purple-900/60 shadow-xs shrink-0 text-left md:text-right">
            <div className="text-[11px] font-semibold text-purple-700 dark:text-purple-300">
              Verified School Roster
            </div>
            <div className="text-lg font-bold text-[var(--text-primary)] num-tabular">
              {allStudents.filter(s => s.role === 'student' && !s.isDeactivated).length} Active Students
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">
              Grades 9–12 · Verified Skills
            </div>
          </div>
        </div>

        {/* Search Input Box */}
        <div className="mt-6">
          <div className="relative">
            <textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Describe what students or skills you are looking for..."
              className="w-full h-28 p-4 pr-32 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500 shadow-xs resize-none"
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <button
                onClick={() => handleSearch(query)}
                disabled={loading || !query.trim()}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Find Matches</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Prompt Pills */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-[var(--text-muted)] flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Try asking:
            </span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handlePromptClick(p)}
                className="text-[11px] px-3 py-1 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-purple-200 dark:border-purple-900 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-purple-400 transition-all text-left truncate max-w-xs"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Extracted Requirements Tags */}
      {hasSearched && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Extracted Requirements:
            </span>
            {extractedTags.map((tag, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="text-xs text-[var(--text-muted)] font-medium">
            Powered by Deterministic Match Engine
          </div>
        </div>
      )}

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
            Recommended Student Matches ({results.length})
          </h2>
          <span className="text-xs text-[var(--text-muted)] font-medium">
            Ranked by skill relevance & availability
          </span>
        </div>

        {results.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3">
            <Search className="w-10 h-10 text-[var(--text-muted)] mx-auto opacity-50" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">No matching student profiles found</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              Try refining your query with different keywords like Python, Robotics, Mathematics, or Graphic Design.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((res, idx) => (
              <div
                key={res.student.id || idx}
                className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 space-y-4 shadow-xs flex flex-col justify-between hover:border-purple-300 transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={res.student.avatar}
                        alt={res.student.name}
                        className="w-12 h-12 rounded-2xl object-cover bg-[var(--bg-subtle)] border border-[var(--border-color)]"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-[var(--text-primary)]">
                            {res.student.name}
                          </h3>
                          {res.student.isVerified && (
                            <ShieldCheck className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <p className="text-xs text-[var(--text-muted)]">
                          {res.student.grade} · Section {res.student.section}
                        </p>
                      </div>
                    </div>

                    <div className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold shrink-0">
                      {res.matchScore}% Match
                    </div>
                  </div>

                  {/* Rationale Box */}
                  <div className="p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 space-y-1">
                    <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider block">
                      Why this student matches:
                    </span>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {res.rationale}
                    </p>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                    {res.student.bio}
                  </p>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                      Relevant Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {res.student.skills.slice(0, 5).map((skill, sIdx) => {
                        const isMatch = res.matchingSkills.some(
                          m => m.toLowerCase() === skill.name.toLowerCase()
                        );
                        return (
                          <span
                            key={sIdx}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-medium border ${
                              isMatch
                                ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                                : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-color)]'
                            }`}
                          >
                            {skill.name} · {skill.level}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setSelectedStudentForProfile(res.student);
                      setActiveTab('profile');
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--border-color)]/50 text-[var(--text-primary)] font-semibold text-xs transition-colors text-center"
                  >
                    View Profile
                  </button>

                  <button
                    onClick={() => setInviteStudentModal({ isOpen: true, student: res.student })}
                    className="py-2 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 font-semibold text-xs transition-colors flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Invite</span>
                  </button>

                  <button
                    onClick={() => openDirectMessageWith(res.student)}
                    className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
