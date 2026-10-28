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
  Tag,
  ChevronDown,
  AlertCircle,
  Lightbulb
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
    'Computer Science',
    'Mathematics',
    'Social Science & Debate',
    'Environment & Life Sciences',
    'Academic Exploration',
    'General'
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Question Detail View */}
      {selectedQuestionForDetail ? (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedQuestionForDetail(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Questions</span>
          </button>

          {/* Question Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-4 shadow-xs">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {selectedQuestionForDetail.topic}
                </span>
                <span className="text-xs text-[var(--text-muted)]">·</span>
                <span className="text-xs text-[var(--text-muted)]">
                  Asked by {selectedQuestionForDetail.authorName} ({selectedQuestionForDetail.authorGrade})
                </span>
                <span className="text-xs text-[var(--text-muted)]">·</span>
                <span className="text-xs text-[var(--text-muted)]">{selectedQuestionForDetail.createdAt}</span>
              </div>

              {selectedQuestionForDetail.acceptedAnswerId && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Answer Accepted</span>
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">
              {selectedQuestionForDetail.title}
            </h1>

            <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
              {selectedQuestionForDetail.body}
            </p>

            <div className="flex items-center gap-1.5 flex-wrap pt-3 border-t border-[var(--border-color)]/70">
              {selectedQuestionForDetail.tags.map((t, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-[var(--bg-subtle)] text-[11px] font-medium text-[var(--text-secondary)] border border-[var(--border-color)]"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>

          {/* Answers Count & List */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              {currentAnswers.length} {currentAnswers.length === 1 ? 'Answer' : 'Answers'}
            </h2>

            {currentAnswers.map(ans => {
              const isAccepted = ans.isAccepted;
              const canAccept =
                currentUser &&
                selectedQuestionForDetail.authorId === currentUser.id &&
                !selectedQuestionForDetail.acceptedAnswerId;

              return (
                <div
                  key={ans.id}
                  className={`p-6 rounded-3xl bg-[var(--bg-surface)] border transition-all space-y-3.5 shadow-xs ${
                    isAccepted
                      ? 'border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/20 dark:bg-emerald-950/20'
                      : 'border-[var(--border-color)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={ans.authorAvatar}
                        alt={ans.authorName}
                        className="w-8 h-8 rounded-xl bg-blue-100 object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span className="text-xs font-bold text-[var(--text-primary)] block">
                          {ans.authorName}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {ans.authorGrade} · {ans.createdAt}
                        </span>
                      </div>
                    </div>

                    {isAccepted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Accepted Answer</span>
                      </span>
                    ) : canAccept ? (
                      <button
                        onClick={() => acceptAnswer(selectedQuestionForDetail.id, ans.id)}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-xl border border-emerald-200 transition-colors"
                      >
                        Mark as Accepted
                      </button>
                    ) : null}
                  </div>

                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                    {ans.body}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]/60">
                    <button
                      onClick={() => upvoteAnswer(ans.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        currentUser && ans.upvotedBy.includes(currentUser.id)
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-color)] hover:text-blue-600'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span className="num-tabular">{ans.upvotes} Upvotes</span>
                    </button>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      Helpful Academic Contribution
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit Answer Form */}
          <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Your Answer</h3>
            {currentUser ? (
              <>
                <p className="text-xs text-[var(--text-muted)]">
                  Support your peer with clear reasoning, textbook references, or problem-solving steps.
                </p>
                <form onSubmit={handleAnswerSubmit} className="space-y-3">
                  <textarea
                    rows={4}
                    value={answerInput}
                    onChange={e => setAnswerInput(e.target.value)}
                    placeholder="Write your explanation or step-by-step resolution..."
                    className="w-full p-4 text-xs sm:text-sm rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-blue-400"
                    required
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!answerInput.trim()}
                      className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                    >
                      Post Answer
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-center space-y-2">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Please sign in to answer questions and help your peers.</p>
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold"
                >
                  Sign In
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
              <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
                Questions & Answers
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
                Peer learning forum for OPG World School across STEM, humanities, and project research
              </p>
            </div>

            <button
              onClick={() => setIsAskModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Ask a Question</span>
            </button>
          </div>

          {/* Search & Topic Tabs */}
          <div className="p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search questions by topic, concept, or keywords..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[var(--text-secondary)]">Sort:</span>
                <select
                  value={sortOption}
                  onChange={e => setSortOption(e.target.value as any)}
                  className="px-3 py-2 text-xs font-medium rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                >
                  <option value="newest">Newest</option>
                  <option value="discussed">Most Discussed</option>
                  <option value="unanswered">Unanswered</option>
                </select>
              </div>
            </div>

            {/* Topic Filter Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[var(--border-color)]/70 text-xs">
              <span className="text-[11px] font-semibold text-[var(--text-muted)] mr-1">Topic:</span>
              {topicsList.map(topic => (
                <button
                  key={topic}
                  onClick={() => setActiveTopic(topic)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    activeTopic === topic
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-3">
            {filteredQuestions.map(q => (
              <div
                key={q.id}
                onClick={() => setSelectedQuestionForDetail(q)}
                className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-blue-300 dark:hover:border-blue-800 transition-all shadow-xs cursor-pointer group space-y-2.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{q.topic}</span>
                    <span>·</span>
                    <span>{q.authorName} ({q.authorGrade})</span>
                    <span>·</span>
                    <span>{q.createdAt}</span>
                  </div>

                  {q.acceptedAnswerId && (
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200">
                      Solved
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-blue-600 transition-colors">
                  {q.title}
                </h3>

                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                  {q.body}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]/60 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {q.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded-md bg-[var(--bg-subtle)] text-[10px] font-medium text-[var(--text-secondary)]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 text-[var(--text-muted)] text-xs font-semibold num-tabular">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{q.answersCount} answers</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ask Question Modal with AI Assistant */}
      {isAskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-[var(--border-color)] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Ask OPG Student Community
                </h3>
              </div>
              <button
                onClick={() => setIsAskModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm font-semibold"
              >
                ✕
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
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-400"
                  required
                />
              </div>

              {/* AI Assistant feedback box */}
              {isAnalyzingWithAI ? (
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-700 flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  <span>AI Assistant checking for similar questions & suggestions...</span>
                </div>
              ) : (
                aiSuggestions && (
                  <div className="p-3.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-purple-800 dark:text-purple-300">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>AI Question Coach</span>
                    </div>
                    <p className="text-purple-900 dark:text-purple-200">{aiSuggestions.clarityTips}</p>

                    {aiSuggestions.suggestedTags && (
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="font-semibold text-purple-800 dark:text-purple-300">Suggested tags:</span>
                        {aiSuggestions.suggestedTags.map((t, idx) => (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => setQTags(prev => (prev ? `${prev}, ${t}` : t))}
                            className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-[10px] text-purple-700 dark:text-purple-300 border border-purple-200 font-medium"
                          >
                            +{t}
                          </button>
                        ))}
                      </div>
                    )}

                    {aiSuggestions.similarExistingQuestions?.length > 0 && (
                      <div className="pt-2 border-t border-purple-200/60 dark:border-purple-800/60">
                        <span className="font-semibold text-purple-800 dark:text-purple-300">
                          Similar existing questions:
                        </span>
                        <ul className="list-disc pl-4 mt-1 text-[11px] text-purple-900 dark:text-purple-200 space-y-0.5">
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
                  className="w-full p-3 text-xs sm:text-sm rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 text-[11px] text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Academic Integrity: Do not post questions from active exams or assessments. Ask for
                  conceptual explanations, debugging advice, or reference materials.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAskModalOpen(false)}
                  className="px-4 py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
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
