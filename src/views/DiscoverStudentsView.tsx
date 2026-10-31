import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { StudentProfile } from '../types';
import {
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  UserPlus,
  BookOpen,
  Award,
  ShieldCheck,
  ChevronRight,
  User,
  RotateCcw
} from 'lucide-react';

export const DiscoverStudentsView: React.FC = () => {
  const {
    allStudents,
    setSelectedStudentForProfile,
    setActiveTab,
    openDirectMessageWith,
    setInviteStudentModal,
    activeSearchQuery,
    setActiveSearchQuery
  } = useApp();

  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('All');
  const [selectedSkillTag, setSelectedSkillTag] = useState<string>('All');

  // Filter students
  const filteredStudents = useMemo(() => {
    return (allStudents || []).filter(student => {
      if (!student || student.isDeactivated) return false;
      if (activeSearchQuery.trim()) {
        const q = activeSearchQuery.toLowerCase();
        const matchesName = student.name.toLowerCase().includes(q);
        const matchesBio = (student.bio || '').toLowerCase().includes(q);
        const matchesSkill = (student.skills || []).some(s => s.name.toLowerCase().includes(q));
        const matchesInterest = (student.interests || []).some(i => i.toLowerCase().includes(q));
        const matchesSubject = (student.academicStrengths || []).some(s => s.toLowerCase().includes(q));
        if (!matchesName && !matchesBio && !matchesSkill && !matchesInterest && !matchesSubject) {
          return false;
        }
      }

      if (selectedGrade !== 'All' && student.grade !== selectedGrade) {
        return false;
      }

      if (selectedCategory !== 'All' && !(student.skills || []).some(s => s.category === selectedCategory)) {
        return false;
      }

      if (selectedAvailability !== 'All' && student.availability !== selectedAvailability) {
        return false;
      }

      if (selectedSkillTag !== 'All' && !(student.skills || []).some(s => s.name.toLowerCase() === selectedSkillTag.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [allStudents, activeSearchQuery, selectedGrade, selectedCategory, selectedAvailability, selectedSkillTag]);

  const allAvailableSkills = useMemo(() => {
    const set = new Set<string>();
    (allStudents || []).forEach(s => (s.skills || []).forEach(sk => sk.name && set.add(sk.name)));
    return Array.from(set).slice(0, 10);
  }, [allStudents]);

  const handleResetFilters = () => {
    setActiveSearchQuery('');
    setSelectedGrade('All');
    setSelectedCategory('All');
    setSelectedAvailability('All');
    setSelectedSkillTag('All');
  };

  const hasActiveFilters =
    Boolean(activeSearchQuery) ||
    selectedGrade !== 'All' ||
    selectedCategory !== 'All' ||
    selectedAvailability !== 'All' ||
    selectedSkillTag !== 'All';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-1">
            <span>OPG World School</span>
            <span>·</span>
            <span>Student Talent Directory</span>
            <span>·</span>
            <span className="num-tabular font-medium">{filteredStudents.length} Profiles Listed</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Student & Talent Directory
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            Discover peers across Grades 9–12 with complementary skills for science fairs, robotics, debate, and study groups.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('ai-finder')}
          className="px-4 py-2.5 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-700 dark:text-purple-300 border border-purple-500/20 text-xs font-semibold flex items-center gap-2 self-start sm:self-auto transition-all cursor-pointer backdrop-blur-md"
        >
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span>AI Match Finder</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-3xl bg-[var(--bg-surface)]/85 border border-[var(--border-color)] space-y-4 shadow-xs backdrop-blur-md">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search by student name, skill, interest, or academic subject..."
              value={activeSearchQuery}
              onChange={e => setActiveSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Grade selector */}
            <select
              value={selectedGrade}
              onChange={e => setSelectedGrade(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none cursor-pointer"
            >
              <option value="All">All Grades</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>

            {/* Category selector */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none cursor-pointer"
            >
              <option value="All">All Skill Domains</option>
              <option value="Technical">Technical</option>
              <option value="Creative">Creative</option>
              <option value="Academic">Academic</option>
              <option value="Leadership & Sports">Leadership & Sports</option>
            </select>

            {/* Availability selector */}
            <select
              value={selectedAvailability}
              onChange={e => setSelectedAvailability(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none cursor-pointer"
            >
              <option value="All">All Availabilities</option>
              <option value="Active & Seeking Projects">Seeking Projects</option>
              <option value="Open to Collaborate">Open to Collaborate</option>
              <option value="Focusing on Studies / Busy">Studies Focus</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] border border-[var(--border-color)] transition-colors cursor-pointer"
                title="Reset filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Skill Tags Filter */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2.5 border-t border-[var(--border-color)]/70 text-xs">
          <span className="text-[11px] font-semibold text-[var(--text-muted)] mr-1">Popular Skills:</span>
          <button
            onClick={() => setSelectedSkillTag('All')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedSkillTag === 'All'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            All
          </button>
          {allAvailableSkills.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedSkillTag(tag)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedSkillTag === tag
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStudents.map(student => (
          <div
            key={student.id}
            className="rounded-3xl p-6 bg-[var(--bg-surface)]/85 hover:bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-blue-400/50 dark:hover:border-blue-500/50 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-1 flex flex-col justify-between space-y-4 backdrop-blur-md"
          >
            <div>
              {/* Top row: Avatar, Name, Grade & Availability */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-13 h-13 rounded-2xl bg-blue-100 dark:bg-blue-900 object-cover ring-2 ring-[var(--border-color)]"
                      referrerPolicy="no-referrer"
                    />
                    {student.isVerified && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center ring-2 ring-[var(--bg-surface)]" title="Verified OPG Student">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-[var(--text-primary)] leading-snug">
                      {student.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mt-0.5">
                      <span>{student.grade}</span>
                      <span>·</span>
                      <span>{student.role === 'teacher' ? 'Faculty' : `Sec ${student.section || 'A'}`}</span>
                    </div>
                  </div>
                </div>

                {/* Status indicator with explicit label */}
                <span
                  title={student.availability}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 max-w-[110px] truncate ${
                    student.availability === 'Active & Seeking Projects'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                      : student.availability === 'Open to Collaborate'
                      ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20'
                      : student.availability === 'Focusing on Studies / Busy'
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                      : 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20'
                  }`}
                >
                  {student.availability === 'Active & Seeking Projects'
                    ? 'Seeking'
                    : student.availability === 'Open to Collaborate'
                    ? 'Open'
                    : student.availability === 'Focusing on Studies / Busy'
                    ? 'Studies'
                    : student.availability || 'Active'}
                </span>
              </div>

              {/* Bio */}
              <p className="text-xs text-[var(--text-secondary)] mt-3.5 line-clamp-2 leading-relaxed">
                {student.bio || 'OPG student collaborating on academic projects and peer mentorship.'}
              </p>

              {/* Declared Skills */}
              <div className="mt-4 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
                  Top Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(student.skills || []).slice(0, 4).map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2.5 py-1 rounded-lg bg-[var(--bg-subtle)] text-[11px] font-medium text-[var(--text-primary)] border border-[var(--border-color)] flex items-center gap-1.5"
                    >
                      <span>{skill.name}</span>
                      <span className="text-[9px] text-[var(--text-muted)]">{skill.level}</span>
                    </span>
                  ))}
                  {(student.skills || []).length > 4 && (
                    <span className="px-2 py-1 text-[10px] text-[var(--text-muted)] font-medium">
                      +{(student.skills || []).length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Interests & Strengths */}
              <div className="mt-3.5 pt-3 border-t border-[var(--border-color)]/60 text-[11px] text-[var(--text-muted)] space-y-1">
                <div className="truncate">
                  <span className="font-semibold text-[var(--text-secondary)]">Interests: </span>
                  <span>{(student.interests || []).slice(0, 3).join(', ') || 'Robotics, Science, Debate'}</span>
                </div>
                <div className="truncate">
                  <span className="font-semibold text-[var(--text-secondary)]">Strengths: </span>
                  <span>{(student.academicStrengths || []).slice(0, 3).join(', ') || 'Mathematics, Computer Science'}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3.5 border-t border-[var(--border-color)] flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedStudentForProfile(student);
                  setActiveTab('profile');
                }}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] text-[var(--text-primary)] border border-[var(--border-color)] transition-colors text-center cursor-pointer"
              >
                Profile
              </button>
              <button
                onClick={() => setInviteStudentModal({ isOpen: true, student })}
                className="p-2 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-700 dark:text-purple-300 border border-purple-500/20 transition-colors cursor-pointer"
                title="Invite to your project"
              >
                <UserPlus className="w-4 h-4" />
              </button>
              <button
                onClick={() => openDirectMessageWith(student)}
                className="py-2 px-3.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-[var(--bg-surface)]/85 border border-[var(--border-color)] space-y-3 backdrop-blur-md">
          <p className="text-sm font-bold text-[var(--text-primary)]">
            No students found matching your criteria
          </p>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
            Try adjusting your search keyword or clearing the grade/availability filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};
