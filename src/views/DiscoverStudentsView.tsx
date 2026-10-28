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
  ChevronDown,
  Layers
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
      // Role check: display students and mentors
      if (activeSearchQuery.trim()) {
        const q = activeSearchQuery.toLowerCase();
        const matchesName = student.name.toLowerCase().includes(q);
        const matchesBio = student.bio.toLowerCase().includes(q);
        const matchesSkill = student.skills.some(s => s.name.toLowerCase().includes(q));
        const matchesInterest = student.interests.some(i => i.toLowerCase().includes(q));
        const matchesSubject = student.academicStrengths.some(s => s.toLowerCase().includes(q));
        if (!matchesName && !matchesBio && !matchesSkill && !matchesInterest && !matchesSubject) {
          return false;
        }
      }

      if (selectedGrade !== 'All' && student.grade !== selectedGrade) {
        return false;
      }

      if (selectedCategory !== 'All' && !student.skills.some(s => s.category === selectedCategory)) {
        return false;
      }

      if (selectedAvailability !== 'All' && student.availability !== selectedAvailability) {
        return false;
      }

      if (selectedSkillTag !== 'All' && !student.skills.some(s => s.name.toLowerCase() === selectedSkillTag.toLowerCase())) {
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Discover OPG Students
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            Browse verified peer abilities, creative talents, and academic backgrounds
          </p>
        </div>

        <button
          onClick={() => setActiveTab('ai-finder')}
          className="px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-semibold flex items-center gap-2 self-start sm:self-auto transition-colors"
        >
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span>Switch to AI Skill Search</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search by student name, skill, interest, or academic subject..."
              value={activeSearchQuery}
              onChange={e => setActiveSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Grade selector */}
            <select
              value={selectedGrade}
              onChange={e => setSelectedGrade(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
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
              className="px-3 py-2 text-xs font-medium rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
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
              className="px-3 py-2 text-xs font-medium rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
            >
              <option value="All">All Availabilities</option>
              <option value="Active & Seeking Projects">Active & Seeking Projects</option>
              <option value="Open to Collaborate">Open to Collaborate</option>
              <option value="Focusing on Studies / Busy">Focusing on Studies</option>
            </select>
          </div>
        </div>

        {/* Quick Skill Tags Filter */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[var(--border-color)]/70 text-xs">
          <span className="text-[11px] font-semibold text-[var(--text-muted)] mr-1">Popular Skills:</span>
          <button
            onClick={() => setSelectedSkillTag('All')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              selectedSkillTag === 'All'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            All
          </button>
          {allAvailableSkills.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedSkillTag(tag)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                selectedSkillTag === tag
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map(student => (
          <div
            key={student.id}
            className="rounded-3xl p-5 bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-blue-300 dark:hover:border-blue-800 transition-all shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Top row: Avatar, Name, Grade & Section */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm sm:text-base text-[var(--text-primary)]">
                        {student.name}
                      </span>
                      {student.isVerified && (
                        <span title="Verified OPG Student">
                          <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-[var(--text-muted)] mt-0.5">
                      <span>{student.grade} · {student.role === 'teacher' ? 'Faculty' : `Section ${student.section}`}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        student.role === 'developer'
                          ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                          : student.role === 'teacher'
                          ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                          : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                      }`}>
                        {student.role === 'developer' ? 'App Developer' : student.role === 'teacher' ? 'Faculty Mentor' : 'Student'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Availability status badge */}
                <div
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    student.availability === 'Active & Seeking Projects'
                      ? 'bg-emerald-500'
                      : student.availability === 'Open to Collaborate'
                      ? 'bg-blue-500'
                      : 'bg-amber-500'
                  }`}
                  title={student.availability}
                />
              </div>

              {/* Bio */}
              <p className="text-xs text-[var(--text-secondary)] mt-3 line-clamp-2 leading-relaxed">
                {student.bio}
              </p>

              {/* Skills */}
              <div className="mt-3.5 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
                  Declared Skills
                </span>
                <div className="flex flex-wrap gap-1">
                  {student.skills.slice(0, 4).map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 rounded-md bg-[var(--bg-subtle)] text-[11px] font-medium text-[var(--text-primary)] border border-[var(--border-color)] flex items-center gap-1"
                    >
                      <span>{skill.name}</span>
                      <span className="text-[9px] text-[var(--text-muted)]">({skill.level})</span>
                    </span>
                  ))}
                  {student.skills.length > 4 && (
                    <span className="px-1.5 py-0.5 text-[10px] text-[var(--text-muted)] font-medium">
                      +{student.skills.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Interests & Subjects */}
              <div className="mt-3 pt-3 border-t border-[var(--border-color)]/60 text-[11px] text-[var(--text-muted)] space-y-1">
                <div>
                  <span className="font-semibold text-[var(--text-secondary)]">Interests: </span>
                  <span>{(student.interests || []).slice(0, 3).join(', ')}</span>
                </div>
                <div>
                  <span className="font-semibold text-[var(--text-secondary)]">Strengths: </span>
                  <span>{(student.academicStrengths || []).slice(0, 3).join(', ')}</span>
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
                className="flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold bg-[var(--bg-subtle)] hover:bg-[var(--border-color)]/60 text-[var(--text-primary)] border border-[var(--border-color)] transition-colors text-center"
              >
                Profile
              </button>
              <button
                onClick={() => setInviteStudentModal({ isOpen: true, student })}
                className="p-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-colors"
                title="Invite to your project"
              >
                <UserPlus className="w-4 h-4" />
              </button>
              <button
                onClick={() => openDirectMessageWith(student)}
                className="py-1.5 px-3 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            No students found matching your criteria.
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Try resetting your search query or selecting &quot;All Grades&quot;.
          </p>
        </div>
      )}
    </div>
  );
};
