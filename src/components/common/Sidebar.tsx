import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  FileCheck2,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  PlusCircle,
  FolderGit2,
  Award,
  MessageSquare,
  History,
  TrendingUp,
  BookOpen,
  Clock,
  Trophy,
  CalendarClock,
  UserCircle
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  unreadCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, unreadCount = 0 }) => {
  const { user, logout } = useAuth();
  if (!user) return null;

  interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }

  let items: NavItem[] = [];

  if (user.role === 'ADMIN') {
    items = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'users', label: 'Users', icon: Users },
      { id: 'quizzes-approval', label: 'Quiz Management', icon: FileCheck2 },
      { id: 'analytics', label: 'Performance', icon: BarChart3 },
      { id: 'settings', label: 'System Settings', icon: Settings },
      { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount }
    ];
  } else if (user.role === 'QUIZ_CREATOR') {
    items = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'create-quiz', label: 'Create Quiz', icon: PlusCircle },
      { id: 'my-quizzes', label: 'My Quizzes', icon: FolderGit2 },
      { id: 'results', label: 'Quiz Results', icon: Award },
      { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadCount },
      { id: 'quiz-history', label: 'Quiz History', icon: History },
      { id: 'creator-performance', label: 'Performance', icon: TrendingUp }
    ];
  } else if (user.role === 'PARTICIPANT') {
    items = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'quizzes', label: 'Available Quizzes', icon: BookOpen },
      { id: 'attempts', label: 'My Attempts', icon: Clock },
      { id: 'participant-performance', label: 'Performance', icon: TrendingUp },
      { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
      { id: 'reminders', label: 'Reminders', icon: CalendarClock },
      { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadCount },
      { id: 'profile', label: 'Profile', icon: UserCircle }
    ];
  }

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200/80 bg-white min-h-[calc(100vh-4rem)] flex flex-col justify-between py-6 px-4">
      <div className="space-y-6">
        <div>
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            {user.role.replace('_', ' ')} PORTAL
          </div>
          <nav className="space-y-1">
            {items.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 ? (
                    <span className="h-5 min-w-5 px-1.5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-600" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
