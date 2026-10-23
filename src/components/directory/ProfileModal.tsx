import React, { useState } from 'react';
import { 
  X, 
  Award, 
  Star, 
  MapPin, 
  Mail, 
  Send, 
  CheckCircle2, 
  BookOpen, 
  ThumbsUp, 
  MessageSquare,
  Sparkles,
  Calendar
} from 'lucide-react';
import { StudentProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface ProfileModalProps {
  profile: StudentProfile | null;
  onClose: () => void;
  onEndorseSkill: (profileId: string, skillId: string) => Promise<void>;
  onRequestSession: (profile: StudentProfile, subject: string, message: string) => void;
  onOpenDirectMessage?: (profile: StudentProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  onClose,
  onEndorseSkill,
  onRequestSession,
  onOpenDirectMessage
}) => {
  const { profile: currentUserProfile } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [sessionMessage, setSessionMessage] = useState('');
  const [sessionSent, setSessionSent] = useState(false);
  const [isEndorsing, setIsEndorsing] = useState<string | null>(null);

  if (!profile) return null;

  const handleEndorse = async (skillId: string) => {
    setIsEndorsing(skillId);
    await onEndorseSkill(profile.id, skillId);
    setIsEndorsing(null);
  };

  const handleSendSession = (e: React.FormEvent) => {
    e.preventDefault();
    const subjectToSend = selectedSubject || profile.tutoringSubjects[0] || 'General Academic Coaching';
    onRequestSession(profile, subjectToSend, sessionMessage);
    setSessionSent(true);
    setTimeout(() => {
      setSessionSent(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Banner with profile background glow */}
        <div className="relative h-20 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 px-6 py-3 flex justify-between items-start border-b border-slate-800">
          {onOpenDirectMessage && (
            <button
              onClick={() => {
                onClose();
                onOpenDirectMessage(profile);
              }}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-200" />
              <span>Reach Out Directly</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors ml-auto"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>


        {/* Profile Card Header Info */}
        <div className="px-6 pb-4 pt-2 -mt-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-end gap-4">
            <img
              src={profile.avatarUrl}
              alt={profile.fullName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-slate-900 shadow-xl flex-shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white font-display">{profile.fullName}</h2>
                <span className="text-xs text-slate-400 font-mono">{profile.handle}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {profile.isRealRegistration && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Registered Student
                  </span>
                )}
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                  {profile.grade}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                  {profile.department}
                </span>
                {profile.isPeerTutorCertified && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800/50 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    Certified Tutor
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="flex items-center sm:justify-end gap-1 text-sm font-bold text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{profile.rating.toFixed(1)}</span>
              <span className="text-xs text-slate-400 font-normal">({profile.totalSessionsCompleted} sessions)</span>
            </div>
            <span
              className={`inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${
                profile.availability === 'Available Now'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                  : profile.availability === 'Accepting Tutees'
                  ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/40'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              ● {profile.availability}
            </span>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Bio */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              About &amp; Focus
            </h4>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{profile.bio}</p>
          </div>

          {/* Enrolled Courses */}
          {profile.enrolledClasses && profile.enrolledClasses.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                Current &amp; Completed Coursework
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {profile.enrolledClasses.map((cls) => (
                  <span
                    key={cls}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs border border-slate-700/60 font-medium"
                  >
                    {cls}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tutoring Specialties */}
          {profile.tutoringSubjects && profile.tutoringSubjects.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Peer Tutoring Specialties
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {profile.tutoringSubjects.map((sub) => (
                  <span
                    key={sub}
                    className="px-2.5 py-1 rounded-lg bg-indigo-950/70 text-indigo-300 text-xs border border-indigo-800/50 font-semibold"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Endorsable Skills */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-indigo-400" />
                Peer-Endorsed Skills
              </h4>
              <span className="text-[11px] text-slate-400">Click + to endorse peer</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <span className="text-xs font-medium text-white">{skill.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-slate-300">
                    {skill.endorsementsCount}
                  </span>
                  <button
                    onClick={() => handleEndorse(skill.id)}
                    disabled={isEndorsing === skill.id}
                    className="ml-1 text-indigo-400 hover:text-indigo-300 p-0.5 rounded hover:bg-slate-700 transition-colors"
                    title={`Endorse ${profile.fullName} for ${skill.name}`}
                    aria-label={`Endorse ${profile.fullName} for ${skill.name}`}
                  >
                    <ThumbsUp className={`w-3 h-3 ${isEndorsing === skill.id ? 'animate-bounce' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Details & Campus Locations */}
          <div className="p-4 rounded-xl bg-slate-850 bg-slate-800/40 border border-slate-700/60 space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              School Contact &amp; On-Campus Meetup
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <a href={`mailto:${profile.email}`} className="text-indigo-300 hover:underline truncate">
                  {profile.email}
                </a>
              </div>
              {profile.contactMethods.campusLocation && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">{profile.contactMethods.campusLocation}</span>
                </div>
              )}
              {profile.contactMethods.discord && (
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  <span className="truncate">Discord: {profile.contactMethods.discord}</span>
                </div>
              )}
            </div>
          </div>

          {/* Request Mentorship / Study Session Form */}
          <div className="pt-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              Request Study Session with {profile.fullName.split(' ')[0]}
            </h4>

            {sessionSent ? (
              <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Session Request Dispatched!</p>
                  <p className="text-[11px] text-emerald-200">
                    A notification was sent to {profile.email}. Check your school inbox for scheduling.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendSession} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Select Subject</label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      {profile.tutoringSubjects.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                      <option value="General Academic Coaching">General Coaching</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Your Identity</label>
                    <input
                      type="text"
                      disabled
                      value={`${currentUserProfile?.fullName || 'Logged-in Student'} (${currentUserProfile?.email || 'me@oakridge.edu'})`}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Message / Free Periods (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={sessionMessage}
                    onChange={(e) => setSessionMessage(e.target.value)}
                    placeholder="e.g. Free during 4th period study hall or Wednesday 3:30 PM. Stuck on partial fractions!"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Session Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
