import React from 'react';
import {
  LayoutDashboard,
  Network,
  Sparkles,
  RotateCcw,
  Bot,
  BookOpen,
  Route,
  Target,
  BarChart3,
  Users,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { Role } from '../types';

export type NavTab =
  | 'dashboard'
  | 'skillgraph'
  | 'practice'
  | 'revision'
  | 'aitutor'
  | 'subjects'
  | 'learningpath'
  | 'examprep'
  | 'analytics'
  | 'teacherdashboard';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  role: Role;
  overdueRevisionCount: number;
  weakConceptCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  role,
  overdueRevisionCount,
  weakConceptCount,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const studentNavItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'skillgraph' as NavTab,
      label: 'SkillGraph',
      icon: Network,
      badge: weakConceptCount > 0 ? `${weakConceptCount} Weak` : null,
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    {
      id: 'practice' as NavTab,
      label: 'Concept Detective',
      icon: Sparkles,
      badge: 'AI Diagnostic',
      badgeColor: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'revision' as NavTab,
      label: "Today's Revision",
      icon: RotateCcw,
      badge: overdueRevisionCount > 0 ? `${overdueRevisionCount} Due` : null,
      badgeColor: 'bg-amber-100 text-amber-800 animate-pulse',
    },
    {
      id: 'aitutor' as NavTab,
      label: 'Socratic AI Tutor',
      icon: Bot,
      badge: 'Context-Aware',
      badgeColor: 'bg-sky-100 text-sky-700',
    },
    {
      id: 'subjects' as NavTab,
      label: 'My Subjects',
      icon: BookOpen,
      badge: null,
    },
    {
      id: 'learningpath' as NavTab,
      label: 'Learning Path',
      icon: Route,
      badge: 'Adaptive',
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'examprep' as NavTab,
      label: 'Exam Prep Mode',
      icon: Target,
      badge: '11 Days',
      badgeColor: 'bg-purple-100 text-purple-700',
    },
    {
      id: 'analytics' as NavTab,
      label: 'Analytics & Reports',
      icon: BarChart3,
      badge: null,
    },
  ];

  const teacherNavItems = [
    {
      id: 'teacherdashboard' as NavTab,
      label: 'Class Analytics & Cohorts',
      icon: Users,
      badge: '42 Students',
      badgeColor: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'skillgraph' as NavTab,
      label: 'Curriculum SkillGraph',
      icon: Network,
      badge: null,
    },
    {
      id: 'practice' as NavTab,
      label: 'Quiz Diagnostics Suite',
      icon: Sparkles,
      badge: null,
    },
    {
      id: 'analytics' as NavTab,
      label: 'Misconception Insights',
      icon: BarChart3,
      badge: '3 At Risk',
      badgeColor: 'bg-rose-100 text-rose-700',
    },
  ];

  const items = role === 'student' ? studentNavItems : teacherNavItems;

  const handleItemClick = (tabId: NavTab) => {
    onSelectTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col flex-1 h-full justify-between">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Brand Header */}
        <div className="p-5 lg:p-6 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm">
              <div className="w-3.5 h-3.5 bg-white rounded-xs rotate-45" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight font-display">LearnIQ</span>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close Navigation"
            >
              ✕
            </button>
          )}
        </div>

        <div className="p-4 flex-1 space-y-6">
          <div>
            <div className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              {role === 'student' ? 'Student Intelligence' : 'Instructor Controls'}
            </div>
            <nav className="space-y-1">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isActive
                            ? 'bg-blue-700/80 text-white'
                            : item.badgeColor || 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tri-Engine Status Card */}
          <div className="bg-slate-800/40 rounded-xl p-3.5 border border-slate-700/50 text-white">
            <div className="flex items-center gap-1.5 mb-2.5 text-blue-400 text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LearnIQ Tri-Engine</span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Concept Detective</span>
                <span className="text-emerald-400 font-mono text-[10px] font-semibold">Active</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">SkillGraph</span>
                <span className="text-blue-400 font-mono text-[10px] font-semibold">Connected</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">ForgetMeNot</span>
                <span className="text-orange-400 font-mono text-[10px] font-semibold">Decay v2.4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Study Streak Widget */}
        <div className="p-4 mt-auto border-t border-slate-800/80">
          <div className="bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/50">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1.5 flex items-center justify-between">
              <span>Study Streak</span>
              <span className="text-xs">🔥</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-orange-400 font-display">12 Days</span>
              <span className="text-[10px] text-slate-400 font-medium">Top 5% Cohort</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        id="learniq-sidebar"
        className="hidden lg:flex w-64 shrink-0 bg-[#0F172A] border-r border-slate-800 h-screen flex-col justify-between select-none"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[80vw] bg-[#0F172A] border-r border-slate-800 h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
