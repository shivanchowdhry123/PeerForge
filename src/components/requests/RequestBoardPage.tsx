import React, { useState } from 'react';
import { 
  HelpCircle, 
  Search, 
  Filter, 
  PlusCircle, 
  Clock, 
  MapPin, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  UserCheck,
  Send,
  X,
  Mail,
  ArrowRight
} from 'lucide-react';
import { RequestTicket, HelpOffer, Department, UrgencyLevel, RequestStatus } from '../../types';
import { filterRequests } from '../../utils/matching';
import { useAuth } from '../../context/AuthContext';

interface RequestBoardPageProps {
  requests: RequestTicket[];
  onOpenNewRequest: () => void;
  onOpenQuestionnaire: () => void;
  onOfferHelp: (requestId: string, offerMessage: string) => Promise<void>;
  onUpdateStatus: (requestId: string, status: RequestStatus) => Promise<void>;
  onOpenDirectMessage?: (recipientId: string, recipientName: string) => void;
}

const DEPARTMENTS: (Department | 'All Departments')[] = [
  'All Departments',
  'STEM & Coding',
  'Humanities & Writing',
  'Languages & Linguistics',
  'Visual & Performing Arts',
  'Robotics & Engineering',
  'Business, Debate & Civics',
  'Athletics & Wellness'
];

export const RequestBoardPage: React.FC<RequestBoardPageProps> = ({
  requests,
  onOpenNewRequest,
  onOpenQuestionnaire,
  onOfferHelp,
  onUpdateStatus,
  onOpenDirectMessage
}) => {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [urgencyFilter, setUrgencyFilter] = useState('All Urgencies');
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  // Offer modal state
  const [selectedTicketForOffer, setSelectedTicketForOffer] = useState<RequestTicket | null>(null);
  const [offerMessage, setOfferMessage] = useState('');
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);

  // View detail modal state for clicked peer offer
  const [selectedOfferModal, setSelectedOfferModal] = useState<{
    offer: HelpOffer;
    ticketTitle: string;
    ticketSubject: string;
    ticketId: string;
  } | null>(null);

  // Active tickets filtered
  const filteredRequests = filterRequests(
    requests,
    searchQuery,
    departmentFilter,
    urgencyFilter,
    statusFilter
  );

  const openCount = requests.filter((r) => r.status === 'Open').length;
  const criticalCount = requests.filter((r) => r.urgency.includes('Critical') && r.status !== 'Resolved').length;

  const handleSendOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketForOffer || !offerMessage.trim()) return;

    setIsSubmittingOffer(true);
    await onOfferHelp(selectedTicketForOffer.id, offerMessage.trim());
    setIsSubmittingOffer(false);
    setSelectedTicketForOffer(null);
    setOfferMessage('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/60 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              Live Peer Help Exchange
            </span>
            {criticalCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-800/50 flex items-center gap-1 animate-pulse">
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                {criticalCount} Critical
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            School Request Board
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Post academic roadblocks, find peer tutors, or claim open tickets to earn peer service hours.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenQuestionnaire}
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Interactive Matcher</span>
          </button>

          <button
            onClick={onOpenNewRequest}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Request</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-850/80 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, class (e.g. AP Calc, Chemistry, Java), student name, or tags..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="All Urgencies">All Urgencies</option>
              <option value="Critical (Next 24h)">Critical (&lt; 24h)</option>
              <option value="Urgent (2-3 Days)">Urgent (2-3 Days)</option>
              <option value="Standard (This Week)">Standard</option>
              <option value="Ongoing Project">Ongoing</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Open">Open Only</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Quick status tabs */}
        <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
          <span>Showing {filteredRequests.length} of {requests.length} tickets</span>
          <span>•</span>
          <span className="text-emerald-400 font-medium">{openCount} active open requests</span>
        </div>
      </div>

      {/* Ticket List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
            <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">No requests match your filters</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search criteria, or post a new help request for the student body.
            </p>
            <button
              onClick={onOpenNewRequest}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500"
            >
              Create Help Ticket
            </button>
          </div>
        ) : (
          filteredRequests.map((ticket) => {
            const isResolved = ticket.status === 'Resolved';
            const isCritical = ticket.urgency.includes('Critical');

            return (
              <div
                key={ticket.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isResolved
                    ? 'bg-slate-900/50 border-slate-800/60 opacity-80'
                    : isCritical
                    ? 'bg-gradient-to-r from-rose-950/20 via-slate-900 to-slate-900 border-rose-900/40 hover:border-rose-700/60 shadow-lg shadow-rose-950/10'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left: Creator info & Ticket Content */}
                  <div className="flex items-start gap-3 flex-1">
                    <img
                      src={ticket.creatorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                      alt={ticket.creatorName}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700 flex-shrink-0"
                    />

                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-slate-200">{ticket.creatorName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          {ticket.creatorGrade}
                        </span>
                        {onOpenDirectMessage && (
                          <button
                            onClick={() => onOpenDirectMessage(ticket.creatorId, ticket.creatorName)}
                            className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 ml-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            Direct Message
                          </button>
                        )}
                        <span className="text-[11px] text-slate-400">•</span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>


                      <h3 className="text-base font-bold text-white tracking-tight">{ticket.title}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">{ticket.description}</p>

                      {/* Metadata tags */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-800/40 font-medium text-[11px]">
                          {ticket.subject}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[11px]">
                          {ticket.department}
                        </span>
                        {ticket.preferredLocation && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-indigo-400" />
                            {ticket.preferredLocation}
                          </span>
                        )}
                        {ticket.tags.map((tg) => (
                          <span
                            key={tg}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/50"
                          >
                            #{tg}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Status, Urgency, Actions */}
                  <div className="flex md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                          isCritical
                            ? 'bg-rose-950 text-rose-300 border-rose-800/60'
                            : ticket.urgency.includes('Urgent')
                            ? 'bg-amber-950 text-amber-300 border-amber-800/60'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {ticket.urgency}
                      </span>

                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          ticket.status === 'Open'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                            : ticket.status === 'In Progress'
                            ? 'bg-sky-950 text-sky-300 border border-sky-800/50'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isResolved ? (
                        <>
                          <button
                            onClick={() => setSelectedTicketForOffer(ticket)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center gap-1.5"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            Offer Help
                          </button>

                          <button
                            onClick={() => onUpdateStatus(ticket.id, 'Resolved')}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                            title="Mark as resolved"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => onUpdateStatus(ticket.id, 'Open')}
                          className="px-2.5 py-1 rounded text-[11px] text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
                        >
                          Reopen Ticket
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Offer responses section if any */}
                {ticket.offers && ticket.offers.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-indigo-400" />
                        Peer Offers &amp; Assistance ({ticket.offers.length})
                      </p>
                      <span className="text-[10px] text-slate-500 font-medium">Click offer to view full details &amp; contact</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ticket.offers.map((offer) => (
                        <div
                          key={offer.id}
                          onClick={() => setSelectedOfferModal({
                            offer,
                            ticketTitle: ticket.title,
                            ticketSubject: ticket.subject,
                            ticketId: ticket.id
                          })}
                          className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 flex items-start gap-3 text-xs cursor-pointer transition-all group shadow-sm hover:shadow-md"
                        >
                          <img
                            src={offer.helperAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                            alt={offer.helperName}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-600 group-hover:ring-indigo-500 flex-shrink-0 transition-all"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="font-semibold text-white text-[11px] truncate group-hover:text-indigo-300 transition-colors">
                                  {offer.helperName}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700/80 text-slate-300 font-medium flex-shrink-0">
                                  {offer.helperGrade}
                                </span>
                              </div>
                              <span className="text-[10px] text-indigo-400 group-hover:translate-x-0.5 transition-transform font-medium flex items-center gap-0.5 flex-shrink-0 ml-1">
                                View
                                <ArrowRight className="w-2.5 h-2.5" />
                              </span>
                            </div>
                            <p className="text-slate-300 text-[11px] mt-1 line-clamp-2 leading-relaxed">{offer.message}</p>
                            <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-700/40 text-[10px] text-slate-400">
                              <span className="flex items-center gap-1 text-slate-300 truncate">
                                <Mail className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                                {offer.contactEmail}
                              </span>
                              <span className="flex-shrink-0 ml-1">{new Date(offer.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Offer Help Modal */}
      {selectedTicketForOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-display">Offer Help to Peer</h3>
                <p className="text-xs text-slate-400 truncate max-w-xs">{selectedTicketForOffer.title}</p>
              </div>
              <button
                onClick={() => setSelectedTicketForOffer(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendOffer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Message / Availability Details
                </label>
                <textarea
                  required
                  rows={4}
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  placeholder="e.g. Hi! I took AP Calc BC last year (scored a 5). I am free during 4th period study hall or Thursday after school in the science commons. Let me know if that works!"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400">
                Offering as: <span className="text-white font-medium">{profile?.fullName}</span> ({profile?.email})
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicketForOffer(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOffer}
                  className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmittingOffer ? 'Submitting...' : 'Send Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offer Details Popup Modal */}
      {selectedOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedOfferModal.offer.helperAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt={selectedOfferModal.offer.helperName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500 flex-shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white font-display">
                      {selectedOfferModal.offer.helperName}
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 text-xs font-semibold">
                      {selectedOfferModal.offer.helperGrade}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    Offered on {new Date(selectedOfferModal.offer.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOfferModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket context banner */}
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block">
                In Response To Request:
              </span>
              <div className="font-semibold text-slate-200">
                {selectedOfferModal.ticketTitle}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-0.5">
                <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[10px] font-medium">
                  {selectedOfferModal.ticketSubject}
                </span>
              </div>
            </div>

            {/* Full Message Body */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                Full Offer &amp; Availability Details
              </label>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                {selectedOfferModal.offer.message}
              </div>
            </div>

            {/* Contact Details Card */}
            <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <div>
                  <span className="text-slate-400 text-[10px] block">Direct Email</span>
                  <span className="text-white font-medium">{selectedOfferModal.offer.contactEmail}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedOfferModal(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                Close
              </button>

              <a
                href={`mailto:${selectedOfferModal.offer.contactEmail}?subject=${encodeURIComponent(`Re: Peer Help Offer for "${selectedOfferModal.ticketTitle}"`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>Email Helper</span>
              </a>

              {onOpenDirectMessage && (
                <button
                  onClick={() => {
                    const { helperId, helperName } = selectedOfferModal.offer;
                    setSelectedOfferModal(null);
                    onOpenDirectMessage(helperId, helperName);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Direct Message</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
