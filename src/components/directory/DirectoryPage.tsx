import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Award, 
  Star, 
  MapPin, 
  CheckCircle2, 
  Sparkles, 
  Grid, 
  List, 
  BookOpen, 
  ThumbsUp, 
  ChevronRight,
  ExternalLink,
  UserPlus,
  ShieldCheck
} from 'lucide-react';
import { StudentProfile, Department, GradeLevel, AvailabilityStatus, ALL_GRADE_LEVELS } from '../../types';
import { filterProfiles } from '../../utils/matching';

interface DirectoryPageProps {
  profiles: StudentProfile[];
  onSelectProfile: (profile: StudentProfile) => void;
  onEndorseSkill: (profileId: string, skillId: string) => Promise<void>;
  onOpenQuestionnaire: () => void;
  onOpenRegister: () => void;
  onClearMockData?: () => Promise<void>;
  onRestoreMockData?: () => Promise<void>;
}

const DEPARTMENTS: (Department | 'All Departments')[] = [
  'All Departments',
  'STEM & Coding',
  'Humanities & Writing',
  'Languages & Linguistics',
  'Visual & Performing Arts',
  'Robotics & Engineering',
  'Business, Debate & Civics',
  'Athletics & Wellness'
];

export const DirectoryPage: React.FC<DirectoryPageProps> = ({
  profiles,
  onSelectProfile,
  onEndorseSkill,
  onOpenQuestionnaire,
  onOpenRegister,
  onClearMockData,
  onRestoreMockData
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [gradeFilter, setGradeFilter] = useState('All Grades');
  const [availabilityFilter, setAvailabilityFilter] = useState('All Statuses');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredProfiles = filterProfiles(
    profiles,
    searchQuery,
    departmentFilter,
    gradeFilter,
    availabilityFilter,
    verifiedOnly,
    sortBy
  );

  const certifiedCount = profiles.filter((p) => p.isPeerTutorCertified).length;
  const availableNowCount = profiles.filter((p) => p.availability === 'Available Now').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Directory Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/60 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              OPG World School Directory
            </span>
            {profiles.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {profiles.length} Registered Student{profiles.length === 1 ? '' : 's'}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Student Talent &amp; Mentorship Directory
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real registered students across Classes 1–12, Alumni, and Faculty. Sign up to add your profile, offer peer tutoring, or find study partners.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenRegister}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-500 via-emerald-600 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <UserPlus className="w-4 h-4 text-emerald-200" />
            <span>Register as a Student</span>
          </button>

          <button
            onClick={onOpenQuestionnaire}
            className="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Match Me</span>
          </button>
        </div>
      </div>

      {/* Live Directory Status Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">Live Student Directory</span>
          <span className="text-slate-400">• Real student registrations</span>
        </div>

        <div className="flex items-center gap-4 text-slate-300">
          <span>
            Total Registered: <span className="text-white font-bold">{profiles.length}</span>
          </span>
          <button
            onClick={onOpenRegister}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            + Register New Student
          </button>
        </div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
        {/* Top search & views */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, handle, skill (Calculus, Python, French), or course (AP Chem)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="recommended">Sort: Recommended</option>
              <option value="endorsements">Sort: Most Endorsements</option>
              <option value="sessions">Sort: Most Sessions</option>
              <option value="rating">Sort: Highest Rating</option>
              <option value="name">Sort: Name (A-Z)</option>
            </select>

            <div className="flex items-center rounded-xl bg-slate-800 border border-slate-700 p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs ${
                  viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                aria-label="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs ${
                  viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Multi-facet Filter Pills */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-800/80">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="All Grades">All Classes &amp; Grades</option>
            {ALL_GRADE_LEVELS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="All Statuses">All Availability</option>
            <option value="Available Now">Available Now</option>
            <option value="Accepting Tutees">Accepting Tutees</option>
            <option value="Study Partner Only">Study Partner Only</option>
          </select>

          <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 cursor-pointer hover:bg-slate-800 select-none">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded bg-slate-900 border-slate-600 text-indigo-600 focus:ring-0"
            />
            <span className="flex items-center gap-1 font-medium">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              Certified Tutors Only
            </span>
          </label>

          {(departmentFilter !== 'All Departments' ||
            gradeFilter !== 'All Grades' ||
            availabilityFilter !== 'All Statuses' ||
            verifiedOnly ||
            searchQuery) && (
            <button
              onClick={() => {
                setDepartmentFilter('All Departments');
                setGradeFilter('All Grades');
                setAvailabilityFilter('All Statuses');
                setVerifiedOnly(false);
                setSearchQuery('');
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Counter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <div>
            Showing <span className="text-white font-semibold">{filteredProfiles.length}</span> students
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {availableNowCount} available today
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Award className="w-3 h-3 text-emerald-400" />
              {certifiedCount} certified mentors
            </span>
          </div>
        </div>
      </div>

      {/* Empty State when no profiles match */}
      {filteredProfiles.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto">
            <UserPlus className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-white font-display">
              {profiles.length === 0 ? 'No Students Registered Yet' : 'No Profiles Match Your Search'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {profiles.length === 0
                ? 'Be the very first real Oakridge student to register your account, list your classes, and share your skills!'
                : 'Try adjusting your search query, or clear your department/grade filters.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenRegister}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Register as a Student Now
            </button>
            {profiles.length > 0 && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setDepartmentFilter('All Departments');
                  setGradeFilter('All Grades');
                  setAvailabilityFilter('All Statuses');
                  setVerifiedOnly(false);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Clear Search &amp; Filters
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProfiles.map((p) => {
            const totalEndorsements = p.skills.reduce((sum, s) => sum + s.endorsementsCount, 0);

            return (
              <div
                key={p.id}
                onClick={() => onSelectProfile(p)}
                className={`group relative bg-slate-900 border hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/5 rounded-2xl p-5 transition-all cursor-pointer flex flex-col justify-between ${
                  p.isRealRegistration ? 'border-emerald-700/60 ring-1 ring-emerald-500/30' : 'border-slate-800'
                }`}
              >
                <div className="space-y-3">
                  {/* Top user row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.avatarUrl}
                        alt={p.fullName}
                        className={`w-12 h-12 rounded-xl object-cover ring-1 transition-colors ${
                          p.isRealRegistration ? 'ring-emerald-500/60' : 'ring-slate-700 group-hover:ring-indigo-500/50'
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                            {p.fullName}
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-400">{p.handle}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        p.availability === 'Available Now'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/50'
                          : p.availability === 'Accepting Tutees'
                          ? 'bg-indigo-950/80 text-indigo-300 border-indigo-800/50'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {p.availability}
                    </span>
                  </div>

                  {/* Badges: Grade, Department, Certification, Real Registration Badge */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {p.isRealRegistration && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-700/60 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Registered Student
                      </span>
                    )}
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                      {p.grade}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/60 text-slate-400">
                      {p.department}
                    </span>
                    {p.isPeerTutorCertified && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40 flex items-center gap-1">
                        <Award className="w-3 h-3 text-indigo-400" />
                        Tutor
                      </span>
                    )}
                  </div>

                  {/* Bio snippet */}
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {p.bio}
                  </p>

                  {/* Skills tags */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Key Skills ({p.skills.length})</span>
                      <span>{totalEndorsements} endorsements</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {p.skills.slice(0, 3).map((s) => (
                        <span
                          key={s.id}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60 flex items-center gap-1"
                        >
                          {s.name}
                          <span className="text-slate-400 text-[9px]">+{s.endorsementsCount}</span>
                        </span>
                      ))}
                      {p.skills.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          +{p.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Coursework snippet */}
                  {p.enrolledClasses.length > 0 && (
                    <div className="pt-1">
                      <p className="text-[10px] text-slate-400 uppercase font-medium tracking-wider mb-1">
                        Recent Classes
                      </p>
                      <p className="text-[11px] text-indigo-300 truncate font-mono">
                        {p.enrolledClasses.slice(0, 2).join(' • ')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Row / Stats & Connect CTA */}
                <div className="pt-4 mt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 font-bold text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{p.rating.toFixed(1)}</span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      ({p.totalSessionsCompleted} sessions)
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    View Profile
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">
          {filteredProfiles.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectProfile(p)}
              className="p-4 hover:bg-slate-850/60 hover:bg-slate-800/40 transition-colors cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <img
                  src={p.avatarUrl}
                  alt={p.fullName}
                  className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700 flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-white hover:text-indigo-300">{p.fullName}</h3>
                    {p.isRealRegistration && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                        Registered
                      </span>
                    )}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {p.grade}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-400">
                      {p.department}
                    </span>
                    {p.isPeerTutorCertified && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40 flex items-center gap-1">
                        <Award className="w-3 h-3 text-indigo-400" />
                        Certified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 truncate mt-0.5">{p.bio}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs w-full md:w-auto justify-between md:justify-end">
                <div className="flex flex-wrap gap-1 max-w-xs">
                  {p.skills.slice(0, 2).map((s) => (
                    <span
                      key={s.id}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{p.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{p.totalSessionsCompleted} sessions</span>
                </div>

                <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
