import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Send,
  CheckCircle2,
  GraduationCap,
  ShieldAlert,
  Inbox,
  Clock,
  CheckCircle,
  FileText,
  Lock,
  MessageSquare
} from 'lucide-react';

export const ContactUsView: React.FC = () => {
  const { currentUser, contactInquiries, submitContactInquiry, resolveContactInquiry } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('General Question');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  // Developer inbox filters & notes
  const [inboxFilter, setInboxFilter] = useState<'all' | 'new' | 'reviewed' | 'resolved'>('all');
  const [activeDevNoteId, setActiveDevNoteId] = useState<string | null>(null);
  const [devNoteText, setDevNoteText] = useState('');

  const isDeveloper = currentUser?.role === 'developer';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !subject.trim() || !name.trim() || !email.trim()) return;

    const ticketId = submitContactInquiry({
      name: name.trim(),
      email: email.trim(),
      category,
      subject: subject.trim(),
      message: message.trim()
    });

    setSubmittedTicket(ticketId);
    setSubject('');
    setMessage('');
    setName('');
    setEmail('');
  };

  const handleSaveDevNote = (inquiryId: string) => {
    if (!devNoteText.trim()) return;
    resolveContactInquiry(inquiryId, 'reviewed', devNoteText.trim());
    setActiveDevNoteId(null);
    setDevNoteText('');
  };

  const filteredInquiries = contactInquiries.filter(inq => {
    if (inboxFilter === 'all') return true;
    return inq.status === inboxFilter;
  });

  const newCount = contactInquiries.filter(i => i.status === 'new').length;
  const reviewedCount = contactInquiries.filter(i => i.status === 'reviewed').length;
  const resolvedCount = contactInquiries.filter(i => i.status === 'resolved').length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>PeerForge Helpdesk & Inquiries</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
          Contact Us
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
          Have an inquiry, project mentorship request, or feedback for PeerForge? Submissions are dispatched directly to the development team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Form on Left (2 cols) */}
        <div className="lg:col-span-2">
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-5 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[var(--text-primary)]">Send a Message</h2>
              <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                <Lock className="w-3 h-3" />
                <span>Encrypted · Developers Only</span>
              </span>
            </div>

            {submittedTicket ? (
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-bold text-sm">Thank you! Your message has been sent to the developers.</span>
                </div>
                <p className="text-xs leading-relaxed">
                  Your inquiry has been assigned Reference Ticket <strong className="font-mono">#{submittedTicket}</strong>.
                  Your message has been delivered directly and exclusively to the PeerForge Developer Team. Only authorized developers have access to review and respond.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setSubmittedTicket(null)}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                      Your Name:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Priyanshu M. or Student Name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                      Contact Email:
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. student@opgworldschool.com or gmail"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-400"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                      Topic Category:
                    </label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-400"
                    >
                      <option value="General Question">General Question</option>
                      <option value="Project Mentorship">Project Mentorship Support</option>
                      <option value="Student Council Feedback">Student Council Feedback</option>
                      <option value="Technical Support">Platform Technical Issue</option>
                      <option value="Event Inquiry">School Exhibition & Event Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                      Subject Line:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Request for developer collaboration"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                    Message Details:
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Provide details about your query, proposal, or suggestions for the developers..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full p-3.5 text-xs sm:text-sm rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-400"
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />
                    <span>Dispatched exclusively to developer accounts.</span>
                  </p>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send to Developers</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Info Column */}
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-3">
            <span className="text-xs font-bold text-[var(--text-primary)] block">Developer Routing Protocol</span>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              All messages submitted through this channel are stored securely and delivered exclusively to active App Developers on PeerForge.
            </p>
            <div className="pt-1 text-[11px] text-[var(--text-muted)] space-y-1">
              <p>• Lead App Developers: OPG Student Tech Team</p>
              <p>• Response window: Within 24 school hours</p>
              <p>• Faculty Advisor: School Administration & Mentors</p>
            </div>
          </div>
        </div>
      </div>

      {/* DEVELOPER INBOX - Visible strictly to Developer Accounts */}
      {isDeveloper && (
        <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border-2 border-blue-500/30 shadow-md space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Inbox className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)]">
                    Developer Inbox & Submissions Console
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                    Developer Only
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  Confidential inbox where Contact Us messages arrive after submission
                </p>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setInboxFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                  inboxFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]'
                }`}
              >
                All ({contactInquiries.length})
              </button>
              <button
                onClick={() => setInboxFilter('new')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                  inboxFilter === 'new'
                    ? 'bg-amber-600 text-white'
                    : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]'
                }`}
              >
                New ({newCount})
              </button>
              <button
                onClick={() => setInboxFilter('reviewed')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                  inboxFilter === 'reviewed'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]'
                }`}
              >
                Reviewed ({reviewedCount})
              </button>
              <button
                onClick={() => setInboxFilter('resolved')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                  inboxFilter === 'resolved'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]'
                }`}
              >
                Resolved ({resolvedCount})
              </button>
            </div>
          </div>

          {filteredInquiries.length === 0 ? (
            <div className="py-12 text-center text-[var(--text-muted)] space-y-2">
              <Inbox className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-xs font-medium">No contact messages in this category.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInquiries.map(inquiry => (
                <div
                  key={inquiry.id}
                  className="p-5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                        {inquiry.id}
                      </span>
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        {inquiry.name}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        &lt;{inquiry.email}&gt;
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[var(--text-primary)]">
                        {inquiry.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          inquiry.status === 'new'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : inquiry.status === 'reviewed'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {inquiry.status}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{inquiry.submittedAt}</span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                      {inquiry.subject}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 whitespace-pre-wrap bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-[var(--border-color)]">
                      {inquiry.message}
                    </p>
                  </div>

                  {inquiry.developerNotes && (
                    <div className="p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200">
                      <strong>Developer Note ({inquiry.assignedDeveloper || 'App Developer'}):</strong> {inquiry.developerNotes}
                    </div>
                  )}

                  {/* Developer action buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]/60 text-xs">
                    <div>
                      {activeDevNoteId === inquiry.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Add developer resolution or note..."
                            value={devNoteText}
                            onChange={e => setDevNoteText(e.target.value)}
                            className="px-3 py-1 text-xs rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-400"
                          />
                          <button
                            onClick={() => handleSaveDevNote(inquiry.id)}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-semibold text-xs"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setActiveDevNoteId(null)}
                            className="text-xs text-[var(--text-muted)] hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveDevNoteId(inquiry.id);
                            setDevNoteText(inquiry.developerNotes || '');
                          }}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{inquiry.developerNotes ? 'Edit Dev Note' : 'Add Dev Note'}</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {inquiry.status !== 'reviewed' && (
                        <button
                          onClick={() => resolveContactInquiry(inquiry.id, 'reviewed')}
                          className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold hover:bg-indigo-100 transition-colors"
                        >
                          Mark Reviewed
                        </button>
                      )}
                      {inquiry.status !== 'resolved' && (
                        <button
                          onClick={() => resolveContactInquiry(inquiry.id, 'resolved')}
                          className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Mark Resolved</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
