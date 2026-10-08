import React, { useState, useEffect } from 'react';
import { Quiz, QuizAttempt, LeaderboardEntry, Reminder, Message } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';
import { BarChart } from '../charts/BarChart';
import { LineChart } from '../charts/LineChart';
import { DoughnutChart } from '../charts/DoughnutChart';
import { CategoryMasteryProgressChart } from '../charts/CategoryMasteryProgressChart';
import {
  BookOpen,
  Clock,
  TrendingUp,
  Trophy,
  CalendarClock,
  MessageSquare,
  UserCircle,
  Play,
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  Eye,
  Plus,
  Send,
  Calendar,
  Sparkles,
  Search
} from 'lucide-react';
import { TopPerformersWidget } from './TopPerformersWidget';

interface ParticipantDashboardProps {
  initialTab?: string;
  onStartQuiz: (quiz: Quiz) => void;
  onViewReport: (attemptId: number) => void;
}

export const ParticipantDashboard: React.FC<ParticipantDashboardProps> = ({
  initialTab = 'dashboard',
  onStartQuiz,
  onViewReport
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab);

  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [allAttempts, setAllAttempts] = useState<QuizAttempt[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter for Quizzes
  const [quizSearch, setQuizSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Pre-Quiz Modal
  const [preQuizModal, setPreQuizModal] = useState<Quiz | null>(null);

  // Add Reminder Modal
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderQuizId, setReminderQuizId] = useState<number | null>(null);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');

  // Send Message State
  const [messageQuizId, setMessageQuizId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    loadParticipantData();
  }, [user]);

  const loadParticipantData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [allQuizzes, myAttempts, lb, rems, msgs, allAtts] = await Promise.all([
        api.getQuizzes({ status: 'PUBLISHED' }),
        api.getAttemptsByParticipant(user.id),
        api.getLeaderboard(),
        api.getReminders(user.id),
        api.getMessages(user.id, user.role),
        api.getAllAttempts()
      ]);
      setAvailableQuizzes(allQuizzes);
      setAttempts(myAttempts);
      setLeaderboard(lb);
      setReminders(rems);
      setMessages(msgs);
      setAllAttempts(allAtts || []);
    } catch (err: any) {
      showToast(err.message || 'Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Pre-Quiz Handler
  const handleOpenPreQuiz = (quiz: Quiz) => {
    setPreQuizModal(quiz);
  };

  const handleConfirmStartQuiz = () => {
    if (preQuizModal) {
      const q = preQuizModal;
      setPreQuizModal(null);
      onStartQuiz(q);
    }
  };

  // Reminder Handlers
  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reminderQuizId || !reminderDate || !reminderTime) {
      showToast('Please fill in all reminder fields.', 'error');
      return;
    }
    const q = availableQuizzes.find(item => item.id === reminderQuizId);
    if (!q) return;

    try {
      const newRem = await api.createReminder({
        participantId: user.id,
        quizId: q.id,
        quizTitle: q.title,
        reminderDate,
        reminderTime
      });
      showToast(`Reminder created for ${q.title}!`, 'success');
      setReminders(prev => [newRem, ...prev]);
      setReminderModalOpen(false);
      setReminderDate('');
      setReminderTime('');
    } catch (err: any) {
      showToast(err.message || 'Failed to create reminder.', 'error');
    }
  };

  const handleToggleReminder = async (id: number) => {
    try {
      const updated = await api.toggleReminder(id);
      showToast(`Reminder ${updated.isActive ? 'enabled' : 'disabled'}.`, 'info');
      setReminders(prev => prev.map(r => (r.id === id ? updated : r)));
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle reminder.', 'error');
    }
  };

  const handleDeleteReminder = async (id: number) => {
    try {
      await api.deleteReminder(id);
      showToast('Reminder removed.', 'info');
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      showToast(err.message || 'Failed to delete reminder.', 'error');
    }
  };

  // Message Handler
  const handleSendMessageToCreator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !messageText.trim()) return;

    const quizObj = availableQuizzes.find(q => q.id === messageQuizId);
    const receiverId = quizObj ? quizObj.creatorId : 2; // Default to creator Prof. Sarah Jenkins
    const receiverName = quizObj ? quizObj.creatorName || 'Instructor' : 'Prof. Sarah Jenkins';

    try {
      const newMsg = await api.sendMessage({
        senderId: user.id,
        senderName: user.name,
        senderRole: user.role,
        receiverId,
        receiverName,
        quizId: quizObj?.id,
        quizTitle: quizObj?.title,
        message: messageText.trim()
      });
      showToast('Message sent to quiz creator.', 'success');
      setMessages(prev => [newMsg, ...prev]);
      setMessageText('');
    } catch (err: any) {
      showToast(err.message || 'Failed to send message.', 'error');
    }
  };

  // Metrics
  const completedCount = attempts.length;
  const scores = attempts.map(a => a.percentage);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const myRankEntry = leaderboard.find(e => e.participantId === user?.id);
  const myRank = myRankEntry ? myRankEntry.rank : '-';

  // Categories list
  const categories = ['All', ...Array.from(new Set(availableQuizzes.map(q => q.category)))];

  const filteredQuizzes = availableQuizzes.filter(q => {
    const matchCat = selectedCategory === 'All' || q.category === selectedCategory;
    const matchSearch =
      q.title.toLowerCase().includes(quizSearch.toLowerCase()) ||
      q.description.toLowerCase().includes(quizSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  // Performance Charts Data
  const scoreHistoryLabels = attempts.map((_, idx) => `Quiz #${idx + 1}`);
  const scoreHistoryValues = attempts.map(a => a.percentage);

  const totalCorrect = attempts.reduce((acc, a) => acc + a.correctAnswers, 0);
  const totalWrong = attempts.reduce((acc, a) => acc + a.wrongAnswers, 0);
  const totalUnanswered = attempts.reduce((acc, a) => acc + a.unanswered, 0);

  const passes = attempts.filter(a => a.status === 'PASS').length;
  const fails = attempts.filter(a => a.status === 'FAIL').length;

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
            Student Dashboard
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Java Learning & Assessment Hub</h1>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'dashboard' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'quizzes' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Available Quizzes ({availableQuizzes.length})
          </button>
          <button
            onClick={() => setActiveTab('attempts')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'attempts' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Attempts ({attempts.length})
          </button>
          <button
            onClick={() => setActiveTab('participant-performance')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'participant-performance'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Performance
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'leaderboard' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'reminders' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Reminders ({reminders.filter(r => r.isActive).length})
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'messages' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ask Instructor
          </button>
        </div>

      {/* 10. PARTICIPANT OVERVIEW TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <div className="text-xs font-medium text-slate-500">Available Quizzes</div>
              <div className="text-xl font-bold text-slate-900 font-mono mt-1">{availableQuizzes.length}</div>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <div className="text-xs font-medium text-slate-500">Completed Quizzes</div>
              <div className="text-xl font-bold text-indigo-600 font-mono mt-1">{completedCount}</div>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <div className="text-xs font-medium text-slate-500">Average Score</div>
              <div className="text-xl font-bold text-slate-900 font-mono mt-1">{avgScore}%</div>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <div className="text-xs font-medium text-slate-500">Best Score</div>
              <div className="text-xl font-bold text-emerald-600 font-mono mt-1">{bestScore}%</div>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <div className="text-xs font-medium text-slate-500">Total Attempts</div>
              <div className="text-xl font-bold text-slate-900 font-mono mt-1">{completedCount}</div>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <div className="text-xs font-medium text-slate-500">Leaderboard Rank</div>
              <div className="text-xl font-bold text-amber-600 font-mono mt-1">#{myRank}</div>
            </div>
          </div>

          {/* Top Performers Leaderboard Widget */}
          <TopPerformersWidget
            leaderboard={leaderboard}
            attempts={allAttempts.length > 0 ? allAttempts : attempts}
            availableQuizzes={availableQuizzes}
            currentUser={user}
            onStartQuiz={handleOpenPreQuiz}
            onViewFullLeaderboard={() => setActiveTab('leaderboard')}
          />

          {/* Quick Start Featured Quizzes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Featured Java Challenges
              </h2>
              <button
                onClick={() => setActiveTab('quizzes')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>View All ({availableQuizzes.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availableQuizzes.slice(0, 3).map(quiz => (
                <div
                  key={quiz.id}
                  className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between hover:border-indigo-300 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                      <span>{quiz.category}</span>
                      <span>{quiz.durationMinutes} Mins</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1.5">{quiz.title}</h3>
                    <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                      {quiz.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] text-slate-400">
                      {quiz.questions.length} Questions · Pass {quiz.passingPercentage}%
                    </div>
                    <button
                      onClick={() => handleOpenPreQuiz(quiz)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Quiz</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Attempts Preview */}
          {attempts.length > 0 && (
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Recent Completed Evaluations</h3>
                <button
                  onClick={() => setActiveTab('attempts')}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  View Full History
                </button>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {attempts.slice(0, 3).map(att => (
                  <div key={att.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{att.quizTitle}</div>
                      <div className="text-slate-400 text-[11px]">
                        {new Date(att.submittedAt).toLocaleDateString()} · {att.quizCategory}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-mono font-bold text-slate-900">
                          {att.score}/{att.totalMarks} ({att.percentage}%)
                        </div>
                        <div
                          className={`text-[10px] font-bold uppercase ${
                            att.status === 'PASS' ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {att.status}
                        </div>
                      </div>
                      <button
                        onClick={() => onViewReport(att.id)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition-colors"
                      >
                        View Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mastery Progress Callout */}
          <div className="rounded-xl border border-indigo-200/80 bg-linear-to-r from-indigo-50/70 via-white to-sky-50/50 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-600 text-white shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  Topic Mastery Progress
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Visualize your score trajectories across Java Basics, OOP, Collections, and Concurrency.
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('participant-performance')}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
            >
              View Mastery Progress Chart
            </button>
          </div>
        </div>
      )}

      {/* 11. TAKE QUIZ / AVAILABLE QUIZZES TAB */}
      {activeTab === 'quizzes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Search and Category Filter */}
            <div className="flex items-center gap-3 flex-1 max-w-lg">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search quizzes by title or keyword..."
                  value={quizSearch}
                  onChange={e => setQuizSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 font-medium"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quizzes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredQuizzes.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 text-xs">
                No published quizzes found matching search or category.
              </div>
            ) : (
              filteredQuizzes.map(quiz => (
                <div
                  key={quiz.id}
                  className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between hover:shadow-md transition-all hover:border-indigo-300"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-indigo-600 font-semibold mb-2">
                      <span>{quiz.category}</span>
                      <span className="text-slate-400 font-mono font-normal">
                        {quiz.durationMinutes} mins
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm mb-2">{quiz.title}</h3>
                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-3 mb-4">
                      {quiz.description}
                    </p>
                  </div>

                  <div>
                    <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-100 text-center text-[11px] text-slate-500 mb-4">
                      <div>
                        <div className="font-bold text-slate-900 font-mono">{quiz.questions.length}</div>
                        <div>Questions</div>
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 font-mono">{quiz.totalMarks || 50}</div>
                        <div>Total Marks</div>
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 font-mono">{quiz.passingPercentage}%</div>
                        <div>Passing %</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenPreQuiz(quiz)}
                        className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Timed Quiz</span>
                      </button>
                      <button
                        onClick={() => {
                          setReminderQuizId(quiz.id);
                          setReminderModalOpen(true);
                        }}
                        className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors"
                        title="Set a reminder"
                      >
                        <CalendarClock className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 16. QUIZ PARTICIPATION HISTORY TAB */}
      {activeTab === 'attempts' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500">
            Complete log of all quizzes you have attempted. Click "View Report" to see question-by-question explanations.
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Quiz</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Percentage</th>
                    <th className="px-4 py-3">Time Taken</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">View Report</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {attempts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                        You have not attempted any quizzes yet. Choose a quiz from the "Available Quizzes" tab!
                      </td>
                    </tr>
                  ) : (
                    attempts.map(att => (
                      <tr key={att.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-900">{att.quizTitle}</td>
                        <td className="px-4 py-3 text-slate-500 font-mono">
                          {new Date(att.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 font-mono">
                          {att.score} / {att.totalMarks}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold">{att.percentage}%</td>
                        <td className="px-4 py-3 font-mono">
                          {Math.floor(att.timeTakenSeconds / 60)}m {att.timeTakenSeconds % 60}s
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`font-semibold uppercase text-[10px] ${
                              att.status === 'PASS' ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {att.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => onViewReport(att.id)}
                            className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded text-[11px] transition-colors"
                          >
                            View Report
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 15. PARTICIPANT PERFORMANCE DASHBOARD (CHARTS) */}
      {activeTab === 'participant-performance' && (
        <div className="space-y-6">
          {/* Recharts Category Mastery Progress Chart */}
          <CategoryMasteryProgressChart attempts={attempts} height={320} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Overall Score Trajectory</h3>
              <LineChart
                data={{
                  labels: scoreHistoryLabels.length > 0 ? scoreHistoryLabels : ['Assessment 1'],
                  datasets: [
                    {
                      label: 'Score Percentage',
                      data: scoreHistoryValues.length > 0 ? scoreHistoryValues : [85],
                      borderColor: '#4f46e5',
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      fill: true,
                      tension: 0.3
                    }
                  ]
                }}
                height={230}
              />
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">
                Answer Accuracy Breakdown
              </h3>
              <DoughnutChart
                data={{
                  labels: ['Correct', 'Incorrect', 'Unanswered'],
                  datasets: [
                    {
                      data: [totalCorrect || 1, totalWrong || 0, totalUnanswered || 0],
                      backgroundColor: ['#10b981', '#f43f5e', '#cbd5e1'],
                      borderWidth: 0
                    }
                  ]
                }}
                height={230}
              />
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Pass / Fail Outcome Ratios</h3>
              <DoughnutChart
                data={{
                  labels: ['Passes', 'Not Passed'],
                  datasets: [
                    {
                      data: [passes || 1, fails || 0],
                      backgroundColor: ['#059669', '#e11d48'],
                      borderWidth: 0
                    }
                  ]
                }}
                height={230}
              />
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Mastery Overview</h3>
              <div className="space-y-3 pt-2 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Total Evaluated Questions</span>
                  <span className="font-mono font-bold text-slate-900">
                    {totalCorrect + totalWrong + totalUnanswered}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Average Percentage</span>
                  <span className="font-mono font-bold text-indigo-600">{avgScore}%</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Overall Success Rate</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {attempts.length > 0 ? Math.round((passes / attempts.length) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 17. LEADERBOARD TAB */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          {/* Top Performers Leaderboard Widget */}
          <TopPerformersWidget
            leaderboard={leaderboard}
            attempts={allAttempts.length > 0 ? allAttempts : attempts}
            availableQuizzes={availableQuizzes}
            currentUser={user}
            onStartQuiz={handleOpenPreQuiz}
            onViewFullLeaderboard={() => {}}
          />

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Comprehensive Cohort Standings</h3>
              <div className="text-xs text-slate-500">
                Community standings ranked by total points and average quiz performance.
              </div>
            </div>
            {myRankEntry && (
              <div className="px-3 py-1 bg-amber-50 text-amber-900 rounded-lg text-xs font-semibold border border-amber-200">
                Your Current Rank: #{myRankEntry.rank} ({myRankEntry.totalPoints} pts)
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 font-mono">Rank</th>
                    <th className="px-4 py-3">Participant</th>
                    <th className="px-4 py-3">Quizzes Completed</th>
                    <th className="px-4 py-3">Average Score</th>
                    <th className="px-4 py-3 font-mono">Total Points</th>
                    <th className="px-4 py-3">Pass Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {leaderboard.map(entry => {
                    const isMe = entry.participantId === user?.id;
                    return (
                      <tr
                        key={entry.participantId}
                        className={`transition-colors ${
                          isMe ? 'bg-indigo-50/70 font-semibold' : 'hover:bg-slate-50/60'
                        }`}
                      >
                        <td className="px-4 py-3 font-mono">
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full font-bold text-xs ${
                              entry.rank === 1
                                ? 'bg-amber-100 text-amber-800'
                                : entry.rank === 2
                                ? 'bg-slate-200 text-slate-700'
                                : entry.rank === 3
                                ? 'bg-amber-50 text-amber-700 border border-amber-300'
                                : 'text-slate-500'
                            }`}
                          >
                            {entry.rank}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-900">
                          {entry.participantName} {isMe && '(You)'}
                        </td>
                        <td className="px-4 py-3 font-mono">{entry.quizzesCompleted}</td>
                        <td className="px-4 py-3 font-mono">{entry.averageScore}%</td>
                        <td className="px-4 py-3 font-mono font-bold text-indigo-600">
                          {entry.totalPoints}
                        </td>
                        <td className="px-4 py-3 font-mono text-emerald-700">{entry.passRate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 18. QUIZ REMINDERS TAB */}
      {activeTab === 'reminders' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-xs text-slate-500">
              Schedule test prep reminders for upcoming assessments.
            </div>
            <button
              onClick={() => {
                if (availableQuizzes.length > 0) setReminderQuizId(availableQuizzes[0].id);
                setReminderModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Reminder</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reminders.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 text-xs">
                No reminders scheduled. Set a reminder for a quiz you want to study for!
              </div>
            ) : (
              reminders.map(rem => (
                <div
                  key={rem.id}
                  className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{rem.reminderDate} at {rem.reminderTime}</span>
                      </span>
                      <button
                        onClick={() => handleToggleReminder(rem.id)}
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          rem.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {rem.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm mt-2">{rem.quizTitle}</h4>
                  </div>

                  <div className="flex justify-end pt-3 mt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleDeleteReminder(rem.id)}
                      className="text-xs text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 19. MESSAGING WITH QUIZ CREATOR */}
      {activeTab === 'messages' && (
        <div className="max-w-2xl bg-white border border-slate-200/80 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Ask the Quiz Instructor</h2>
            <p className="text-xs text-slate-500">
              Submit questions regarding Java logic, explanations, or assessment grading.
            </p>
          </div>

          {/* Conversation history */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
            {messages.length === 0 ? (
              <div className="text-center text-slate-400 text-xs py-6">
                No past correspondence. Submit an inquiry below.
              </div>
            ) : (
              messages.map(msg => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-md rounded-xl p-3 text-xs ${
                        isMe ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="text-[10px] opacity-75 font-semibold mb-1">
                        {msg.senderName} ·{' '}
                        {new Date(msg.sentAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <p className="leading-relaxed">{msg.message}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Send Form */}
          <form onSubmit={handleSendMessageToCreator} className="pt-3 border-t border-slate-100 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Related Quiz (Optional)
              </label>
              <select
                value={messageQuizId || ''}
                onChange={e => setMessageQuizId(Number(e.target.value) || null)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-800"
              >
                <option value="">General Question / Java Concept</option>
                {availableQuizzes.map(q => (
                  <option key={q.id} value={q.id}>
                    {q.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask about a specific question or explanation..."
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 text-slate-900"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500 transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 11. PRE-QUIZ INSTRUCTIONS MODAL */}
      {preQuizModal && (
        <Modal
          isOpen={!!preQuizModal}
          onClose={() => setPreQuizModal(null)}
          title={`Prepare to Begin: ${preQuizModal.title}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg text-indigo-950">
              <span className="font-semibold block mb-0.5">Assessment Overview</span>
              <p className="leading-relaxed text-slate-700">{preQuizModal.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-700">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-slate-400 font-medium">Questions</div>
                <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                  {preQuizModal.questions.length} questions
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-slate-400 font-medium">Duration</div>
                <div className="text-base font-bold text-indigo-600 font-mono mt-0.5">
                  {preQuizModal.durationMinutes} minutes
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-slate-400 font-medium">Total Marks</div>
                <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                  {preQuizModal.totalMarks || 50} Marks
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-slate-400 font-medium">Passing Standard</div>
                <div className="text-base font-bold text-emerald-600 font-mono mt-0.5">
                  {preQuizModal.passingPercentage}%
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-900">
              <span className="font-bold block mb-1">Timed Rules:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>The countdown timer starts as soon as you click "Start Quiz".</li>
                <li>Your answers will automatically submit when the timer expires.</li>
                <li>You can freely navigate between questions using the question palette.</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPreQuizModal(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStartQuiz}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-2xs flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Quiz</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Reminder Modal */}
      {reminderModalOpen && (
        <Modal
          isOpen={reminderModalOpen}
          onClose={() => setReminderModalOpen(false)}
          title="Schedule Quiz Reminder"
        >
          <form onSubmit={handleCreateReminder} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Quiz</label>
              <select
                value={reminderQuizId || ''}
                onChange={e => setReminderQuizId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900"
              >
                {availableQuizzes.map(q => (
                  <option key={q.id} value={q.id}>
                    {q.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={reminderDate}
                  onChange={e => setReminderDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Time</label>
                <input
                  type="time"
                  required
                  value={reminderTime}
                  onChange={e => setReminderTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReminderModalOpen(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-2xs"
              >
                Save Reminder
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
