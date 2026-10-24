import React from 'react';
import { 
  Sparkles, 
  Users, 
  HelpCircle, 
  Award, 
  Star, 
  ArrowRight, 
  BookOpen, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Compass,
  Cpu,
  GraduationCap,
  HeartHandshake
} from 'lucide-react';
import { StudentProfile, RequestTicket } from '../../types';
import { SCHOOL_STATS } from '../../services/seedData';

interface HomePageProps {
  profiles: StudentProfile[];
  requests: RequestTicket[];
  onNavigate: (tab: 'home' | 'directory' | 'requests' | 'about') => void;
  onOpenQuestionnaire: () => void;
  onSelectProfile: (profile: StudentProfile) => void;
  onOpenRegister: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  profiles,
  requests,
  onNavigate,
  onOpenQuestionnaire,
  onSelectProfile,
  onOpenRegister
}) => {
  const featuredMentors = profiles.filter((p) => p.isPeerTutorCertified).slice(0, 4);
  const activeRequests = requests.filter((r) => r.status === 'Open').slice(0, 3);

  const academicHubs = [
    {
      name: 'STEM & Computer Science',
      icon: Cpu,
      tutorsCount: 84,
      desc: 'AP Calculus, AP Physics C, Java, Python, Chemistry & Biology',
      color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-300'
    },
    {
      name: 'Robotics & Engineering',
      icon: Compass,
      tutorsCount: 36,
      desc: 'CAD (OnShape), 3D Printing, Arduino C++, Circuit Soldering',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300'
    },
    {
      name: 'Humanities & Writing',
      icon: BookOpen,
      tutorsCount: 52,
      desc: 'AP Lang rhetoric, College essay polishing, DBQs, Literature',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300'
    },
    {
      name: 'Languages & World Cultures',
      icon: GraduationCap,
      tutorsCount: 29,
      desc: 'French, Spanish, Mandarin conversation practice & DELF prep',
      color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-300'
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.15),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(16,185,129,0.08),transparent_50%)] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Tagline Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Official Student Talent &amp; Mentorship Network
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verified School Directory
            </span>
          </div>

          {/* Hero Titles */}
          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] font-display">
              Connect with peers who{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                master what you study.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Break through academic silos. Match with certified peer tutors, AP test veterans, robotics teammates, and study partners across our 1,000+ student body in seconds.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center gap-2.5 sm:gap-3 pt-2">
            <button
              onClick={onOpenRegister}
              className="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-500 via-emerald-600 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>Register as a Student</span>
            </button>

            <button
              onClick={onOpenQuestionnaire}
              className="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Launch Matcher</span>
            </button>

            <button
              onClick={() => onNavigate('directory')}
              className="px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Explore Directory</span>
            </button>

            <button
              onClick={() => onNavigate('requests')}
              className="px-4 py-3 rounded-xl font-medium text-xs sm:text-sm text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-center gap-2 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Help Board ({requests.filter((r) => r.status === 'Open').length})</span>
            </button>
          </div>

          {/* Live School Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-8 border-t border-slate-800/80">
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                {profiles.length}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Enrolled Student Profiles</p>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-display">
                {profiles.filter((p) => p.isPeerTutorCertified).length}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Certified Peer Mentors</p>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-display">
                {requests.filter((r) => r.status === 'Open').length}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Active Help Requests</p>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-display">
                {SCHOOL_STATS.matchSatisfactionRate}%
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Peer Rating Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Matcher Teaser Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-800/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Rapid Question-Based Search
            </span>
            <h2 className="text-2xl font-bold text-white font-display">
              Stuck on tonight’s problem set?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Answer 3 brief questions about your course and urgency. Our matching algorithm scans peer availability, AP scores, and verified endorsements to pair you with the best mentor in under 60 seconds.
            </p>
          </div>

          <button
            onClick={onOpenQuestionnaire}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 whitespace-nowrap transition-transform hover:scale-105"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Launch Questionnaire</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </section>

      {/* Featured Peer Mentors Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" />
              Verified Students &amp; Tutors
            </div>
            <h2 className="text-2xl font-bold text-white font-display">
              Featured Registered Peers
            </h2>
          </div>
          <button
            onClick={() => onNavigate('directory')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            View all {profiles.length} student{profiles.length === 1 ? '' : 's'} in directory
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {profiles.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-lg font-bold text-white font-display">Student Registration is Open</h3>
              <p className="text-xs sm:text-sm text-slate-400">
                All mock profiles have been purged. Be the first real student to register your skills, courses, and study hall availability.
              </p>
            </div>
            <button
              onClick={onOpenRegister}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white shadow-lg shadow-emerald-600/20 transition-all hover:scale-105"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Register Real Student Profile</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {profiles.slice(0, 4).map((mentor) => (
              <div
                key={mentor.id}
                onClick={() => onSelectProfile(mentor)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all hover:shadow-xl hover:shadow-indigo-500/5 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={mentor.avatarUrl}
                      alt={mentor.fullName}
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-700"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white hover:text-indigo-300">
                        {mentor.fullName}
                      </h3>
                      <p className="text-[11px] text-slate-400">{mentor.grade}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <Award className="w-3.5 h-3.5" />
                    <span>{mentor.isPeerTutorCertified ? 'Certified Peer Tutor' : 'Registered Student'}</span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {mentor.bio}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {mentor.skills.slice(0, 2).map((s) => (
                      <span
                        key={s.id}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{mentor.rating ? mentor.rating.toFixed(1) : '5.0'}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-indigo-400">View Profile →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Academic Hubs Explorer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Curriculum Coverage
          </span>
          <h2 className="text-2xl font-bold text-white font-display mt-0.5">
            Explore Academic Hubs
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {academicHubs.map((hub) => {
            const Icon = hub.icon;
            return (
              <div
                key={hub.name}
                onClick={() => onNavigate('directory')}
                className={`p-5 rounded-2xl border bg-gradient-to-b ${hub.color} hover:scale-[1.02] transition-all cursor-pointer space-y-3`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{hub.name}</h3>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{hub.desc}</p>
                </div>
                <div className="pt-2 flex items-center justify-between text-xs font-medium text-slate-400">
                  <span>{hub.tutorsCount} active tutors</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent Open Help Requests Ticker */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Live School Activity
            </span>
            <h2 className="text-2xl font-bold text-white font-display mt-0.5">
              Active Help Requests
            </h2>
          </div>
          <button
            onClick={() => onNavigate('requests')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            Open Request Board
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeRequests.map((req) => (
            <div
              key={req.id}
              onClick={() => onNavigate('requests')}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800/50">
                  {req.urgency}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(req.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white line-clamp-1">{req.title}</h4>
              <p className="text-xs text-slate-400 line-clamp-2">{req.description}</p>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] text-indigo-300 font-medium">{req.subject}</span>
                <span className="text-indigo-400 font-semibold hover:underline">Offer Help →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works / 3 Steps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-8">
          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Designed for 1,000+ Students
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              A friction-free workflow that pairs students based on coursework, availability, and verified skill endorsements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 flex items-center justify-center font-bold font-display">
                01
              </div>
              <h3 className="text-sm font-bold text-white">State Your Goal</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Take the 60-second interactive questionnaire or post a ticket to the school-wide request board.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold font-display">
                02
              </div>
              <h3 className="text-sm font-bold text-white">Smart Match Scoring</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our algorithm calculates curriculum overlap, grade level preference, and verified tutor credentials.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-600/30 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold font-display">
                03
              </div>
              <h3 className="text-sm font-bold text-white">Collaborate &amp; Endorse</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Meet in campus study halls or Discord. After your session, endorse your peer’s specific subject skills.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
