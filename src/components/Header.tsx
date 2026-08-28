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
  ChevronDown,
  Menu
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
  onToggleMobileMenu?: () => void;
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
  onToggleMobileMenu,
}) => {
  const activeSubject = subjects.find((s) => s.id === activeSubjectId);

  return (
    <header
      id="learniq-header"
      className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 select-none z-20"
    >
      {/* Left: Hamburger (mobile) + Section Title & Tag */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {onToggleMobileMenu && (
          <button
            id="header-mobile-menu-btn"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center space-x-2 sm:space-x-3">
          <h1 className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 font-display truncate max-w-[150px] sm:max-w-none">
            Learning Intelligence
          </h1>
          <span className="hidden sm:inline-block px-2.5 py-0.5 bg-slate-100 text-slate-500 text-xs font-semibold rounded uppercase tracking-wider">
            Sem {user.semester}
          </span>
        </div>
      </div>

      {/* Center: Subject Filter dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative">
          <select
            id="header-subject-select"
            value={activeSubjectId}
            onChange={(e) => onSelectSubject(e.target.value)}
            className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold py-1.5 pl-2.5 sm:pl-3 pr-7 sm:pr-8 rounded-lg border border-slate-200 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 max-w-[130px] sm:max-w-[220px] truncate"
          >
            <option value="all">📚 All Subjects ({subjects.length})</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code}: {sub.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Quick Diagnostic Practice Button */}
        <button
          id="header-quick-diagnose-btn"
          onClick={onOpenQuickPractice}
          className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Diagnostic Quiz</span>
        </button>
      </div>

      {/* Right Section: Role Switcher & User Profile */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Role Toggle */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            id="role-student-btn"
            onClick={() => onToggleRole('student')}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md transition-all ${
              role === 'student'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Student</span>
          </button>
          <button
            id="role-teacher-btn"
            onClick={() => onToggleRole('teacher')}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md transition-all ${
              role === 'teacher'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Instructor</span>
          </button>
        </div>

        {/* User Info Avatar */}
        <div className="flex items-center space-x-2 sm:space-x-3 pl-2 sm:pl-3 border-l border-slate-200">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-slate-200"
          />
          <div className="hidden lg:block text-left">
            <span className="font-semibold text-xs text-slate-800 block leading-tight">{user.name}</span>
            <span className="text-[10px] text-slate-400 font-medium block">BS Computer Science</span>
          </div>
        </div>
      </div>
    </header>
  );
};
