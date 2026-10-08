import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Quiz, Question, ParticipantAnswer } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { CodeSnippet } from '../common/CodeSnippet';
import { Clock, AlertTriangle, ChevronLeft, ChevronRight, CheckCircle2, Bookmark, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizPlayerProps {
  quiz: Quiz;
  onFinish: (attemptId: number) => void;
  onCancel: () => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({ quiz, onFinish, onCancel }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const totalTimeSeconds = quiz.durationMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalTimeSeconds);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const hasSubmittedRef = useRef(false);
  const startTimeRef = useRef<number>(Date.now());

  // Submit attempt handler
  const doSubmit = useCallback(async (isTimeExpired = false) => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    setIsSubmitting(true);

    const timeSpent = Math.min(totalTimeSeconds, Math.round((Date.now() - startTimeRef.current) / 1000));

    const formattedAnswers = quiz.questions.map(q => ({
      questionId: q.id,
      selectedAnswer: selectedAnswers[q.id] || null
    }));

    if (!user) {
      showToast('You must be signed in to submit an assessment.', 'error');
      setIsSubmitting(false);
      hasSubmittedRef.current = false;
      return;
    }

    try {
      const attempt = await api.submitQuizAttempt({
        quizId: quiz.id,
        participantId: user.id,
        participantName: user.name,
        answers: formattedAnswers,
        timeTakenSeconds: timeSpent
      });

      if (attempt.status === 'PASS') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        showToast(`Congratulations! You passed with ${attempt.percentage}%!`, 'success');
      } else {
        showToast(`Quiz completed. Score: ${attempt.score}/${attempt.totalMarks} (${attempt.percentage}%)`, 'info');
      }

      onFinish(attempt.id);
    } catch (err: any) {
      showToast(err.message || 'Failed to submit quiz.', 'error');
      setIsSubmitting(false);
      hasSubmittedRef.current = false;
    }
  }, [quiz, selectedAnswers, totalTimeSeconds, user, showToast, onFinish]);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!hasSubmittedRef.current) {
            showToast('Time has expired! Submitting your answers automatically...', 'error');
            doSubmit(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [doSubmit, showToast]);

  const currentQuestion: Question = quiz.questions[currentIndex];
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const isTimeCritical = secondsRemaining < 120; // less than 2 minutes

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = quiz.questions.length;

  const handleSelectOption = (optionKey: 'A' | 'B' | 'C' | 'D') => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionKey
    }));
  };

  const handleClearAnswer = () => {
    setSelectedAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentQuestion.id];
      return copy;
    });
  };

  const handleToggleFlag = () => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id]
    }));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Bar with Quiz Title & Countdown Timer */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 py-3 backdrop-blur-md sm:px-8">
        <div>
          <span className="text-xs uppercase tracking-wider text-indigo-400 font-semibold">{quiz.category}</span>
          <h1 className="text-base font-semibold text-white truncate max-w-md">{quiz.title}</h1>
        </div>

        {/* Countdown Timer */}
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border font-mono text-sm font-semibold tracking-wider ${
              isTimeCritical
                ? 'border-rose-500/80 bg-rose-950/60 text-rose-300 animate-pulse'
                : 'border-slate-700 bg-slate-900 text-slate-200'
            }`}
          >
            <Clock className={`w-4 h-4 ${isTimeCritical ? 'text-rose-400' : 'text-indigo-400'}`} />
            <span>TIME LEFT:</span>
            <span className="text-base tabular-nums">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Left Column: Question Area */}
        <div className="flex-1 flex flex-col justify-between bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xl">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              <div className="flex items-center gap-3">
                <span className="tabular-nums font-mono text-indigo-400 font-semibold">
                  {currentQuestion.marks || 10} Marks
                </span>
                <button
                  type="button"
                  onClick={handleToggleFlag}
                  className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                    flaggedQuestions[currentQuestion.id]
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{flaggedQuestions[currentQuestion.id] ? 'Flagged' : 'Flag'}</span>
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="text-slate-100 font-medium text-base mb-3 leading-relaxed">
              {currentQuestion.questionText}
            </div>

            {/* Optional Java Code Snippet */}
            {currentQuestion.codeSnippet && (
              <CodeSnippet code={currentQuestion.codeSnippet} language="java" />
            )}

            {/* Options */}
            <div className="mt-5 space-y-2.5">
              {(['A', 'B', 'C', 'D'] as const).map(optionKey => {
                const optText = (optionKey === 'A' ? currentQuestion.optionA : optionKey === 'B' ? currentQuestion.optionB : optionKey === 'C' ? currentQuestion.optionC : currentQuestion.optionD);
                const isSelected = selectedAnswers[currentQuestion.id] === optionKey;

                return (
                  <button
                    key={optionKey}
                    type="button"
                    onClick={() => handleSelectOption(optionKey)}
                    className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-sm ring-1 ring-indigo-500'
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {optionKey}
                    </span>
                    <span className="text-sm pt-0.5 leading-relaxed">{optText}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Navigation Buttons */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 px-3.5 py-2 rounded-lg border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              {selectedAnswers[currentQuestion.id] && (
                <button
                  type="button"
                  onClick={handleClearAnswer}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Clear Selection
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {currentIndex < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors shadow-sm"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Review & Finish</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Question Navigator Palette */}
        <div className="w-full lg:w-80 shrink-0 bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3">
              Question Navigator
            </h3>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-600"></span>
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700"></span>
                <span>Unanswered ({totalQuestions - answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded ring-2 ring-indigo-500 bg-slate-900"></span>
                <span>Current</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-600"></span>
                <span>Flagged</span>
              </div>
            </div>

            {/* Grid of Question Numbers */}
            <div className="grid grid-cols-5 gap-2">
              {quiz.questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = !!selectedAnswers[q.id];
                const isFlagged = !!flaggedQuestions[q.id];

                let btnStyle = 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-600';
                if (isAnswered) {
                  btnStyle = 'bg-emerald-700/80 text-white border-emerald-600 font-semibold';
                }
                if (isFlagged) {
                  btnStyle = 'bg-amber-600 text-white border-amber-500 font-semibold';
                }
                if (isCurrent) {
                  btnStyle += ' ring-2 ring-indigo-400 font-bold';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-lg font-mono text-xs flex items-center justify-center transition-all ${btnStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-6 space-y-2">
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              Submit Quiz Now
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
            >
              Exit Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal before Submit */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400 mb-3">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-semibold text-white text-base">Ready to Submit Quiz?</h3>
            </div>
            <p className="text-slate-300 text-sm mb-4 leading-relaxed">
              You have answered <span className="font-bold text-white font-mono">{answeredCount}</span> of{' '}
              <span className="font-bold text-white font-mono">{totalQuestions}</span> questions.
              {totalQuestions - answeredCount > 0 && (
                <span className="text-amber-300 block mt-1">
                  Warning: You still have {totalQuestions - answeredCount} unanswered questions!
                </span>
              )}
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Return to Quiz
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSubmitModal(false);
                  doSubmit();
                }}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
              >
                {isSubmitting ? 'Grading...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
