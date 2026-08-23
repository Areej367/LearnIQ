import React from 'react';
import {
  Route,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Zap,
  Target,
  Brain,
  AlertCircle,
  Play,
  RotateCcw
} from 'lucide-react';
import { LearningTask, ConceptNode } from '../types';

interface LearningPathViewProps {
  tasks: LearningTask[];
  concepts: ConceptNode[];
  onToggleTaskComplete: (taskId: string) => void;
  onStartQuizOnConcept: (concept: ConceptNode) => void;
  onOpenRevision: () => void;
}

export const LearningPathView: React.FC<LearningPathViewProps> = ({
  tasks,
  concepts,
  onToggleTaskComplete,
  onStartQuizOnConcept,
  onOpenRevision,
}) => {
  const completedTasks = tasks.filter((t) => t.isCompleted);
  const pendingTasks = tasks.filter((t) => !t.isCompleted);
  const totalMinutes = pendingTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0);

  return (
    <div id="learning-path-view" className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 lg:p-8 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-bold">
            <Route className="w-3.5 h-3.5" />
            <span>AI Dynamic Study Roadmap</span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold font-display tracking-tight">
            Personalized Daily Learning Path
          </h1>
          <p className="text-slate-300 text-xs lg:text-sm leading-relaxed">
            Continuously recalculated based on quiz mistake diagnoses, prerequisite dependency trees, and ForgetMeNot memory half-life decay.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/20 backdrop-blur-sm">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-300">Remaining Daily Effort</p>
            <p className="text-xl font-extrabold text-white mt-0.5">{totalMinutes} mins</p>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-300">Tasks Completed</p>
            <p className="text-xl font-extrabold text-emerald-400 mt-0.5">
              {completedTasks.length} / {tasks.length}
            </p>
          </div>
        </div>
      </div>

      {/* Tasks Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-600" />
            <span>Prioritized Learning Sequence</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            AI ordered by cognitive prerequisite leverage
          </span>
        </div>

        <div className="space-y-3">
          {tasks.map((task, idx) => {
            const concept = concepts.find((c) => c.id === task.conceptId);

            return (
              <div
                key={task.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  task.isCompleted
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : task.type === 'prerequisite_repair'
                    ? 'bg-rose-50/60 border-rose-200 shadow-xs'
                    : task.type === 'revision'
                    ? 'bg-amber-50/60 border-amber-200 shadow-xs'
                    : 'bg-white border-slate-200/80 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => onToggleTaskComplete(task.id)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      task.isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'border-2 border-slate-300 hover:border-indigo-600 bg-white'
                    }`}
                  >
                    {task.isCompleted && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">{task.title}</span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          task.type === 'prerequisite_repair'
                            ? 'bg-rose-100 text-rose-800'
                            : task.type === 'revision'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {task.type.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {task.reason}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-semibold pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{task.estimatedMinutes} mins</span>
                      </span>
                      <span>•</span>
                      <span>Concept: {task.conceptTitle}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {task.type === 'revision' ? (
                    <button
                      onClick={onOpenRevision}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Start Revision</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (concept) onStartQuizOnConcept(concept);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Practice Task</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
