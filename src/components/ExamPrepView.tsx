import React, { useState } from 'react';
import {
  Target,
  Calendar,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  Play
} from 'lucide-react';
import { ExamGoal, ConceptNode, Subject } from '../types';
import { fetchExamPlan } from '../services/api';

interface ExamPrepViewProps {
  examGoal: ExamGoal;
  concepts: ConceptNode[];
  subjects: Subject[];
  onStartTimedMockExam: () => void;
  onStartQuizOnConcept: (concept: ConceptNode) => void;
}

export const ExamPrepView: React.FC<ExamPrepViewProps> = ({
  examGoal,
  concepts,
  subjects,
  onStartTimedMockExam,
  onStartQuizOnConcept,
}) => {
  const [activePlanTab, setActivePlanTab] = useState<'roadmap' | 'high_yield' | 'mock'>('roadmap');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);

  const subjectConcepts = concepts.filter((c) => c.subjectId === examGoal.subjectId);
  const weakConcepts = subjectConcepts.filter((c) => c.status === 'weak');

  const handleRefreshPlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const plan = await fetchExamPlan({
        subjectTitle: examGoal.subjectName,
        examDate: examGoal.examDate,
        targetScore: examGoal.targetScore,
        currentMastery: examGoal.currentEstimatedMastery,
        availableHoursDaily: 2.5,
        weakConcepts: weakConcepts.map((c) => c.title),
      });
      setGeneratedPlan(plan);
    } catch (err) {
      console.error('Plan generation failed:', err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const roadmapPhases = generatedPlan?.priorityRoadmap || [
    {
      phase: 'Phase 1: Days 1-3',
      focus: 'Prerequisite Repair (Functional Dependencies & Key Constraints)',
      topics: ['Functional Dependencies', '2NF Partial Dependencies', 'Candidate Keys'],
    },
    {
      phase: 'Phase 2: Days 4-7',
      focus: 'High-Yield Core Algorithms (3NF Normalization & SQL JOINs)',
      topics: ['3NF Normalization Decomposition', 'BCNF vs 3NF Tradeoffs', 'SQL Outer Joins'],
    },
    {
      phase: 'Phase 3: Days 8-9',
      focus: 'Performance & Storage (Indexing & Transactions)',
      topics: ['B+ Tree Index Lookups', 'ACID Isolation Levels'],
    },
    {
      phase: 'Phase 4: Days 10-11',
      focus: 'Timed Comprehensive Mock Exams & ForgetMeNot Flash Retest',
      topics: ['Full Mock Assessment', 'Rapid Formula Recall'],
    },
  ];

  return (
    <div id="exam-prep-view" className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 rounded-3xl p-6 lg:p-8 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-bold">
            <Target className="w-3.5 h-3.5" />
            <span>AI Exam Readiness Optimizer</span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold font-display tracking-tight">
            {examGoal.subjectName} Final Exam Prep
          </h1>
          <p className="text-purple-200 text-xs lg:text-sm leading-relaxed">
            Targeting a <strong>{examGoal.targetScore}% target score</strong>. Focus your limited study time on highest-yield prerequisite leverage points.
          </p>
        </div>

        <div className="flex items-center gap-6 bg-white/10 p-4 rounded-2xl border border-white/20 backdrop-blur-sm shrink-0">
          <div className="text-center">
            <p className="text-[10px] uppercase font-bold text-purple-200">Days Remaining</p>
            <p className="text-3xl font-extrabold font-display text-white mt-0.5">
              {examGoal.daysRemaining}
            </p>
          </div>
          <div className="h-10 w-px bg-white/20" />
          <div className="text-center">
            <p className="text-[10px] uppercase font-bold text-purple-200">Current Mastery</p>
            <p className="text-3xl font-extrabold font-display text-emerald-400 mt-0.5">
              {examGoal.currentEstimatedMastery}%
            </p>
          </div>
        </div>
      </div>

      {/* Target Progress Meter */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-700">Exam Readiness Gap:</span>
          <span className="text-indigo-600">
            {examGoal.targetScore - examGoal.currentEstimatedMastery}% mastery to reach Target Grade A
          </span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden relative">
          <div
            className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${examGoal.currentEstimatedMastery}%` }}
          />
          {/* Target marker line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-purple-600 z-10"
            style={{ left: `${examGoal.targetScore}%` }}
            title={`Target: ${examGoal.targetScore}%`}
          />
        </div>

        <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
          <span>0%</span>
          <span>Current: {examGoal.currentEstimatedMastery}%</span>
          <span className="text-purple-700 font-bold">Target: {examGoal.targetScore}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Exam Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>11-Day Dynamic Study Roadmap</span>
            </h2>
            <button
              onClick={handleRefreshPlan}
              disabled={isGeneratingPlan}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
            >
              {isGeneratingPlan ? 'Recalculating...' : 'Regenerate AI Schedule ⟳'}
            </button>
          </div>

          <div className="space-y-4">
            {roadmapPhases.map((phase: any, idx: number) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200">
                    {phase.phase}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Daily Target: 2.5 hrs</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{phase.focus}</h3>

                <div className="flex flex-wrap gap-2 pt-1">
                  {phase.topics.map((top: string, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
                    >
                      {top}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: High-Yield Focus & Mock Launcher */}
        <div className="space-y-4">
          {/* Mock Exam Launcher */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Timed 15-Minute Mock Exam
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Simulates real exam constraints with mixed-difficulty questions across all {examGoal.subjectName} syllabus topics.
            </p>

            <button
              onClick={onStartTimedMockExam}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch Timed Mock Exam</span>
            </button>
          </div>

          {/* High Yield Weakness Matrix */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Highest Yield Weak Topics
              </h3>
            </div>

            <div className="space-y-2.5">
              {weakConcepts.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl flex items-center justify-between text-xs cursor-pointer hover:bg-rose-100/80 transition-colors"
                  onClick={() => onStartQuizOnConcept(c)}
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-rose-900">{c.title}</p>
                    <p className="text-[10px] text-rose-700">Mastery: {c.masteryScore}%</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-rose-600" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
