import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Skill } from '../types';
import {
  X,
  User,
  Sparkles,
  BookOpen,
  Award,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Plus
} from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const {
    currentUser,
    updateCurrentUserProfile,
    isOnboardingOpen,
    setIsOnboardingOpen
  } = useApp();

  const [step, setStep] = useState(1);
  const [name, setName] = useState(currentUser?.name || '');
  const [grade, setGrade] = useState(currentUser?.grade || 'Grade 11');
  const [section, setSection] = useState(currentUser?.section || 'A');
  const [house, setHouse] = useState(currentUser?.house || 'Agni');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [skills, setSkills] = useState<Skill[]>(currentUser?.skills || []);
  const [interestsText, setInterestsText] = useState((currentUser?.interests || []).join(', '));
  const [strengthsText, setStrengthsText] = useState((currentUser?.academicStrengths || []).join(', '));

  // Custom skill input states
  const [customSkillName, setCustomSkillName] = useState('');
  const [customSkillCategory, setCustomSkillCategory] = useState<Skill['category']>('Technical');
  const [customSkillLevel, setCustomSkillLevel] = useState<Skill['level']>('Intermediate');
  const [showCustomSkillForm, setShowCustomSkillForm] = useState(false);

  // Sync state whenever modal opens or currentUser changes
  useEffect(() => {
    if (currentUser && isOnboardingOpen) {
      setName(currentUser.name);
      setGrade(currentUser.grade);
      setSection(currentUser.section);
      setHouse(currentUser.house || 'Agni');
      setBio(currentUser.bio);
      setSkills(currentUser.skills || []);
      setInterestsText((currentUser.interests || []).join(', '));
      setStrengthsText((currentUser.academicStrengths || []).join(', '));
      setStep(1);
      setShowCustomSkillForm(false);
      setCustomSkillName('');
    }
  }, [currentUser, isOnboardingOpen]);

  if (!currentUser || !isOnboardingOpen) return null;

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customSkillName.trim();
    if (!trimmed) return;

    if (skills.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setCustomSkillName('');
      return;
    }

    const newSkill: Skill = {
      name: trimmed,
      category: customSkillCategory,
      level: customSkillLevel,
      verified: false
    };

    setSkills(prev => [...prev, newSkill]);
    setCustomSkillName('');
    setShowCustomSkillForm(false);
  };

  const handleRemoveSkill = (skillName: string) => {
    setSkills(prev => prev.filter(s => s.name.toLowerCase() !== skillName.toLowerCase()));
  };

  const popularSkillsPresets: Skill[] = [
    { name: 'Python', category: 'Technical', level: 'Intermediate', verified: false },
    { name: 'Web Development', category: 'Technical', level: 'Intermediate', verified: false },
    { name: 'Robotics & Arduino', category: 'Technical', level: 'Intermediate', verified: false },
    { name: 'Graphic Design (Figma)', category: 'Creative', level: 'Intermediate', verified: false },
    { name: 'Video Editing', category: 'Creative', level: 'Intermediate', verified: false },
    { name: 'Public Speaking & MUN', category: 'Leadership & Sports', level: 'Intermediate', verified: false },
    { name: 'Physics Olympiad', category: 'Academic', level: 'Advanced', verified: false },
    { name: 'Mathematics (Calculus)', category: 'Academic', level: 'Advanced', verified: false },
    { name: 'Creative Writing', category: 'Creative', level: 'Intermediate', verified: false },
    { name: 'Violin / Music Theory', category: 'Creative', level: 'Advanced', verified: false }
  ];

  const togglePresetSkill = (preset: Skill) => {
    const exists = skills.some(s => s.name.toLowerCase() === preset.name.toLowerCase());
    if (exists) {
      setSkills(skills.filter(s => s.name.toLowerCase() !== preset.name.toLowerCase()));
    } else {
      setSkills([...skills, preset]);
    }
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile({
      name: name.trim() || currentUser.name,
      grade,
      section,
      house: house as any,
      bio: bio.trim(),
      skills,
      interests: interestsText.split(',').map(s => s.trim()).filter(Boolean),
      academicStrengths: strengthsText.split(',').map(s => s.trim()).filter(Boolean)
    });
    setIsOnboardingOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[var(--bg-surface)] rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-[var(--border-color)] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center font-bold text-xs">
              OPG
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Student Profile & Onboarding
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                Step {step} of 2 · Verified School Record
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOnboardingOpen(false)}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                Display Name (School Registered):
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                  Grade / Class:
                </label>
                <select
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                >
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                  Section:
                </label>
                <select
                  value={section}
                  onChange={e => setSection(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                  <option value="D">Section D</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                Short Introduction / Bio:
              </label>
              <textarea
                rows={3}
                placeholder="Share your academic interests, club memberships, and what projects you want to build..."
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="w-full p-3 text-xs sm:text-sm rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <span>Next: Skills & Hobbies</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[var(--text-primary)]">
                  Your Selected Skills ({skills.length}):
                </label>
                <button
                  type="button"
                  onClick={() => setShowCustomSkillForm(!showCustomSkillForm)}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Custom Skill</span>
                </button>
              </div>

              {/* Display active selected skills tags */}
              {skills.length > 0 ? (
                <div className="flex items-center gap-1.5 flex-wrap p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] mb-3">
                  {skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-medium"
                    >
                      <span>{s.name}</span>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-normal">({s.level})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s.name)}
                        className="p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-md text-blue-600 dark:text-blue-300 transition-colors ml-0.5 cursor-pointer"
                        title="Remove skill"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--text-muted)] italic mb-3">
                  No skills selected yet. Choose from presets below or add custom skills!
                </p>
              )}

              {/* Custom Skill Input Form */}
              {showCustomSkillForm && (
                <form
                  onSubmit={handleAddCustomSkill}
                  className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-3 mb-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                      <span>Add Any Custom Skill</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCustomSkillForm(false)}
                      className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[var(--text-secondary)] block mb-1">
                      Skill Name:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 3D Modeling, Rust, Quantum Computing, Piano, Debate..."
                      value={customSkillName}
                      onChange={e => setCustomSkillName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-[var(--text-secondary)] block mb-1">
                        Category:
                      </label>
                      <select
                        value={customSkillCategory}
                        onChange={e => setCustomSkillCategory(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                      >
                        <option value="Technical">Technical</option>
                        <option value="Creative">Creative</option>
                        <option value="Academic">Academic</option>
                        <option value="Leadership & Sports">Leadership & Sports</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[var(--text-secondary)] block mb-1">
                        Proficiency Level:
                      </label>
                      <select
                        value={customSkillLevel}
                        onChange={e => setCustomSkillLevel(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCustomSkillForm(false)}
                      className="px-3 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs cursor-pointer"
                    >
                      Add Custom Skill
                    </button>
                  </div>
                </form>
              )}

              {/* Popular Presets */}
              <div>
                <span className="text-xs font-semibold text-[var(--text-muted)] block mb-1.5">
                  Popular School Presets (Click to toggle):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {popularSkillsPresets.map((preset, idx) => {
                    const isChecked = skills.some(
                      s => s.name.toLowerCase() === preset.name.toLowerCase()
                    );
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => togglePresetSkill(preset)}
                        className={`p-2 rounded-xl text-left text-xs border transition-colors flex items-center justify-between cursor-pointer ${
                          isChecked
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-semibold'
                            : 'border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-primary)]'
                        }`}
                      >
                        <span className="truncate">{preset.name}</span>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                Interests & Hobbies (comma separated):
              </label>
              <input
                type="text"
                value={interestsText}
                onChange={e => setInterestsText(e.target.value)}
                placeholder="e.g. Robotics, Chess, Badminton, Astronomy"
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                Academic Subjects of Interest:
              </label>
              <input
                type="text"
                value={strengthsText}
                onChange={e => setStrengthsText(e.target.value)}
                placeholder="e.g. Physics, Computer Science, Economics"
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ← Back
              </button>

              <button
                type="button"
                onClick={handleFinish}
                className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
              >
                Save & Complete Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
