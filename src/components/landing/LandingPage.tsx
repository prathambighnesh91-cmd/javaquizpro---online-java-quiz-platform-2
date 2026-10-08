import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';
import { CodeSnippet } from '../common/CodeSnippet';
import {
  Clock,
  Award,
  BarChart3,
  Trophy,
  MessageSquare,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Layers,
  Cpu,
  Sparkles,
  Check,
  X,
  Code2,
  Database,
  Server,
  FileCheck2,
  ChevronRight,
  Play
} from 'lucide-react';

interface LandingPageProps {
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
  onExploreQuizzes: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateLogin,
  onNavigateRegister,
  onExploreQuizzes
}) => {
  const { login } = useAuth();

  // Interactive Live Quiz Teaser State
  const [selectedTeaserOption, setSelectedTeaserOption] = useState<string | null>(null);
  const [teaserSubmitted, setTeaserSubmitted] = useState(false);

  // Category filter state for showcase
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');

  const handleQuickDemoLogin = (email: string) => {
    login(email, 'password123');
  };

  const categories = [
    {
      name: 'Java Basics',
      tagline: 'Memory models, primitive types, operator precedence, and variable scopes.',
      topics: ['Primitive Sizes', 'String Pool', 'Operators', 'Type Casting'],
      icon: Terminal,
      questionsCount: 15,
      difficulty: 'Beginner to Intermediate'
    },
    {
      name: 'OOP in Java',
      tagline: 'Deep dive into polymorphism, dynamic dispatch, abstract classes, and interfaces.',
      topics: ['Overriding vs Overloading', 'super & this', 'Dynamic Dispatch', 'Default Methods'],
      icon: Layers,
      questionsCount: 20,
      difficulty: 'Intermediate'
    },
    {
      name: 'Collections & Generics',
      tagline: 'Hash collisions, Red-Black treeification, balancing sets, and PECS wildcards.',
      topics: ['HashMap Internal Architecture', 'TreeSet', 'LinkedHashSet', 'PECS Wildcards'],
      icon: BookOpen,
      questionsCount: 18,
      difficulty: 'Advanced'
    },
    {
      name: 'Multithreading & Concurrency',
      tagline: 'Hardware CAS, volatile memory visibility, ReentrantLocks, and thread-pools.',
      topics: ['Volatile Semantics', 'AtomicInteger', 'ExecutorService', 'Deadlock Prevention'],
      icon: Cpu,
      questionsCount: 16,
      difficulty: 'Expert'
    },
    {
      name: 'Exception Handling',
      tagline: 'Checked vs unchecked exceptions, try-with-resources, and AutoCloseable contracts.',
      topics: ['Throwable Hierarchy', 'AutoCloseable', 'Multi-catch', 'Suppressed Exceptions'],
      icon: ShieldCheck,
      questionsCount: 12,
      difficulty: 'Intermediate'
    },
    {
      name: 'Java Streams & Lambdas',
      tagline: 'Lazy evaluation, functional interfaces, collectors, and parallel stream pipelines.',
      topics: ['Intermediate vs Terminal', 'Collectors.groupingBy', 'Optional Patterns', 'Lambdas'],
      icon: Award,
      questionsCount: 14,
      difficulty: 'Advanced'
    }
  ];

  const filteredCategories = activeCategoryFilter === 'All'
    ? categories
    : categories.filter(c => c.name.toLowerCase().includes(activeCategoryFilter.toLowerCase()));

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-950 text-white shadow-2xl">
        {/* Subtle Ambient Radial Backlight */}
        <div className="absolute inset-0 z-0 opacity-30">
          <img
            src="/src/assets/images/java_quiz_hero_1790624884383.jpg"
            alt="Java Quiz Platform Environment"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
        </div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 px-6 py-14 sm:px-12 sm:py-20 max-w-5xl mx-auto space-y-8">
          {/* Header Brand Lockup & Trust Badge */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
            <BrandLogo size="lg" theme="dark" />
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-medium text-indigo-300 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Java 17 LTS · Spring Boot 3 · MySQL 8.0</span>
            </div>
          </div>

          {/* Main Headline & Proposition */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] text-balance">
              Master Java Programming Through Timed Challenges
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Assess your knowledge with verified JVM questions, real exam countdown timers, instant detailed performance diagnostics, and instructor-guided feedback.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onNavigateRegister}
              className="px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md hover:shadow-indigo-500/25 cursor-pointer flex items-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onNavigateLogin}
              className="px-6 py-3 text-sm font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all cursor-pointer"
            >
              Sign In to Portal
            </button>
            <button
              onClick={onExploreQuizzes}
              className="px-6 py-3 text-sm font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Browse All Quizzes</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 1-Click Demo Login Bar */}
          <div className="pt-8 border-t border-slate-800/80">
            <div className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>One-Click Fast Demo Login for Reviewers & Students</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin@example.com')}
                className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-amber-950/40 hover:border-amber-500/50 transition-all text-left cursor-pointer group shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-300 group-hover:text-amber-200">
                    Administrator
                  </span>
                  <span className="text-[10px] text-amber-400/80 font-mono">1-Click</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">admin@example.com</div>
                <div className="text-[10px] text-slate-500 mt-1">Full control, user & quiz moderation</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('creator@example.com')}
                className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-cyan-950/40 hover:border-cyan-500/50 transition-all text-left cursor-pointer group shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-cyan-300 group-hover:text-cyan-200">
                    Quiz Creator
                  </span>
                  <span className="text-[10px] text-cyan-400/80 font-mono">1-Click</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">creator@example.com</div>
                <div className="text-[10px] text-slate-500 mt-1">Author quizzes, grade & message</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('student@example.com')}
                className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-emerald-950/40 hover:border-emerald-500/50 transition-all text-left cursor-pointer group shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-300 group-hover:text-emerald-200">
                    Participant
                  </span>
                  <span className="text-[10px] text-emerald-400/80 font-mono">1-Click</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">student@example.com</div>
                <div className="text-[10px] text-slate-500 mt-1">Take quizzes, view reports & rank</div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE TEASER: "Test Your Java Knowledge Right Now" */}
      <section className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
              <Terminal className="w-4 h-4" />
              <span>Interactive Quiz Experience Preview</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Test Your Java Knowledge in 10 Seconds
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Experience the instant explanation and evaluation workflow before signing up.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
              Question: String Immutability
            </span>
          </div>
        </div>

        {/* Live Question Card */}
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:p-6 space-y-4">
          <div className="text-sm font-semibold text-slate-900">
            What is the console output when executing the following Java code?
          </div>

          <CodeSnippet
            code={`String str = "Java";\nstr.concat(" 17");\nSystem.out.println(str);`}
            language="java"
          />

          {/* Interactive Choices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {[
              { key: 'A', text: 'Java 17', isCorrect: false },
              { key: 'B', text: 'Java', isCorrect: true },
              { key: 'C', text: 'NullPointerException', isCorrect: false },
              { key: 'D', text: 'Compilation Error', isCorrect: false }
            ].map(opt => {
              const isSelected = selectedTeaserOption === opt.key;
              let btnStyle = 'border-slate-200 bg-white hover:border-slate-300 text-slate-800';

              if (teaserSubmitted) {
                if (opt.isCorrect) {
                  btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-500 font-semibold';
                } else if (isSelected && !opt.isCorrect) {
                  btnStyle = 'border-rose-400 bg-rose-50 text-rose-950 font-semibold';
                }
              } else if (isSelected) {
                btnStyle = 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-1 ring-indigo-600 font-semibold';
              }

              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    setSelectedTeaserOption(opt.key);
                    setTeaserSubmitted(true);
                  }}
                  className={`p-3 rounded-xl border text-xs text-left flex items-center justify-between transition-all cursor-pointer ${btnStyle}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono font-bold text-[11px] bg-slate-100 text-slate-600">
                      {opt.key}
                    </span>
                    <span>{opt.text}</span>
                  </div>
                  {teaserSubmitted && opt.isCorrect && (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  {teaserSubmitted && isSelected && !opt.isCorrect && (
                    <X className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Instant Explanation Feedback */}
          {teaserSubmitted && (
            <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-4 text-xs text-indigo-950 space-y-1.5 animate-in fade-in duration-200">
              <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>
                  {selectedTeaserOption === 'B' ? 'Correct Answer!' : 'Explanation (Correct Answer: B)'}
                </span>
              </div>
              <p className="leading-relaxed text-slate-700">
                In Java, <code>String</code> objects are strictly <strong>immutable</strong>. Calling <code>str.concat(" 17")</code> creates and returns a brand-new String object containing <code>"Java 17"</code>. Because the result was not reassigned to <code>str</code>, the variable <code>str</code> still references the original literal <code>"Java"</code> in the String constant pool.
              </p>
              <div className="pt-2 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Want full timed tests with deep reporting?</span>
                <button
                  onClick={onExploreQuizzes}
                  className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <span>Start Full Practice Quiz</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. ASYMMETRIC BENTO GRID: CAPABILITIES */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Platform Capabilities
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Engineered for Modern Java Technical Assessments
          </h3>
          <p className="text-xs text-slate-500">
            Everything needed to prepare for technical interviews, university courses, and certifications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Card 1: Timed Exam Engine (Col Span 2) */}
          <div className="md:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-2xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">
                Exam-Grade Timed Countdown & Auto-Submit
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl mb-6">
                Real exam pressure with an active countdown timer, critical time warnings, and zero-loss answers. If the clock runs out, answers are automatically graded instantly.
              </p>

              {/* Visual Mock of Question Navigator */}
              <div className="rounded-xl border border-slate-200 bg-slate-900 text-slate-100 p-4 font-mono text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-[11px]">
                  <span className="text-slate-400">TIME LEFT: <strong className="text-white">14:32</strong></span>
                  <span className="text-emerald-400 font-semibold">8 / 10 Answered</span>
                </div>
                <div className="grid grid-cols-10 gap-1.5 text-center">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <div
                      key={n}
                      className={`h-7 rounded flex items-center justify-center text-[11px] font-bold ${
                        n <= 8 ? 'bg-emerald-600 text-white' : n === 9 ? 'ring-2 ring-indigo-400 bg-slate-800' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {n}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-600" /> Auto-Save State</span>
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-600" /> Flag for Review</span>
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-600" /> Anti-Cheating Timer</span>
            </div>
          </div>

          {/* Bento Card 2: PDF Reports & Analysis */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-2xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">
                Detailed Reports & PDF Export
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Review every option with precise explanations citing the Java Language Specification. Download complete performance reports as official PDF documents.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between font-mono">
                <span className="text-slate-500">Report Status:</span>
                <span className="font-bold text-emerald-600">PASSED (85%)</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-500">PDF Generator:</span>
                <span className="text-slate-700 font-semibold">jsPDF v2.5</span>
              </div>
            </div>
          </div>

          {/* Bento Card 3: Role-Based Workflow */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-2xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">
                Multi-Role Security
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Strict separation of roles between Administrators, Quiz Authors, and Participants. Every API endpoint enforces role authorization.
              </p>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Admin Moderation & Users Table</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                <span>Creator Authoring Studio & Feedback</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span>Student Attempts & Analytics</span>
              </div>
            </div>
          </div>

          {/* Bento Card 4: Leaderboards & Analytics (Col Span 2) */}
          <div className="md:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-2xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Trophy className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">
                Competitive Leaderboard & Progress Tracking
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl mb-4">
                Benchmark your score trajectories over time with Chart.js visualization. Compare performance against peers on the global leaderboard without exposing private data.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-center text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="font-bold text-slate-900 font-mono text-base">50+</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Java Questions</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="font-bold text-indigo-600 font-mono text-base">Instant</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Result Grading</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="font-bold text-emerald-600 font-mono text-base">100%</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Explanation Rigor</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CURATED JAVA KNOWLEDGE DOMAINS */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
              Curriculum & Coverage
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Curated Java Knowledge Domains</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Comprehensive assessments mapped to real-world Java development challenges.
            </p>
          </div>

          <button
            onClick={onExploreQuizzes}
            className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs whitespace-nowrap self-start sm:self-auto cursor-pointer"
          >
            <span>Explore All Quizzes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map(cat => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                onClick={onExploreQuizzes}
                className="group p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-400/80 hover:bg-indigo-50/20 transition-all cursor-pointer flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-xl bg-slate-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      {cat.difficulty}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-base mb-1 group-hover:text-indigo-600 transition-colors">
                    {cat.name}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {cat.tagline}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {cat.topics.map(t => (
                      <span
                        key={t}
                        className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono">{cat.questionsCount} Questions</span>
                  <span className="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    <span>Take Quiz</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. COLLEGE PROJECT ARCHITECTURE SPECIFICATION */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900 text-white p-6 sm:p-10 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
              <Code2 className="w-4 h-4" />
              <span>Full-Stack Architecture Standard</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Built as a Complete College Major Project
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1 leading-relaxed">
              Provides both a live interactive client with persistent storage and the complete production Java 17 + Spring Boot 3 + MySQL 8.0 backend source files for university submission.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateRegister}
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors shadow-sm cursor-pointer whitespace-nowrap"
            >
              Start Assessing Now
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
            <div className="text-slate-400">Backend Core</div>
            <div className="font-bold text-white font-mono text-sm mt-0.5">Spring Boot 3.2</div>
            <div className="text-[10px] text-slate-500 mt-1">REST APIs & MVC</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
            <div className="text-slate-400">Relational DB</div>
            <div className="font-bold text-white font-mono text-sm mt-0.5">MySQL 8.0</div>
            <div className="text-[10px] text-slate-500 mt-1">9 Normalized Tables</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
            <div className="text-slate-400">Security Layer</div>
            <div className="font-bold text-white font-mono text-sm mt-0.5">Spring Security 6</div>
            <div className="text-[10px] text-slate-500 mt-1">JWT + BCrypt Hashing</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
            <div className="text-slate-400">Frontend UI</div>
            <div className="font-bold text-white font-mono text-sm mt-0.5">React 19 & Tailwind</div>
            <div className="text-[10px] text-slate-500 mt-1">Chart.js Analytics</div>
          </div>
        </div>
      </section>
    </div>
  );
};
