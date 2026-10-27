import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SchoolEvent } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Bookmark,
  Share2,
  Award,
  Bell,
  ExternalLink,
  Plus,
  X,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const EventsView: React.FC = () => {
  const { events, toggleEventRsvp, currentUser, addEvent } = useApp();
  const [filterCategory, setFilterCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // New Event Form State
  const canPublish = currentUser.role === 'developer' || currentUser.role === 'teacher' || currentUser.role === 'admin';
  const roleLabel = currentUser.role === 'developer' ? 'App Developer' : currentUser.role === 'teacher' ? 'Teacher / Faculty' : 'Admin';

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<SchoolEvent['category']>('Competition');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00 AM - 01:00 PM');
  const [location, setLocation] = useState('OPG World School Main Auditorium & Quad');
  const [organizer, setOrganizer] = useState(`${currentUser.name} (${roleLabel})`);
  const [description, setDescription] = useState('');
  const [isOfficial, setIsOfficial] = useState(true);

  const categories = [
    'All',
    'Official Announcement',
    'Competition',
    'Exhibition',
    'Workshop',
    'Club Meeting'
  ];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date.trim()) return;

    addEvent({
      title: title.trim(),
      category,
      date: date.trim(),
      time: time.trim() || 'TBA',
      location: location.trim() || 'Campus',
      organizer: organizer.trim() || `${currentUser.name} (${roleLabel})`,
      description: description.trim() || 'No additional details provided.',
      isOfficial,
      linkText: 'RSVP Now'
    });

    setTitle('');
    setDescription('');
    setDate('');
    setIsModalOpen(false);
    setSuccessBanner('Upcoming event published successfully to the school calendar!');
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const filteredEvents = events.filter(e => {
    if (filterCategory !== 'All' && e.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Events & Official Announcements
            </h1>
            {canPublish && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-bold">
                <ShieldCheck className="w-3 h-3" />
                {roleLabel} Publishing Access
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            Verified academic exhibitions, inter-house competitions, and club workshops
          </p>
        </div>

        {canPublish && (
          <button
            onClick={() => {
              setOrganizer(`${currentUser.name} (${roleLabel})`);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Upcoming Event</span>
          </button>
        )}
      </div>

      {successBanner && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter strip */}
      <div className="flex items-center gap-1.5 flex-wrap p-2 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              filterCategory === cat
                ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.map(event => (
          <div
            key={event.id}
            className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs space-y-4 hover:border-blue-300 dark:hover:border-blue-800 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                      event.isOfficial
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                        : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200'
                    }`}
                  >
                    {event.category}
                  </span>
                  {event.isOfficial && (
                    <span className="text-[10px] text-purple-700 dark:text-purple-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Official Circular</span>
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                  {event.title}
                </h3>

                <div className="text-xs text-[var(--text-muted)] flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1 font-medium text-[var(--text-primary)] num-tabular">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>{event.date}</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span>{event.time}</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span>{event.location}</span>
                  </span>
                </div>
              </div>

              {/* RSVP Button */}
              <div className="shrink-0">
                <button
                  onClick={() => toggleEventRsvp(event.id)}
                  className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 ${
                    event.isRsvpd
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{event.isRsvpd ? 'Attending ✓' : 'RSVP / Register'}</span>
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {event.description}
            </p>

            <div className="pt-3 border-t border-[var(--border-color)]/60 flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Organized by: <strong className="text-[var(--text-primary)]">{event.organizer}</strong></span>
              <span className="num-tabular font-semibold text-[var(--text-secondary)]">
                {event.rsvpCount} students registered
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Upcoming Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] rounded-3xl max-w-xl w-full p-6 sm:p-7 border border-[var(--border-color)] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Publish Upcoming Event
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Authorized for {roleLabel} ({currentUser.name})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Inter-School Robotics & AI Hackathon 2026"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                    Event Category
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                  >
                    <option value="Competition">Competition</option>
                    <option value="Exhibition">Exhibition</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Official Announcement">Official Announcement</option>
                    <option value="Club Meeting">Club Meeting</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                    Date *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dec 05, 2026"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                    Time / Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM - 01:30 PM"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                    Location / Venue
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Main Auditorium / Lab"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                  Organizer Name / Authority
                </label>
                <input
                  type="text"
                  value={organizer}
                  onChange={e => setOrganizer(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                  Description & Participation Guidelines
                </label>
                <textarea
                  rows={3}
                  placeholder="Outline eligibility (Classes 9-12), team size, registration procedure, and judging criteria..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-3 text-xs sm:text-sm rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
                <input
                  type="checkbox"
                  id="officialEventCheck"
                  checked={isOfficial}
                  onChange={e => setIsOfficial(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
                <label htmlFor="officialEventCheck" className="text-xs text-[var(--text-primary)] font-medium cursor-pointer">
                  Mark as Official School Circular (displays verified circular badge)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Publish Event</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
