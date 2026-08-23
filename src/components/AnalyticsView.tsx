import React, { useState } from 'react';
import {
  BarChart3,
  Sparkles,
  TrendingUp,
  Brain,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  Loader2,
  FileText,
  Flame,
  Award
} from 'lucide-react';
import {
  ConceptNode,
  Subject,
  PerformanceLog,
  UserProfile,
  AIWeeklyReport
} from '../types';
import { fetchWeeklyLearningReport } from '../services/api';

interface AnalyticsViewProps {
  user: UserProfile;
  concepts: ConceptNode[];
  subjects: Subject[];
  performanceLogs: PerformanceLog[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  user,
  concepts,
  subjects,
  performanceLogs,
}) => {
  const [report, setReport] = useState<AIWeeklyReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const generated = await fetchWeeklyLearningReport({
        studentProfile: user,
        masteryData: concepts.map((c) => ({ title: c.title, score: c.masteryScore, status: c.status })),
        recentMistakes: performanceLogs.map((l) => ({
          concept: l.conceptTitle,
          rootCause: l.aiDiagnosis?.rootCause,
          type: l.aiDiagnosis?.misconceptionType,
        })),
        subjects: subjects.map((s) => s.name),
      });
      setReport(generated);
    } catch (err) {
      console.error('Report error:', err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const masteredCount = concepts.filter((c) => c.status === 'mastered').length;
  const developingCount = concepts.filter((c) => c.status === 'developing').length;
  const weakCount = concepts.filter((c) => c.status === 'weak').length;

  return (
    <div id="analytics-view" className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <span>Learning Intelligence & Analytics</span>
          </h1>
          <p className="text-xs text-slate-500">
            Cognitive diagnostics, misconception patterns, and AI synthesis of your learning journey
          </p>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={isGeneratingReport}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
        >
          {isGeneratingReport ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Synthesizing Report...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Diagnostic Report</span>
            </>
          )}
        </button>
      </div>

      {/* Generated AI Report Card */}
      {report && (
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 lg:p-8 text-white shadow-xl space-y-6 border border-indigo-500/30 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500 text-white flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold font-display text-white">
                  AI Weekly Learning Intelligence Brief
                </h2>
                <p className="text-xs text-indigo-300">
                  Generated {new Date(report.generatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              {report.overallProgressDelta}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
              <p className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">
                Strongest Cognitive Areas
              </p>
              <p className="text-slate-200 leading-relaxed font-medium">{report.strongestArea}</p>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
              <p className="font-bold text-rose-400 uppercase tracking-wider text-[10px]">
                Critical Prerequisite Gaps
              </p>
              <p className="text-slate-200 leading-relaxed font-medium">{report.weakestArea}</p>
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2 text-xs">
            <p className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
              Frequent Mental Model Misconception
            </p>
            <p className="text-slate-200 font-medium leading-relaxed">{report.mostCommonMistake}</p>
          </div>

          <div className="space-y-2 text-xs">
            <p className="font-bold text-indigo-300 uppercase tracking-wider text-[10px]">
              Recommended 7-Day Action Plan
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {report.weeklyActionPlan.map((action, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-2.5 bg-white/5 rounded-xl border border-white/10 text-slate-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Concept Mastery Distribution */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 font-display">
            Mastery Distribution
          </h3>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-emerald-700">Mastered (80-100%)</span>
                <span>{masteredCount} concepts</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${(masteredCount / concepts.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-amber-700">Developing (50-79%)</span>
                <span>{developingCount} concepts</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{ width: `${(developingCount / concepts.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-rose-700">Weak (&lt;50%)</span>
                <span>{weakCount} concepts</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-rose-500 h-2 rounded-full"
                  style={{ width: `${(weakCount / concepts.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Misconception Classifications */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 font-display">
            Identified Error Patterns
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100 flex items-center justify-between">
              <span className="font-bold text-rose-900">Missing Prerequisite</span>
              <span className="font-mono text-rose-700 font-bold">48% of errors</span>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-between">
              <span className="font-bold text-amber-900">Mental Model Confusion</span>
              <span className="font-mono text-amber-700 font-bold">32% of errors</span>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
              <span className="font-bold text-blue-900">Procedural Oversight</span>
              <span className="font-mono text-blue-700 font-bold">20% of errors</span>
            </div>
          </div>
        </div>

        {/* Study Habit Stats */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 font-display">
            Study Habit Metrics
          </h3>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
              <Flame className="w-5 h-5 text-amber-500 mx-auto" />
              <p className="text-lg font-extrabold text-amber-900 mt-1">{user.studyStreakDays} Days</p>
              <p className="text-[10px] text-amber-700 font-semibold">Consecutive Streak</p>
            </div>

            <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
              <Clock className="w-5 h-5 text-indigo-600 mx-auto" />
              <p className="text-lg font-extrabold text-indigo-900 mt-1">14.5 hrs</p>
              <p className="text-[10px] text-indigo-700 font-semibold">This Week</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
