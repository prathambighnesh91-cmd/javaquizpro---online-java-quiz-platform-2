import React, { useState, useMemo } from 'react';
import { LeaderboardEntry, QuizAttempt, Quiz, User } from '../../types';
import {
  Trophy,
  Medal,
  Award,
  Flame,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Zap,
  Target,
  Play,
  Layers,
  ChevronRight,
  CheckCircle2,
  Crown
} from 'lucide-react';

interface TopPerformersWidgetProps {
  leaderboard: LeaderboardEntry[];
  attempts: QuizAttempt[];
  availableQuizzes: Quiz[];
  currentUser: User | null;
  onStartQuiz: (quiz: Quiz) => void;
  onViewFullLeaderboard: () => void;
}

export const TopPerformersWidget: React.FC<TopPerformersWidgetProps> = ({
  leaderboard,
  attempts,
  availableQuizzes,
  currentUser,
  onStartQuiz,
  onViewFullLeaderboard
}) => {
  const [activeTab, setActiveTab] = useState<'overall' | 'categories' | 'recent'>('overall');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Find current user's entry
  const myRankEntry = useMemo(() => {
    if (!currentUser) return null;
    return leaderboard.find(e => e.participantId === currentUser.id) || null;
  }, [leaderboard, currentUser]);

  // Next rank ahead of current user (for friendly challenge)
  const rankAheadEntry = useMemo(() => {
    if (!myRankEntry || myRankEntry.rank <= 1) return null;
    return leaderboard.find(e => e.rank === myRankEntry.rank - 1) || null;
  }, [leaderboard, myRankEntry]);

  // Top 3 Podium Participants
  const topThree = useMemo(() => {
    return leaderboard.slice(0, 3);
  }, [leaderboard]);

  // Ranks 4 to 8
  const runnerUps = useMemo(() => {
    return leaderboard.slice(3, 8);
  }, [leaderboard]);

  // Compute category champions based on all attempts
  const categoryChampions = useMemo(() => {
    const map = new Map<string, {
      category: string;
      topParticipantId: number;
      topParticipantName: string;
      bestPercentage: number;
      totalPoints: number;
      attemptsCount: number;
      quizTitle: string;
      quizId: number;
    }>();

    attempts.forEach(att => {
      const cat = att.quizCategory || 'Java Basics';
      const existing = map.get(cat);
      if (!existing || att.percentage > existing.bestPercentage || (att.percentage === existing.bestPercentage && att.score > existing.totalPoints)) {
        map.set(cat, {
          category: cat,
          topParticipantId: att.participantId,
          topParticipantName: att.participantName,
          bestPercentage: att.percentage,
          totalPoints: att.score,
          attemptsCount: (existing?.attemptsCount || 0) + 1,
          quizTitle: att.quizTitle,
          quizId: att.quizId
        });
      } else {
        existing.attemptsCount += 1;
      }
    });

    return Array.from(map.values());
  }, [attempts]);

  // Recent High Scores (scores >= 80% sorted by date desc)
  const recentHighScores = useMemo(() => {
    return [...attempts]
      .filter(a => a.percentage >= 70)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 6);
  }, [attempts]);

  // Max points on leaderboard for progress bar scaling
  const maxPoints = useMemo(() => {
    return leaderboard.length > 0 ? Math.max(...leaderboard.map(e => e.totalPoints), 1) : 100;
  }, [leaderboard]);

  // Handle click on challenge quiz
  const handleChallengeQuiz = (quizId: number) => {
    const targetQuiz = availableQuizzes.find(q => q.id === quizId) || availableQuizzes[0];
    if (targetQuiz) {
      onStartQuiz(targetQuiz);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60 shadow-2xs shrink-0">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-slate-900">
                Top Performers Leaderboard
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50">
                <Flame className="w-3 h-3 text-amber-600 fill-amber-500" />
                Live Standings
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Benchmarked across Java core evaluations, coding challenges, and exam accuracy.
            </p>
          </div>
        </div>

        {/* Segmented Controls for Widget Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto text-xs">
          <button
            onClick={() => setActiveTab('overall')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'overall'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Top Overall
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Category Champions
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'recent'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Recent High Scores
          </button>
        </div>
      </div>

      {/* Motivational Rank Spotlight Banner (Friendly Competition Callout) */}
      {myRankEntry && (
        <div className="rounded-xl border border-indigo-100 bg-linear-to-r from-indigo-50/60 via-slate-50 to-amber-50/40 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-mono font-bold text-xs shrink-0 shadow-2xs">
              #{myRankEntry.rank}
            </div>
            <div>
              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                <span>Your Ranking: #{myRankEntry.rank} of {leaderboard.length}</span>
                <span className="text-slate-400">·</span>
                <span className="font-mono text-indigo-600 font-bold">{myRankEntry.totalPoints} pts</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500 font-mono">{myRankEntry.averageScore}% avg</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {myRankEntry.rank === 1 ? (
                  <span className="text-emerald-700 font-medium">
                    🏆 You are currently leading the Java cohort! Complete new quizzes to defend your title.
                  </span>
                ) : rankAheadEntry ? (
                  <span>
                    You are only <strong className="text-indigo-700 font-mono">{rankAheadEntry.totalPoints - myRankEntry.totalPoints} pts</strong> behind <strong className="text-slate-800">{rankAheadEntry.participantName}</strong> (#{rankAheadEntry.rank}). Complete 1 quiz to overtake!
                  </span>
                ) : (
                  <span>Keep practicing Java topics to climb into the top 3 podium!</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {availableQuizzes.length > 0 && (
              <button
                onClick={() => onStartQuiz(availableQuizzes[0])}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-2xs cursor-pointer whitespace-nowrap"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Climb Leaderboard</span>
              </button>
            )}
            <button
              onClick={onViewFullLeaderboard}
              className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Full Standings
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: OVERALL STANDINGS (PODIUM + RUNNERS UP) */}
      {activeTab === 'overall' && (
        <div className="space-y-4">
          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {topThree.map((entry, idx) => {
              const isCurrentUser = currentUser?.id === entry.participantId;
              const isFirst = entry.rank === 1;
              const isSecond = entry.rank === 2;
              const isThird = entry.rank === 3;

              let borderAccent = 'border-slate-200';
              let badgeBg = 'bg-slate-100 text-slate-700';
              let medalIcon = <Award className="w-4 h-4 text-slate-500" />;

              if (isFirst) {
                borderAccent = 'border-amber-300 bg-amber-50/20';
                badgeBg = 'bg-amber-100 text-amber-900 border-amber-300';
                medalIcon = <Crown className="w-4 h-4 text-amber-500" />;
              } else if (isSecond) {
                borderAccent = 'border-slate-300 bg-slate-50/40';
                badgeBg = 'bg-slate-200 text-slate-800 border-slate-300';
                medalIcon = <Medal className="w-4 h-4 text-slate-400" />;
              } else if (isThird) {
                borderAccent = 'border-amber-700/20 bg-amber-50/10';
                badgeBg = 'bg-amber-800/10 text-amber-900 border-amber-800/30';
                medalIcon = <Medal className="w-4 h-4 text-amber-700" />;
              }

              return (
                <div
                  key={entry.participantId}
                  className={`rounded-xl border p-4 transition-all relative flex flex-col justify-between ${borderAccent} ${
                    isCurrentUser ? 'ring-2 ring-indigo-500 ring-offset-1' : ''
                  }`}
                >
                  <div>
                    {/* Rank indicator and Medal */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`h-6 w-6 rounded-md font-mono font-bold text-xs flex items-center justify-center border ${badgeBg}`}>
                          #{entry.rank}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {isFirst ? 'Gold Podium' : isSecond ? 'Silver Podium' : 'Bronze Podium'}
                        </span>
                      </div>
                      {medalIcon}
                    </div>

                    {/* Participant Name */}
                    <div className="flex items-baseline justify-between gap-1 mb-1">
                      <h4 className="font-bold text-slate-900 text-sm truncate">
                        {entry.participantName}
                      </h4>
                      {isCurrentUser && (
                        <span className="text-[10px] font-bold text-indigo-600 shrink-0 font-sans">
                          (You)
                        </span>
                      )}
                    </div>

                    {/* Points & Accuracy Details */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                      <span>{entry.quizzesCompleted} {entry.quizzesCompleted === 1 ? 'quiz' : 'quizzes'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-slate-700 font-medium">{entry.averageScore}% avg</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-700 font-mono font-medium">{entry.passRate}% pass</span>
                    </div>
                  </div>

                  {/* Points Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400 text-[11px]">Score Power</span>
                      <span className="font-mono font-bold text-slate-900">
                        {entry.totalPoints} pts
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFirst ? 'bg-amber-500' : isSecond ? 'bg-slate-400' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.round((entry.totalPoints / maxPoints) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Runners-up Table (Ranks 4 - 8) */}
          {runnerUps.length > 0 && (
            <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/40">
              <div className="px-4 py-2 bg-slate-100/60 border-b border-slate-200/60 flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <span>Rank & Challenger</span>
                <div className="flex items-center gap-6 font-mono">
                  <span>Accuracy</span>
                  <span>Total Points</span>
                </div>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {runnerUps.map(entry => {
                  const isCurrentUser = currentUser?.id === entry.participantId;
                  return (
                    <div
                      key={entry.participantId}
                      className={`px-4 py-2.5 flex items-center justify-between transition-colors ${
                        isCurrentUser ? 'bg-indigo-50/60 font-semibold' : 'hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-400 w-5 text-center text-xs">
                          #{entry.rank}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <span>{entry.participantName}</span>
                            {isCurrentUser && (
                              <span className="text-[10px] font-bold text-indigo-600 font-sans">
                                (You)
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {entry.quizzesCompleted} quizzes completed · {entry.passRate}% pass rate
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 font-mono">
                        <span className="text-slate-600">{entry.averageScore}%</span>
                        <span className="font-bold text-slate-900 w-16 text-right">
                          {entry.totalPoints} pts
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CATEGORY CHAMPIONS */}
      {activeTab === 'categories' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-500">
            Top scoring participants across specific Java disciplines. Challenge their benchmarks to claim the domain title!
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoryChampions.map(champ => {
              const isCurrentUser = currentUser?.id === champ.topParticipantId;
              return (
                <div
                  key={champ.category}
                  className="rounded-xl border border-slate-200/90 bg-white p-4 flex flex-col justify-between hover:border-indigo-300 transition-all shadow-2xs space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span className="font-semibold text-indigo-600">{champ.category}</span>
                      <span className="font-mono text-[11px] text-slate-400">{champ.attemptsCount} attempts</span>
                    </div>

                    <div className="font-bold text-slate-900 text-sm">
                      {champ.topParticipantName} {isCurrentUser && <span className="text-indigo-600 text-xs font-sans">(You)</span>}
                    </div>

                    <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      Best on: {champ.quizTitle}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Peak Score</div>
                      <div className="font-mono font-bold text-emerald-600 text-sm">
                        {champ.bestPercentage}% ({champ.totalPoints} pts)
                      </div>
                    </div>

                    <button
                      onClick={() => handleChallengeQuiz(champ.quizId)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Challenge</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: RECENT HIGH SCORES (HALL OF FAME FEED) */}
      {activeTab === 'recent' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-500">
            Real-time feed of participants scoring 70%+ on Java challenges. Try these assessments to test your skills!
          </div>

          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-white overflow-hidden text-xs">
            {recentHighScores.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No recent high score submissions logged yet. Be the first to score 80%+!
              </div>
            ) : (
              recentHighScores.map(score => {
                const isCurrentUser = currentUser?.id === score.participantId;
                const isPerfect = score.percentage === 100;
                const minutes = Math.floor(score.timeTakenSeconds / 60);
                const seconds = score.timeTakenSeconds % 60;

                return (
                  <div
                    key={score.id}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isPerfect ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {isPerfect ? <Sparkles className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span>{score.participantName}</span>
                          {isCurrentUser && (
                            <span className="text-[10px] font-bold text-indigo-600 font-sans">
                              (You)
                            </span>
                          )}
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-600 font-normal">{score.quizTitle}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>{score.quizCategory}</span>
                          <span>·</span>
                          <span>{minutes}m {seconds}s time</span>
                          <span>·</span>
                          <span>{new Date(score.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="text-right">
                        <div className="font-mono font-bold text-slate-900">
                          {score.percentage}% ({score.score}/{score.totalMarks})
                        </div>
                        <div className={`text-[10px] font-bold uppercase ${isPerfect ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {isPerfect ? 'Perfect Score' : 'Mastery Achieved'}
                        </div>
                      </div>

                      <button
                        onClick={() => handleChallengeQuiz(score.quizId)}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        title="Take this quiz to test your score"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Try Quiz</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Footer bar */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
          <span>Scores are recalculated in real-time as participants submit assessments.</span>
        </div>
        <button
          onClick={onViewFullLeaderboard}
          className="font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
        >
          <span>Explore Detailed Cohort Standings</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
