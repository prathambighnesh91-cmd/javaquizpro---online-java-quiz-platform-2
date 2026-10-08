import React, { useState, useEffect } from 'react';
import { User, Quiz, QuizAttempt, SystemSetting, Notification, Role, UserStatus, QuizStatus } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';
import { BarChart } from '../charts/BarChart';
import { LineChart } from '../charts/LineChart';
import { DoughnutChart } from '../charts/DoughnutChart';
import { CodeSnippet } from '../common/CodeSnippet';
import {
  Users,
  FileCheck2,
  BarChart3,
  Settings,
  Bell,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  Edit,
  Eye,
  Send,
  Save,
  Shield,
  BookOpen,
  Award
} from 'lucide-react';

interface AdminDashboardProps {
  initialTab?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialTab = 'overview' }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab);

  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | Role>('ALL');
  const [quizStatusFilter, setQuizStatusFilter] = useState<'ALL' | QuizStatus>('ALL');

  // Modals
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'PARTICIPANT' as Role,
    status: 'ACTIVE' as UserStatus
  });

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedQuizForReject, setSelectedQuizForReject] = useState<Quiz | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [previewQuizModal, setPreviewQuizModal] = useState<Quiz | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [u, q, att, s, n] = await Promise.all([
        api.getUsers(),
        api.getQuizzes(),
        api.getAttemptsByQuiz(101).then(() => api.getLeaderboard().then(() => api.getAttemptsByParticipant(3).then(() => []))), // load attempts
        api.getSettings(),
        api.getNotifications(1)
      ]);
      setUsers(u);
      setQuizzes(q);
      setSettings(s);
      setNotifications(n);

      // fetch all attempts directly from storage/api helper
      const allAtts = (await api.getQuizzes()).flatMap(async (quizItem) => {
        return await api.getAttemptsByQuiz(quizItem.id);
      });
      const resolved = (await Promise.all(allAtts)).flat();
      setAttempts(resolved);
    } catch (err: any) {
      showToast(err.message || 'Error loading admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // User Actions
  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserFormData({
      name: '',
      email: '',
      password: '',
      role: 'PARTICIPANT',
      status: 'ACTIVE'
    });
    setUserModalOpen(true);
  };

  const handleOpenEditUser = (user: User) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      status: user.status
    });
    setUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.name || !userFormData.email) {
      showToast('Name and email are required.', 'error');
      return;
    }

    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, {
          name: userFormData.name,
          email: userFormData.email,
          role: userFormData.role,
          status: userFormData.status
        });
        showToast('User updated successfully.', 'success');
      } else {
        await api.addUser({
          name: userFormData.name,
          email: userFormData.email,
          password: userFormData.password || 'password123',
          role: userFormData.role,
          status: userFormData.status
        });
        showToast('User created successfully.', 'success');
      }
      setUserModalOpen(false);
      const updated = await api.getUsers();
      setUsers(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to save user.', 'error');
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      try {
        await api.deleteUser(user.id);
        showToast('User deleted successfully.', 'success');
        setUsers(prev => prev.filter(u => u.id !== user.id));
      } catch (err: any) {
        showToast(err.message || 'Failed to delete user.', 'error');
      }
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.updateUser(user.id, { status: nextStatus });
      showToast(`User status set to ${nextStatus}.`, 'success');
      setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, status: nextStatus } : u)));
    } catch (err: any) {
      showToast(err.message || 'Failed to update user status.', 'error');
    }
  };

  // Quiz Management Actions
  const handleApproveQuiz = async (quiz: Quiz) => {
    try {
      const updated = await api.approveQuiz(quiz.id);
      showToast(`Quiz "${quiz.title}" approved successfully.`, 'success');
      setQuizzes(prev => prev.map(q => (q.id === quiz.id ? updated : q)));
    } catch (err: any) {
      showToast(err.message || 'Failed to approve quiz.', 'error');
    }
  };

  const handleOpenRejectModal = (quiz: Quiz) => {
    setSelectedQuizForReject(quiz);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuizForReject) return;
    if (!rejectReason.trim()) {
      showToast('Please provide a reason for rejection.', 'error');
      return;
    }

    try {
      const updated = await api.rejectQuiz(selectedQuizForReject.id, rejectReason.trim());
      showToast(`Quiz "${selectedQuizForReject.title}" rejected with feedback.`, 'info');
      setQuizzes(prev => prev.map(q => (q.id === selectedQuizForReject.id ? updated : q)));
      setRejectModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to reject quiz.', 'error');
    }
  };

  const handlePublishQuiz = async (quiz: Quiz) => {
    try {
      const updated = await api.publishQuiz(quiz.id);
      showToast(`Quiz "${quiz.title}" published and live for participants!`, 'success');
      setQuizzes(prev => prev.map(q => (q.id === quiz.id ? updated : q)));
    } catch (err: any) {
      showToast(err.message || 'Failed to publish quiz.', 'error');
    }
  };

  const handleDeleteQuiz = async (quiz: Quiz) => {
    if (confirm(`Delete quiz "${quiz.title}" and its questions permanently?`)) {
      try {
        await api.deleteQuiz(quiz.id);
        showToast('Quiz deleted successfully.', 'success');
        setQuizzes(prev => prev.filter(q => q.id !== quiz.id));
      } catch (err: any) {
        showToast(err.message || 'Failed to delete quiz.', 'error');
      }
    }
  };

  // Settings Save
  const handleSettingChange = (name: string, value: string) => {
    setSettings(prev => prev.map(s => (s.settingName === name ? { ...s, settingValue: value } : s)));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings(settings);
      showToast('System settings updated successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update settings.', 'error');
    }
  };

  // Calculations for Reports
  const totalUsers = users.length;
  const totalParticipants = users.filter(u => u.role === 'PARTICIPANT').length;
  const totalCreators = users.filter(u => u.role === 'QUIZ_CREATOR').length;
  const totalQuizzes = quizzes.length;
  const publishedQuizzes = quizzes.filter(q => q.status === 'PUBLISHED').length;
  const pendingQuizzes = quizzes.filter(q => q.status === 'PENDING').length;
  const completedAttempts = attempts.length;
  const passedAttempts = attempts.filter(a => a.status === 'PASS').length;
  const passPercentage = completedAttempts > 0 ? Math.round((passedAttempts / completedAttempts) * 100) : 0;
  const avgScore = completedAttempts > 0 ? Math.round(attempts.reduce((acc, a) => acc + a.percentage, 0) / completedAttempts) : 0;

  // Chart Data preparation
  const categoryCountMap: Record<string, number> = {};
  quizzes.forEach(q => {
    categoryCountMap[q.category] = (categoryCountMap[q.category] || 0) + (q.attemptsCount || 1);
  });

  const categoryLabels = Object.keys(categoryCountMap);
  const categoryAttemptsData = Object.values(categoryCountMap);

  const barChartData = {
    labels: categoryLabels.length > 0 ? categoryLabels : ['Java Basics', 'OOP', 'Collections', 'Multithreading'],
    datasets: [
      {
        label: 'Attempts / Interest',
        data: categoryAttemptsData.length > 0 ? categoryAttemptsData : [24, 18, 15, 8],
        backgroundColor: '#4f46e5',
        borderRadius: 6
      }
    ]
  };

  const doughnutRoleData = {
    labels: ['Participants', 'Quiz Creators', 'Administrators'],
    datasets: [
      {
        data: [totalParticipants || 1, totalCreators || 1, 1],
        backgroundColor: ['#6366f1', '#06b6d4', '#f59e0b'],
        borderWidth: 0
      }
    ]
  };

  const passFailData = {
    labels: ['Passed', 'Failed'],
    datasets: [
      {
        data: [passedAttempts || 1, (completedAttempts - passedAttempts) || 0],
        backgroundColor: ['#10b981', '#f43f5e'],
        borderWidth: 0
      }
    ]
  };

  const filteredUsers = users.filter(u => {
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const filteredQuizzes = quizzes.filter(q => {
    if (quizStatusFilter === 'ALL') return true;
    return q.status === quizStatusFilter;
  });

  return (
    <div className="space-y-8">
      {/* Tab Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
            System Administration
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Control Center</h1>
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
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'users' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('quizzes-approval')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'quizzes-approval' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quizzes ({quizzes.length})
            {pendingQuizzes > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white px-1.5 py-0.2 rounded-full text-[10px]">
                {pendingQuizzes}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'analytics' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'settings' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'notifications' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Alerts
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {(activeTab === 'overview' || activeTab === 'dashboard') && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
              <div className="text-xs font-medium text-slate-500">Total Users</div>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1">{totalUsers}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                {totalParticipants} participants · {totalCreators} creators
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
              <div className="text-xs font-medium text-slate-500">Total Quizzes</div>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1">{totalQuizzes}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                {publishedQuizzes} published · {pendingQuizzes} pending review
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
              <div className="text-xs font-medium text-slate-500">Completed Attempts</div>
              <div className="text-2xl font-bold text-indigo-600 font-mono mt-1">{completedAttempts}</div>
              <div className="text-[11px] text-slate-400 mt-1">Avg Score: {avgScore}%</div>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
              <div className="text-xs font-medium text-slate-500">Pass Percentage</div>
              <div className="text-2xl font-bold text-emerald-600 font-mono mt-1">{passPercentage}%</div>
              <div className="text-[11px] text-slate-400 mt-1">{passedAttempts} successful evaluations</div>
            </div>
          </div>

          {/* Pending Approval Callout if any */}
          {pendingQuizzes > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-amber-950">
                    {pendingQuizzes} quiz submission{pendingQuizzes > 1 ? 's' : ''} awaiting review
                  </div>
                  <div className="text-xs text-amber-800">
                    Quiz creators have submitted assessments that require administrative approval before publishing.
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setQuizStatusFilter('PENDING');
                  setActiveTab('quizzes-approval');
                }}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors whitespace-nowrap"
              >
                Review Submissions
              </button>
            </div>
          )}

          {/* Two-Column Overview Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Quiz Engagement by Category</h3>
              <BarChart data={barChartData} height={220} />
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Pass vs Fail Outcome Distribution</h3>
              <DoughnutChart data={passFailData} height={220} />
            </div>
          </div>
        </div>
      )}

      {/* 4.1 USER MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={e => setUserRoleFilter(e.target.value as any)}
                className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-hidden"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="QUIZ_CREATOR">Quiz Creator</option>
                <option value="PARTICIPANT">Participant</option>
              </select>
            </div>

            <button
              onClick={handleOpenAddUser}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New User</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 font-mono">ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        No users matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-500">{u.id}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                            {u.name.charAt(0)}
                          </span>
                          <span>{u.name}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{u.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`font-semibold ${
                              u.role === 'ADMIN'
                                ? 'text-amber-700'
                                : u.role === 'QUIZ_CREATOR'
                                ? 'text-cyan-700'
                                : 'text-indigo-700'
                            }`}
                          >
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                              u.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                          >
                            {u.status}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEditUser(u)}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {u.id !== 1 && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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

      {/* 4.2 QUIZ CONTENT MANAGEMENT TAB */}
      {activeTab === 'quizzes-approval' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Filter by status:</span>
              {(['ALL', 'PENDING', 'APPROVED', 'PUBLISHED', 'REJECTED'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setQuizStatusFilter(st)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    quizStatusFilter === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 font-mono">Quiz ID</th>
                    <th className="px-4 py-3">Quiz Title</th>
                    <th className="px-4 py-3">Creator</th>
                    <th className="px-4 py-3">Questions</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredQuizzes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                        No quizzes found matching status filter.
                      </td>
                    </tr>
                  ) : (
                    filteredQuizzes.map(q => (
                      <tr key={q.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-500">#{q.id}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          <div>{q.title}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{q.category}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{q.creatorName || 'Instructor'}</td>
                        <td className="px-4 py-3 font-mono">{q.questions.length}</td>
                        <td className="px-4 py-3 font-mono">{q.durationMinutes} mins</td>
                        <td className="px-4 py-3">
                          <span
                            className={`font-semibold uppercase text-[11px] tracking-wider ${
                              q.status === 'PUBLISHED'
                                ? 'text-emerald-700'
                                : q.status === 'APPROVED'
                                ? 'text-indigo-700'
                                : q.status === 'PENDING'
                                ? 'text-amber-700'
                                : 'text-rose-700'
                            }`}
                          >
                            {q.status}
                          </span>
                          {q.rejectionReason && (
                            <div className="text-[10px] text-rose-600 italic mt-0.5 line-clamp-1">
                              Reason: {q.rejectionReason}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setPreviewQuizModal(q)}
                            className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded text-[11px] font-medium"
                            title="View Quiz Questions"
                          >
                            Preview
                          </button>
                          {q.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApproveQuiz(q)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleOpenRejectModal(q)}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-semibold transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {q.status === 'APPROVED' && (
                            <button
                              onClick={() => handlePublishQuiz(q)}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-semibold transition-colors"
                            >
                              Publish
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteQuiz(q)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors inline-block"
                            title="Delete Quiz"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* 4.4 PERFORMANCE REPORTS & ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900">Quiz Participation by Category</h3>
                <span className="text-xs text-slate-400 font-mono">Attempts</span>
              </div>
              <BarChart data={barChartData} height={240} />
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900">User Role Distribution</h3>
                <span className="text-xs text-slate-400 font-mono">Total {totalUsers}</span>
              </div>
              <DoughnutChart data={doughnutRoleData} height={240} />
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900">Evaluation Pass/Fail Ratios</h3>
                <span className="text-xs text-slate-400 font-mono">{passPercentage}% Pass Rate</span>
              </div>
              <DoughnutChart data={passFailData} height={240} />
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">System Key Performance Metrics</h3>
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center py-2 border-b border-slate-100 text-xs">
                  <span className="text-slate-600">Total Registered Participants</span>
                  <span className="font-mono font-semibold text-slate-900">{totalParticipants}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100 text-xs">
                  <span className="text-slate-600">Active Content Creators</span>
                  <span className="font-mono font-semibold text-slate-900">{totalCreators}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100 text-xs">
                  <span className="text-slate-600">Total Live Assessments</span>
                  <span className="font-mono font-semibold text-slate-900">{publishedQuizzes}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100 text-xs">
                  <span className="text-slate-600">Average Platform Score</span>
                  <span className="font-mono font-semibold text-indigo-600">{avgScore}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4.3 SYSTEM SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-white border border-slate-200/80 rounded-xl p-6 shadow-2xs">
          <div className="border-b border-slate-100 pb-3 mb-5">
            <h2 className="text-base font-bold text-slate-900">System Configuration</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Control global parameters for quiz durations, registration limits, and platform features.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            {settings.map(setting => {
              const isBoolean = setting.settingValue === 'true' || setting.settingValue === 'false';
              return (
                <div key={setting.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-slate-50">
                  <div className="flex-1 pr-4">
                    <label className="text-xs font-semibold text-slate-900 capitalize">
                      {setting.settingName.replace(/_/g, ' ')}
                    </label>
                    <div className="text-[11px] text-slate-400">{setting.description}</div>
                  </div>

                  <div className="w-full sm:w-48">
                    {isBoolean ? (
                      <select
                        value={setting.settingValue}
                        onChange={e => handleSettingChange(setting.settingName, e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-800"
                      >
                        <option value="true">Enabled / Yes</option>
                        <option value="false">Disabled / No</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={setting.settingValue}
                        onChange={e => handleSettingChange(setting.settingName, e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-800"
                      />
                    )}
                  </div>
                </div>
              );
            })}

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-2xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save All Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4.5 SYSTEM ALERTS & NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">System Activity & Alerts</h2>
            <button
              onClick={async () => {
                await api.clearAllNotifications(1);
                setNotifications([]);
                showToast('Notifications cleared.', 'info');
              }}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2.5">
            {notifications.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-400 text-xs">
                No active notifications or alerts.
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`rounded-xl border p-4 transition-all flex items-start gap-3.5 bg-white ${
                    n.readStatus ? 'border-slate-200/80 text-slate-600' : 'border-indigo-200 bg-indigo-50/20 text-slate-900'
                  }`}
                >
                  <div className="mt-0.5">
                    {n.type === 'ALERT' && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                    {n.type === 'SUCCESS' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                    {n.type === 'INFO' && <Bell className="w-4 h-4 text-indigo-500" />}
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="font-semibold text-slate-900 flex items-center justify-between">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-0.5 leading-relaxed text-slate-600">{n.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title={editingUser ? `Edit User #${editingUser.id}` : 'Create New User Account'}
      >
        <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={userFormData.name}
              onChange={e => setUserFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. John Doe"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={userFormData.email}
              onChange={e => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="user@example.com"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Password {editingUser && '(leave blank to keep unchanged)'}
            </label>
            <input
              type="password"
              value={userFormData.password}
              onChange={e => setUserFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Enter password"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">User Role</label>
              <select
                value={userFormData.role}
                onChange={e => setUserFormData(prev => ({ ...prev, role: e.target.value as Role }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900"
              >
                <option value="PARTICIPANT">Participant</option>
                <option value="QUIZ_CREATOR">Quiz Creator</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Status</label>
              <select
                value={userFormData.status}
                onChange={e => setUserFormData(prev => ({ ...prev, status: e.target.value as UserStatus }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setUserModalOpen(false)}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500 shadow-2xs"
            >
              {editingUser ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Rejection Reason Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Provide Reason for Rejection"
      >
        <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
          <p className="text-slate-600">
            Please specify the feedback or guidelines the quiz creator must address before this quiz can be approved.
          </p>
          <textarea
            required
            rows={4}
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="e.g. Please clarify Question 3 explanation regarding memory leak in thread pools and provide 4 options."
            className="w-full p-3 rounded-lg border border-slate-200 text-slate-900"
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setRejectModalOpen(false)}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg shadow-2xs"
            >
              Submit Rejection
            </button>
          </div>
        </form>
      </Modal>

      {/* Quiz Preview Modal */}
      {previewQuizModal && (
        <Modal
          isOpen={!!previewQuizModal}
          onClose={() => setPreviewQuizModal(null)}
          title={`Preview Quiz: ${previewQuizModal.title}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-semibold text-indigo-600">{previewQuizModal.category}</span>
              <span className="text-slate-400 font-mono">
                Duration: {previewQuizModal.durationMinutes}m · Passing: {previewQuizModal.passingPercentage}%
              </span>
            </div>
            <p className="text-slate-700 leading-relaxed">{previewQuizModal.description}</p>

            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Questions ({previewQuizModal.questions.length})
              </h4>
              {previewQuizModal.questions.map((q, idx) => (
                <div key={q.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                  <div className="font-semibold text-slate-900">
                    Q{idx + 1}: {q.questionText} ({q.marks} Marks)
                  </div>
                  {q.codeSnippet && <CodeSnippet code={q.codeSnippet} language="java" />}
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div>A. {q.optionA}</div>
                    <div>B. {q.optionB}</div>
                    <div>C. {q.optionC}</div>
                    <div>D. {q.optionD}</div>
                  </div>
                  <div className="text-emerald-700 font-semibold pt-1 border-t border-slate-200">
                    Correct: Option {q.correctAnswer} — {q.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
