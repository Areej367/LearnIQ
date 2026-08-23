import React, { useState } from 'react';
import {
  RotateCcw,
  Sparkles,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  ArrowRight,
  TrendingDown,
  Brain,
  Layers,
  ChevronRight,
  RefreshCw,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RevisionItem, ConceptNode, Subject } from '../types';

interface RevisionViewProps {
  revisionItems: RevisionItem[];
  concepts: ConceptNode[];
  subjects: Subject[];
  onCompleteRevision: (conceptId: string, performanceRating: 'hard' | 'good' | 'easy') => void;
  onStartQuizOnConcept: (concept: ConceptNode) => void;
}

export const RevisionView: React.FC<RevisionViewProps> = ({
  revisionItems,
  concepts,
  subjects,
  onCompleteRevision,
  onStartQuizOnConcept,
}) => {
  const [activeSessionIndex, setActiveSessionIndex] = useState<number | null>(null);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);

  const reviewNowItems = revisionItems.filter((r) => r.urgency === 'review_now');
  const reviewSoonItems = revisionItems.filter((r) => r.urgency === 'review_soon');
  const strongItems = revisionItems.filter((r) => r.urgency === 'strong');

  const activeReviewItem =
    activeSessionIndex !== null ? reviewNowItems[activeSessionIndex] : null;

  const handleStartFlashRecall = () => {
    if (reviewNowItems.length > 0) {
      setActiveSessionIndex(0);
      setIsFlipped(false);
      setSessionCompleted(false);
    }
  };

  const handleRateFlashCard = (rating: 'hard' | 'good' | 'easy') => {
    if (!activeReviewItem) return;

    onCompleteRevision(activeReviewItem.concept.id, rating);

    if (activeSessionIndex !== null && activeSessionIndex < reviewNowItems.length - 1) {
      setActiveSessionIndex(activeSessionIndex + 1);
      setIsFlipped(false);
    } else {
      setActiveSessionIndex(null);
      setSessionCompleted(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <div id="forgetmenot-revision-view" className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-6 lg:p-8 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold backdrop-blur-sm">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ForgetMeNot Predictive Spaced Retention</span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold font-display tracking-tight">
            Today's Spaced Revision Session
          </h1>
          <p className="text-amber-100 text-xs lg:text-sm leading-relaxed">
            Using Ebbinghaus memory decay modeling (<code className="bg-black/20 px-1.5 py-0.5 rounded font-mono text-[11px]">R = e^(-t/S)</code>), ForgetMeNot schedules active recall right at the optimal cognitive decay threshold.
          </p>
        </div>

        {/* Quick Flash Recall Start Button */}
        {reviewNowItems.length > 0 ? (
          <button
            onClick={handleStartFlashRecall}
            className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-amber-50 text-amber-900 rounded-2xl text-xs font-extrabold shadow-lg shadow-black/10 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Zap className="w-4 h-4 text-amber-600" />
            <span>Start Rapid Recall ({reviewNowItems.length} Due)</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 text-white text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>All Overdue Concepts Revised!</span>
          </div>
        )}
      </div>

      {/* Interactive Active Flash Recall Mode */}
      {activeReviewItem && (
        <div className="bg-white rounded-3xl border-2 border-amber-300 p-6 lg:p-8 shadow-xl space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                {(activeSessionIndex || 0) + 1}/{reviewNowItems.length}
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Active Spaced Recall: {activeReviewItem.concept.title}
                </h3>
                <p className="text-xs text-slate-500">{activeReviewItem.subjectName}</p>
              </div>
            </div>

            <button
              onClick={() => setActiveSessionIndex(null)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              Exit Session
            </button>
          </div>

          {/* Flashcard Front/Back */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[220px] p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-amber-50/30 border border-slate-200 cursor-pointer flex flex-col justify-center items-center text-center space-y-4 hover:shadow-md transition-all select-none"
          >
            {!isFlipped ? (
              <>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                  Prompt: Active Recall
                </span>
                <h4 className="text-lg font-bold text-slate-900 max-w-xl">
                  What is the fundamental invariant and operation rule of{' '}
                  <strong className="text-amber-800 underline">{activeReviewItem.concept.title}</strong>?
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  (Think through your answer, then click anywhere on this card to reveal the definition)
                </p>
              </>
            ) : (
              <>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                  Core Invariant & Definition
                </span>
                <p className="text-sm text-slate-800 font-medium max-w-xl leading-relaxed">
                  {activeReviewItem.concept.definition}
                </p>
                {activeReviewItem.concept.commonPitfalls.length > 0 && (
                  <p className="text-xs text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                    <strong>Avoid Pitfall:</strong> {activeReviewItem.concept.commonPitfalls[0]}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Performance Rating Bar */}
          {isFlipped && (
            <div className="space-y-3 pt-2">
              <p className="text-center text-xs font-bold text-slate-600">
                How accurately did you recall this concept?
              </p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleRateFlashCard('hard')}
                  className="py-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold transition-all"
                >
                  🔴 Hard (Forgot / Reset Decay)
                </button>
                <button
                  onClick={() => handleRateFlashCard('good')}
                  className="py-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold transition-all"
                >
                  🟡 Good (+2.5d Stability)
                </button>
                <button
                  onClick={() => handleRateFlashCard('easy')}
                  className="py-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition-all"
                >
                  🟢 Easy (+5.0d Stability)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Session Completed Alert */}
      {sessionCompleted && (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-900">
                Spaced Revision Complete!
              </h3>
              <p className="text-xs text-emerald-700">
                Memory stability increased across all revised topics. Next revision scheduled in 4–7 days.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSessionCompleted(false)}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3 Urgency Buckets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgency 1: Review Now (<65% Retention) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-rose-200">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <h2 className="text-sm font-bold text-slate-900 font-display">
                Review Now ({reviewNowItems.length})
              </h2>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800">
              &lt;65% Retention
            </span>
          </div>

          <p className="text-xs text-slate-500">
            High memory decay threshold reached. Active recall is critical today.
          </p>

          <div className="space-y-3">
            {reviewNowItems.map((item) => (
              <div
                key={item.concept.id}
                className="bg-white rounded-2xl border border-rose-200 p-4 shadow-xs hover:border-rose-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{item.concept.title}</h3>
                    <p className="text-[10px] text-slate-500">{item.subjectName}</p>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                    {item.retentionScore}%
                  </span>
                </div>

                {/* Decay Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                    <span>{item.daysSinceReview}d since review</span>
                    <span>Stability: {item.stabilityDays}d</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-rose-500 h-1.5 rounded-full"
                      style={{ width: `${item.retentionScore}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onStartQuizOnConcept(item.concept)}
                    className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Practice Concept</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Urgency 2: Review Soon (65-85% Retention) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-amber-200">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 font-display">
                Review Soon ({reviewSoonItems.length})
              </h2>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
              65-85% Retention
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Approaching the retention boundary within the next 48 hours.
          </p>

          <div className="space-y-3">
            {reviewSoonItems.map((item) => (
              <div
                key={item.concept.id}
                className="bg-white rounded-2xl border border-amber-200/80 p-4 shadow-xs hover:border-amber-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{item.concept.title}</h3>
                    <p className="text-[10px] text-slate-500">{item.subjectName}</p>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    {item.retentionScore}%
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                    <span>{item.daysSinceReview}d since review</span>
                    <span>Stability: {item.stabilityDays}d</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-1.5 rounded-full"
                      style={{ width: `${item.retentionScore}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => onStartQuizOnConcept(item.concept)}
                  className="w-full py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <span>Quick Test</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Urgency 3: Strong Retention (>85%) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-bold text-slate-900 font-display">
                Solidified ({strongItems.length})
              </h2>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              &gt;85% Retention
            </span>
          </div>

          <p className="text-xs text-slate-500">
            High memory stability. Scheduled for long-interval maintenance.
          </p>

          <div className="space-y-3">
            {strongItems.map((item) => (
              <div
                key={item.concept.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{item.concept.title}</h3>
                    <p className="text-[10px] text-slate-500">{item.subjectName}</p>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {item.retentionScore}%
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                    <span>{item.daysSinceReview}d since review</span>
                    <span>Stability: {item.stabilityDays}d</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full"
                      style={{ width: `${item.retentionScore}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
