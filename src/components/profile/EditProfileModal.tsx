import React, { useState } from 'react';
import { X, Save, Plus, Trash2, Tag, BookOpen, MapPin, AlertTriangle } from 'lucide-react';
import { StudentProfile, AvailabilityStatus, Department, GradeLevel, ALL_GRADE_LEVELS } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateCurrentProfile, deleteAccount } = useAuth();

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [bio, setBio] = useState(profile?.bio || '');
  const [grade, setGrade] = useState<GradeLevel>(profile?.grade || 'Class 11');
  const [availability, setAvailability] = useState<AvailabilityStatus>(profile?.availability || 'Available Now');
  const [department, setDepartment] = useState<Department>(profile?.department || 'STEM & Coding');
  const [discord, setDiscord] = useState(profile?.contactMethods.discord || '');
  const [campusLocation, setCampusLocation] = useState(profile?.contactMethods.campusLocation || '');

  // Lists
  const [classesInput, setClassesInput] = useState('');
  const [classes, setClasses] = useState<string[]>(profile?.enrolledClasses || []);

  const [tutoringInput, setTutoringInput] = useState('');
  const [tutoringSubjects, setTutoringSubjects] = useState<string[]>(profile?.tutoringSubjects || []);

  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState(profile?.skills || []);

  if (!isOpen || !profile) return null;

  const handleAddClass = () => {
    if (classesInput.trim() && !classes.includes(classesInput.trim())) {
      setClasses([...classes, classesInput.trim()]);
      setClassesInput('');
    }
  };

  const handleRemoveClass = (cls: string) => {
    setClasses(classes.filter((c) => c !== cls));
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
    if (skillInput.trim() && !skills.some((s) => s.name.toLowerCase() === skillInput.trim().toLowerCase())) {
      setSkills([
        ...skills,
        {
          id: `s-${Date.now()}`,
          name: skillInput.trim(),
          category: department,
          endorsementsCount: 1
        }
      ]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (id: string) => {
    setSkills(skills.filter((s) => s.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StudentProfile = {
      ...profile,
      bio,
      grade,
      availability,
      department,
      enrolledClasses: classes,
      tutoringSubjects,
      skills,
      contactMethods: {
        ...profile.contactMethods,
        discord: discord.trim() || undefined,
        campusLocation: campusLocation.trim() || undefined
      }
    };

    await updateCurrentProfile(updated);
    onClose();
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    await deleteAccount();
    setIsDeleting(false);
    setIsConfirmingDelete(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-display">Edit Profile &amp; Skills</h3>
            <p className="text-xs text-slate-400">Keep your academic offerings up to date</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5">
          {/* Grade, Availability & Department */}
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">Availability Status</label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value as AvailabilityStatus)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Available Now">Available Now</option>
                <option value="Accepting Tutees">Accepting Tutees</option>
                <option value="Study Partner Only">Study Partner Only</option>
                <option value="Busy / Finals Prep">Busy / Finals Prep</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="STEM & Coding">STEM &amp; Coding</option>
                <option value="Humanities & Writing">Humanities &amp; Writing</option>
                <option value="Languages & Linguistics">Languages &amp; Linguistics</option>
                <option value="Visual & Performing Arts">Visual &amp; Performing Arts</option>
                <option value="Robotics & Engineering">Robotics &amp; Engineering</option>
                <option value="Business, Debate & Civics">Business, Debate &amp; Civics</option>
                <option value="Athletics & Wellness">Athletics &amp; Wellness</option>
              </select>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Bio &amp; Academic Focus</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell peers what you are enthusiastic about teaching or studying..."
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Tutoring Subjects */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Subjects You Can Tutor / Help With
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
                placeholder="e.g. AP Calculus BC"
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
                  className="px-2 py-0.5 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800/60 text-xs flex items-center gap-1"
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

          {/* Skills */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Skill Tags</label>
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
                placeholder="e.g. Python, Derivatives, Essay Editing"
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
                  key={sk.id}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-xs flex items-center gap-1"
                >
                  <Tag className="w-3 h-3 text-indigo-400" />
                  {sk.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(sk.id)}
                    className="text-slate-400 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Campus Location</label>
              <input
                type="text"
                value={campusLocation}
                onChange={(e) => setCampusLocation(e.target.value)}
                placeholder="e.g. Library 2nd Floor Desk 4"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Discord Tag</label>
              <input
                type="text"
                value={discord}
                onChange={(e) => setDiscord(e.target.value)}
                placeholder="username#1234"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Footer & Danger Zone */}
          {isConfirmingDelete ? (
            <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800/80 text-xs text-rose-200 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-100 text-sm">Delete Account Permanently?</h4>
                  <p className="text-rose-300 mt-0.5 leading-relaxed">
                    This action will permanently delete your student profile, skills, and account record from the OPG World School system. This cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  disabled={isDeleting}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {isDeleting ? 'Deleting Account...' : 'Yes, Permanently Delete My Account'}
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/40 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Account
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Profile
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
