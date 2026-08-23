import React from 'react';
import {
  Sparkles,
  Flame,
  RotateCcw,
  Target,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  BookOpen,
  Brain,
  Network,
  Zap,
  Bot,
  AlertTriangle,
  Lightbulb,
  Award,
  ChevronRight
} from 'lucide-react';
import {
  ConceptNode,
  Subject,
  PerformanceLog,
  ExamGoal,
  UserProfile,
  RevisionItem
} from '../types';

interface DashboardViewProps {
  user: UserProfile;
  subjects: Subject[];
  concepts: ConceptNode[];
  performanceLogs: PerformanceLog[];
  examGoal: ExamGoal;
  revisionItems: RevisionItem[];
  onNavigate: (tab: any) => void;
  onSelectConcept: (concept: ConceptNode) => void;
  onStartQuizOnConcept: (concept: ConceptNode) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  subjects,
  concepts,
  performanceLogs,
  examGoal,
  revisionItems,
  onNavigate,
  onSelectConcept,
  onStartQuizOnConcept,
}) => {
  // Compute overall stats
  const totalConcepts = concepts.length;
  const masteredConcepts = concepts.filter((c) => c.status === 'mastered').length;
  const developingConcepts = concepts.filter((c) => c.status === 'developing').length;
  const weakConcepts = concepts.filter((c) => c.status === 'weak');
  const notLearnedConcepts = concepts.filter((c) => c.status === 'not_learned').length;

  const averageMastery = Math.round(
    concepts.reduce((acc, curr) => acc + curr.masteryScore, 0) / (totalConcepts || 1)
  );

  const urgentRevisions = revisionItems.filter((r) => r.urgency === 'review_now');
  const upcomingRevisions = revisionItems.filter((r) => r.urgency === 'review_soon');
  const solidRevisions = revisionItems.filter((r) => r.urgency === 'strong');

  // Most critical weak concept for hero action
  const topWeakConcept = weakConcepts[0] || concepts[0];

  return (
    <div id="learniq-dashboard-view" className="space-y-6 pb-12">
      {/* Top Stat Row (3 Cards matching design theme) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Overall Mastery Card */}
        <div className="md:col-span-3 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Overall Mastery</div>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-slate-800 font-display">{averageMastery}%</span>
              <span className="text-emerald-600 text-xs font-semibold flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+4.2% wk</span>
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${averageMastery}%` }} />
          </div>
        </div>

        {/* Due for Revision Card */}
        <div className="md:col-span-3 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Due for Revision</div>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-slate-800 font-display">{urgentRevisions.length}</span>
              <span className="text-orange-500 text-xs font-bold bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                High Risk
              </span>
            </div>
          </div>
          <div className="text-xs text-slate-500 font-medium mt-2 flex items-center justify-between">
            <span>ForgetMeNot Engine</span>
            <span className="font-semibold text-slate-700">81% avg retention</span>
          </div>
        </div>

        {/* Next Exam Hero Banner */}
        <div className="md:col-span-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 shadow-lg flex items-center justify-between text-white">
          <div className="space-y-1">
            <div className="text-blue-100 text-xs font-bold uppercase tracking-wider">
              Next Exam: {examGoal.subjectName}
            </div>
            <div className="text-2xl font-bold font-display tracking-tight">
              Prep Score: {examGoal.currentEstimatedMastery}%
            </div>
            <div className="text-xs text-blue-100/90 font-medium">
              Target: {examGoal.targetScore}% • {examGoal.daysRemaining} days remaining
            </div>
          </div>
          <button
            onClick={() => onNavigate('examprep')}
            className="bg-white hover:bg-blue-50 text-blue-700 px-5 py-2.5 rounded-lg font-bold text-xs shadow-sm transition-all shrink-0 hover:scale-105 active:scale-95 flex items-center gap-1.5"
          >
            <span>Start Session</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Middle Row: AI Insight Card (Concept Detective) & ForgetMeNot Dark Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* AI Insight Card (Concept Detective) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h2 className="font-bold text-lg text-slate-800 font-display">AI Insight Card</h2>
            </div>
            <span className="text-xs text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Concept Detective
            </span>
          </div>

          <div className="flex items-start space-x-5">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center shrink-0 border border-amber-100 shadow-xs">
              <span className="text-2xl">🔍</span>
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-slate-700 leading-relaxed font-medium text-base lg:text-lg">
                "You are consistently struggling with{' '}
                <span className="text-indigo-600 font-bold">Recursion & 3NF Normalization</span>. Your previous mistakes suggest that the primary cognitive bottleneck is understanding{' '}
                <span className="underline decoration-indigo-300 decoration-2 font-semibold">Function Call Stacks & Attribute Closures</span>."
              </p>

              {/* Recommended Learning Path */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2.5">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Recommended Learning Path
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                    <span>Review Memory Management (Stack vs Heap) & Functional Dependencies</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    <span className="font-bold text-slate-800">
                      Interactive Visualization: Base Case Anatomy & Attribute Closures
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                    <span>Complete 3 Level-1 adaptive diagnostic drills</span>
                  </div>
                </div>
              </div>

              {/* Interactive buttons */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => onStartQuizOnConcept(topWeakConcept)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Launch Diagnostic Drill</span>
                </button>
                <button
                  onClick={() => onNavigate('skillgraph')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <Network className="w-3.5 h-3.5 text-slate-500" />
                  <span>Trace on SkillGraph</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ForgetMeNot Dark Card */}
        <div className="lg:col-span-4 bg-[#1E293B] rounded-2xl p-6 shadow-sm flex flex-col justify-between text-white border border-slate-700/50">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🕒</span>
                <h2 className="font-bold text-lg font-display">ForgetMeNot</h2>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                Spaced Recall
              </span>
            </div>

            <div className="space-y-3.5">
              {urgentRevisions.slice(0, 1).map((item) => (
                <div
                  key={item.concept.id}
                  onClick={() => onStartQuizOnConcept(item.concept)}
                  className="border-l-2 border-orange-500 pl-4 py-1 hover:bg-white/5 rounded-r-lg transition-colors cursor-pointer"
                >
                  <div className="text-xs text-slate-400 font-medium">{item.concept.title}</div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="font-semibold text-xs text-slate-200">
                      Retention: {item.retentionScore}%
                    </span>
                    <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded font-bold">
                      NOW
                    </span>
                  </div>
                </div>
              ))}

              {upcomingRevisions.slice(0, 1).map((item) => (
                <div
                  key={item.concept.id}
                  onClick={() => onStartQuizOnConcept(item.concept)}
                  className="border-l-2 border-yellow-500 pl-4 py-1 hover:bg-white/5 rounded-r-lg transition-colors cursor-pointer"
                >
                  <div className="text-xs text-slate-400 font-medium">{item.concept.title}</div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="font-semibold text-xs text-slate-200">
                      Retention: {item.retentionScore}%
                    </span>
                    <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded font-bold">
                      SOON
                    </span>
                  </div>
                </div>
              ))}

              <div className="border-l-2 border-slate-700 pl-4 py-1 opacity-60">
                <div className="text-xs text-slate-400 font-medium">Relational Algebra & Projections</div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="font-semibold text-xs text-slate-300">Retention: 94%</span>
                  <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-bold">
                    STRONG
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('revision')}
            className="w-full mt-5 bg-white/10 hover:bg-white/20 py-2.5 rounded-xl text-xs font-bold border border-white/10 transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
            <span>Review Daily Deck ({urgentRevisions.length} due)</span>
          </button>
        </div>
      </div>

      {/* Interactive SkillGraph Prerequisite Path Preview Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-800 font-display">Interactive SkillGraph Preview</h3>
          </div>
          <button
            onClick={() => onNavigate('skillgraph')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
          >
            <span>Open Full Graph</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex justify-center pt-8 pb-4">
          <div className="relative w-full max-w-2xl flex items-center justify-around">
            <div className="w-24 h-16 bg-emerald-50 border-2 border-emerald-500 rounded-lg flex flex-col items-center justify-center text-xs font-bold text-emerald-700 shadow-sm text-center p-1">
              <span>Databases</span>
              <span className="text-[9px] font-normal text-emerald-600">92% Mastered</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-200 shrink-0" />
            <div className="w-24 h-16 bg-emerald-50 border-2 border-emerald-500 rounded-lg flex flex-col items-center justify-center text-xs font-bold text-emerald-700 shadow-sm text-center p-1">
              <span>SQL Keys</span>
              <span className="text-[9px] font-normal text-emerald-600">84% Mastered</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-200 shrink-0" />
            <div className="w-24 h-16 bg-orange-50 border-2 border-orange-400 rounded-lg flex flex-col items-center justify-center text-xs font-bold text-orange-700 shadow-sm text-center p-1">
              <span>Functional Dep.</span>
              <span className="text-[9px] font-semibold text-orange-600">52% Weak</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-200 shrink-0" />
            <div className="w-24 h-16 bg-slate-50 border-2 border-slate-200 rounded-lg flex flex-col items-center justify-center text-xs font-bold text-slate-400 text-center p-1">
              <span>3NF Normalization</span>
              <span className="text-[9px] font-normal text-slate-400">48% Blocked</span>
            </div>

            <div className="absolute -top-4 left-0 w-full flex justify-center">
              <div className="px-3.5 py-1 bg-blue-50 text-blue-600 text-[10px] rounded-full border border-blue-100 font-bold uppercase tracking-widest shadow-2xs">
                Prerequisite Path: Successive Dependency Bottleneck
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Semester Subjects Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-slate-800 font-display">Active Semester Subjects</h2>
          </div>
          <button
            onClick={() => onNavigate('subjects')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Manage Subjects →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub) => {
            const subConcepts = concepts.filter((c) => c.subjectId === sub.id);
            const subMastered = subConcepts.filter((c) => c.status === 'mastered').length;
            const subWeak = subConcepts.filter((c) => c.status === 'weak').length;
            const subScore = Math.round(
              subConcepts.reduce((acc, c) => acc + c.masteryScore, 0) / (subConcepts.length || 1)
            );

            return (
              <div
                key={sub.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                      {sub.code} • Semester {sub.semester}
                    </span>
                    <h3 className="text-base font-bold text-slate-800">{sub.name}</h3>
                  </div>
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: sub.color }}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Subject Mastery</span>
                    <span className="font-bold text-slate-800">{subScore}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${subScore}%`,
                        backgroundColor: sub.color,
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <span>
                    🟢 <strong>{subMastered}</strong> Mastered
                  </span>
                  {subWeak > 0 && (
                    <span className="text-rose-600 font-bold">
                      🔴 {subWeak} Weak Gaps
                    </span>
                  )}
                  <button
                    onClick={() => onNavigate('skillgraph')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    Graph →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Mistake Log & Root Cause History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-slate-800 font-display">
              Recent Concept Detective Diagnoses
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            AI root-cause breakdown of recent quiz attempts
          </span>
        </div>

        <div className="space-y-3">
          {performanceLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-all space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">{log.conceptTitle}</span>
                  <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                    {log.subjectName}
                  </span>
                </div>
                {log.aiDiagnosis && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 capitalize">
                    {log.aiDiagnosis.misconceptionType.replace('_', ' ')}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-700 font-medium">
                <span className="text-slate-400">Q:</span> "{log.questionText}"
              </p>

              {log.aiDiagnosis && (
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-800 space-y-1">
                  <p className="font-semibold text-rose-700 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>AI Diagnosis: {log.aiDiagnosis.rootCause}</span>
                  </p>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {log.aiDiagnosis.misconceptionDetail}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
