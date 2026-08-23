import React, { useState, useMemo } from 'react';
import {
  Network,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  Bot,
  Zap,
  Info,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { ConceptNode, PrerequisiteEdge, Subject, ConceptStatus } from '../types';

interface SkillGraphViewProps {
  concepts: ConceptNode[];
  edges: PrerequisiteEdge[];
  subjects: Subject[];
  activeSubjectId: string | 'all';
  selectedConcept: ConceptNode | null;
  onSelectConcept: (concept: ConceptNode | null) => void;
  onStartQuizOnConcept: (concept: ConceptNode) => void;
  onOpenAITutorWithConcept: (concept: ConceptNode) => void;
}

export const SkillGraphView: React.FC<SkillGraphViewProps> = ({
  concepts,
  edges,
  subjects,
  activeSubjectId,
  selectedConcept,
  onSelectConcept,
  onStartQuizOnConcept,
  onOpenAITutorWithConcept,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | ConceptStatus>('all');
  const [zoomLevel, setZoomLevel] = useState(1);

  // Filter concepts based on subject, search, and status
  const filteredConcepts = useMemo(() => {
    return concepts.filter((c) => {
      const matchesSubject = activeSubjectId === 'all' || c.subjectId === activeSubjectId;
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.definition.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatusFilter === 'all' || c.status === selectedStatusFilter;
      return matchesSubject && matchesSearch && matchesStatus;
    });
  }, [concepts, activeSubjectId, searchQuery, selectedStatusFilter]);

  // Compute node status counts
  const masteredCount = concepts.filter((c) => c.status === 'mastered').length;
  const developingCount = concepts.filter((c) => c.status === 'developing').length;
  const weakCount = concepts.filter((c) => c.status === 'weak').length;
  const notLearnedCount = concepts.filter((c) => c.status === 'not_learned').length;

  const getStatusColor = (status: ConceptStatus) => {
    switch (status) {
      case 'mastered':
        return {
          bg: 'bg-emerald-50 hover:bg-emerald-100',
          border: 'border-emerald-300',
          badge: 'bg-emerald-100 text-emerald-800',
          dot: 'bg-emerald-500',
          label: 'Mastered',
        };
      case 'developing':
        return {
          bg: 'bg-amber-50 hover:bg-amber-100',
          border: 'border-amber-300',
          badge: 'bg-amber-100 text-amber-800',
          dot: 'bg-amber-500',
          label: 'Developing',
        };
      case 'weak':
        return {
          bg: 'bg-rose-50 hover:bg-rose-100',
          border: 'border-rose-300 ring-2 ring-rose-400/30',
          badge: 'bg-rose-100 text-rose-800',
          dot: 'bg-rose-500 animate-pulse',
          label: 'Weak Prerequisite Gap',
        };
      case 'not_learned':
      default:
        return {
          bg: 'bg-slate-50 hover:bg-slate-100',
          border: 'border-slate-300 border-dashed',
          badge: 'bg-slate-200 text-slate-700',
          dot: 'bg-slate-400',
          label: 'Not Learned',
        };
    }
  };

  // Group concepts by category for structured visual layers
  const categories = useMemo(() => {
    const map: Record<string, ConceptNode[]> = {};
    filteredConcepts.forEach((c) => {
      if (!map[c.category]) map[c.category] = [];
      map[c.category].push(c);
    });
    return Object.entries(map);
  }, [filteredConcepts]);

  return (
    <div id="skillgraph-view" className="space-y-6 pb-12">
      {/* Top Header & Graph Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 font-display">
                Interactive SkillGraph Knowledge Network
              </h1>
              <p className="text-xs text-slate-500">
                Visualizes conceptual dependencies, prerequisite mastery, and cognitive gap roots
              </p>
            </div>
          </div>
        </div>

        {/* Status Legend Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setSelectedStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              selectedStatusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({concepts.length})
          </button>
          <button
            onClick={() => setSelectedStatusFilter('mastered')}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              selectedStatusFilter === 'mastered'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Mastered ({masteredCount})</span>
          </button>
          <button
            onClick={() => setSelectedStatusFilter('developing')}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              selectedStatusFilter === 'developing'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Developing ({developingCount})</span>
          </button>
          <button
            onClick={() => setSelectedStatusFilter('weak')}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              selectedStatusFilter === 'weak'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Weak ({weakCount})</span>
          </button>
        </div>
      </div>

      {/* Search and Zoom Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search concepts, prerequisites, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
            className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-slate-500 px-1">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.3, z + 0.1))}
            className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Visual Graph Stage + Concept Detail Inspector Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Interactive Graph Canvas */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs overflow-hidden relative min-h-[600px]">
          {/* Subtle Grid Background */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#4f46e5 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />

          <div
            className="space-y-8 transition-transform duration-200 origin-top-left"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {categories.map(([categoryName, categoryConcepts]) => (
              <div key={categoryName} className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 font-display">
                    {categoryName}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">
                    ({categoryConcepts.length} concepts)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {categoryConcepts.map((concept) => {
                    const statusInfo = getStatusColor(concept.status);
                    const isSelected = selectedConcept?.id === concept.id;
                    const subject = subjects.find((s) => s.id === concept.subjectId);

                    return (
                      <div
                        key={concept.id}
                        id={`graph-node-${concept.id}`}
                        onClick={() => onSelectConcept(concept)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                          statusInfo.bg
                        } ${statusInfo.border} ${
                          isSelected
                            ? 'ring-2 ring-indigo-600 shadow-md scale-[1.02]'
                            : 'shadow-xs hover:shadow-md'
                        }`}
                      >
                        {/* Status dot & Subject code */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusInfo.dot}`} />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              {subject?.code || 'CS'}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${statusInfo.badge}`}
                          >
                            {concept.masteryScore}% Mastery
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {concept.title}
                        </h4>

                        <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                          {concept.definition}
                        </p>

                        {/* Prerequisites Badge Row */}
                        {concept.prerequisites.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-200/50 text-[10px] text-slate-500">
                            <span className="font-semibold text-slate-400">Prereqs:</span>
                            <span className="font-bold text-slate-700">
                              {concept.prerequisites
                                .map((pid) => {
                                  const req = concepts.find((x) => x.id === pid);
                                  return req ? req.title.split(' ')[0] : 'Base';
                                })
                                .join(', ')}
                            </span>
                          </div>
                        )}

                        {/* Hover hint */}
                        <div className="flex items-center justify-between mt-3 text-[11px] font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Inspect Node →</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {concept.practiceCount} attempts
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Concept Inspector Side Drawer */}
        <div className="space-y-4">
          {selectedConcept ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-md space-y-5 sticky top-20">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {selectedConcept.category}
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 font-display">
                    {selectedConcept.title}
                  </h3>
                </div>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                    getStatusColor(selectedConcept.status).badge
                  }`}
                >
                  {getStatusColor(selectedConcept.status).label}
                </span>
              </div>

              {/* Mastery & Retention Dual Meters */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Mastery Score</p>
                  <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                    {selectedConcept.masteryScore}%
                  </p>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full"
                      style={{ width: `${selectedConcept.masteryScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Memory Retention</p>
                  <p
                    className={`text-xl font-extrabold mt-0.5 ${
                      selectedConcept.retentionScore < 65 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {selectedConcept.retentionScore}%
                  </p>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        selectedConcept.retentionScore < 65 ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${selectedConcept.retentionScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Definition & Summary */}
              <div className="space-y-1.5 text-xs">
                <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Definition
                </p>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60 font-medium">
                  {selectedConcept.definition}
                </p>
              </div>

              {/* Prerequisites Checklist */}
              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center justify-between">
                  <span>Prerequisite Hierarchy</span>
                  <span className="text-slate-400 font-normal">
                    {selectedConcept.prerequisites.length} required
                  </span>
                </p>

                {selectedConcept.prerequisites.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">
                    Foundational concept. No prior prerequisites required.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedConcept.prerequisites.map((pid) => {
                      const req = concepts.find((x) => x.id === pid);
                      if (!req) return null;
                      const reqStatus = getStatusColor(req.status);

                      return (
                        <div
                          key={req.id}
                          onClick={() => onSelectConcept(req)}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/60 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${reqStatus.dot}`} />
                            <span className="font-bold text-slate-800 text-xs">{req.title}</span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${reqStatus.badge}`}
                          >
                            {req.masteryScore}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Common Pitfalls */}
              {selectedConcept.commonPitfalls.length > 0 && (
                <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1 text-xs">
                  <p className="font-bold text-rose-900 flex items-center gap-1.5 text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Common Cognitive Pitfall</span>
                  </p>
                  <p className="text-rose-800 text-[11px] leading-relaxed">
                    {selectedConcept.commonPitfalls[0]}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  id="inspect-start-quiz-btn"
                  onClick={() => onStartQuizOnConcept(selectedConcept)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/30"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Concept Detective Quiz</span>
                </button>

                <button
                  id="inspect-ask-tutor-btn"
                  onClick={() => onOpenAITutorWithConcept(selectedConcept)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Bot className="w-4 h-4 text-slate-600" />
                  <span>Ask Socratic AI Tutor</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Network className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Concept Selected</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Click any concept node on the SkillGraph to inspect prerequisites, definition, memory decay, and diagnosis recommendations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
