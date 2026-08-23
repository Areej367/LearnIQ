import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Calendar,
  Award,
  Target,
  Clock,
  Sparkles,
  ChevronRight,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Subject, ConceptNode } from '../types';

interface SubjectsViewProps {
  subjects: Subject[];
  concepts: ConceptNode[];
  onAddSubject: (subject: Partial<Subject>) => void;
  onSelectSubjectForDetail: (subjectId: string) => void;
  onOpenPracticeWithSubject: (subjectId: string) => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  subjects,
  concepts,
  onAddSubject,
  onSelectSubjectForDetail,
  onOpenPracticeWithSubject,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubGrade, setNewSubGrade] = useState('A');
  const [newSubExam, setNewSubExam] = useState('2026-06-15');

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubCode.trim()) return;

    onAddSubject({
      id: `sub-${Date.now()}`,
      code: newSubCode.toUpperCase(),
      name: newSubName,
      semester: 5,
      targetGrade: newSubGrade,
      examDate: newSubExam,
      color: '#6366f1',
    });

    setNewSubCode('');
    setNewSubName('');
    setShowAddModal(false);
  };

  return (
    <div id="subjects-view" className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span>Semester 5 Curriculum & Subjects</span>
          </h1>
          <p className="text-xs text-slate-500">
            Manage your enrolled university courses, target letter grades, and syllabus mastery mapping
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Enrolled Subject</span>
        </button>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((sub) => {
          const subConcepts = concepts.filter((c) => c.subjectId === sub.id);
          const masteredCount = subConcepts.filter((c) => c.status === 'mastered').length;
          const weakCount = subConcepts.filter((c) => c.status === 'weak').length;
          const developingCount = subConcepts.filter((c) => c.status === 'developing').length;

          const averageMastery = Math.round(
            subConcepts.reduce((acc, c) => acc + c.masteryScore, 0) / (subConcepts.length || 1)
          );

          return (
            <div
              key={sub.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      {sub.code} • Sem {sub.semester}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 font-display mt-0.5">
                      {sub.name}
                    </h3>
                  </div>
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: sub.color }}
                  />
                </div>

                {/* Target Grade & Exam Date Badges */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    <span>Target: {sub.targetGrade}</span>
                  </span>
                  {sub.examDate && (
                    <span className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Exam: {sub.examDate}</span>
                    </span>
                  )}
                </div>

                {/* Mastery Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">Curriculum Mastery</span>
                    <span className="text-slate-800 font-bold">{averageMastery}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${averageMastery}%`,
                        backgroundColor: sub.color,
                      }}
                    />
                  </div>
                </div>

                {/* Concept breakdown chips */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="font-extrabold text-emerald-800">{masteredCount}</p>
                    <p className="text-[10px] text-emerald-600 font-semibold">Mastered</p>
                  </div>
                  <div className="p-2 bg-amber-50 rounded-xl border border-amber-100">
                    <p className="font-extrabold text-amber-800">{developingCount}</p>
                    <p className="text-[10px] text-amber-600 font-semibold">Developing</p>
                  </div>
                  <div className="p-2 bg-rose-50 rounded-xl border border-rose-100">
                    <p className="font-extrabold text-rose-800">{weakCount}</p>
                    <p className="text-[10px] text-rose-600 font-semibold">Weak Gaps</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => onOpenPracticeWithSubject(sub.id)}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Practice Subject</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-display">
              Add New Enrolled Subject
            </h3>

            <form onSubmit={handleCreateSubject} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject Code</label>
                <input
                  type="text"
                  placeholder="e.g. CS-304"
                  value={newSubCode}
                  onChange={(e) => setNewSubCode(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject Title</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Networks & Security"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Grade</label>
                  <select
                    value={newSubGrade}
                    onChange={(e) => setNewSubGrade(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="A+">A+ (95%+)</option>
                    <option value="A">A (90%+)</option>
                    <option value="B+">B+ (80%+)</option>
                    <option value="B">B (75%+)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Exam Date</label>
                  <input
                    type="date"
                    value={newSubExam}
                    onChange={(e) => setNewSubExam(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
