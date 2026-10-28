import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Question, Answer } from '../types';
import {
  HelpCircle,
  Search,
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  Sparkles,
  Plus,
  ArrowLeft,
  AlertCircle,
  Lightbulb,
  Share2,
  Send,
  BookOpen,
  X
} from 'lucide-react';

export const QAView: React.FC = () => {
  const {
    currentUser,
    questions,
    answers,
    selectedQuestionForDetail,
    setSelectedQuestionForDetail,
    askQuestion,
    postAnswer,
    upvoteAnswer,
    acceptAnswer,
    openAuthModal
  } = useApp();

  const [activeTopic, setActiveTopic] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'newest' | 'discussed' | 'unanswered'>('newest');

  // Ask Question Modal state
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [qTitle, setQTitle] = useState('');
  const [qBody, setQBody] = useState('');
  const [qTopic, setQTopic] = useState('Computer Science');
  const [qTags, setQTags] = useState('Python, Robotics');
  const [isAnalyzingWithAI, setIsAnalyzingWithAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{
    suggestedTags: string[];
    clarityTips: string;
    similarExistingQuestions: any[];
  } | null>(null);

  // New answer input state
  const [answerInput, setAnswerInput] = useState('');

  const topicsList = [
    'All',
    'Physics & STEM',
    'Electronics & Robotics',
    'Computer Science',
    'Mathematics',
    'Social Science & Debate',
    'Environment & Life Sciences',
    'Academic Exploration'
  ];

  // AI Assistance check when title blur
  const handleCheckQuestionAI = async () => {
    if (!qTitle.trim() || qTitle.length < 8) return;
    setIsAnalyzingWithAI(true);
    try {
      const res = await fetch('/api/ai/question-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: qTitle, body: qBody })
      });
      if (res.ok) {
        const data = await res.json();
        setAiSuggestions(data);
      }
    } catch (e) {
      console.warn('AI question assistant error', e);
    } finally {
      setIsAnalyzingWithAI(false);
    }
  };

  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qTitle.trim() || !qBody.trim()) return;

    const tagsArray = qTags.split(',').map(t => t.trim()).filter(Boolean);
    const newQ = await askQuestion({
      title: qTitle.trim(),
      body: qBody.trim(),
      topic: qTopic,
      tags: tagsArray.length > 0 ? tagsArray : ['Academics']
    });

    setQTitle('');
    setQBody('');
    setAiSuggestions(null);
    setIsAskModalOpen(false);
    setSelectedQuestionForDetail(newQ);
  };

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerInput.trim() || !selectedQuestionForDetail) return;
    postAnswer(selectedQuestionForDetail.id, answerInput);
    setAnswerInput('');
  };

  // Filtered & sorted questions
  const filteredQuestions = (questions || []).filter(q => {
    if (!q) return false;
    if (activeTopic !== 'All' && q.topic !== activeTopic) return false;
    if (searchQuery.trim()) {
      const s = searchQuery.toLowerCase();
      const matchT = q.title.toLowerCase().includes(s);
      const matchB = q.body.toLowerCase().includes(s);
      const matchTags = q.tags.some(t => t.toLowerCase().includes(s));
      if (!matchT && !matchB && !matchTags) return false;
    }
    if (sortOption === 'unanswered' && q.answersCount > 0) return false;
    return true;
  });

  if (sortOption === 'discussed') {
    filteredQuestions.sort((a, b) => b.answersCount - a.answersCount);
  }

  // Active question answers
  const currentAnswers = (selectedQuestionForDetail && (answers || []).length > 0)
    ? (answers || []).filter(a => a && a.questionId === selectedQuestionForDetail.id)
    : [];

  const solvedCount = (questions || []).filter(q => Boolean(q.acceptedAnswerId)).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Question Detail View */}
      {selectedQuestionForDetail ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          <button
            onClick={() => setSelectedQuestionForDetail(null)}
            className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to All Questions & Requests</span>
          </button>

          {/* Question Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)]/90 border border-[var(--border-color)] shadow-md backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedQuestionForDetail.topic}</span>
                <span>·</span>
                <span className="text-[var(--text-secondary)]">Asked by {selectedQuestionForDetail.authorName} ({selectedQuestionForDetail.authorGrade})</span>
                <span>·</span>
                <span className="num-tabular">{selectedQuestionForDetail.createdAt}</span>
              </div>

              {selectedQuestionForDetail.acceptedAnswerId && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Verified Solution</span>
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              {selectedQuestionForDetail.title}
            </h1>

            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
              {selectedQuestionForDetail.body}
            </p>

            <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-[var(--border-color)]/70">
              {selectedQuestionForDetail.tags.map((t, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-[var(--bg-subtle)] text-[11px] font-medium text-[var(--text-secondary)] border border-[var(--border-color)]"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>

          {/* Answers Count & List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                {currentAnswers.length} {currentAnswers.length === 1 ? 'Peer Answer' : 'Peer Answers'}
              </h2>
              {selectedQuestionForDetail.acceptedAnswerId && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  Author marked best solution
                </span>
              )}
            </div>

            {currentAnswers.map(ans => {
              const isAccepted = ans.isAccepted;
              const canAccept =
                currentUser &&
                selectedQuestionForDetail.authorId === currentUser.id &&
                !selectedQuestionForDetail.acceptedAnswerId;

              return (
                <div
                  key={ans.id}
                  className={`p-6 rounded-3xl transition-all space-y-4 backdrop-blur-md ${
                    isAccepted
                      ? 'border-2 border-emerald-500/30 bg-emerald-500/5 shadow-md'
                      : 'border border-[var(--border-color)] bg-[var(--bg-surface)]/85 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={ans.authorAvatar}
                        alt={ans.authorName}
                        className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900 object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span className="text-xs font-bold text-[var(--text-primary)] block">
                          {ans.authorName}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] num-tabular">
                          {ans.authorGrade} · {ans.createdAt}
                        </span>
                      </div>
                    </div>

                    {isAccepted ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Accepted Solution</span>
                      </span>
                    ) : canAccept ? (
                      <button
                        onClick={() => acceptAnswer(selectedQuestionForDetail.id, ans.id)}
                        className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 bg-emerald-500/10 hover:bg-emerald-500/20 px-3.5 py-1.5 rounded-xl border border-emerald-500/30 transition-colors cursor-pointer"
                      >
                        Accept this Answer
                      </button>
                    ) : null}
                  </div>

                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                    {ans.body}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]/60">
                    <button
                      onClick={() => upvoteAnswer(ans.id)}
                      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        currentUser && ans.upvotedBy.includes(currentUser.id)
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-color)] hover:text-blue-600'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span className="num-tabular">{ans.upvotes} Upvotes</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Post Answer Form */}
            {currentUser ? (
              <form onSubmit={handleAnswerSubmit} className="p-6 rounded-3xl bg-[var(--bg-surface)]/90 border border-[var(--border-color)] shadow-xs space-y-3 backdrop-blur-md">
                <label className="text-xs font-bold text-[var(--text-primary)] block">
                  Write Your Solution or Advice
                </label>
                <textarea
                  rows={4}
                  value={answerInput}
                  onChange={e => setAnswerInput(e.target.value)}
                  placeholder="Share a step-by-step explanation, relevant documentation, or code snippets..."
                  className="w-full p-3.5 text-xs sm:text-sm rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-all"
                  required
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[var(--text-muted)]">
                    Be constructive and follow OPG academic guidelines
                  </span>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Solution</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center space-y-2">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Please sign in to answer questions and help your fellow students.</p>
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Sign In to Answer
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Questions Forum Directory */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-1">
                <span>OPG World School</span>
                <span>·</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">Peer Academic Exchange</span>
                <span>·</span>
                <span className="num-tabular font-medium">{solvedCount} Solved</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                Questionnaire & Peer Requests
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
                Submit questions, post project teammate inquiries, or resolve academic doubts across Class 9–12 subjects.
              </p>
            </div>

            <button
              onClick={() => setIsAskModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all self-start sm:self-auto cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Ask a Question</span>
            </button>
          </div>

          {/* Search & Topic Tabs */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[var(--bg-surface)]/85 border border-[var(--border-color)] space-y-3.5 shadow-xs backdrop-blur-md">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search questions by topic, concept, or keywords..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[var(--text-muted)] shrink-0">Sort by:</span>
                <select
                  value={sortOption}
                  onChange={e => setSortOption(e.target.value as any)}
                  className="px-3 py-2 text-xs font-medium rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="discussed">Most Discussed</option>
                  <option value="unanswered">Unanswered</option>
                </select>
              </div>
            </div>

            {/* Topic Filter Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap pt-2.5 border-t border-[var(--border-color)]/70 text-xs">
              <span className="text-[11px] font-semibold text-[var(--text-muted)] mr-1">Topics:</span>
              {topicsList.map(topic => (
                <button
                  key={topic}
                  onClick={() => setActiveTopic(topic)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    activeTopic === topic
                      ? 'bg-blue-600 text-white shadow-xs font-semibold'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-3.5">
            {filteredQuestions.length === 0 ? (
              <div className="p-12 rounded-3xl bg-[var(--bg-surface)]/80 border border-[var(--border-color)] text-center space-y-3 backdrop-blur-md">
                <HelpCircle className="w-10 h-10 text-[var(--text-muted)] mx-auto opacity-50" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">No questions found</h3>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                  Be the first to post a question or topic request in this subject category!
                </p>
                <button
                  onClick={() => setIsAskModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-xs"
                >
                  Post a Question
                </button>
              </div>
            ) : (
              filteredQuestions.map(q => (
                <div
                  key={q.id}
                  onClick={() => setSelectedQuestionForDetail(q)}
                  className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-surface)]/85 hover:bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-blue-400/50 dark:hover:border-blue-500/50 transition-all shadow-xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer group space-y-3 backdrop-blur-md"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{q.topic}</span>
                      <span>·</span>
                      <span>{q.authorName} ({q.authorGrade})</span>
                      <span>·</span>
                      <span className="num-tabular">{q.createdAt}</span>
                    </div>

                    {q.acceptedAnswerId && (
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>Solved</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {q.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                    {q.body}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]/60 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {q.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-md bg-[var(--bg-subtle)] text-[10px] font-medium text-[var(--text-secondary)] border border-[var(--border-color)]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 text-[var(--text-muted)] text-xs font-semibold num-tabular">
                      <span className="flex items-center gap-1 group-hover:text-blue-600 transition-colors">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{q.answersCount} {q.answersCount === 1 ? 'answer' : 'answers'}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Ask Question Modal with AI Assistant */}
      {isAskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-[var(--border-color)] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 backdrop-blur-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                    Ask Student Community
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">OPG World School peer academic board</p>
                </div>
              </div>
              <button
                onClick={() => setIsAskModalOpen(false)}
                className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAskSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                  Question Title:
                </label>
                <input
                  type="text"
                  placeholder="e.g. How do you implement PID control on Arduino for line tracking?"
                  value={qTitle}
                  onChange={e => setQTitle(e.target.value)}
                  onBlur={handleCheckQuestionAI}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-all"
                  required
                />
              </div>

              {/* AI Assistant feedback box */}
              {isAnalyzingWithAI ? (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-700 dark:text-purple-300 flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  <span>AI Assistant checking for similar questions & suggestions...</span>
                </div>
              ) : (
                aiSuggestions && (
                  <div className="p-4 rounded-2xl bg-purple-500/8 border border-purple-500/20 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-purple-700 dark:text-purple-300">
                      <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                      <span>AI Question Coach</span>
                    </div>
                    <p className="text-[var(--text-secondary)]">{aiSuggestions.clarityTips}</p>

                    {aiSuggestions.suggestedTags && (
                      <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                        <span className="font-semibold text-purple-700 dark:text-purple-300">Suggested tags:</span>
                        {aiSuggestions.suggestedTags.map((t, idx) => (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => setQTags(prev => (prev ? `${prev}, ${t}` : t))}
                            className="px-2 py-0.5 rounded-md bg-[var(--bg-surface)] text-[10px] text-purple-700 dark:text-purple-300 border border-purple-300/40 font-medium cursor-pointer"
                          >
                            +{t}
                          </button>
                        ))}
                      </div>
                    )}

                    {aiSuggestions.similarExistingQuestions?.length > 0 && (
                      <div className="pt-2 border-t border-purple-200/40 dark:border-purple-800/40">
                        <span className="font-semibold text-purple-700 dark:text-purple-300">
                          Similar existing questions:
                        </span>
                        <ul className="list-disc pl-4 mt-1 text-[11px] text-[var(--text-secondary)] space-y-0.5">
                          {aiSuggestions.similarExistingQuestions.map((sq, i) => (
                            <li key={i}>{sq.title}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                    Subject Topic:
                  </label>
                  <select
                    value={qTopic}
                    onChange={e => setQTopic(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Social Science & Debate">Social Science & Debate</option>
                    <option value="Environment & Life Sciences">Environment & Life Sciences</option>
                    <option value="Academic Exploration">Academic Exploration</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                    Tags (comma separated):
                  </label>
                  <input
                    type="text"
                    value={qTags}
                    onChange={e => setQTags(e.target.value)}
                    placeholder="e.g. Arduino, PID, Control"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                  Detailed Explanation:
                </label>
                <textarea
                  rows={5}
                  placeholder="Describe your current approach, where you are getting stuck, and what references you have reviewed..."
                  value={qBody}
                  onChange={e => setQBody(e.target.value)}
                  className="w-full p-3 text-xs sm:text-sm rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                <span className="leading-relaxed">
                  Academic Integrity Notice: Do not post active exam questions. Ask for conceptual clarification, debugging advice, or research references.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAskModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Publish Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
