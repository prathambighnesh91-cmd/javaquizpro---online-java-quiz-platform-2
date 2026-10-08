import React, { useState, useEffect } from 'react';
import { QuizAttempt, Quiz, Question } from '../../types';
import { api } from '../../services/api';
import { CodeSnippet } from '../common/CodeSnippet';
import { useToast } from '../common/Toast';
import { jsPDF } from 'jspdf';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Award,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Share2,
  Check,
  RotateCcw,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizResultViewProps {
  attemptId: number;
  onBack: () => void;
  onRetake?: (quizId: number) => void;
}

export const QuizResultView: React.FC<QuizResultViewProps> = ({ attemptId, onBack, onRetake }) => {
  const { showToast } = useToast();
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const att = await api.getAttemptById(attemptId);
        setAttempt(att);
        const q = await api.getQuizById(att.quizId);
        setQuiz(q);

        if (att.status === 'PASS') {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
          });
        }
      } catch (err) {
        console.error('Error loading result report', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [attemptId]);

  if (loading || !attempt) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-sm">Calculating performance report...</span>
      </div>
    );
  }

  const isPass = attempt.status === 'PASS';
  const durationMinutes = Math.floor(attempt.timeTakenSeconds / 60);
  const durationSeconds = attempt.timeTakenSeconds % 60;
  const avgTimePerQuestion = attempt.answers.length > 0 ? (attempt.timeTakenSeconds / attempt.answers.length).toFixed(1) : '0';

  const toggleExpand = (qId: number) => {
    setExpandedQuestions(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const expandAll = () => {
    if (!quiz) return;
    const all: Record<number, boolean> = {};
    quiz.questions.forEach(q => (all[q.id] = true));
    setExpandedQuestions(all);
  };

  const collapseAll = () => {
    setExpandedQuestions({});
  };

  const handleDownloadPDF = () => {
    if (!attempt || !quiz) return;
    setIsGeneratingPdf(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let y = margin;

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
          return true;
        }
        return false;
      };

      // Header Banner
      doc.setFillColor(30, 41, 59); // Slate-800
      doc.rect(margin, y, contentWidth, 24, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(255, 255, 255);
      doc.text('Java Quiz Assessment Report', margin + 6, y + 10);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(203, 213, 225);
      doc.text(
        `Participant: ${attempt.participantName}   |   Date: ${new Date(attempt.submittedAt).toLocaleDateString()}   |   Attempt #${attempt.id}`,
        margin + 6,
        y + 18
      );

      y += 30;

      // Overview Card
      const pass = attempt.status === 'PASS';
      if (pass) {
        doc.setFillColor(236, 253, 245); // Emerald-50
        doc.setDrawColor(16, 185, 129);  // Emerald-500
      } else {
        doc.setFillColor(255, 241, 242); // Rose-50
        doc.setDrawColor(244, 63, 94);   // Rose-500
      }
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, y, contentWidth, 34, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text(attempt.quizTitle, margin + 6, y + 8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Category: ${attempt.quizCategory}   |   Passing Threshold: ${quiz.passingPercentage}%`, margin + 6, y + 15);

      // Result badge on right
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      if (pass) {
        doc.setTextColor(5, 150, 105);
        doc.text(`PASSED (${attempt.percentage}%)`, contentWidth + margin - 6, y + 10, { align: 'right' });
      } else {
        doc.setTextColor(225, 29, 72);
        doc.text(`NOT PASSED (${attempt.percentage}%)`, contentWidth + margin - 6, y + 10, { align: 'right' });
      }

      // Key metrics row inside card
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const durationMin = Math.floor(attempt.timeTakenSeconds / 60);
      const durationSec = attempt.timeTakenSeconds % 60;
      const metricsLine = `Score: ${attempt.score}/${attempt.totalMarks}   |   Correct: ${attempt.correctAnswers}   |   Incorrect: ${attempt.wrongAnswers}   |   Unanswered: ${attempt.unanswered}   |   Time: ${durationMin}m ${durationSec}s`;
      doc.text(metricsLine, margin + 6, y + 26);

      y += 40;

      // Instructor feedback if available
      if (attempt.feedback) {
        checkPageBreak(25);
        doc.setFillColor(238, 242, 255); // Indigo-50
        doc.setDrawColor(199, 210, 254);
        doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(67, 56, 202);
        doc.text('Instructor Feedback:', margin + 4, y + 6);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59);
        const feedbackLines = doc.splitTextToSize(attempt.feedback, contentWidth - 8);
        doc.text(feedbackLines, margin + 4, y + 12);
        y += 24;
      }

      // Section: Question Breakdown
      checkPageBreak(15);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('Question-by-Question Analysis', margin, y);
      y += 6;

      quiz.questions.forEach((q, idx) => {
        const userAnsRecord = attempt.answers.find(a => a.questionId === q.id);
        const userChoice = userAnsRecord?.selectedAnswer || null;
        const isCorrect = userAnsRecord?.isCorrect || false;
        const isUnanswered = userChoice === null;

        const qLines = doc.splitTextToSize(`Q${idx + 1}. ${q.questionText}`, contentWidth - 8);
        const explanationLines = q.explanation ? doc.splitTextToSize(`Explanation: ${q.explanation}`, contentWidth - 8) : [];
        const blockHeight = 16 + (qLines.length * 4.5) + (explanationLines.length * 4) + (q.codeSnippet ? 14 : 0);

        checkPageBreak(blockHeight + 4);

        // Box border
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(margin, y, contentWidth, blockHeight, 2, 2, 'FD');

        // Result marker
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        if (isCorrect) {
          doc.setTextColor(5, 150, 105);
          doc.text(`[CORRECT +${q.marks || 10}]`, contentWidth + margin - 4, y + 6, { align: 'right' });
        } else if (isUnanswered) {
          doc.setTextColor(100, 116, 139);
          doc.text('[UNANSWERED 0]', contentWidth + margin - 4, y + 6, { align: 'right' });
        } else {
          doc.setTextColor(225, 29, 72);
          doc.text(`[INCORRECT 0/${q.marks || 10}]`, contentWidth + margin - 4, y + 6, { align: 'right' });
        }

        // Question text
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(qLines, margin + 4, y + 6);

        let curY = y + 6 + (qLines.length * 4.5);

        // Code snippet preview if present
        if (q.codeSnippet) {
          doc.setFillColor(241, 245, 249);
          doc.rect(margin + 4, curY, contentWidth - 8, 10, 'F');
          doc.setFont('courier', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(30, 41, 59);
          const snippetLines = doc.splitTextToSize(q.codeSnippet.replace(/\n/g, ' '), contentWidth - 12);
          doc.text(snippetLines.slice(0, 2), margin + 6, curY + 4);
          curY += 12;
        }

        // Answers row
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        const yourAnsText = userChoice ? `Your Answer: Option ${userChoice}` : 'Your Answer: (Unanswered)';
        const correctAnsText = `Correct Answer: Option ${q.correctAnswer}`;
        doc.text(`${yourAnsText}    |    ${correctAnsText}`, margin + 4, curY + 2);
        curY += 6;

        // Explanation text
        if (explanationLines.length > 0) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text(explanationLines, margin + 4, curY);
        }

        y += blockHeight + 4;
      });

      // Footer page numbering
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Java Quiz Assessment Platform  ·  Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
      }

      const cleanTitle = attempt.quizTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 25);
      doc.save(`JavaQuiz-Report-${cleanTitle}-${attempt.id}.pdf`);
      showToast('Performance report PDF downloaded successfully.', 'success');
    } catch (err: any) {
      console.error('PDF generation error:', err);
      showToast('Failed to generate PDF report.', 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Top Breadcrumb & Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>

        <div className="flex items-center gap-3">
          {onRetake && quiz && (
            <button
              onClick={() => onRetake(quiz.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Quiz</span>
            </button>
          )}

          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
            title="Save report as PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* Main Score Banner Card */}
      <div
        className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-all ${
          isPass
            ? 'border-emerald-200 bg-linear-to-br from-emerald-50/50 via-white to-teal-50/30'
            : 'border-rose-200 bg-linear-to-br from-rose-50/50 via-white to-orange-50/30'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200/60">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              <span>{attempt.quizCategory}</span>
              <span>·</span>
              <span>Attempt #{attempt.id}</span>
              <span>·</span>
              <span>{new Date(attempt.submittedAt).toLocaleDateString()}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{attempt.quizTitle}</h1>
            <p className="text-sm text-slate-600 mt-1">Participant: {attempt.participantName}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs uppercase font-semibold text-slate-500 tracking-wider">Final Outcome</div>
              <div
                className={`text-2xl font-black tracking-tight ${
                  isPass ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {isPass ? 'PASSED' : 'NOT PASSED'}
              </div>
            </div>
            <div
              className={`h-16 w-16 rounded-2xl flex items-center justify-center font-mono font-bold text-xl shadow-sm ${
                isPass ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
              }`}
            >
              {attempt.percentage}%
            </div>
          </div>
        </div>

        {/* Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 pt-6">
          <div className="bg-white/80 rounded-xl p-3.5 border border-slate-200/60 shadow-2xs">
            <div className="text-xs text-slate-500 font-medium">Marks Obtained</div>
            <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
              {attempt.score} <span className="text-xs text-slate-400 font-normal">/ {attempt.totalMarks}</span>
            </div>
          </div>

          <div className="bg-white/80 rounded-xl p-3.5 border border-slate-200/60 shadow-2xs">
            <div className="text-xs text-slate-500 font-medium">Percentage</div>
            <div className="text-lg font-bold text-slate-900 font-mono mt-0.5 tabular-nums">
              {attempt.percentage}%
            </div>
          </div>

          <div className="bg-white/80 rounded-xl p-3.5 border border-slate-200/60 shadow-2xs">
            <div className="text-xs text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Correct</span>
            </div>
            <div className="text-lg font-bold text-emerald-700 font-mono mt-0.5 tabular-nums">
              {attempt.correctAnswers}
            </div>
          </div>

          <div className="bg-white/80 rounded-xl p-3.5 border border-slate-200/60 shadow-2xs">
            <div className="text-xs text-rose-700 font-medium flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              <span>Incorrect</span>
            </div>
            <div className="text-lg font-bold text-rose-700 font-mono mt-0.5 tabular-nums">
              {attempt.wrongAnswers}
            </div>
          </div>

          <div className="bg-white/80 rounded-xl p-3.5 border border-slate-200/60 shadow-2xs">
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Unanswered</span>
            </div>
            <div className="text-lg font-bold text-slate-700 font-mono mt-0.5 tabular-nums">
              {attempt.unanswered}
            </div>
          </div>

          <div className="bg-white/80 rounded-xl p-3.5 border border-slate-200/60 shadow-2xs">
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Time Taken</span>
            </div>
            <div className="text-lg font-bold text-slate-900 font-mono mt-0.5 tabular-nums">
              {durationMinutes}m {durationSeconds}s
            </div>
          </div>
        </div>

        {/* Creator Feedback (if any) */}
        {attempt.feedback && (
          <div className="mt-6 rounded-xl bg-indigo-50/70 border border-indigo-200/80 p-4 text-sm text-indigo-950">
            <div className="font-semibold text-indigo-900 flex items-center gap-1.5 mb-1">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Instructor Feedback</span>
            </div>
            <p className="leading-relaxed">{attempt.feedback}</p>
          </div>
        )}
      </div>

      {/* Question-Wise Analysis Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Question-by-Question Analysis</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review correct answers, explanations, and Java concept breakdowns.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              type="button"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 px-2 py-1"
            >
              Expand All
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={collapseAll}
              type="button"
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-2 py-1"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {quiz?.questions.map((q, idx) => {
            const userAnsRecord = attempt.answers.find(a => a.questionId === q.id);
            const userChoice = userAnsRecord?.selectedAnswer || null;
            const isCorrect = userAnsRecord?.isCorrect || false;
            const isUnanswered = userChoice === null;
            const isExpanded = expandedQuestions[q.id] ?? true;

            return (
              <div
                key={q.id}
                className={`rounded-xl border bg-white transition-all overflow-hidden ${
                  isCorrect
                    ? 'border-emerald-200/80 shadow-2xs'
                    : isUnanswered
                    ? 'border-slate-200 shadow-2xs'
                    : 'border-rose-200/80 shadow-2xs'
                }`}
              >
                {/* Header row */}
                <div
                  onClick={() => toggleExpand(q.id)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-800'
                          : isUnanswered
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      Q{idx + 1}
                    </span>
                    <div className="text-sm font-semibold text-slate-900 line-clamp-1">{q.questionText}</div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Correct (+{q.marks || 10})</span>
                        </span>
                      ) : isUnanswered ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                          <HelpCircle className="w-4 h-4" />
                          <span>Unanswered (0)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700">
                          <XCircle className="w-4 h-4" />
                          <span>Wrong (0/{q.marks || 10})</span>
                        </span>
                      )}
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 pt-1 border-t border-slate-100 bg-slate-50/40 text-sm space-y-4">
                    <div className="text-slate-800 font-medium">{q.questionText}</div>

                    {q.codeSnippet && <CodeSnippet code={q.codeSnippet} language="java" />}

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
                      {(['A', 'B', 'C', 'D'] as const).map(key => {
                        const optText = (key === 'A' ? q.optionA : key === 'B' ? q.optionB : key === 'C' ? q.optionC : q.optionD);
                        const isThisCorrect = q.correctAnswer === key;
                        const isUserChoice = userChoice === key;

                        let style = 'bg-white border-slate-200 text-slate-700';
                        if (isThisCorrect) {
                          style = 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium ring-1 ring-emerald-300';
                        } else if (isUserChoice && !isThisCorrect) {
                          style = 'bg-rose-50 border-rose-300 text-rose-950 font-medium line-through';
                        }

                        return (
                          <div
                            key={key}
                            className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 transition-all ${style}`}
                          >
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-[11px] font-bold ${
                                isThisCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : isUserChoice
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {key}
                            </span>
                            <div className="flex-1">
                              <span>{optText}</span>
                              {isThisCorrect && (
                                <span className="ml-2 text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                                  (Correct Answer)
                                </span>
                              )}
                              {isUserChoice && !isThisCorrect && (
                                <span className="ml-2 text-[10px] uppercase font-bold text-rose-700 tracking-wider">
                                  (Your Answer)
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="rounded-lg bg-indigo-50/70 border border-indigo-100 p-3 text-xs text-indigo-950">
                        <span className="font-bold text-indigo-900 uppercase tracking-wider block mb-1">
                          Explanation:
                        </span>
                        <p className="leading-relaxed">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
