import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { QuizAttempt } from '../../types';
import { TrendingUp, Layers, CheckCircle2 } from 'lucide-react';

interface CategoryMasteryProgressChartProps {
  attempts: QuizAttempt[];
  height?: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Java Basics': '#6366f1',           // Indigo
  'OOP in Java': '#0284c7',           // Sky/Cyan
  'Collections': '#10b981',           // Emerald
  'Multithreading': '#f59e0b',        // Amber
  'Exception Handling': '#8b5cf6',   // Violet
  'Java Streams': '#ec4899',          // Pink
  'General Java': '#14b8a6'           // Teal
};

const DEFAULT_COLOR = '#64748b';

export const CategoryMasteryProgressChart: React.FC<CategoryMasteryProgressChartProps> = ({
  attempts,
  height = 320
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Extract all unique categories present in attempts or curriculum
  const categories = useMemo(() => {
    const set = new Set<string>();
    attempts.forEach(a => {
      if (a.quizCategory) set.add(a.quizCategory);
    });
    // Fallback curriculum standards if student has only taken 1 or 2
    if (!set.has('Java Basics')) set.add('Java Basics');
    if (!set.has('OOP in Java')) set.add('OOP in Java');
    if (!set.has('Collections')) set.add('Collections');
    return Array.from(set);
  }, [attempts]);

  // Transform attempts chronologically into cumulative progress tracking points
  const chartData = useMemo(() => {
    if (attempts.length === 0) {
      return [
        {
          attemptNumber: 1,
          dateLabel: 'Initial Baseline',
          'Java Basics': 50,
          'OOP in Java': 40,
          'Collections': 45
        }
      ];
    }

    // Sort attempts ascending by date
    const sorted = [...attempts].sort(
      (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
    );

    // Keep running best or latest score per category
    const runningScores: Record<string, number> = {};
    categories.forEach(cat => {
      runningScores[cat] = 0;
    });

    return sorted.map((att, idx) => {
      const cat = att.quizCategory || 'Java Basics';
      // Record this attempt's score for its category
      runningScores[cat] = att.percentage;

      const dateObj = new Date(att.submittedAt);
      const dateStr = dateObj.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      });

      const entry: Record<string, any> = {
        attemptNumber: idx + 1,
        dateLabel: `#${idx + 1} (${dateStr})`,
        quizTitle: att.quizTitle,
        activeCategory: cat,
        attemptScore: att.percentage,
        passStatus: att.status
      };

      // Populate running scores for all active categories
      categories.forEach(c => {
        if (runningScores[c] > 0) {
          entry[c] = runningScores[c];
        }
      });

      return entry;
    });
  }, [attempts, categories]);

  // Compute category average scores & improvement metrics
  const categoryStats = useMemo(() => {
    return categories.map(cat => {
      const catAttempts = attempts.filter(a => a.quizCategory === cat);
      if (catAttempts.length === 0) {
        return { category: cat, attemptsCount: 0, latestScore: 0, avgScore: 0, delta: 0 };
      }
      const firstScore = catAttempts[catAttempts.length - 1].percentage;
      const latestScore = catAttempts[0].percentage;
      const avg = Math.round(
        catAttempts.reduce((acc, a) => acc + a.percentage, 0) / catAttempts.length
      );
      return {
        category: cat,
        attemptsCount: catAttempts.length,
        latestScore,
        avgScore: avg,
        delta: latestScore - firstScore
      };
    });
  }, [attempts, categories]);

  const activeLines = selectedCategory === 'ALL'
    ? categories
    : categories.filter(c => c === selectedCategory);

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-0.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Mastery Progress by Category (Recharts)</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Topic Score Improvement Trajectory
          </h3>
          <p className="text-xs text-slate-500">
            Tracking your proficiency score progress across individual Java domains over time.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map(cat => {
            const color = CATEGORY_COLORS[cat] || DEFAULT_COLOR;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recharts Container */}
      <div style={{ width: '100%', height }} className="pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 25, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 11, fill: '#64748b', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />

            <YAxis
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              tick={{ fontSize: 11, fill: '#64748b', fontFamily: "'JetBrains Mono', monospace" }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              unit="%"
            />

            {/* Standard Passing Benchmark line */}
            <ReferenceLine
              y={60}
              stroke="#cbd5e1"
              strokeDasharray="4 4"
              label={{
                value: 'Passing Benchmark (60%)',
                fill: '#94a3b8',
                fontSize: 10,
                position: 'insideBottomRight'
              }}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const dataPoint = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-slate-200 bg-slate-900 p-3 text-white text-xs shadow-xl min-w-[200px] space-y-1.5 font-sans">
                      <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1 flex justify-between">
                        <span>Attempt {dataPoint.attemptNumber}</span>
                        <span className="font-mono text-slate-400">{label}</span>
                      </div>
                      {dataPoint.quizTitle && (
                        <div className="text-[11px] text-slate-300 font-medium line-clamp-1">
                          {dataPoint.quizTitle}
                        </div>
                      )}
                      <div className="pt-1 space-y-1">
                        {payload.map((item: any) => (
                          <div
                            key={item.dataKey}
                            className="flex items-center justify-between gap-4 font-mono text-[11px]"
                          >
                            <span className="flex items-center gap-1.5" style={{ color: item.color }}>
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-slate-300 font-sans">{item.name}:</span>
                            </span>
                            <span className="font-bold text-white">{item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{
                fontSize: '11px',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                paddingBottom: '8px'
              }}
            />

            {/* Dynamic Lines per Category */}
            {activeLines.map(cat => {
              const color = CATEGORY_COLORS[cat] || DEFAULT_COLOR;
              return (
                <Line
                  key={cat}
                  type="monotone"
                  dataKey={cat}
                  name={cat}
                  stroke={color}
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 2, fill: '#ffffff', stroke: color }}
                  activeDot={{ r: 6, stroke: color, strokeWidth: 2, fill: color }}
                  connectNulls
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category Mastery Summary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100 text-xs">
        {categoryStats.map(stat => {
          const color = CATEGORY_COLORS[stat.category] || DEFAULT_COLOR;
          return (
            <div
              key={stat.category}
              className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="font-medium text-slate-800 text-[11px] truncate">
                  {stat.category}
                </span>
              </div>
              <div className="flex items-baseline justify-between font-mono">
                <span className="text-sm font-bold text-slate-900">
                  {stat.latestScore > 0 ? `${stat.latestScore}%` : 'Pending'}
                </span>
                <span className="text-[10px] text-slate-400 font-sans">
                  {stat.attemptsCount} {stat.attemptsCount === 1 ? 'quiz' : 'quizzes'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
