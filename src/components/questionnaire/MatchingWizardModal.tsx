import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  BookOpen, 
  Clock, 
  MapPin, 
  User, 
  Send, 
  ExternalLink,
  Award,
  Star
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudentProfile, Department, UrgencyLevel, GradeLevel, QuestionnaireAnswers, MatchScoreResult, ALL_GRADE_LEVELS } from '../../types';
import { calculateMatchScore } from '../../utils/matching';

interface MatchingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: StudentProfile[];
  onSelectProfile: (profile: StudentProfile) => void;
  onCreateRequestTicket: (ticket: {
    title: string;
    description: string;
    subject: string;
    department: Department;
    urgency: UrgencyLevel;
    preferredLocation: string;
    tags: string[];
  }) => void;
}

const DEPARTMENTS: Department[] = [
  'STEM & Coding',
  'Humanities & Writing',
  'Languages & Linguistics',
  'Visual & Performing Arts',
  'Robotics & Engineering',
  'Business, Debate & Civics',
  'Athletics & Wellness'
];

const POPULAR_SUBJECTS: Record<Department, string[]> = {
  'STEM & Coding': ['AP Calculus BC', 'AP Computer Science A', 'AP Physics C', 'AP Chemistry', 'AP Biology', 'AP Statistics'],
  'Humanities & Writing': ['AP English Language', 'AP US History', 'Creative Writing', 'College Essays', 'Philosophy'],
  'Languages & Linguistics': ['AP French Language', 'AP Spanish Language', 'Mandarin Chinese', 'German I/II'],
  'Visual & Performing Arts': ['AP Music Theory', 'Studio Art 2D', 'Digital Media / Figma', 'Orchestra Sight Reading'],
  'Robotics & Engineering': ['FIRST Robotics CAD (OnShape)', 'Arduino C++', 'Circuit Soldering', '3D Printing'],
  'Business, Debate & Civics': ['Model UN Crisis', 'Lincoln-Douglas Debate', 'AP Macroeconomics', 'AP US Gov'],
  'Athletics & Wellness': ['Study Skills & Habits', 'Exam Stress Coaching', 'Peer Tutoring Strategy']
};

export const MatchingWizardModal: React.FC<MatchingWizardModalProps> = ({
  isOpen,
  onClose,
  profiles,
  onSelectProfile,
  onCreateRequestTicket
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [department, setDepartment] = useState<Department>('STEM & Coding');
  const [subject, setSubject] = useState<string>('AP Calculus BC');
  const [customSubject, setCustomSubject] = useState<string>('');
  const [needType, setNeedType] = useState<QuestionnaireAnswers['needType']>('one-on-one-tutor');
  const [targetGrade, setTargetGrade] = useState<GradeLevel | 'Any Grade'>('Any Grade');
  const [urgency, setUrgency] = useState<UrgencyLevel>('Urgent (2-3 Days)');
  const [locationPreference, setLocationPreference] = useState<QuestionnaireAnswers['locationPreference']>('In-Person (School Library/Labs)');
  const [specificTopicNotes, setSpecificTopicNotes] = useState<string>('');

  // Results State
  const [matches, setMatches] = useState<MatchScoreResult[]>([]);
  const [postedSuccess, setPostedSuccess] = useState(false);

  if (!isOpen) return null;

  const currentSubject = customSubject.trim() ? customSubject.trim() : subject;

  const handleCalculateMatches = () => {
    const answers: QuestionnaireAnswers = {
      needType,
      subject: currentSubject,
      department,
      targetGrade,
      urgency,
      locationPreference,
      specificTopicNotes
    };

    const scored = profiles.map((p) => calculateMatchScore(p, answers));
    scored.sort((a, b) => b.score - a.score);

    setMatches(scored.slice(0, 5));
    setStep(4);

    // Fire confetti celebration if high match
    if (scored.length > 0 && scored[0].score >= 70) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }
    }
  };

  const handlePostAsRequest = () => {
    onCreateRequestTicket({
      title: `Looking for assistance with ${currentSubject}`,
      description: specificTopicNotes.trim()
        ? specificTopicNotes
        : `Seeking a peer mentor or study partner for ${currentSubject} (${needType.replace(/-/g, ' ')}).`,
      subject: currentSubject,
      department,
      urgency,
      preferredLocation: locationPreference,
      tags: [currentSubject, department.split(' ')[0], needType]
    });
    setPostedSuccess(true);
    setTimeout(() => {
      onClose();
      setPostedSuccess(false);
      setStep(1);
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Interactive Talent Matcher</h3>
              <p className="text-xs text-slate-400">Oakridge Academy Peer Recommendation Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicator */}
        <div className="px-6 py-3 bg-slate-850/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'
              }`}
            >
              1
            </span>
            <span className={step === 1 ? 'text-white font-medium' : ''}>Subject</span>
          </div>
          <div className="w-8 h-0.5 bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'
              }`}
            >
              2
            </span>
            <span className={step === 2 ? 'text-white font-medium' : ''}>Mode</span>
          </div>
          <div className="w-8 h-0.5 bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'
              }`}
            >
              3
            </span>
            <span className={step === 3 ? 'text-white font-medium' : ''}>Details</span>
          </div>
          <div className="w-8 h-0.5 bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                step === 4 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'
              }`}
            >
              4
            </span>
            <span className={step === 4 ? 'text-white font-medium' : ''}>Top Matches</span>
          </div>
        </div>

        {/* Modal Body / Steps */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  1. Select Academic Department
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DEPARTMENTS.map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => {
                        setDepartment(dept);
                        setSubject(POPULAR_SUBJECTS[dept][0]);
                        setCustomSubject('');
                      }}
                      className={`p-2.5 rounded-xl text-left border text-xs font-medium transition-all ${
                        department === dept
                          ? 'border-indigo-500 bg-indigo-950/60 text-white ring-1 ring-indigo-500/50 shadow-sm'
                          : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  2. Choose Specific Course or Subject
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {POPULAR_SUBJECTS[department].map((subj) => (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => {
                        setSubject(subj);
                        setCustomSubject('');
                      }}
                      className={`p-2 rounded-lg text-left text-xs font-medium border transition-colors ${
                        subject === subj && !customSubject
                          ? 'border-indigo-500 bg-indigo-600/30 text-white'
                          : 'border-slate-800 bg-slate-800/30 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {subj}
                    </button>
                  ))}
                </div>

                <div className="mt-3">
                  <label className="block text-[11px] text-slate-400 mb-1">Or enter another custom class / topic:</label>
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="e.g. AP Macroeconomics, Python PyTorch, French Subjunctive..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  What kind of collaboration do you need?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: 'one-on-one-tutor',
                      title: '1-on-1 Peer Tutoring',
                      desc: 'Weekly or single-session deep dive with an experienced senior or peer.'
                    },
                    {
                      id: 'exam-cram',
                      title: 'Rapid Exam Cram Session',
                      desc: 'Urgent prep before an upcoming quiz, midterm, or AP exam.'
                    },
                    {
                      id: 'study-group',
                      title: 'Study Partner / Group',
                      desc: 'Accountability partner to solve problem sets together.'
                    },
                    {
                      id: 'project-partner',
                      title: 'Project / Competition Teammate',
                      desc: 'Co-builder for hackathons, science fairs, or group projects.'
                    }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setNeedType(item.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        needType === item.id
                          ? 'border-indigo-500 bg-indigo-950/60 text-white ring-1 ring-indigo-500/50'
                          : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <h4 className="text-xs font-bold text-white mb-0.5">{item.title}</h4>
                      <p className="text-[11px] text-slate-400">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Preferred Session Location
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(
                    [
                      'In-Person (School Library/Labs)',
                      'Virtual (Meet/Discord)',
                      'Hybrid / Flexible'
                    ] as const
                  ).map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setLocationPreference(loc)}
                      className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-colors ${
                        locationPreference === loc
                          ? 'border-indigo-500 bg-indigo-600/30 text-white'
                          : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5 inline mr-1 text-indigo-400" />
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    How urgently do you need help?
                  </label>
                  <div className="space-y-2">
                    {(
                      [
                        'Critical (Next 24h)',
                        'Urgent (2-3 Days)',
                        'Standard (This Week)',
                        'Ongoing Project'
                      ] as UrgencyLevel[]
                    ).map((urg) => (
                      <button
                        key={urg}
                        type="button"
                        onClick={() => setUrgency(urg)}
                        className={`w-full p-2.5 rounded-lg border text-left text-xs font-medium flex items-center justify-between ${
                          urgency === urg
                            ? 'border-indigo-500 bg-indigo-600/30 text-white'
                            : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>{urg}</span>
                        {urg.includes('Critical') && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Mentor Grade Level Preference
                  </label>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {(['Any Grade', ...ALL_GRADE_LEVELS] as const).map((gr) => (
                      <button
                        key={gr}
                        type="button"
                        onClick={() => setTargetGrade(gr as any)}
                        className={`w-full p-2 rounded-lg border text-left text-xs font-medium ${
                          targetGrade === gr
                            ? 'border-indigo-500 bg-indigo-600/30 text-white'
                            : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {gr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Specific topics, problem sets, or goals (Optional)
                </label>
                <textarea
                  rows={3}
                  value={specificTopicNotes}
                  onChange={(e) => setSpecificTopicNotes(e.target.value)}
                  placeholder="e.g. Preparing for Unit 5 test on Friday, need help with Taylor series polynomial formulas and radius of convergence..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between bg-indigo-950/40 border border-indigo-800/50 rounded-xl p-3">
                <div>
                  <p className="text-xs font-semibold text-indigo-200">
                    Matches for: <span className="text-white font-bold">{currentSubject}</span>
                  </p>
                  <p className="text-[11px] text-indigo-300/80">
                    Calculated across {profiles.length} registered school profiles
                  </p>
                </div>
                <button
                  onClick={handlePostAsRequest}
                  disabled={postedSuccess}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{postedSuccess ? 'Posted to Board!' : 'Post to Request Board'}</span>
                </button>
              </div>

              {postedSuccess && (
                <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Your request has been published to the Request Board. Peers will be notified!
                </div>
              )}

              <div className="space-y-3">
                {matches.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <p className="text-sm">No direct mentors found for this exact combination.</p>
                    <button
                      onClick={handlePostAsRequest}
                      className="mt-3 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg"
                    >
                      Post as a School-Wide Help Ticket
                    </button>
                  </div>
                ) : (
                  matches.map((res, idx) => (
                    <div
                      key={res.profile.id}
                      className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <img
                          src={res.profile.avatarUrl}
                          alt={res.profile.fullName}
                          className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-700"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-white">{res.profile.fullName}</h4>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                              {res.profile.grade}
                            </span>
                            {res.profile.isPeerTutorCertified && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40 flex items-center gap-1">
                                <Award className="w-3 h-3" /> Certified Tutor
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-300 line-clamp-1">{res.profile.bio}</p>

                          <div className="flex flex-wrap gap-1 pt-1">
                            {res.matchReasons.map((reason, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-800/30 flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-2.5 h-2.5 text-indigo-400" />
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                        <div className="text-right">
                          <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1 justify-end">
                            <span className="text-lg font-extrabold">{res.score}%</span> Match
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span>{res.profile.rating.toFixed(1)}</span>
                            <span>({res.profile.totalSessionsCompleted} sessions)</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            onClose();
                            onSelectProfile(res.profile);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                        >
                          View Profile &amp; Contact
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          {step > 1 && step < 4 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => (s + 1) as any)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/25"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : step === 3 ? (
            <button
              onClick={handleCalculateMatches}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white flex items-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Calculate Best Matches
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                setStep(1);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
