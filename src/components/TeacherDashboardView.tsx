import React from 'react';
import {
  Users,
  AlertTriangle,
  Sparkles,
  TrendingDown,
  Brain,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  Send,
  Download,
  AlertCircle
} from 'lucide-react';
import { ConceptNode, Subject } from '../types';

interface TeacherDashboardViewProps {
  concepts: ConceptNode[];
  subjects: Subject[];
  onOpenConceptDetectiveForCohort: (concept: ConceptNode) => void;
}

export const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({
  concepts,
  subjects,
  onOpenConceptDetectiveForCohort,
}) => {
  const cohortMetrics = {
    totalStudents: 42,
    averageMastery: 71,
    atRiskStudents: 3,
    activeQuizzesToday: 128,
  };

  const strugglingTopics = [
    {
      conceptId: 'c-db-3nf',
      title: '3NF Normalization & Transitive Dependencies',
      subject: 'Database Systems (CS-301)',
      struggleRate: 64,
      rootCause:
        '64% of students confuse 2NF partial dependencies with 3NF transitive dependencies due to weak functional dependency closures.',
      recommendedIntervention: 'Assign 10-minute Attribute Closure Socratic Drill',
    },
    {
      conceptId: 'c-dsa-recursion',
      title: 'Recursion Call Stack & Halting Base Cases',
      subject: 'Data Structures & Algorithms (CS-201)',
      struggleRate: 58,
      rootCause:
        '58% of students miss return unwinding order and mental models of stack frames.',
      recommendedIntervention: 'Conduct visual call stack trace demonstration in lecture',
    },
    {
      conceptId: 'c-db-joins',
      title: 'SQL Multi-table Joins & Outer NULL Preservation',
      subject: 'Database Systems (CS-301)',
      struggleRate: 46,
      rootCause:
        'Students place outer table filtering predicates in WHERE instead of ON clause.',
      recommendedIntervention: 'Broadcast diagnostic practice challenge to cohort',
    },
  ];

  const atRiskStudents = [
    {
      name: 'Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      mastery: '48%',
      criticalGap: 'Functional Dependencies & Relational Model',
      status: 'High Intervention Needed',
    },
    {
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      mastery: '54%',
      criticalGap: 'Recursion & Time Complexity',
      status: 'Prerequisite Repair Pending',
    },
    {
      name: 'Devon Thorne',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      mastery: '56%',
      criticalGap: 'SQL Normalization Rules',
      status: 'Decaying Retention',
    },
  ];

  return (
    <div id="teacher-dashboard-view" className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 lg:p-8 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold">
            <Users className="w-3.5 h-3.5" />
            <span>Instructor Diagnostic Intelligence</span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold font-display tracking-tight">
            Cohort Performance & Cognitive Bottlenecks
          </h1>
          <p className="text-slate-300 text-xs lg:text-sm leading-relaxed">
            Real-time aggregation of student quiz attempts, prerequisite breakdown clusters, and early-warning intervention indicators.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/20 backdrop-blur-sm shrink-0">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-300">Enrolled Students</p>
            <p className="text-2xl font-extrabold text-white mt-0.5">{cohortMetrics.totalStudents}</p>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-300">Class Average</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-0.5">{cohortMetrics.averageMastery}%</p>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-300">At Risk</p>
            <p className="text-2xl font-extrabold text-rose-400 mt-0.5">{cohortMetrics.atRiskStudents}</p>
          </div>
        </div>
      </div>

      {/* Class Struggling Topics with Root Causes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-600" />
            <span>Class-Wide Cognitive Bottlenecks</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Aggregated Concept Detective diagnoses across all student attempts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {strugglingTopics.map((topic, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {topic.subject}
                  </span>
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                    {topic.struggleRate}% Struggling
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{topic.title}</h3>

                <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-100 text-xs text-rose-900 space-y-1">
                  <p className="font-bold text-[10px] uppercase">AI Root Cause Breakdown</p>
                  <p className="leading-relaxed font-medium">{topic.rootCause}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <p className="text-[11px] text-indigo-700 font-semibold">
                  💡 {topic.recommendedIntervention}
                </p>
                <button
                  onClick={() => {
                    const c = concepts.find((x) => x.id === topic.conceptId);
                    if (c) onOpenConceptDetectiveForCohort(c);
                  }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Inspect Diagnostic Matrix</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Early Warning System: At-Risk Students */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h2 className="text-base font-bold text-slate-900 font-display">
              Early Warning System: Students Requiring Prerequisite Intervention
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Automated risk detection</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {atRiskStudents.map((st, i) => (
            <div
              key={i}
              className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-start gap-3 space-y-1"
            >
              <img
                src={st.avatar}
                alt={st.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-300 shrink-0"
              />
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-slate-900">{st.name}</p>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                    {st.mastery}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  <strong className="text-slate-700">Gap:</strong> {st.criticalGap}
                </p>
                <span className="inline-block text-[10px] font-semibold text-rose-700">
                  ⚠️ {st.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
