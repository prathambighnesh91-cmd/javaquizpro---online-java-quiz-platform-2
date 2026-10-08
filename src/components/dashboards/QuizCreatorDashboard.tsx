import React, { useState, useEffect } from 'react';
import { Quiz, Question, QuizAttempt, Message, QuizStatus } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';
import { CodeSnippet } from '../common/CodeSnippet';
import { BarChart } from '../charts/BarChart';
import { DoughnutChart } from '../charts/DoughnutChart';
import {
  FolderGit2,
  PlusCircle,
  Award,
  MessageSquare,
  History,
  TrendingUp,
  Plus,
  Trash2,
  Edit,
  Send,
  CheckCircle,
  Clock,
  Check,
  AlertCircle,
  Eye,
  FileCode2
} from 'lucide-react';

interface QuizCreatorDashboardProps {
  initialTab?: string;
}

const JAVA_CATEGORIES = [
  'Java Basics',
  'OOP in Java',
  'Classes and Objects',
  'Inheritance',
  'Polymorphism',
  'Exception Handling',
  'Collections',
  'Multithreading',
  'JDBC',
  'Java Streams',
  'File Handling',
  'Advanced Java'
];

export const QuizCreatorDashboard: React.FC<QuizCreatorDashboardProps> = ({ initialTab = 'overview' }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab);

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // History Filter
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'ALL' | QuizStatus>('ALL');

  // Create / Edit Quiz Form State
  const [editingQuizId, setEditingQuizId] = useState<number | null>(null);
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    category: 'Java Basics',
    durationMinutes: 15,
    passingPercentage: 60
  });

  const [formQuestions, setFormQuestions] = useState<Question[]>([
    {
      id: 1,
      questionText: '',
      codeSnippet: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      explanation: '',
      marks: 10
    }
  ]);

  // Feedback Modal
  const [feedbackModalAttempt, setFeedbackModalAttempt] = useState<QuizAttempt | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  // Messaging State
  const [selectedRecipientId, setSelectedRecipientId] = useState<number | null>(null);
  const [replyMessageText, setReplyMessageText] = useState('');

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    loadCreatorData();
  }, [user]);

  const loadCreatorData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [allQuizzes, allMsgs] = await Promise.all([
        api.getQuizzes({ creatorId: user.id }),
        api.getMessages(user.id, user.role)
      ]);
      setQuizzes(allQuizzes);
      setMessages(allMsgs);

      // Load attempts for this creator's quizzes
      const attemptPromises = allQuizzes.map(q => api.getAttemptsByQuiz(q.id));
      const res = await Promise.all(attemptPromises);
      setAttempts(res.flat());
    } catch (err: any) {
      showToast(err.message || 'Failed to load creator data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Add Question to Form
  const handleAddQuestionToForm = () => {
    setFormQuestions(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        questionText: '',
        codeSnippet: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
        explanation: '',
        marks: 10
      }
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (formQuestions.length <= 1) {
      showToast('A quiz must have at least one question.', 'error');
      return;
    }
    setFormQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx: number, field: keyof Question, value: any) => {
    setFormQuestions(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  // Save Quiz (Draft or Submit)
  const handleSaveQuiz = async (submitForApproval = false) => {
    if (!quizForm.title.trim()) {
      showToast('Please enter a Quiz Title.', 'error');
      return;
    }

    // Validate questions
    for (let i = 0; i < formQuestions.length; i++) {
      const q = formQuestions[i];
      if (!q.questionText.trim() || !q.optionA.trim() || !q.optionB.trim() || !q.optionC.trim() || !q.optionD.trim()) {
        showToast(`Please complete question #${i + 1} with all 4 options.`, 'error');
        return;
      }
    }

    try {
      let savedQuiz: Quiz;
      if (!user) {
        showToast('Please sign in to author quizzes.', 'error');
        return;
      }

      if (editingQuizId) {
        savedQuiz = await api.updateQuiz(editingQuizId, {
          title: quizForm.title,
          description: quizForm.description,
          category: quizForm.category,
          durationMinutes: Number(quizForm.durationMinutes),
          passingPercentage: Number(quizForm.passingPercentage),
          creatorId: user.id,
          creatorName: user.name,
          questions: formQuestions,
          status: submitForApproval ? 'PENDING' : 'DRAFT'
        });
        showToast(`Quiz updated ${submitForApproval ? 'and submitted for approval' : 'as draft'}.`, 'success');
      } else {
        savedQuiz = await api.createQuiz({
          title: quizForm.title,
          description: quizForm.description,
          category: quizForm.category,
          durationMinutes: Number(quizForm.durationMinutes),
          passingPercentage: Number(quizForm.passingPercentage),
          creatorId: user.id,
          creatorName: user.name,
          status: submitForApproval ? 'PENDING' : 'DRAFT',
          questions: formQuestions
        });
        showToast(`Quiz created with ${formQuestions.length} questions!`, 'success');
      }

      // Reset form
      setEditingQuizId(null);
      setQuizForm({
        title: '',
        description: '',
        category: 'Java Basics',
        durationMinutes: 15,
        passingPercentage: 60
      });
      setFormQuestions([
        {
          id: 1,
          questionText: '',
          codeSnippet: '',
          optionA: '',
          optionB: '',
          optionC: '',
          optionD: '',
          correctAnswer: 'A',
          explanation: '',
          marks: 10
        }
      ]);
      await loadCreatorData();
      setActiveTab('my-quizzes');
    } catch (err: any) {
      showToast(err.message || 'Failed to save quiz.', 'error');
    }
  };

  const handleEditQuiz = (q: Quiz) => {
    setEditingQuizId(q.id);
    setQuizForm({
      title: q.title,
      description: q.description,
      category: q.category,
      durationMinutes: q.durationMinutes,
      passingPercentage: q.passingPercentage
    });
    setFormQuestions(q.questions);
    setActiveTab('create-quiz');
  };

  const handleDeleteQuiz = async (quizId: number) => {
    if (confirm('Are you sure you want to delete this quiz?')) {
      try {
        await api.deleteQuiz(quizId);
        showToast('Quiz deleted successfully.', 'success');
        setQuizzes(prev => prev.filter(q => q.id !== quizId));
      } catch (err: any) {
        showToast(err.message || 'Failed to delete quiz.', 'error');
      }
    }
  };

  const handleSubmitForApproval = async (quizId: number) => {
    try {
      const updated = await api.submitQuizForApproval(quizId);
      showToast('Quiz submitted for admin review.', 'success');
      setQuizzes(prev => prev.map(q => (q.id === quizId ? updated : q)));
    } catch (err: any) {
      showToast(err.message || 'Failed to submit for approval.', 'error');
    }
  };

  const handlePublishApprovedQuiz = async (quizId: number) => {
    try {
      const updated = await api.publishQuiz(quizId);
      showToast('Quiz published! Participants can now take this quiz.', 'success');
      setQuizzes(prev => prev.map(q => (q.id === quizId ? updated : q)));
    } catch (err: any) {
      showToast(err.message || 'Failed to publish quiz.', 'error');
    }
  };

  // Feedback Actions
  const handleOpenFeedback = (attempt: QuizAttempt) => {
    setFeedbackModalAttempt(attempt);
    setFeedbackText(attempt.feedback || '');
  };

  const handleSaveFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackModalAttempt) return;
    try {
      const updated = await api.addAttemptFeedback(feedbackModalAttempt.id, feedbackText);
      showToast('Feedback submitted to participant.', 'success');
      setAttempts(prev => prev.map(a => (a.id === updated.id ? updated : a)));
      setFeedbackModalAttempt(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to submit feedback.', 'error');
    }
  };

  // Message Actions
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessageText.trim() || !user) return;

    try {
      const activeRecipient = messages.find(m => m.senderId === selectedRecipientId);
      await api.sendMessage({
        senderId: user.id,
        senderName: user.name,
        senderRole: user.role,
        receiverId: selectedRecipientId || 3,
        receiverName: activeRecipient?.senderName || 'Participant',
        message: replyMessageText.trim()
      });
      showToast('Reply message sent.', 'success');
      setReplyMessageText('');
      const updatedMsgs = await api.getMessages(user.id, user.role);
      setMessages(updatedMsgs);
    } catch (err: any) {
      showToast(err.message || 'Failed to send reply.', 'error');
    }
  };

  // Stats calculation
  const totalQuizzesCount = quizzes.length;
  const totalAttemptsCount = attempts.length;
  const scores = attempts.map(a => a.percentage);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;
  const passedCount = attempts.filter(a => a.status === 'PASS').length;
  const passRate = totalAttemptsCount > 0 ? Math.round((passedCount / totalAttemptsCount) * 100) : 0;

  const filteredHistory = quizzes.filter(q => {
    if (historyStatusFilter === 'ALL') return true;
    return q.status === historyStatusFilter;
  });

  return (
    <div className="space-y-8">
      {/* Tab Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
            Instructor Studio
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Quiz Creator Dashboard</h1>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'overview' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('my-quizzes')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'my-quizzes' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Quizzes ({quizzes.length})
          </button>
          <button
            onClick={() => {
              setEditingQuizId(null);
              setActiveTab('create-quiz');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'create-quiz' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            + Create Quiz
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'results' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Submissions ({attempts.length})
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'messages' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Messages
          </button>
          <button
            onClick={() => setActiveTab('quiz-history')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'quiz-history' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            History
          </button>
        </div>
      </div>

      {/* OVERVIEW / PERFORMANCE TAB (Section 9) */}
      {(activeTab === 'overview' || activeTab === 'creator-performance') && (
        <div className="space-y-6">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <div className="text-xs font-medium text-slate-500">Quizzes Created</div>
              <div className="text-xl font-bold text-slate-900 font-mono mt-1">{totalQuizzesCount}</div>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <div className="text-xs font-medium text-slate-500">Total Attempts</div>
              <div className="text-xl font-bold text-indigo-600 font-mono mt-1">{totalAttemptsCount}</div>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <div className="text-xs font-medium text-slate-500">Average Score</div>
              <div className="text-xl font-bold text-slate-900 font-mono mt-1">{avgScore}%</div>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <div className="text-xs font-medium text-slate-500">Highest Score</div>
              <div className="text-xl font-bold text-emerald-600 font-mono mt-1">{highestScore}%</div>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <div className="text-xs font-medium text-slate-500">Lowest Score</div>
              <div className="text-xl font-bold text-rose-600 font-mono mt-1">{lowestScore}%</div>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <div className="text-xs font-medium text-slate-500">Pass Rate</div>
              <div className="text-xl font-bold text-teal-600 font-mono mt-1">{passRate}%</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Quiz Attempts per Title</h3>
              <BarChart
                data={{
                  labels: quizzes.map(q => q.title.substring(0, 18) + '...'),
                  datasets: [
                    {
                      label: 'Attempts',
                      data: quizzes.map(q => q.attemptsCount || 0),
                      backgroundColor: '#6366f1',
                      borderRadius: 6
                    }
                  ]
                }}
                height={220}
              />
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Overall Submission Pass vs Fail</h3>
              <DoughnutChart
                data={{
                  labels: ['Passed Submissions', 'Failed Submissions'],
                  datasets: [
                    {
                      data: [passedCount || 1, (totalAttemptsCount - passedCount) || 0],
                      backgroundColor: ['#10b981', '#f43f5e'],
                      borderWidth: 0
                    }
                  ]
                }}
                height={220}
              />
            </div>
          </div>
        </div>
      )}

      {/* 5.1 CREATE / EDIT QUIZ TAB */}
      {activeTab === 'create-quiz' && (
        <div className="max-w-4xl bg-white border border-slate-200/80 rounded-xl p-6 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">
              {editingQuizId ? 'Edit Java Assessment' : 'Author New Java Quiz'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify duration, passing standards, and construct multiple-choice questions with optional code snippets.
            </p>
          </div>

          {/* Step 1: Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Quiz Title *</label>
              <input
                type="text"
                required
                value={quizForm.title}
                onChange={e => setQuizForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Java Concurrency & Synchronization Essentials"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={quizForm.description}
                onChange={e => setQuizForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Briefly describe the topics and learning objectives covered in this assessment."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={quizForm.category}
                onChange={e => setQuizForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 font-medium"
              >
                {JAVA_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Duration (Mins)</label>
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={quizForm.durationMinutes}
                  onChange={e => setQuizForm(prev => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pass Percentage (%)</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={quizForm.passingPercentage}
                  onChange={e => setQuizForm(prev => ({ ...prev, passingPercentage: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Questions Builder */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Questions ({formQuestions.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Total Marks:{' '}
                  <span className="font-mono font-bold text-indigo-600">
                    {formQuestions.reduce((acc, q) => acc + (Number(q.marks) || 10), 0)}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddQuestionToForm}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-lg transition-colors border border-indigo-200 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            {/* Question Items */}
            <div className="space-y-6">
              {formQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs space-y-3 relative"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <span className="font-bold text-slate-900 flex items-center gap-2">
                      <span className="h-5 w-5 rounded bg-indigo-600 text-white flex items-center justify-center font-mono text-[10px]">
                        {idx + 1}
                      </span>
                      <span>Question #{idx + 1}</span>
                    </span>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-medium">Marks:</span>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={q.marks}
                          onChange={e => handleQuestionChange(idx, 'marks', Number(e.target.value))}
                          className="w-16 px-2 py-1 rounded border border-slate-200 bg-white font-mono"
                        />
                      </div>
                      {formQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Remove question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Question Prompt *</label>
                    <textarea
                      rows={2}
                      value={q.questionText}
                      onChange={e => handleQuestionChange(idx, 'questionText', e.target.value)}
                      placeholder="e.g. What happens when calling Thread.sleep() inside a synchronized block?"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900"
                    />
                  </div>

                  {/* Optional Java Snippet */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Java Code Snippet (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={q.codeSnippet || ''}
                      onChange={e => handleQuestionChange(idx, 'codeSnippet', e.target.value)}
                      placeholder="public class Test {\n  public static void main(String[] args) {\n    // snippet\n  }\n}"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 font-mono text-[11px]"
                    />
                  </div>

                  {/* 4 Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {(['A', 'B', 'C', 'D'] as const).map(optKey => (
                      <div key={optKey}>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-semibold text-slate-700">Option {optKey} *</label>
                          <label className="inline-flex items-center gap-1 text-[11px] cursor-pointer text-indigo-700">
                            <input
                              type="radio"
                              name={`correct_${q.id}`}
                              checked={q.correctAnswer === optKey}
                              onChange={() => handleQuestionChange(idx, 'correctAnswer', optKey)}
                            />
                            <span>Mark Correct</span>
                          </label>
                        </div>
                        <input
                          type="text"
                          value={q[`option${optKey}` as keyof Question] as string}
                          onChange={e =>
                            handleQuestionChange(idx, `option${optKey}` as keyof Question, e.target.value)
                          }
                          placeholder={`Option ${optKey} text`}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Explanation */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Correct Answer Explanation *
                    </label>
                    <textarea
                      rows={2}
                      value={q.explanation}
                      onChange={e => handleQuestionChange(idx, 'explanation', e.target.value)}
                      placeholder="Explain why the marked option is correct according to the Java specification."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Submit Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('my-quizzes')}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSaveQuiz(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleSaveQuiz(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-2xs"
              >
                Submit for Admin Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5.2 MANAGE MY QUIZZES TAB */}
      {activeTab === 'my-quizzes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-xs text-slate-500">
              Quizzes you created and their review/publication lifecycle status.
            </div>
            <button
              onClick={() => {
                setEditingQuizId(null);
                setActiveTab('create-quiz');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Quiz</span>
            </button>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 font-mono">ID</th>
                    <th className="px-4 py-3">Title & Category</th>
                    <th className="px-4 py-3">Questions</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Attempts</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {quizzes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                        You have not authored any quizzes yet. Click "+ Create Quiz" to begin.
                      </td>
                    </tr>
                  ) : (
                    quizzes.map(q => (
                      <tr key={q.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-400">#{q.id}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{q.title}</div>
                          <div className="text-[11px] text-slate-400">{q.category}</div>
                        </td>
                        <td className="px-4 py-3 font-mono">{q.questions.length}</td>
                        <td className="px-4 py-3 font-mono">{q.durationMinutes}m</td>
                        <td className="px-4 py-3">
                          <span
                            className={`font-semibold uppercase text-[10px] tracking-wider px-2 py-0.5 rounded ${
                              q.status === 'PUBLISHED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : q.status === 'APPROVED'
                                ? 'bg-indigo-100 text-indigo-800'
                                : q.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-800'
                                : q.status === 'REJECTED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {q.status}
                          </span>
                          {q.rejectionReason && (
                            <div className="text-[10px] text-rose-600 mt-1 max-w-xs italic">
                              Feedback: {q.rejectionReason}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono">{q.attemptsCount || 0}</td>
                        <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                          {q.status === 'DRAFT' && (
                            <button
                              onClick={() => handleSubmitForApproval(q.id)}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[11px] font-semibold transition-colors"
                            >
                              Submit to Admin
                            </button>
                          )}
                          {q.status === 'APPROVED' && (
                            <button
                              onClick={() => handlePublishApprovedQuiz(q.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold transition-colors"
                            >
                              Publish Live
                            </button>
                          )}
                          <button
                            onClick={() => handleEditQuiz(q)}
                            className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuiz(q.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* 6. QUIZ RESULTS & FEEDBACK TAB */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500">
            Participant submissions across your quizzes. You can evaluate answers and send direct feedback.
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Participant</th>
                    <th className="px-4 py-3">Quiz</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Correct / Wrong</th>
                    <th className="px-4 py-3">Time Taken</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {attempts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                        No submissions yet. Once participants take your quizzes, their scores will appear here.
                      </td>
                    </tr>
                  ) : (
                    attempts.map(att => (
                      <tr key={att.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-900">{att.participantName}</td>
                        <td className="px-4 py-3 text-slate-700 max-w-xs truncate">{att.quizTitle}</td>
                        <td className="px-4 py-3 font-mono font-bold">
                          {att.score}/{att.totalMarks} ({att.percentage}%)
                        </td>
                        <td className="px-4 py-3 font-mono">
                          <span className="text-emerald-700">{att.correctAnswers}✓</span> ·{' '}
                          <span className="text-rose-700">{att.wrongAnswers}✗</span>
                        </td>
                        <td className="px-4 py-3 font-mono">
                          {Math.floor(att.timeTakenSeconds / 60)}m {att.timeTakenSeconds % 60}s
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {new Date(att.submittedAt).toLocaleDateString()}
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
                            onClick={() => handleOpenFeedback(att)}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                              att.feedback
                                ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {att.feedback ? 'Edit Feedback' : '+ Send Feedback'}
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

      {/* 7. PARTICIPANT INTERACTION & MESSAGING TAB */}
      {activeTab === 'messages' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Message Threads */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Participant Inquiries ({messages.length})
            </h3>
            <div className="space-y-2">
              {messages.length === 0 ? (
                <div className="text-slate-400 text-xs py-4 text-center">No messages yet.</div>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedRecipientId(msg.senderId)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                      selectedRecipientId === msg.senderId
                        ? 'border-indigo-400 bg-indigo-50/50'
                        : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-900">
                      <span>{msg.senderName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(msg.sentAt).toLocaleDateString()}
                      </span>
                    </div>
                    {msg.quizTitle && (
                      <div className="text-[10px] text-indigo-600 font-medium truncate mt-0.5">
                        Quiz: {msg.quizTitle}
                      </div>
                    )}
                    <p className="text-slate-600 mt-1 line-clamp-2">{msg.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Conversation & Reply */}
          <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-bold text-slate-900">Communication Panel</h3>
                <p className="text-xs text-slate-500">
                  Respond to participant questions regarding Java questions or technical concepts.
                </p>
              </div>

              {/* Message history */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {messages.map(msg => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md rounded-xl p-3 text-xs ${
                          isMe
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        <div className="text-[10px] opacity-75 font-semibold mb-1">
                          {msg.senderName} · {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <p className="leading-relaxed">{msg.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-100 mt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type an explanatory reply to the student..."
                  value={replyMessageText}
                  onChange={e => setReplyMessageText(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
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
        </div>
      )}

      {/* 8. QUIZ HISTORY TAB */}
      {activeTab === 'quiz-history' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Filter History:</span>
            {(['ALL', 'DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PUBLISHED'] as const).map(st => (
              <button
                key={st}
                onClick={() => setHistoryStatusFilter(st)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  historyStatusFilter === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Quiz</th>
                    <th className="px-4 py-3">Created Date</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Questions</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Attempts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredHistory.map(q => (
                    <tr key={q.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{q.title}</div>
                        <div className="text-[11px] text-slate-400">{q.category}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono">
                        {new Date(q.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-mono">{q.durationMinutes} mins</td>
                      <td className="px-4 py-3 font-mono">{q.questions.length}</td>
                      <td className="px-4 py-3 font-semibold uppercase text-[10px] tracking-wider">
                        {q.status}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-indigo-600">
                        {q.attemptsCount || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModalAttempt && (
        <Modal
          isOpen={!!feedbackModalAttempt}
          onClose={() => setFeedbackModalAttempt(null)}
          title={`Instructor Feedback for ${feedbackModalAttempt.participantName}`}
        >
          <form onSubmit={handleSaveFeedback} className="space-y-4 text-xs">
            <div>
              <div className="font-semibold text-slate-900 mb-1">
                Quiz: {feedbackModalAttempt.quizTitle}
              </div>
              <div className="text-slate-500 font-mono mb-3">
                Score: {feedbackModalAttempt.score}/{feedbackModalAttempt.totalMarks} ({feedbackModalAttempt.percentage}%)
              </div>
            </div>

            <textarea
              required
              rows={4}
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              placeholder="e.g. Great job on the dynamic dispatch questions! Make sure to review ThreadLocal semantics and memory visibility before attempting the advanced concurrency quiz."
              className="w-full p-3 rounded-lg border border-slate-200 text-slate-900"
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setFeedbackModalAttempt(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-2xs"
              >
                Save & Deliver Feedback
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
