import React, { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const {
    currentUser,
    updateCurrentUserProfile,
    isOnboardingOpen,
    setIsOnboardingOpen
  } = useApp();

  if (!currentUser || !isOnboardingOpen) return null;

  const [step, setStep] = useState(1);
  const [name, setName] = useState(currentUser.name);
  const [grade, setGrade] = useState(currentUser.grade);
  const [section, setSection] = useState(currentUser.section);
  const [house, setHouse] = useState(currentUser.house);
  const [bio, setBio] = useState(currentUser.bio);
  const [skills, setSkills] = useState<Skill[]>(currentUser.skills);
  const [interestsText, setInterestsText] = useState(currentUser.interests.join(', '));
  const [strengthsText, setStrengthsText] = useState(currentUser.academicStrengths.join(', '));

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
              <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1.5">
                Select Your Skills & Proficiencies:
              </label>
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
                      className={`p-2 rounded-xl text-left text-xs border transition-colors flex items-center justify-between ${
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
