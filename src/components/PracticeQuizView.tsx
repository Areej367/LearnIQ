import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Bot,
  Brain,
  HelpCircle,
  Lightbulb,
  Zap,
  BookOpen,
  Send,
  Loader2,
  ChevronRight,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  ConceptNode,
  QuizQuestion,
  Subject,
  AIDiagnosis,
  PerformanceLog,
  MisconceptionType
} from '../types';
import {
  fetchConceptDetectiveDiagnosis,
  fetchExplainMistake,
  fetchGeneratedQuiz
} from '../services/api';

interface PracticeQuizViewProps {
  concepts: ConceptNode[];
  subjects: Subject[];
  questions: QuizQuestion[];
  activeSubjectId: string | 'all';
  onRecordAttempt: (
    conceptId: string,
    isCorrect: boolean,
    questionText: string,
    studentAnswer: string,
    correctAnswer: string,
    diagnosis?: AIDiagnosis
  ) => void;
  onOpenAITutorWithConcept: (concept: ConceptNode) => void;
  selectedConceptForQuiz?: ConceptNode | null;
}

export const PracticeQuizView: React.FC<PracticeQuizViewProps> = ({
  concepts,
  subjects,
  questions,
  activeSubjectId,
  onRecordAttempt,
  onOpenAITutorWithConcept,
  selectedConceptForQuiz,
}) => {
  // Active state
  const [selectedConceptId, setSelectedConceptId] = useState<string>(
    selectedConceptForQuiz?.id || concepts[0]?.id || ''
  );
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [writtenReasoning, setWrittenReasoning] = useState<string>('');
  const [showReasoningInput, setShowReasoningInput] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [aiDiagnosis, setAiDiagnosis] = useState<AIDiagnosis | null>(null);
  const [mistakeExplanation, setMistakeExplanation] = useState<{
    whyWrong: string;
    whatYouMisunderstood: string;
    whatToLearnFirst: string;
    tryAgainQuestion?: {
      questionText: string;
      options: string[];
      correctAnswer: string;
      explanation: string;
    };
  } | null>(null);

  // Try Again question sub-state
  const [tryAgainSelectedOption, setTryAgainSelectedOption] = useState<string | null>(null);
  const [tryAgainSubmitted, setTryAgainSubmitted] = useState<boolean>(false);
  const [isGeneratingAiQuiz, setIsGeneratingAiQuiz] = useState<boolean>(false);
  const [customAiQuestions, setCustomAiQuestions] = useState<QuizQuestion[]>([]);

  const activeConcept = concepts.find((c) => c.id === selectedConceptId) || concepts[0];
  const activeSubject = subjects.find((s) => s.id === activeConcept?.subjectId);

  // Available questions for this concept or subject
  const availableQuestions = React.useMemo(() => {
    if (customAiQuestions.length > 0) return customAiQuestions;
    const forConcept = questions.filter((q) => q.conceptId === selectedConceptId);
    if (forConcept.length > 0) return forConcept;
    return questions.slice(0, 3);
  }, [questions, selectedConceptId, customAiQuestions]);

  const currentQ = availableQuestions[currentQuestionIndex] || questions[0];

  const handleSubmitAnswer = async () => {
    const studentAns = writtenReasoning.trim()
      ? `${selectedOption || 'Selected answer'}: "${writtenReasoning}"`
      : selectedOption;

    if (!studentAns) return;

    setIsSubmitting(true);
    const correct = selectedOption === currentQ.correctAnswer;
    setIsCorrect(correct);
    setHasSubmitted(true);

    if (correct) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
      onRecordAttempt(
        activeConcept.id,
        true,
        currentQ.questionText,
        studentAns,
        currentQ.correctAnswer
      );
      setIsSubmitting(false);
    } else {
      // Trigger AI Concept Detective Root Cause Analysis
      try {
        const [diagnosis, explanation] = await Promise.all([
          fetchConceptDetectiveDiagnosis({
            question: currentQ.questionText,
            correctAnswer: currentQ.correctAnswer,
            studentAnswer: studentAns,
            conceptTitle: activeConcept.title,
            subject: activeSubject?.name,
            prerequisites: activeConcept.prerequisites.map((pid) => {
              const p = concepts.find((x) => x.id === pid);
              return p ? p.title : pid;
            }),
          }),
          fetchExplainMistake({
            question: currentQ.questionText,
            correctAnswer: currentQ.correctAnswer,
            studentAnswer: studentAns,
            conceptTitle: activeConcept.title,
            subject: activeSubject?.name,
          }),
        ]);

        setAiDiagnosis(diagnosis);
        setMistakeExplanation(explanation);

        onRecordAttempt(
          activeConcept.id,
          false,
          currentQ.questionText,
          studentAns,
          currentQ.correctAnswer,
          diagnosis
        );
      } catch (err) {
        console.error('Diagnosis failure:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setWrittenReasoning('');
    setShowReasoningInput(false);
    setHasSubmitted(false);
    setIsCorrect(false);
    setAiDiagnosis(null);
    setMistakeExplanation(null);
    setTryAgainSelectedOption(null);
    setTryAgainSubmitted(false);

    if (currentQuestionIndex < availableQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setCurrentQuestionIndex(0);
    }
  };

  const handleGenerateAiQuiz = async () => {
    setIsGeneratingAiQuiz(true);
    try {
      const res = await fetchGeneratedQuiz({
        conceptTitle: activeConcept.title,
        subject: activeSubject?.name || 'Computer Science',
        difficulty,
        count: 3,
        focusWeakness: activeConcept.commonPitfalls[0] || '',
      });

      if (res.questions && res.questions.length > 0) {
        setCustomAiQuestions(res.questions);
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setHasSubmitted(false);
        setAiDiagnosis(null);
        setMistakeExplanation(null);
      }
    } catch (err) {
      console.error('Quiz gen error:', err);
    } finally {
      setIsGeneratingAiQuiz(false);
    }
  };

  return (
    <div id="practice-quiz-view" className="space-y-6 pb-12">
      {/* Top Header & Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-600/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <span>Concept Detective Diagnostic Suite</span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                Cognitive Root Cause AI
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Pinpoints why mistakes happen, diagnoses mental models, and repairs missing prerequisites
            </p>
          </div>
        </div>

        {/* Concept Selector & Difficulty */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedConceptId}
            onChange={(e) => {
              setSelectedConceptId(e.target.value);
              setCustomAiQuestions([]);
              setCurrentQuestionIndex(0);
              setHasSubmitted(false);
              setSelectedOption(null);
            }}
            className="bg-slate-100 hover:bg-slate-200/80 text-xs font-bold text-slate-800 py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {concepts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.status === 'weak' ? '🔴' : c.status === 'mastered' ? '🟢' : '🟡'} {c.title} ({c.masteryScore}%)
              </option>
            ))}
          </select>

          {/* Difficulty selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setDifficulty(lvl)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-all ${
                  difficulty === lvl
                    ? 'bg-white text-indigo-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerateAiQuiz}
            disabled={isGeneratingAiQuiz}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
          >
            {isGeneratingAiQuiz ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Brain className="w-3.5 h-3.5 text-indigo-400" />
                <span>Generate Adaptive AI Questions</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Question & Diagnostic Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Question Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 lg:p-8 shadow-xs space-y-6">
            {/* Question Meta header */}
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-400">
                  Question {currentQuestionIndex + 1} of {availableQuestions.length}
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                  {currentQ.bloomsLevel || 'Application'}
                </span>
              </div>
              <span className="text-slate-500 font-medium">{activeConcept.title}</span>
            </div>

            {/* Question Text */}
            <div className="space-y-4">
              <h2 className="text-base lg:text-lg font-bold text-slate-900 leading-relaxed">
                {currentQ.questionText}
              </h2>

              {currentQ.codeSnippet && (
                <div className="bg-slate-900 rounded-2xl p-4 font-mono text-xs text-sky-300 overflow-x-auto shadow-inner">
                  <pre>{currentQ.codeSnippet}</pre>
                </div>
              )}
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                let optionStyle = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800';

                if (hasSubmitted) {
                  if (opt === currentQ.correctAnswer) {
                    optionStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-400/30';
                  } else if (isSelected && !isCorrect) {
                    optionStyle = 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-400/30';
                  } else {
                    optionStyle = 'bg-slate-50/50 border-slate-200 text-slate-400 opacity-60';
                  }
                } else if (isSelected) {
                  optionStyle = 'bg-indigo-50 border-indigo-600 text-indigo-900 ring-2 ring-indigo-500/20 font-bold';
                }

                return (
                  <button
                    key={idx}
                    id={`quiz-opt-${idx}`}
                    disabled={hasSubmitted || isSubmitting}
                    onClick={() => setSelectedOption(opt)}
                    className={`w-full p-4 rounded-2xl border text-left text-xs lg:text-sm font-medium transition-all flex items-start gap-3.5 ${optionStyle}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-600'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 leading-relaxed">{opt}</span>

                    {hasSubmitted && opt === currentQ.correctAnswer && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {hasSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Optional "Explain Your Reasoning" field to enable deep AI NLP diagnosis */}
            {!hasSubmitted && (
              <div className="pt-2">
                {!showReasoningInput ? (
                  <button
                    onClick={() => setShowReasoningInput(true)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Explain your thought process (optional for deeper diagnosis)</span>
                  </button>
                ) : (
                  <div className="space-y-2 bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-100">
                    <label className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Your Reasoning (Concept Detective will analyze your mental model):</span>
                    </label>
                    <textarea
                      rows={2}
                      value={writtenReasoning}
                      onChange={(e) => setWrittenReasoning(e.target.value)}
                      placeholder="e.g. 'I chose this because I assumed binary search works by scanning first to last sequentially...'"
                      className="w-full p-2.5 bg-white rounded-xl border border-indigo-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              {currentQ.prerequisiteClue && !hasSubmitted && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="italic">{currentQ.prerequisiteClue}</span>
                </div>
              )}

              <div className="flex items-center gap-3 ml-auto">
                {!hasSubmitted ? (
                  <button
                    id="submit-quiz-answer-btn"
                    disabled={!selectedOption || isSubmitting}
                    onClick={handleSubmitAnswer}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Diagnosing with Concept Detective...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit & Diagnose</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    id="next-quiz-question-btn"
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* AI Concept Detective Root Cause Dissection Card */}
          {hasSubmitted && !isCorrect && (
            <div
              id="ai-concept-detective-result"
              className="bg-white rounded-3xl border-2 border-rose-200 p-6 lg:p-8 shadow-lg space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-rose-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 font-display">
                      AI Concept Detective: Root Cause Diagnosis
                    </h3>
                    <p className="text-xs text-rose-600 font-bold">
                      Identified Cognitive Gap & Remediation Path
                    </p>
                  </div>
                </div>

                {aiDiagnosis && (
                  <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-rose-100 text-rose-900 border border-rose-200 capitalize">
                    {aiDiagnosis.misconceptionType.replace('_', ' ')}
                  </span>
                )}
              </div>

              {/* 1. Comparison: What you answered vs Correct */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-1">
                  <p className="font-bold text-rose-900 uppercase tracking-wider text-[10px]">
                    What you answered
                  </p>
                  <p className="text-rose-800 font-semibold">{selectedOption}</p>
                </div>

                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-1">
                  <p className="font-bold text-emerald-900 uppercase tracking-wider text-[10px]">
                    Correct Answer
                  </p>
                  <p className="text-emerald-800 font-semibold">{currentQ.correctAnswer}</p>
                </div>
              </div>

              {/* 2. Deep Root Cause & Mental Model Breakdown */}
              {aiDiagnosis && (
                <div className="p-5 bg-gradient-to-br from-indigo-50/60 to-slate-50 rounded-2xl border border-indigo-100 space-y-3 text-xs">
                  <div>
                    <p className="font-extrabold text-indigo-900 text-xs flex items-center gap-1.5">
                      <Brain className="w-4 h-4 text-indigo-600" />
                      <span>Underlying Root Cause</span>
                    </p>
                    <p className="text-slate-800 font-semibold text-sm mt-1">
                      {aiDiagnosis.rootCause}
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-slate-500 text-[10px] uppercase">
                      Mental Model Misconception
                    </p>
                    <p className="text-slate-700 leading-relaxed mt-0.5">
                      {aiDiagnosis.misconceptionDetail}
                    </p>
                  </div>
                </div>
              )}

              {/* 3. Missing Prerequisites Checklist */}
              {aiDiagnosis && aiDiagnosis.missingPrerequisites.length > 0 && (
                <div className="space-y-2 text-xs">
                  <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                    Prerequisites to Review Before Proceeding
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {aiDiagnosis.missingPrerequisites.map((prereq, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold"
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>{prereq}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Action Plan */}
              {aiDiagnosis && (
                <div className="space-y-2 text-xs">
                  <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                    Recommended 5-Step Learning Fix
                  </p>
                  <div className="space-y-1.5">
                    {aiDiagnosis.recommendedActionPlan.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60"
                      >
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-slate-700 font-medium">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. "Try Again" Interactive Question on the Prerequisite */}
              {mistakeExplanation?.tryAgainQuestion && (
                <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <h4 className="text-sm font-bold text-slate-900 font-display">
                      Try Again: Immediate Prerequisite Check
                    </h4>
                  </div>

                  <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                    {mistakeExplanation.tryAgainQuestion.questionText}
                  </p>

                  <div className="space-y-2">
                    {mistakeExplanation.tryAgainQuestion.options.map((opt, i) => {
                      const isOptSelected = tryAgainSelectedOption === opt;
                      let tryStyle = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800';

                      if (tryAgainSubmitted) {
                        if (opt === mistakeExplanation.tryAgainQuestion?.correctAnswer) {
                          tryStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                        } else if (isOptSelected) {
                          tryStyle = 'bg-rose-50 border-rose-300 text-rose-900';
                        }
                      } else if (isOptSelected) {
                        tryStyle = 'bg-indigo-50 border-indigo-600 text-indigo-900 font-bold';
                      }

                      return (
                        <button
                          key={i}
                          disabled={tryAgainSubmitted}
                          onClick={() => setTryAgainSelectedOption(opt)}
                          className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${tryStyle}`}
                        >
                          <span>{opt}</span>
                          {tryAgainSubmitted && opt === mistakeExplanation.tryAgainQuestion?.correctAnswer && (
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {!tryAgainSubmitted ? (
                    <button
                      disabled={!tryAgainSelectedOption}
                      onClick={() => {
                        setTryAgainSubmitted(true);
                        if (
                          tryAgainSelectedOption ===
                          mistakeExplanation.tryAgainQuestion?.correctAnswer
                        ) {
                          confetti({ particleCount: 50, spread: 50 });
                        }
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 transition-all"
                    >
                      Verify Prerequisite Understanding
                    </button>
                  ) : (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-medium">
                      <strong>AI Review:</strong> {mistakeExplanation.tryAgainQuestion.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Correct Feedback Banner */}
          {hasSubmitted && isCorrect && (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Excellent! Conceptual understanding confirmed.</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                {currentQ.explanation}
              </p>
              <div className="pt-2 flex items-center gap-3">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                  Mastery: +10% | Stability: +3.2 days
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Concept Prerequisite Quick Info Card */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Active Concept Focus
              </span>
              <h3 className="text-base font-extrabold text-slate-900 font-display">
                {activeConcept.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{activeSubject?.name}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
              <p className="font-bold text-slate-700 text-[10px] uppercase">Core Rule</p>
              <p className="text-slate-600 leading-relaxed">{activeConcept.definition}</p>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-700 text-[10px] uppercase">Prerequisites</p>
              {activeConcept.prerequisites.length === 0 ? (
                <p className="text-slate-400 italic text-[11px]">No prerequisites required.</p>
              ) : (
                <div className="space-y-1">
                  {activeConcept.prerequisites.map((pid) => {
                    const req = concepts.find((x) => x.id === pid);
                    return (
                      <div
                        key={pid}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-[11px]"
                      >
                        <span className="font-semibold text-slate-700">{req?.title || pid}</span>
                        <span className="font-bold text-slate-500">{req?.masteryScore || 0}%</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={() => onOpenAITutorWithConcept(activeConcept)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Bot className="w-4 h-4 text-indigo-600" />
              <span>Discuss with Socratic AI Tutor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
