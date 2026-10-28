import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FolderKanban, X, Sparkles, Send } from 'lucide-react';

export const InviteToProjectModal: React.FC = () => {
  const {
    currentUser,
    projects,
    inviteStudentModal,
    setInviteStudentModal,
    sendMessage
  } = useApp();

  const student = inviteStudentModal.student;
  const userProjects = currentUser ? projects.filter(p => p.ownerId === currentUser.id) : [];

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    userProjects[0]?.id || ''
  );
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [inviteMessage, setInviteMessage] = useState<string>(
    'Hi! I saw your skills on OPG Connect and would love to collaborate with you on our project.'
  );

  if (!inviteStudentModal.isOpen || !student || !currentUser) return null;

  const currentProject = projects.find(p => p.id === selectedProjectId);

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) {
      alert('Please create a project first before sending team invitations.');
      return;
    }

    setInviteStudentModal({ isOpen: false, student: null });
    alert(`Project invitation sent to ${student.name} for "${currentProject.title}"!`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[var(--bg-surface)] rounded-3xl max-w-md w-full p-6 border border-[var(--border-color)] shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Invite to School Project
            </h3>
          </div>
          <button
            onClick={() => setInviteStudentModal({ isOpen: false, student: null })}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
          <img
            src={student.avatar}
            alt={student.name}
            className="w-10 h-10 rounded-xl bg-purple-100 object-cover shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <span className="text-xs font-bold text-[var(--text-primary)] block truncate">
              {student.name}
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">
              {student.grade} · {student.skills[0]?.name || 'Student'}
            </span>
          </div>
        </div>

        {userProjects.length === 0 ? (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-xs space-y-2">
            <p className="font-semibold">You have not created any projects yet.</p>
            <p className="text-[11px]">
              Head to &quot;Projects & Team&quot; to launch your initiative, then invite {student.name.split(' ')[0]} to join your open roles!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendInvite} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                Select Your Project:
              </label>
              <select
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
              >
                {userProjects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                Proposed Role:
              </label>
              <input
                type="text"
                placeholder="e.g. Lead Programmer / UI Designer"
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                Personalized Invitation Note:
              </label>
              <textarea
                rows={3}
                value={inviteMessage}
                onChange={e => setInviteMessage(e.target.value)}
                className="w-full p-3 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setInviteStudentModal({ isOpen: false, student: null })}
                className="px-4 py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Collaboration Invite</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
