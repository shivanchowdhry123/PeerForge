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
  const [aiSource, setAiSource] = useState<string>('gemini-3.8-flash');
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

    try {
      const res = await fetch('/api/ai/match-students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          targetGrade
        })
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
        setExtractedTags(data.extractedRequirements || []);
        setAiSource(data.aiSource || 'gemini-3.8-flash');
      } else {
        throw new Error('Search failed');
      }
    } catch (err) {
      console.warn('AI search error, using client fallback', err);
      // Fallback matching
      const words = searchQuery.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      const fallbackMatches: AIMatchResult[] = allStudents.filter(s => !s.isDeactivated).map(student => {
        let score = 40;
        const matched: string[] = [];
        student.skills.forEach(s => {
          if (words.some(w => s.name.toLowerCase().includes(w))) {
            score += 25;
            matched.push(s.name);
          }
        });
        return {
          student,
          matchScore: Math.min(97, score),
          rationale: `Matched based on proficiency in ${matched.join(', ') || 'related subjects'}.`,
          matchingSkills: matched.length > 0 ? matched : [student.skills[0]?.name || 'Collaboration'],
          complementaryRole: `${student.skills[0]?.name || 'Core'} Contributor`
        };
      });
      fallbackMatches.sort((a, b) => b.matchScore - a.matchScore);
      setResults(fallbackMatches.slice(0, 4));
      setExtractedTags(words.slice(0, 3));
      setAiSource('semantic-matcher');
    } finally {
      setLoading(false);
    }
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
              <span>AI-Assisted Student Discovery</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Find Complementary Talent Across OPG World School
            </h1>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Describe your project needs in plain natural language. Our safe school AI analyzes student
              profiles, verified abilities, and collaboration availability to recommend the optimal team.
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
              rows={3}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="e.g. I need two students who know Python and one student who can design a logo for our science project..."
              className="w-full p-4 text-sm sm:text-base rounded-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600 shadow-sm"
            />
            <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[var(--text-secondary)]">Target Grade:</span>
                <select
                  value={targetGrade}
                  onChange={e => setTargetGrade(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-slate-800 border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                >
                  <option value="All">All Grades (9–12)</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </select>
              </div>

              <button
                onClick={() => handleSearch(query)}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-98 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Student Profiles...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Find Matching Students</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sample queries */}
        <div className="mt-4 pt-4 border-t border-purple-200/60 dark:border-purple-800/40">
          <span className="text-xs font-semibold text-[var(--text-secondary)] block mb-2">
            Suggested Prompts:
          </span>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handlePromptClick(p)}
                className="px-3 py-1.5 text-xs text-left rounded-lg bg-white/80 dark:bg-slate-900/80 hover:bg-white text-[var(--text-secondary)] hover:text-purple-700 border border-purple-100 dark:border-purple-900/60 transition-colors shadow-2xs"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Extracted Requirements Bar */}
      {extractedTags.length > 0 && (
        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="font-semibold text-[var(--text-primary)]">Extracted Requirements:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {extractedTags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-medium"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <span className="text-[11px] text-[var(--text-muted)]">
            Powered by {aiSource === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Semantic Engine'}
          </span>
        </div>
      )}

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            {hasSearched ? `Recommended Student Matches (${results.length})` : 'Featured Student Talent'}
          </h2>
          <span className="text-xs text-[var(--text-muted)]">
            Ranked by skill relevance & availability
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3">
            <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Querying verified school profile database...
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Matching declared proficiencies and collaboration preferences
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="p-10 text-center rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3">
            <Users className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Click &quot;Find Matching Students&quot; or select a sample prompt above
            </p>
            <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
              Our AI discovery engine will cross-reference technical skills, creative abilities, and project
              histories.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((result, idx) => {
              const student = result.student;
              return (
                <div
                  key={student.id}
                  className="rounded-2xl p-5 bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-purple-300 dark:hover:border-purple-700 transition-all shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Avatar, Name, Score */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 object-cover shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-base text-[var(--text-primary)]">
                              {student.name}
                            </span>
                            {student.isVerified && (
                              <span title="School Verified Student">
                                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[var(--text-muted)]">
                            {student.grade} · Section {student.section}
                          </div>
                        </div>
                      </div>

                      {/* Match Score Badge */}
                      <div className="text-right shrink-0">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold num-tabular">
                          <Sparkles className="w-3 h-3 text-emerald-500" />
                          <span>{result.matchScore}% Match</span>
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                          {result.complementaryRole}
                        </span>
                      </div>
                    </div>

                    {/* AI Rationale Box */}
                    <div className="mt-3.5 p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-xs text-purple-900 dark:text-purple-200 space-y-1">
                      <div className="font-semibold flex items-center gap-1 text-[11px] text-purple-700 dark:text-purple-300">
                        <Lightbulb className="w-3 h-3" />
                        <span>Why this student matches:</span>
                      </div>
                      <p className="leading-relaxed">{result.rationale}</p>
                    </div>

                    {/* Bio snippet */}
                    <p className="text-xs text-[var(--text-secondary)] mt-3 line-clamp-2 leading-relaxed">
                      {student.bio}
                    </p>

                    {/* Skills list */}
                    <div className="mt-3 space-y-1.5">
                      <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
                        Relevant Skills
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {student.skills.map((s, sIdx) => {
                          const isHighlighted = result.matchingSkills.some(
                            ms => ms.toLowerCase() === s.name.toLowerCase()
                          );
                          return (
                            <span
                              key={sIdx}
                              className={`text-[11px] px-2 py-0.5 rounded-md border font-medium ${
                                isHighlighted
                                  ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 font-semibold'
                                  : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-color)]'
                              }`}
                            >
                              {s.name} · <span className="text-[10px] opacity-80">{s.level}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-[var(--border-color)] flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedStudentForProfile(student);
                        setActiveTab('profile');
                      }}
                      className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-[var(--bg-subtle)] hover:bg-[var(--border-color)]/60 text-[var(--text-primary)] border border-[var(--border-color)] transition-colors text-center"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => setInviteStudentModal({ isOpen: true, student })}
                      className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-colors flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Invite</span>
                    </button>
                    <button
                      onClick={() => openDirectMessageWith(student)}
                      className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Message</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
