import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { Role } from '../../types';
import { Lock, Mail, User, Shield, CheckCircle2, Globe, Sparkles } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { Modal } from '../common/Modal';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  onSuccess: () => void;
  onCancel: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login', onSuccess, onCancel }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const { login, loginWithGoogle, register, isLoading } = useAuth();
  const { showToast } = useToast();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<'PARTICIPANT' | 'QUIZ_CREATOR'>('PARTICIPANT');

  // Google OAuth modal state
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [customGoogleRole, setCustomGoogleRole] = useState<'PARTICIPANT' | 'QUIZ_CREATOR'>('PARTICIPANT');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showToast('Please enter both email and password.', 'error');
      return;
    }

    try {
      await login(loginEmail, loginPassword);
      showToast('Successfully signed in.', 'success');
      onSuccess();
    } catch (err: any) {
      showToast(err.message || 'Login failed. Please verify credentials.', 'error');
    }
  };

  const handleGoogleSignIn = async (account: {
    sub: string;
    email: string;
    name: string;
    avatarUrl?: string;
    role?: Role;
  }) => {
    try {
      await loginWithGoogle(account);
      showToast(`Welcome, ${account.name}! Successfully signed in via Google.`, 'success');
      setGoogleModalOpen(false);
      onSuccess();
    } catch (err: any) {
      showToast(err.message || 'Google sign-in failed.', 'error');
    }
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim() || !customGoogleName.trim()) {
      showToast('Please enter both Google email and your profile name.', 'error');
      return;
    }
    // Deterministic unique Google sub hash based on email to ensure stable identity
    const cleanEmail = customGoogleEmail.trim().toLowerCase();
    const generatedSub = 'google_sub_' + Array.from(cleanEmail).reduce((acc, char) => acc + char.charCodeAt(0), 1000000000);

    handleGoogleSignIn({
      sub: generatedSub.toString(),
      email: cleanEmail,
      name: customGoogleName.trim(),
      role: customGoogleRole
    });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regName.trim() || !regEmail.trim()) {
      showToast('All fields are required.', 'error');
      return;
    }

    if (regPassword.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    try {
      await register(regName, regEmail, regPassword, regRole);
      showToast(`Account created as ${regRole.replace('_', ' ')}!`, 'success');
      onSuccess();
    } catch (err: any) {
      showToast(err.message || 'Registration failed.', 'error');
    }
  };

  const handleQuickFill = (role: Role) => {
    if (role === 'ADMIN') {
      setLoginEmail('admin@example.com');
      setLoginPassword('password123');
    } else if (role === 'QUIZ_CREATOR') {
      setLoginEmail('creator@example.com');
      setLoginPassword('password123');
    } else {
      setLoginEmail('student@example.com');
      setLoginPassword('password123');
    }
    setMode('login');
  };

  return (
    <div className="max-w-md mx-auto my-8 bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xl">
      {/* Brand Header */}
      <div className="flex flex-col items-center justify-center mb-6 text-center">
        <BrandLogo size="lg" />
        <p className="text-xs text-slate-500 mt-2">
          {mode === 'login' ? 'Sign in to access your dashboard & assessments' : 'Join as a student or instructor'}
        </p>
      </div>

      {/* Mode Switch Tabs */}
      <div className="flex border-b border-slate-100 pb-3 mb-6">
        <button
          onClick={() => setMode('login')}
          className={`flex-1 text-center py-2 text-sm font-semibold transition-colors border-b-2 -mb-3 ${
            mode === 'login'
              ? 'text-indigo-600 border-indigo-600'
              : 'text-slate-400 border-transparent hover:text-slate-700'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setMode('register')}
          className={`flex-1 text-center py-2 text-sm font-semibold transition-colors border-b-2 -mb-3 ${
            mode === 'register'
              ? 'text-indigo-600 border-indigo-600'
              : 'text-slate-400 border-transparent hover:text-slate-700'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Primary Google Sign-In Button */}
      <button
        type="button"
        onClick={() => setGoogleModalOpen(true)}
        disabled={isLoading}
        className="w-full py-2.5 px-4 mb-4 border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-98"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-[11px] uppercase tracking-wider text-slate-400">
          <span className="bg-white px-2">Or continue with email</span>
        </div>
      </div>

      {mode === 'login' ? (
        <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Sign In to Dashboard'}
          </button>

          {/* Quick Demo Pre-fills */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400 font-medium block mb-2">
              Or prefill sample credentials:
            </span>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('ADMIN')}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('QUIZ_CREATOR')}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium"
              >
                Quiz Creator
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('PARTICIPANT')}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium"
              >
                Student
              </button>
            </div>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                value={regName}
                onChange={e => setRegName(e.target.value)}
                placeholder="e.g. Jordan Smith"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                placeholder="jordan@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={regConfirmPassword}
                onChange={e => setRegConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Register As</label>
            <select
              value={regRole}
              onChange={e => setRegRole(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 font-medium"
            >
              <option value="PARTICIPANT">Participant (Take Quizzes & Learn)</option>
              <option value="QUIZ_CREATOR">Quiz Creator (Author & Publish Quizzes)</option>
            </select>
            <p className="text-[10px] text-slate-400 mt-1">
              * Note: Administrator accounts are managed centrally by the platform.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>
      )}

      <div className="mt-4 text-center">
        <button
          onClick={onCancel}
          type="button"
          className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          Cancel and return to home
        </button>
      </div>

      {/* Google Sign-In Account Selector Modal */}
      {googleModalOpen && (
        <Modal
          isOpen={googleModalOpen}
          onClose={() => setGoogleModalOpen(false)}
          title="Sign in with Google"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs text-slate-600">
            <div className="text-center pb-2 border-b border-slate-100">
              <div className="inline-flex p-3 rounded-2xl bg-indigo-50 text-indigo-600 mb-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Choose Google Account</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Each account is uniquely identified by its immutable Google ID (<code className="font-mono text-indigo-600">sub</code>).
              </p>
            </div>

            {/* Test Accounts: User A (Aadi) vs User B (Rahul) */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Instant One-Click Google Accounts:
              </div>

              {/* User A: Aadi */}
              <button
                type="button"
                onClick={() => handleGoogleSignIn({
                  sub: '104829384729182736451',
                  email: 'userA@gmail.com',
                  name: 'Aadi',
                  role: 'PARTICIPANT'
                })}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-left flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                    A
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Aadi <span className="text-[10px] text-indigo-600 font-normal">(User A)</span>
                    </div>
                    <div className="text-[11px] text-slate-500">userA@gmail.com</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400">sub: ...6451</span>
              </button>

              {/* User B: Rahul */}
              <button
                type="button"
                onClick={() => handleGoogleSignIn({
                  sub: '109283746192837465022',
                  email: 'userB@gmail.com',
                  name: 'Rahul',
                  role: 'PARTICIPANT'
                })}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-left flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                    R
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Rahul <span className="text-[10px] text-emerald-600 font-normal">(User B)</span>
                    </div>
                    <div className="text-[11px] text-slate-500">userB@gmail.com</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400">sub: ...5022</span>
              </button>
            </div>

            {/* Custom Google Account Section */}
            <div className="pt-3 border-t border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Or Enter Any Custom Google Account:
              </div>

              <form onSubmit={handleCustomGoogleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Your Google Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aadi"
                      value={customGoogleName}
                      onChange={e => setCustomGoogleName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Your Gmail Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. userA@gmail.com"
                      value={customGoogleEmail}
                      onChange={e => setCustomGoogleEmail(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-slate-900 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Role</label>
                  <select
                    value={customGoogleRole}
                    onChange={e => setCustomGoogleRole(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-slate-900 text-xs font-medium"
                  >
                    <option value="PARTICIPANT">Participant (Student)</option>
                    <option value="QUIZ_CREATOR">Quiz Creator (Instructor)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs shadow-2xs transition-colors cursor-pointer"
                >
                  Sign In with Custom Google Account
                </button>
              </form>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
