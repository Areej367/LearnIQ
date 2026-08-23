import React from 'react';
import {
  Sparkles,
  Flame,
  Bell,
  Search,
  BookOpen,
  GraduationCap,
  Users,
  Brain,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { Subject, UserProfile, Role } from '../types';

interface HeaderProps {
  user: UserProfile;
  subjects: Subject[];
  activeSubjectId: string | 'all';
  onSelectSubject: (id: string | 'all') => void;
  role: Role;
  onToggleRole: (role: Role) => void;
  onOpenQuickPractice: () => void;
  onOpenAITutor: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  subjects,
  activeSubjectId,
  onSelectSubject,
  role,
  onToggleRole,
  onOpenQuickPractice,
  onOpenAITutor,
}) => {
  const activeSubject = subjects.find((s) => s.id === activeSubjectId);

  return (
    <header
      id="learniq-header"
      className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shrink-0 select-none z-20"
    >
      {/* Left: Section Title & Tag */}
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold text-slate-800 font-display">
          Learning Intelligence
        </h1>
        <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-xs font-semibold rounded uppercase tracking-wider">
          Semester {user.semester}
        </span>
      </div>

      {/* Center: Subject Filter dropdown */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <select
            id="header-subject-select"
            value={activeSubjectId}
            onChange={(e) => onSelectSubject(e.target.value)}
            className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg border border-slate-200 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">📚 All Active Subjects ({subjects.length})</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code}: {sub.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Quick Diagnostic Practice Button */}
        <button
          id="header-quick-diagnose-btn"
          onClick={onOpenQuickPractice}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Diagnostic Quiz</span>
        </button>
      </div>

      {/* Right Section: Role Switcher & User Profile */}
      <div className="flex items-center space-x-5">
        {/* Role Toggle */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            id="role-student-btn"
            onClick={() => onToggleRole('student')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
              role === 'student'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student</span>
          </button>
          <button
            id="role-teacher-btn"
            onClick={() => onToggleRole('teacher')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
              role === 'teacher'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Instructor</span>
          </button>
        </div>

        {/* User Info Avatar */}
        <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200"
          />
          <div className="hidden sm:block text-left">
            <span className="font-semibold text-sm text-slate-800 block leading-tight">{user.name}</span>
            <span className="text-[10px] text-slate-400 font-medium block">BS Computer Science</span>
          </div>
        </div>
      </div>
    </header>
  );
};
