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
  ArrowRight,
  Trash2,
  User,
  RotateCcw,
  ArrowUpDown
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
  onDeleteRequest?: (requestId: string) => Promise<void>;
  onDeleteOffer?: (requestId: string, offerId: string) => Promise<void>;
  onOpenDirectMessage?: (recipientId: string, recipientName: string) => void;
  onOpenAuth?: () => void;
  newlyCreatedRequestId?: string | null;
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
  onDeleteRequest,
  onDeleteOffer,
  onOpenDirectMessage,
  onOpenAuth,
  newlyCreatedRequestId
}) => {
  const { profile } = useAuth();
  
  // Two dedicated search options: one for requests, one for student names
  const [requestSearchQuery, setRequestSearchQuery] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Rich filters for requests
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [urgencyFilter, setUrgencyFilter] = useState('All Urgencies');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [gradeFilter, setGradeFilter] = useState('All Grades');
  const [offerStatusFilter, setOfferStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Offer modal state
  const [selectedTicketForOffer, setSelectedTicketForOffer] = useState<RequestTicket | null>(null);
  const [offerMessage, setOfferMessage] = useState('');
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);

  // Deletion modals state
  const [ticketToDelete, setTicketToDelete] = useState<RequestTicket | null>(null);
  const [isDeletingTicket, setIsDeletingTicket] = useState(false);

  const [offerToDelete, setOfferToDelete] = useState<{
    requestId: string;
    offerId: string;
    helperName: string;
  } | null>(null);
  const [isDeletingOffer, setIsDeletingOffer] = useState(false);

  // View detail modal state for clicked peer offer
  const [selectedOfferModal, setSelectedOfferModal] = useState<{
    offer: HelpOffer;
    ticketTitle: string;
    ticketSubject: string;
    ticketId: string;
  } | null>(null);

  const isCreatedWithin24Hours = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    return diffMs >= 0 && diffMs < 24 * 60 * 60 * 1000;
  };

  // Active tickets filtered with dual search and expanded filters
  const filteredRequests = filterRequests(
    requests,
    requestSearchQuery,
    departmentFilter,
    urgencyFilter,
    statusFilter,
    studentSearchQuery,
    gradeFilter,
    offerStatusFilter,
    sortBy
  );

  const openCount = requests.filter((r) => r.status === 'Open').length;
  const criticalCount = requests.filter((r) => r.urgency.includes('Critical') && r.status !== 'Resolved').length;
  const newRequestsCount = requests.filter((r) => isCreatedWithin24Hours(r.createdAt) || newlyCreatedRequestId === r.id).length;

  const activeFilterCount = [
    Boolean(requestSearchQuery.trim()),
    Boolean(studentSearchQuery.trim()),
    departmentFilter !== 'All Departments',
    urgencyFilter !== 'All Urgencies',
    statusFilter !== 'All Statuses',
    gradeFilter !== 'All Grades',
    offerStatusFilter !== 'All',
    sortBy !== 'newest'
  ].filter(Boolean).length;

  const handleResetAllFilters = () => {
    setRequestSearchQuery('');
    setStudentSearchQuery('');
    setDepartmentFilter('All Departments');
    setUrgencyFilter('All Urgencies');
    setStatusFilter('All Statuses');
    setGradeFilter('All Grades');
    setOfferStatusFilter('All');
    setSortBy('newest');
  };

  const handleSendOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketForOffer || !offerMessage.trim()) return;

    setIsSubmittingOffer(true);
    await onOfferHelp(selectedTicketForOffer.id, offerMessage.trim());
    setIsSubmittingOffer(false);
    setSelectedTicketForOffer(null);
    setOfferMessage('');
  };

  const handleConfirmDeleteTicket = async () => {
    if (!ticketToDelete || !onDeleteRequest) return;
    setIsDeletingTicket(true);
    try {
      await onDeleteRequest(ticketToDelete.id);
      setTicketToDelete(null);
    } finally {
      setIsDeletingTicket(false);
    }
  };

  const handleConfirmDeleteOffer = async () => {
    if (!offerToDelete || !onDeleteOffer) return;
    setIsDeletingOffer(true);
    try {
      await onDeleteOffer(offerToDelete.requestId, offerToDelete.offerId);
      if (selectedOfferModal && selectedOfferModal.offer.id === offerToDelete.offerId) {
        setSelectedOfferModal(null);
      }
      setOfferToDelete(null);
    } finally {
      setIsDeletingOffer(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
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
            {newRequestsCount > 0 && (
              <span className="animate-pulse-badge px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-500/70 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                {newRequestsCount} Fresh Today
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

      {/* Filter and Dual Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        {/* Dual Search Options: Request Search + Student Name Search */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* 1. Request details search bar */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-indigo-400" />
                Search Requests
              </span>
              <span className="text-[10px] text-slate-500 font-normal lowercase">topic, coursework, tags, description</span>
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={requestSearchQuery}
                onChange={(e) => setRequestSearchQuery(e.target.value)}
                placeholder="Search requests (e.g. AP Calc, Chemistry, Java, Essay Review)..."
                className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                aria-label="Search requests by topic, coursework or tags"
              />
              {requestSearchQuery && (
                <button
                  type="button"
                  onClick={() => setRequestSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-md transition-colors"
                  title="Clear request search"
                  aria-label="Clear request search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 2. Student Name search bar */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                Search by Student Name
              </span>
              <span className="text-[10px] text-slate-500 font-normal lowercase">student creator or helper</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400/80" />
              <input
                type="text"
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
                placeholder="Search by student or helper name (e.g. Sophie, Marcus, Elena)..."
                className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                aria-label="Search requests by student or helper name"
              />
              {studentSearchQuery && (
                <button
                  type="button"
                  onClick={() => setStudentSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-md transition-colors"
                  title="Clear student name search"
                  aria-label="Clear student name search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Expanded Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
          {/* Department */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Department
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 truncate"
              aria-label="Filter by department"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Urgency
            </label>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 truncate"
              aria-label="Filter by urgency"
            >
              <option value="All Urgencies">All Urgencies</option>
              <option value="Critical (Next 24h)">Critical (&lt; 24h)</option>
              <option value="Urgent (2-3 Days)">Urgent (2-3 Days)</option>
              <option value="Standard (This Week)">Standard</option>
              <option value="Ongoing Project">Ongoing</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 truncate"
              aria-label="Filter by status"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Open">Open Only</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Grade Level Filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Grade Level
            </label>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 truncate"
              aria-label="Filter by student grade level"
            >
              <option value="All Grades">All Grades</option>
              <option value="Grade 9">Grade 9 (Freshman)</option>
              <option value="Grade 10">Grade 10 (Sophomore)</option>
              <option value="Grade 11">Grade 11 (Junior)</option>
              <option value="Grade 12">Grade 12 (Senior)</option>
              <option value="Class 9">Class 9</option>
              <option value="Class 10">Class 10</option>
              <option value="Class 11">Class 11</option>
              <option value="Class 12">Class 12</option>
              <option value="Faculty & Staff">Faculty & Staff</option>
              <option value="Alumni">Alumni</option>
            </select>
          </div>

          {/* Peer Offer Status Filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Offer Activity
            </label>
            <select
              value={offerStatusFilter}
              onChange={(e) => setOfferStatusFilter(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 truncate"
              aria-label="Filter by offer activity"
            >
              <option value="All">All Activity</option>
              <option value="Needs Helpers">Needs Helpers (0)</option>
              <option value="Has Active Offers">Has Offers (1+)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 truncate"
              aria-label="Sort requests by"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="urgency">Highest Urgency</option>
              <option value="offers">Most Discussion</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Pills & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-indigo-400" />
              Quick Filters:
            </span>
            <button
              type="button"
              onClick={() => {
                setUrgencyFilter((prev) => prev.includes('Critical') ? 'All Urgencies' : 'Critical (Next 24h)');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                urgencyFilter.includes('Critical')
                  ? 'bg-rose-950 text-rose-300 border border-rose-700'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              Critical Only
            </button>
            <button
              type="button"
              onClick={() => {
                setOfferStatusFilter((prev) => prev === 'Needs Helpers' ? 'All' : 'Needs Helpers');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                offerStatusFilter === 'Needs Helpers'
                  ? 'bg-amber-950 text-amber-300 border border-amber-700'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              Needs Helpers
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter((prev) => prev === 'Open' ? 'All Statuses' : 'Open');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                statusFilter === 'Open'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              Open Tickets
            </button>
            <button
              type="button"
              onClick={() => {
                setSortBy((prev) => prev === 'urgency' ? 'newest' : 'urgency');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                sortBy === 'urgency'
                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-700'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <ArrowUpDown className="w-3 h-3 text-indigo-400" />
              Urgency Order
            </button>
          </div>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleResetAllFilters}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-900/60 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Quick status tabs & counts */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Showing <strong className="text-white font-semibold">{filteredRequests.length}</strong> of {requests.length} tickets</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">{openCount} active open requests</span>
          </div>
          {newRequestsCount > 0 && (
            <span className="text-indigo-300 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              {newRequestsCount} fresh requests posted recently
            </span>
          )}
        </div>
      </div>

      {/* Ticket List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
            <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">No requests match your filters</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search query, student name, or filters, or post a new help request for the student body.
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetAllFilters}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 border border-slate-700"
                >
                  Clear All Filters
                </button>
              )}
              <button
                onClick={onOpenNewRequest}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
              >
                Create Help Ticket
              </button>
            </div>
          </div>
        ) : (
          filteredRequests.map((ticket) => {
            const isResolved = ticket.status === 'Resolved';
            const isCritical = ticket.urgency.includes('Critical');
            const isNew = newlyCreatedRequestId === ticket.id || isCreatedWithin24Hours(ticket.createdAt);
            const isJustPosted = newlyCreatedRequestId === ticket.id;

            const isAuthor = Boolean(
              profile && (
                profile.userId === ticket.creatorId ||
                profile.id === ticket.creatorId ||
                (profile.fullName && ticket.creatorName && profile.fullName.trim().toLowerCase() === ticket.creatorName.trim().toLowerCase())
              )
            );
            const isFacultyOrAdmin = Boolean(
              profile && (
                profile.grade === 'Faculty & Staff' ||
                (profile as any).role === 'admin' ||
                (profile as any).role === 'faculty'
              )
            );
            const isGuestPost = !ticket.creatorId || ticket.creatorId === 'guest' || ticket.creatorId.startsWith('guest-');
            const canDeleteTicket = isAuthor || isFacultyOrAdmin || (!profile && isGuestPost);

            return (
              <div
                key={ticket.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isNew ? 'animate-new-request ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-950/40 ' : ''
                }${
                  isResolved
                    ? 'bg-slate-900/50 border-slate-800/60 opacity-80'
                    : isCritical
                    ? 'bg-gradient-to-r from-rose-950/20 via-slate-900 to-slate-900 border-rose-900/40 hover:border-rose-700/60 shadow-lg shadow-rose-950/10'
                    : isNew
                    ? 'bg-gradient-to-r from-indigo-950/30 via-slate-900 to-slate-900 border-indigo-800/60 hover:border-indigo-600/70 hover:shadow-md'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left: Creator info & Ticket Content */}
                  <div className="flex items-start gap-3 flex-1">
                    <img
                      src={ticket.creatorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                      alt={ticket.creatorName}
                      className={`w-10 h-10 rounded-xl object-cover ring-1 flex-shrink-0 ${
                        isNew ? 'ring-indigo-500 ring-2' : 'ring-slate-700'
                      }`}
                    />

                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isNew && (
                          <span className="animate-pulse-badge px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-500/70 flex items-center gap-1 shadow-sm shadow-indigo-500/30">
                            <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                            NEW REQUEST
                          </span>
                        )}
                        {isJustPosted && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-600/60 flex items-center gap-1 animate-pulse">
                            ✨ Just Posted
                          </span>
                        )}
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
                        {(ticket.tags || []).map((tg, idx) => (
                          <span
                            key={`${tg}-${idx}`}
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
                            onClick={() => {
                              if (!profile) {
                                if (onOpenAuth) onOpenAuth();
                              } else {
                                setSelectedTicketForOffer(ticket);
                              }
                            }}
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

                      {onDeleteRequest && (
                        <button
                          type="button"
                          onClick={() => setTicketToDelete(ticket)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-rose-300 bg-rose-950/20 hover:bg-rose-950/50 border border-rose-900/40 hover:border-rose-800 transition-colors flex items-center gap-1.5"
                          title="Delete request from board"
                          aria-label={`Delete request: ${ticket.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          <span className="text-[11px] font-semibold text-rose-300">Delete</span>
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
                      {(ticket.offers || []).map((offer, idx) => {
                        const canDeleteOfferItem = Boolean(
                          profile && (
                            profile.userId === offer.helperId ||
                            profile.id === offer.helperId ||
                            (profile.fullName && offer.helperName && profile.fullName.trim().toLowerCase() === offer.helperName.trim().toLowerCase()) ||
                            profile.userId === ticket.creatorId ||
                            profile.id === ticket.creatorId ||
                            profile.grade === 'Faculty & Staff'
                          )
                        );

                        return (
                          <div
                            key={offer.id || `offer-${idx}`}
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
                                <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
                                  <span className="text-[10px] text-indigo-400 group-hover:translate-x-0.5 transition-transform font-medium flex items-center gap-0.5">
                                    View
                                    <ArrowRight className="w-2.5 h-2.5" />
                                  </span>
                                  {onDeleteOffer && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOfferToDelete({
                                          requestId: ticket.id,
                                          offerId: offer.id,
                                          helperName: offer.helperName
                                        });
                                      }}
                                      className="p-1 rounded text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/60 transition-colors ml-1"
                                      title="Delete offer message"
                                      aria-label={`Delete offer from ${offer.helperName}`}
                                    >
                                      <Trash2 className="w-3 h-3 text-rose-400" />
                                    </button>
                                  )}
                                </div>
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
                        );
                      })}
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
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
              {onDeleteOffer ? (
                <button
                  type="button"
                  onClick={() => {
                    setOfferToDelete({
                      requestId: selectedOfferModal.ticketId,
                      offerId: selectedOfferModal.offer.id,
                      helperName: selectedOfferModal.offer.helperName
                    });
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-white bg-rose-950/40 hover:bg-rose-900 border border-rose-900/50 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Message</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
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
        </div>
      )}

      {/* Delete Ticket Confirmation Dialog */}
      {ticketToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-rose-400 flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-display">Delete Help Request</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Are you sure you want to delete this help request? This post will be permanently removed from the School Request Board.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1.5">
              <div className="font-semibold text-white truncate">{ticketToDelete.title}</div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-medium">
                  {ticketToDelete.subject}
                </span>
                <span>•</span>
                <span>{ticketToDelete.department}</span>
              </div>
              <p className="text-slate-300 text-[11px] line-clamp-2 leading-relaxed">
                {ticketToDelete.description}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingTicket}
                onClick={() => setTicketToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingTicket}
                onClick={handleConfirmDeleteTicket}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isDeletingTicket ? 'Deleting...' : 'Delete Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Offer Message Confirmation Dialog */}
      {offerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-rose-400 flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-display">Delete Offer Message</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Are you sure you want to remove this offer message from {offerToDelete.helperName}?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingOffer}
                onClick={() => setOfferToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingOffer}
                onClick={handleConfirmDeleteOffer}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isDeletingOffer ? 'Removing...' : 'Delete Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
