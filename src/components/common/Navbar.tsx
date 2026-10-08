import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { UserCheck, LogOut, ChevronDown, Bell, Code, RotateCcw } from 'lucide-react';
import { resetAllToDefault } from '../../services/storage';
import { useToast } from './Toast';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenArchitecture: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onOpenArchitecture }) => {
  const { user, logout, switchRole } = useAuth();
  const { showToast } = useToast();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const handleResetData = () => {
    if (confirm('Reset all demo data (users, quizzes, attempts) to default state?')) {
      resetAllToDefault();
      showToast('Database reset to initial sample state.', 'info');
      window.location.reload();
    }
  };

  const roleDisplayName: Record<Role, string> = {
    ADMIN: 'Administrator',
    QUIZ_CREATOR: 'Quiz Creator',
    PARTICIPANT: 'Participant'
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onSelectTab('dashboard')}
          type="button"
          className="hover:opacity-90 transition-opacity cursor-pointer text-left"
        >
          <BrandLogo size="md" />
        </button>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`transition-colors hover:text-slate-900 py-1 ${
              currentTab === 'dashboard' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : ''
            }`}
          >
            Dashboard
          </button>
          {user?.role === 'PARTICIPANT' && (
            <>
              <button
                onClick={() => onSelectTab('quizzes')}
                className={`transition-colors hover:text-slate-900 py-1 ${
                  currentTab === 'quizzes' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : ''
                }`}
              >
                Available Quizzes
              </button>
              <button
                onClick={() => onSelectTab('attempts')}
                className={`transition-colors hover:text-slate-900 py-1 ${
                  currentTab === 'attempts' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : ''
                }`}
              >
                My Attempts
              </button>
              <button
                onClick={() => onSelectTab('leaderboard')}
                className={`transition-colors hover:text-slate-900 py-1 ${
                  currentTab === 'leaderboard' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : ''
                }`}
              >
                Leaderboard
              </button>
            </>
          )}
          {user?.role === 'QUIZ_CREATOR' && (
            <>
              <button
                onClick={() => onSelectTab('my-quizzes')}
                className={`transition-colors hover:text-slate-900 py-1 ${
                  currentTab === 'my-quizzes' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : ''
                }`}
              >
                My Quizzes
              </button>
              <button
                onClick={() => onSelectTab('create-quiz')}
                className={`transition-colors hover:text-slate-900 py-1 ${
                  currentTab === 'create-quiz' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : ''
                }`}
              >
                Create Quiz
              </button>
              <button
                onClick={() => onSelectTab('results')}
                className={`transition-colors hover:text-slate-900 py-1 ${
                  currentTab === 'results' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : ''
                }`}
              >
                Submissions
              </button>
            </>
          )}
          {user?.role === 'ADMIN' && (
            <>
              <button
                onClick={() => onSelectTab('users')}
                className={`transition-colors hover:text-slate-900 py-1 ${
                  currentTab === 'users' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : ''
                }`}
              >
                Users
              </button>
              <button
                onClick={() => onSelectTab('quizzes-approval')}
                className={`transition-colors hover:text-slate-900 py-1 ${
                  currentTab === 'quizzes-approval' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : ''
                }`}
              >
                Review Quizzes
              </button>
              <button
                onClick={() => onSelectTab('analytics')}
                className={`transition-colors hover:text-slate-900 py-1 ${
                  currentTab === 'analytics' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : ''
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => onSelectTab('settings')}
                className={`transition-colors hover:text-slate-900 py-1 ${
                  currentTab === 'settings' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : ''
                }`}
              >
                Settings
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Primary actions & profile controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenArchitecture}
            type="button"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200/60"
            title="View Spring Boot & MySQL Architecture"
          >
            <Code className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">Spring Boot / SQL Code</span>
          </button>

          <button
            onClick={handleResetData}
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="Reset database to default seed"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-6 w-6 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <div className="font-semibold text-slate-900 leading-tight truncate max-w-[120px]">{user.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <span>{roleDisplayName[user.role]}</span>
                    {user.authProvider === 'GOOGLE' && (
                      <span className="text-[9px] text-indigo-600 font-sans font-bold">· Google</span>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-white p-2 shadow-xl border border-slate-100 z-50 text-xs"
                  onClick={() => setRoleMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <div className="font-semibold text-slate-900 flex items-center justify-between">
                      <span className="truncate">{user.name}</span>
                      {user.authProvider === 'GOOGLE' && (
                        <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-semibold">
                          Google
                        </span>
                      )}
                    </div>
                    <div className="text-slate-500 truncate text-[11px]">{user.email}</div>
                  </div>

                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Quick Role Switcher
                  </div>
                  <button
                    onClick={() => switchRole('ADMIN')}
                    className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      user.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <span>Admin Dashboard</span>
                    {user.role === 'ADMIN' && <span className="text-[10px] bg-indigo-100 px-1.5 rounded">Active</span>}
                  </button>
                  <button
                    onClick={() => switchRole('QUIZ_CREATOR')}
                    className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      user.role === 'QUIZ_CREATOR' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <span>Quiz Creator</span>
                    {user.role === 'QUIZ_CREATOR' && <span className="text-[10px] bg-indigo-100 px-1.5 rounded">Active</span>}
                  </button>
                  <button
                    onClick={() => switchRole('PARTICIPANT')}
                    className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      user.role === 'PARTICIPANT' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <span>Participant View</span>
                    {user.role === 'PARTICIPANT' && <span className="text-[10px] bg-indigo-100 px-1.5 rounded">Active</span>}
                  </button>

                  <div className="border-t border-slate-100 mt-2 pt-1">
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 transition-colors font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTab('login')}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onSelectTab('register')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
