import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { AuthPage } from './components/auth/AuthPage';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { QuizCreatorDashboard } from './components/dashboards/QuizCreatorDashboard';
import { ParticipantDashboard } from './components/dashboards/ParticipantDashboard';
import { QuizPlayer } from './components/quiz/QuizPlayer';
import { QuizResultView } from './components/quiz/QuizResultView';
import { SpringBootCodeViewer } from './components/docs/SpringBootCodeViewer';
import { BrandLogo } from './components/common/BrandLogo';
import { Quiz } from './types';
import { api } from './services/api';

function MainAppContent() {
  const { user } = useAuth();

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);

  // Active Quiz Playing State
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);

  // Active Result Report State
  const [activeReportAttemptId, setActiveReportAttemptId] = useState<number | null>(null);

  // Architecture inspector modal
  const [architectureOpen, setArchitectureOpen] = useState(false);

  // If user is currently taking a timed quiz, show the full-screen Quiz Player
  if (activeQuiz) {
    return (
      <QuizPlayer
        quiz={activeQuiz}
        onFinish={(attemptId: number) => {
          setActiveQuiz(null);
          setActiveReportAttemptId(attemptId);
        }}
        onCancel={() => setActiveQuiz(null)}
      />
    );
  }

  // If user is viewing a detailed performance report
  if (activeReportAttemptId) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar
          currentTab={currentTab}
          onSelectTab={tab => {
            setActiveReportAttemptId(null);
            setCurrentTab(tab);
          }}
          onOpenArchitecture={() => setArchitectureOpen(true)}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <QuizResultView
            attemptId={activeReportAttemptId}
            onBack={() => setActiveReportAttemptId(null)}
            onRetake={async (quizId: number) => {
              const q = await api.getQuizById(quizId);
              setActiveReportAttemptId(null);
              setActiveQuiz(q);
            }}
          />
        </main>
        <SpringBootCodeViewer isOpen={architectureOpen} onClose={() => setArchitectureOpen(false)} />
      </div>
    );
  }

  // If user is not logged in:
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar
          currentTab="landing"
          onSelectTab={tab => {
            if (tab === 'login') setAuthMode('login');
            else if (tab === 'register') setAuthMode('register');
            else setAuthMode(null);
          }}
          onOpenArchitecture={() => setArchitectureOpen(true)}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {authMode ? (
            <AuthPage
              initialMode={authMode}
              onSuccess={() => {
                setAuthMode(null);
                setCurrentTab('dashboard');
              }}
              onCancel={() => setAuthMode(null)}
            />
          ) : (
            <LandingPage
              onNavigateLogin={() => setAuthMode('login')}
              onNavigateRegister={() => setAuthMode('register')}
              onExploreQuizzes={() => setAuthMode('login')}
            />
          )}
        </main>

        <footer className="border-t border-slate-200/80 bg-white py-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <BrandLogo size="sm" />
            <div className="text-slate-400 font-mono text-[11px] text-center sm:text-right">
              Spring Boot 3 · MySQL 8.0 · React 19 · Role-Based Security
            </div>
          </div>
        </footer>

        <SpringBootCodeViewer isOpen={architectureOpen} onClose={() => setArchitectureOpen(false)} />
      </div>
    );
  }

  // If user is logged in, show role-based sidebar and dashboard
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenArchitecture={() => setArchitectureOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Role-Specific Sidebar */}
        <div className="hidden md:block">
          <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {user.role === 'ADMIN' && <AdminDashboard initialTab={currentTab} />}

          {user.role === 'QUIZ_CREATOR' && <QuizCreatorDashboard initialTab={currentTab} />}

          {user.role === 'PARTICIPANT' && (
            <ParticipantDashboard
              initialTab={currentTab}
              onStartQuiz={quiz => setActiveQuiz(quiz)}
              onViewReport={attemptId => setActiveReportAttemptId(attemptId)}
            />
          )}
        </main>
      </div>

      <SpringBootCodeViewer isOpen={architectureOpen} onClose={() => setArchitectureOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainAppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
