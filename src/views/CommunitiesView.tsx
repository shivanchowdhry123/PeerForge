import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Community, CommunityPost } from '../types';
import { INITIAL_POSTS } from '../data/initialData';
import {
  Users,
  Search,
  CheckCircle2,
  Plus,
  ArrowLeft,
  MessageSquare,
  ThumbsUp,
  BarChart2,
  Calendar,
  Share2,
  Sparkles
} from 'lucide-react';

export const CommunitiesView: React.FC = () => {
  const {
    currentUser,
    communities,
    allStudents,
    selectedCommunityForDetail,
    setSelectedCommunityForDetail,
    toggleJoinCommunity,
    createCommunityPost,
    likeCommunityPost,
    votePoll,
    openAuthModal
  } = useApp();

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // New post state
  const [postContent, setPostContent] = useState('');
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOpt1, setPollOpt1] = useState('');
  const [pollOpt2, setPollOpt2] = useState('');

  // Clean example posts for active community
  const [localPosts, setLocalPosts] = useState<CommunityPost[]>(INITIAL_POSTS);

  const categories = [
    'All',
    'STEM & Robotics',
    'Debate & Leadership',
    'Academic Exploration',
    'Environment & Life Sciences',
    'Arts & Media'
  ];

  const filteredCommunities = (communities || []).filter(c => {
    if (!c) return false;
    if (activeCategory !== 'All' && c.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name?.toLowerCase().includes(q);
      const matchDesc = c.description?.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() || !selectedCommunityForDetail) return;

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      communityId: selectedCommunityForDetail.id,
      authorId: currentUser?.id || 'visitor',
      authorName: currentUser?.name || 'Visitor',
      authorGrade: currentUser?.grade || 'N/A',
      authorAvatar: currentUser?.avatar || '',
      content: postContent.trim(),
      createdAt: 'Just now',
      likes: 0,
      likedBy: [],
      commentsCount: 0,
      poll:
        showPollCreator && pollQuestion && pollOpt1 && pollOpt2
          ? {
              question: pollQuestion,
              options: [
                { text: pollOpt1, votes: 0, voters: [] },
                { text: pollOpt2, votes: 0, voters: [] }
              ]
            }
          : undefined
    };

    setLocalPosts(prev => [newPost, ...prev]);
    setPostContent('');
    setShowPollCreator(false);
    setPollQuestion('');
    setPollOpt1('');
    setPollOpt2('');
  };

  const handleVote = (postId: string, optIndex: number) => {
    setLocalPosts(prev =>
      prev.map(p => {
        if (p.id === postId && p.poll) {
          const updatedOptions = p.poll.options.map((opt, i) => {
            const hasVoted = currentUser && opt.voters.includes(currentUser.id);
            if (i === optIndex) {
              return {
                ...opt,
                votes: hasVoted ? opt.votes : opt.votes + 1,
                voters: hasVoted || !currentUser ? opt.voters : [...opt.voters, currentUser.id]
              };
            } else if (hasVoted && currentUser) {
              return {
                ...opt,
                votes: Math.max(0, opt.votes - 1),
                voters: opt.voters.filter(id => id !== currentUser.id)
              };
            }
            return opt;
          });
          return {
            ...p,
            poll: { ...p.poll, options: updatedOptions }
          };
        }
        return p;
      })
    );
  };

  const handleLike = (postId: string) => {
    setLocalPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const hasLiked = currentUser && p.likedBy.includes(currentUser.id);
          return {
            ...p,
            likes: hasLiked ? p.likes - 1 : (currentUser ? p.likes + 1 : p.likes),
            likedBy: hasLiked && currentUser
              ? p.likedBy.filter(id => id !== currentUser.id)
              : (currentUser ? [...p.likedBy, currentUser.id] : p.likedBy)
          };
        }
        return p;
      })
    );
  };

  const communityPosts = selectedCommunityForDetail
    ? localPosts.filter(p => p.communityId === selectedCommunityForDetail.id)
    : [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Community Detail Page */}
      {selectedCommunityForDetail ? (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedCommunityForDetail(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Communities</span>
          </button>

          {/* Banner & Information */}
          <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] overflow-hidden shadow-xs">
            {selectedCommunityForDetail.coverImage && (
              <div className="h-44 sm:h-56 w-full overflow-hidden relative">
                <img
                  src={selectedCommunityForDetail.coverImage}
                  alt={selectedCommunityForDetail.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>
            )}

            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {selectedCommunityForDetail.category}
                    </span>
                    {selectedCommunityForDetail.isOfficial && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200">
                        Official School Club
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">
                    {selectedCommunityForDetail.name}
                  </h1>
                  <p className="text-xs text-[var(--text-muted)]">
                    Led by {selectedCommunityForDetail.leaderName} · {selectedCommunityForDetail.membersCount} Members
                  </p>
                </div>

                <button
                  onClick={() => toggleJoinCommunity(selectedCommunityForDetail.id)}
                  className={`px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-xs shrink-0 ${
                    selectedCommunityForDetail.isJoined
                      ? 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:bg-red-50 hover:text-red-600'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {selectedCommunityForDetail.isJoined ? 'Member (Leave)' : 'Join Community'}
                </button>
              </div>

              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {selectedCommunityForDetail.description}
              </p>

              <div className="flex items-center gap-2 flex-wrap pt-2">
                {selectedCommunityForDetail.topics.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-[var(--bg-subtle)] text-xs font-medium text-[var(--text-secondary)] border border-[var(--border-color)]"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Posts & Discussions Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Create Post Form */}
              <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3 shadow-xs">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Share with Club Members</h3>
                {currentUser ? (
                  <form onSubmit={handleCreatePost} className="space-y-3">
                    <textarea
                      rows={3}
                      placeholder="Announce a project meeting, share resources, or discuss an upcoming competition..."
                      value={postContent}
                      onChange={e => setPostContent(e.target.value)}
                      className="w-full p-3.5 text-xs sm:text-sm rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-400"
                      required
                    />

                    {/* Optional Poll Drawer */}
                    {showPollCreator && (
                      <div className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-2">
                        <div className="text-xs font-bold text-[var(--text-primary)]">Add a Member Poll</div>
                        <input
                          type="text"
                          placeholder="Poll question..."
                          value={pollQuestion}
                          onChange={e => setPollQuestion(e.target.value)}
                          className="w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Option 1..."
                            value={pollOpt1}
                            onChange={e => setPollOpt1(e.target.value)}
                            className="p-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Option 2..."
                            value={pollOpt2}
                            onChange={e => setPollOpt2(e.target.value)}
                            className="p-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => setShowPollCreator(!showPollCreator)}
                        className="text-xs font-medium text-purple-700 dark:text-purple-300 hover:underline flex items-center gap-1"
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                        <span>{showPollCreator ? 'Remove Poll' : '+ Attach Poll'}</span>
                      </button>

                      <button
                        type="submit"
                        disabled={!postContent.trim()}
                        className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50 transition-colors shadow-xs"
                      >
                        Publish Post
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-center space-y-2">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Please sign in to post updates and participate in polls.</p>
                    <button
                      onClick={() => openAuthModal('login')}
                      className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>

              {/* Posts Feed */}
              <div className="space-y-4">
                {communityPosts.map(post => (
                  <div
                    key={post.id}
                    className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={post.authorAvatar}
                          alt={post.authorName}
                          className="w-9 h-9 rounded-xl bg-blue-100 object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span className="text-xs font-bold text-[var(--text-primary)] block">
                            {post.authorName}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {post.authorGrade} · {post.createdAt}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>

                    {/* Poll rendering if present */}
                    {post.poll && (
                      <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-2.5">
                        <span className="text-xs font-bold text-[var(--text-primary)] block">
                          📊 {post.poll.question}
                        </span>
                        <div className="space-y-2">
                          {post.poll.options.map((opt, idx) => {
                            const totalVotes = post.poll!.options.reduce((sum, o) => sum + o.votes, 0);
                            const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                            const hasVotedThis = currentUser && opt.voters.includes(currentUser.id);

                            return (
                              <button
                                key={idx}
                                onClick={() => handleVote(post.id, idx)}
                                className={`w-full p-2.5 rounded-xl border text-left transition-all relative overflow-hidden flex items-center justify-between ${
                                  hasVotedThis
                                    ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-semibold'
                                    : 'border-[var(--border-color)] bg-white dark:bg-slate-900/60 text-[var(--text-primary)]'
                                }`}
                              >
                                <div
                                  className="absolute left-0 top-0 bottom-0 bg-blue-100/50 dark:bg-blue-900/30 transition-all pointer-events-none"
                                  style={{ width: `${pct}%` }}
                                />
                                <span className="relative z-10 text-xs">{opt.text}</span>
                                <span className="relative z-10 text-[11px] font-bold num-tabular text-[var(--text-secondary)]">
                                  {pct}% ({opt.votes})
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]/60 text-xs">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-colors ${
                          currentUser && post.likedBy.includes(currentUser.id)
                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border-[var(--border-color)] hover:text-blue-600'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span className="font-semibold num-tabular">{post.likes}</span>
                      </button>

                      <span className="text-[11px] text-[var(--text-muted)]">
                        {post.commentsCount} comments
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Club Members & Officers */}
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Active Club Members</h3>
                  <span className="text-xs text-[var(--text-muted)] num-tabular">
                    {allStudents.length} total
                  </span>
                </div>

                <div className="space-y-3">
                  {allStudents.slice(0, 5).map(member => (
                    <div key={member.id} className="flex items-center gap-2.5">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-8 h-8 rounded-lg bg-blue-100 object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[var(--text-primary)] block truncate">
                          {member.name}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {member.grade} · {member.house}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Community Guidelines</h3>
                <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li>Respect school values and intellectual property.</li>
                  <li>Use constructive, encouraging language in peer discussions.</li>
                  <li>Official club announcements require mentor concurrence.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Communities Directory */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
                Communities & Interest Groups
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
                Join student-led clubs, societies, and academic circles at OPG World School
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3 shadow-xs">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search clubs, interest areas, and societies..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[var(--border-color)]/70 text-xs">
              <span className="text-[11px] font-semibold text-[var(--text-muted)] mr-1">Category:</span>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    activeCategory === cat
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Communities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCommunities.map(community => (
              <div
                key={community.id}
                className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-blue-300 dark:hover:border-blue-800 transition-all shadow-xs overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {community.coverImage && (
                    <div className="h-32 w-full overflow-hidden">
                      <img
                        src={community.coverImage}
                        alt={community.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        {community.category}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)] num-tabular">
                        {community.membersCount} members
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[var(--text-primary)]">
                      {community.name}
                    </h3>

                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      {community.description}
                    </p>

                    <div className="text-[11px] text-[var(--text-muted)] pt-1">
                      Lead: <span className="font-semibold text-[var(--text-primary)]">{community.leaderName}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCommunityForDetail(community)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-[var(--bg-subtle)] hover:bg-[var(--border-color)]/60 text-[var(--text-primary)] border border-[var(--border-color)] transition-colors text-center"
                  >
                    Enter Club
                  </button>

                  <button
                    onClick={() => toggleJoinCommunity(community.id)}
                    className={`py-2 px-4 rounded-xl text-xs font-semibold transition-colors ${
                      community.isJoined
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {community.isJoined ? 'Joined' : 'Join'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
