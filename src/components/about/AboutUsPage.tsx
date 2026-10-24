import React, { useState } from 'react';
import { 
  Compass, 
  Users, 
  ShieldCheck, 
  Mail, 
  Send, 
  CheckCircle2, 
  Heart, 
  Award, 
  BookOpen, 
  Sparkles,
  MapPin,
  Clock
} from 'lucide-react';

export const AboutUsPage: React.FC = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [inquiryType, setInquiryType] = useState('General Question');
  const [message, setMessage] = useState('');

  const teamMembers = [
    {
      name: 'Maya Lin-Chen',
      role: 'Student Co-Founder & Technical Lead',
      grade: 'Grade 12',
      bio: 'USACO Silver competitor and CS Honor Society Co-President. Architected the PeerForge matching algorithm to solve study group fragmentation.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
    },
    {
      name: 'Julian Alvarez',
      role: 'Student Co-Founder & Tutoring Director',
      grade: 'Grade 12',
      bio: 'Math Team Captain and peer mentor coordinator. Passionate about destigmatizing asking for academic help among underclassmen.',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80'
    },
    {
      name: 'Sophia Montgomery',
      role: 'Head of Student Outreach & Editorial',
      grade: 'Grade 11',
      bio: 'Editor-in-Chief of the Student Newspaper. Leads student mentor orientation, honor code workshops, and humanities curriculum integration.',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80'
    },
    {
      name: 'Dr. Robert Henderson',
      role: 'Faculty Advisor & Physics Chair',
      grade: 'Faculty Sponsor',
      bio: 'Oversees tutor certification, academic honor policies, and coordinates school room access for after-school peer learning labs.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80'
    }
  ];

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !message.trim()) return;
    setFormSubmitted(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setMessage('');
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Hero / Origin Section */}
      <section className="space-y-6 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
          <Compass className="w-3.5 h-3.5" />
          The Story Behind PeerForge
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
          Building a School Where No Student Learns Alone.
        </h1>

        <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
          In early 2024, students faced a common challenge: across Classes 1-12 and alumni, finding peer study partners, robotics collaborators, and verified tutors was fragmented.
        </p>

        <p className="text-sm text-slate-400 leading-relaxed">
          PeerForge was initiated by student leaders to create a safe, organized, and verified internal talent exchange. Today, it connects students across all grades, turning study halls into collaborative hives of peer-driven growth.
        </p>
      </section>

      {/* Core Values / Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white font-display">Democratized Mentorship</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tutoring should never be a luxury. Every single student has unlimited access to peer assistance, study buddies, and academic coaching.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white font-display">Honor Code &amp; Academic Integrity</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            PeerForge is strictly an educational tool. Mentors guide understanding and problem-solving methodologies—never doing the work for someone else.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white font-display">Verified Peer Endorsements</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Skills are backed by peers who have studied together and faculty who verify curriculum proficiency, ensuring authentic talent discovery.
          </p>
        </div>
      </section>

      {/* Founding Team & Faculty Advisors */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Meet the Team &amp; Advisors
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            The student leaders and faculty sponsors steering the PeerForge Talent Exchange.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center space-y-3 flex flex-col items-center justify-between"
            >
              <div className="space-y-3 flex flex-col items-center">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-500/30"
                />
                <div>
                  <h3 className="text-sm font-bold text-white">{member.name}</h3>
                  <p className="text-[11px] text-indigo-400 font-medium">{member.role}</p>
                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    {member.grade}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact & Support Section */}
      <section className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/50">
            <Mail className="w-3.5 h-3.5" />
            Get in Touch
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Contact the PeerForge Steering Committee
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Have questions about tutor certification, want to report an issue, or propose a new curriculum hub? Reach out to our student officers or faculty sponsors directly.
          </p>

          <div className="space-y-3 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Campus — Student Center &amp; Library Commons</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <a href="mailto:contact@peerforge.edu" className="hover:underline text-indigo-300">
                contact@peerforge.edu
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Office Hours: Mon–Fri during Study Breaks &amp; 3:15–4:30 PM</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="p-6 rounded-2xl bg-slate-850/80 bg-slate-800/30 border border-slate-700/60">
          {formSubmitted ? (
            <div className="p-6 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Message Transmitted!</h3>
              <p className="text-xs text-slate-300">
                Thank you for reaching out. A student representative or faculty advisor will reply to your school email within 24 hours.
              </p>
              <button
                onClick={() => setFormSubmitted(false)}
                className="mt-3 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
              >
                Send Another Note
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitContact} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Liam O'Connor"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Student / School Email</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="student@school.edu"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Inquiry Topic</label>
                <select
                  value={inquiryType}
                  onChange={(e) => setInquiryType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="General Question">General Question</option>
                  <option value="Peer Tutor Certification">Peer Tutor Certification Application</option>
                  <option value="Report Honor Code Concern">Academic Honor Code Inquiry</option>
                  <option value="Platform Feedback / Bug">Platform Feature Suggestion</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Message</label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we assist you or improve your PeerForge experience?"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Submit Inquiry
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
