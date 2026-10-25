import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  GraduationCap, 
  BookOpen, 
  Sparkles, 
  Tag, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  MessageSquare, 
  ArrowRight, 
  ArrowLeft,
  Award,
  Upload,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { Department, GradeLevel, StudentProfile, ALL_GRADE_LEVELS } from '../../types';
import { useAuth, RegisterStudentPayload } from '../../context/AuthContext';
import confetti from 'canvas-confetti';

interface RegisterStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newProfile: StudentProfile) => void;
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

const SUGGESTED_CLASSES: Record<Department, string[]> = {
  'STEM & Coding': ['AP Calculus BC', 'AP Computer Science A', 'AP Physics C', 'AP Chemistry', 'AP Biology', 'AP Statistics', 'Linear Algebra'],
  'Humanities & Writing': ['AP English Language', 'AP US History', 'AP European History', 'Creative Writing Honors', 'Philosophy & Ethics'],
  'Languages & Linguistics': ['AP French Language', 'AP Spanish Literature', 'Mandarin Chinese III', 'German II', 'Latin Literature'],
  'Visual & Performing Arts': ['AP Music Theory', 'Chamber Orchestra', 'Studio Art 2D', 'Digital Media Production', 'Theater Arts'],
  'Robotics & Engineering': ['FIRST Robotics Capstone', 'CAD Engineering Design', 'Arduino C++', 'Electronics & Circuits'],
  'Business, Debate & Civics': ['Model UN Delegation', 'Mock Trial', 'AP Macroeconomics', 'AP US Government', 'Public Rhetoric'],
  'Athletics & Wellness': ['Peer Leadership Seminar', 'Sports Nutrition', 'Mindfulness & Study Habits']
};

export const RegisterStudentModal: React.FC<RegisterStudentModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { registerFullStudent } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [handle, setHandle] = useState('');
  const [grade, setGrade] = useState<GradeLevel>('Class 11');
  const [department, setDepartment] = useState<Department>('STEM & Coding');
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  // Academics
  const [classInput, setClassInput] = useState('');
  const [enrolledClasses, setEnrolledClasses] = useState<string[]>(['AP Calculus BC']);

  const [tutoringInput, setTutoringInput] = useState('');
  const [tutoringSubjects, setTutoringSubjects] = useState<string[]>(['Calculus', 'Precalculus']);

  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>(['Calculus', 'Problem Solving']);

  // Bio & Contact
  const [bio, setBio] = useState('');
  const [campusLocation, setCampusLocation] = useState('School Library 2nd Floor');
  const [discord, setDiscord] = useState('');
  const [isPeerTutorCertified, setIsPeerTutorCertified] = useState(false);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        setError('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddClass = (clsName: string) => {
    if (clsName.trim() && !enrolledClasses.includes(clsName.trim())) {
      setEnrolledClasses([...enrolledClasses, clsName.trim()]);
    }
  };

  const handleRemoveClass = (cls: string) => {
    setEnrolledClasses(enrolledClasses.filter((c) => c !== cls));
  };

  const handleAddTutoring = () => {
    if (tutoringInput.trim() && !tutoringSubjects.includes(tutoringInput.trim())) {
      setTutoringSubjects([...tutoringSubjects, tutoringInput.trim()]);
      setTutoringInput('');
    }
  };

  const handleRemoveTutoring = (subj: string) => {
    setTutoringSubjects(tutoringSubjects.filter((s) => s !== subj));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (sk: string) => {
    setSkills(skills.filter((s) => s !== sk));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      if (!fullName.trim() || !email.trim()) {
        setError('Please provide your name and school email.');
        return;
      }

      if (!password || password.length < 6) {
        setError('Password is required and must be at least 6 characters long.');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter your password.');
        return;
      }

      setError('');
      setStep(2);
      return;
    }

    if (step === 2) {
      setError('');
      setStep(3);
      return;
    }

    // Step 3 Submission
    setIsSubmitting(true);
    setError('');

    const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fullName.trim() || 'student')}`;

    const payload: RegisterStudentPayload = {
      fullName: fullName.trim(),
      email: email.trim(),
      password: password.trim(),
      handle: handle.trim() || `@${fullName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      grade,
      department,
      avatarUrl: avatarUrl || defaultAvatar,
      bio: bio.trim() || `Enthusiastic ${grade} student focusing on ${department}.`,
      enrolledClasses,
      tutoringSubjects: tutoringSubjects.length > 0 ? tutoringSubjects : [department.split(' ')[0]],
      skills: skills.length > 0 ? skills : ['Academic Problem Solving'],
      campusLocation: campusLocation.trim(),
      discord: discord.trim() || undefined,
      isPeerTutorCertified
    };

    const res = await registerFullStudent(payload);
    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    if (res.profile) {
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }
      onSuccess(res.profile);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <UserPlus className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Student Registration</h3>
              <p className="text-xs text-slate-400">Join the Student Talent &amp; Mentorship Directory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress */}
        <div className="px-6 py-2.5 bg-slate-850/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
              step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'
            }`}>
              1
            </span>
            <span className={step === 1 ? 'text-white font-medium' : ''}>Student Identity</span>
          </div>
          <div className="w-12 h-0.5 bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
              step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'
            }`}>
              2
            </span>
            <span className={step === 2 ? 'text-white font-medium' : ''}>Classes &amp; Skills</span>
          </div>
          <div className="w-12 h-0.5 bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
              step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'
            }`}>
              3
            </span>
            <span className={step === 3 ? 'text-white font-medium' : ''}>Bio &amp; Contact</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Legal / Student Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alexander Turner"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Student / School Email <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@school.edu"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-xl bg-slate-800/40 border border-indigo-900/40">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Create Mandatory Password <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm Password <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <p className="col-span-1 sm:col-span-2 text-[10px] text-indigo-300">
                  🔒 Password is required to log into your account securely from any device.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Class / Grade Level</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value as GradeLevel)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {ALL_GRADE_LEVELS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as Department)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Directory Handle</label>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="@alex_t"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Native Profile Picture File Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Upload Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-2xl bg-slate-800 border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0 group">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <Camera className="w-6 h-6 mb-1 text-slate-400" />
                        <span className="text-[9px]">Photo</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-sm transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      Choose Image File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    {avatarUrl ? (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="block text-[11px] text-rose-400 hover:text-rose-300"
                      >
                        Remove uploaded photo
                      </button>
                    ) : (
                      <p className="text-[11px] text-slate-400">
                        Upload any photo or image file from your device (Max 5MB).
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Enrolled Courses */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Enrolled or Completed Coursework
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={classInput}
                    onChange={(e) => setClassInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (classInput.trim()) {
                          handleAddClass(classInput.trim());
                          setClassInput('');
                        }
                      }
                    }}
                    placeholder="Type class name and press Enter (e.g. AP Physics C)..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (classInput.trim()) {
                        handleAddClass(classInput.trim());
                        setClassInput('');
                      }
                    }}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>

                {/* Suggestions for Department */}
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="text-[10px] text-slate-400 mr-1 self-center">Suggestions:</span>
                  {SUGGESTED_CLASSES[department].slice(0, 4).map((suggested) => (
                    <button
                      key={suggested}
                      type="button"
                      onClick={() => handleAddClass(suggested)}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700 hover:bg-slate-700"
                    >
                      + {suggested}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {enrolledClasses.map((cls) => (
                    <span
                      key={cls}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5"
                    >
                      <BookOpen className="w-3 h-3 text-indigo-400" />
                      {cls}
                      <button
                        type="button"
                        onClick={() => handleRemoveClass(cls)}
                        className="text-slate-400 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Tutoring Subjects */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subjects You Are Ready to Mentor / Tutor
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tutoringInput}
                    onChange={(e) => setTutoringInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTutoring();
                      }
                    }}
                    placeholder="e.g. AP Calculus AB, Algebra II, Essay Review..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTutoring}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tutoringSubjects.map((sub) => (
                    <span
                      key={sub}
                      className="px-2 py-0.5 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800/60 text-xs font-semibold flex items-center gap-1"
                    >
                      {sub}
                      <button
                        type="button"
                        onClick={() => handleRemoveTutoring(sub)}
                        className="text-indigo-400 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Skills Tags */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Skill Tags (Peers can endorse these!)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="e.g. Python, Integrals, Figma, Lab Reports..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((sk) => (
                    <span
                      key={sk}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3 text-indigo-400" />
                      {sk}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(sk)}
                        className="text-slate-400 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Student Bio &amp; What You Love Learning
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your classmates about your academic interests, projects, or study style..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Campus Meetup & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Favorite Campus Study Spot
                  </label>
                  <input
                    type="text"
                    value={campusLocation}
                    onChange={(e) => setCampusLocation(e.target.value)}
                    placeholder="e.g. Science Commons Desk 4, Library 2nd Fl"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Discord or Slack Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={discord}
                    onChange={(e) => setDiscord(e.target.value)}
                    placeholder="alex#4912"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Tutor certification checkbox */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="certTutor"
                  checked={isPeerTutorCertified}
                  onChange={(e) => setIsPeerTutorCertified(e.target.checked)}
                  className="mt-0.5 rounded bg-slate-900 border-slate-600 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="certTutor" className="text-xs text-slate-300 cursor-pointer">
                  <span className="font-semibold text-white flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-emerald-400 inline" />
                    Register as a Peer Tutor
                  </span>
                  <span className="block text-slate-400 text-[11px] mt-0.5">
                    I am willing to conduct 1-on-1 tutoring sessions, log completed hours, and uphold school Honor Code standards.
                  </span>
                </label>
              </div>

              {/* Live Preview Card */}
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-900/40">
                <p className="text-[10px] uppercase font-bold text-indigo-400 mb-2">Live Directory Preview:</p>
                <div className="flex items-center gap-3">
                  <img
                    src={avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fullName || 'student')}`}
                    alt="Preview"
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-indigo-500/50"
                  />
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      {fullName || 'Your Name'}
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 font-normal">
                        {grade}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {department} • {tutoringSubjects.slice(0, 2).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setStep((s) => (s - 1) as any);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/25"
              >
                Next Step
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white flex items-center gap-2 shadow-lg shadow-emerald-600/25"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isSubmitting ? 'Registering...' : 'Complete Registration & Join Directory'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

