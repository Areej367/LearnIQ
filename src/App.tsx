import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { SkillGraphView } from './components/SkillGraphView';
import { PracticeQuizView } from './components/PracticeQuizView';
import { RevisionView } from './components/RevisionView';
import { AITutorView } from './components/AITutorView';
import { SubjectsView } from './components/SubjectsView';
import { LearningPathView } from './components/LearningPathView';
import { ExamPrepView } from './components/ExamPrepView';
import { AnalyticsView } from './components/AnalyticsView';
import { TeacherDashboardView } from './components/TeacherDashboardView';
import {
  INITIAL_USER,
  INITIAL_SUBJECTS,
  INITIAL_CONCEPTS,
  INITIAL_EDGES,
  INITIAL_PERFORMANCE_LOGS,
  INITIAL_LEARNING_TASKS,
  INITIAL_EXAM_GOAL,
  SAMPLE_QUIZ_QUESTIONS,
} from './data/initialData';
import {
  ConceptNode,
  Subject,
  PerformanceLog,
  LearningTask,
  ExamGoal,
  UserProfile,
  Role,
  AIDiagnosis,
  RevisionItem,
} from './types';
import {
  computeRevisionSchedule,
  updateConceptAfterPractice,
} from './utils/forgettingCurve';

export const App: React.FC = () => {
  // Application State
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [role, setRole] = useState<Role>('student');
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [activeSubjectId, setActiveSubjectId] = useState<string | 'all'>('all');

  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [concepts, setConcepts] = useState<ConceptNode[]>(INITIAL_CONCEPTS);
  const [edges, setEdges] = useState(INITIAL_EDGES);
  const [performanceLogs, setPerformanceLogs] = useState<PerformanceLog[]>(
    INITIAL_PERFORMANCE_LOGS
  );
  const [learningTasks, setLearningTasks] = useState<LearningTask[]>(
    INITIAL_LEARNING_TASKS
  );
  const [examGoal, setExamGoal] = useState<ExamGoal>(INITIAL_EXAM_GOAL);

  // Concept focused across views
  const [selectedConcept, setSelectedConcept] = useState<ConceptNode | null>(
    INITIAL_CONCEPTS[2] // e.g. 3NF Normalization
  );
  const [conceptForQuiz, setConceptForQuiz] = useState<ConceptNode | null>(null);
  const [conceptForTutor, setConceptForTutor] = useState<ConceptNode | null>(null);

  // Compute live ForgetMeNot revision items
  const revisionItems: RevisionItem[] = useMemo(() => {
    return computeRevisionSchedule(concepts, subjects);
  }, [concepts, subjects]);

  const overdueCount = revisionItems.filter((r) => r.urgency === 'review_now').length;
  const weakCount = concepts.filter((c) => c.status === 'weak').length;

  // Handle Practice Quiz Attempt
  const handleRecordAttempt = (
    conceptId: string,
    isCorrect: boolean,
    questionText: string,
    studentAnswer: string,
    correctAnswer: string,
    diagnosis?: AIDiagnosis
  ) => {
    // 1. Update concept score & retention
    setConcepts((prevConcepts) =>
      prevConcepts.map((c) => {
        if (c.id !== conceptId) return c;
        return updateConceptAfterPractice(c, isCorrect);
      })
    );

    // 2. Add performance log
    const targetConcept = concepts.find((c) => c.id === conceptId);
    const targetSubject = subjects.find((s) => s.id === targetConcept?.subjectId);

    const newLog: PerformanceLog = {
      id: `log-${Date.now()}`,
      studentId: user.id,
      conceptId,
      conceptTitle: targetConcept?.title || conceptId,
      subjectId: targetConcept?.subjectId || '',
      subjectName: targetSubject?.name || 'Computer Science',
      questionId: `q-${Date.now()}`,
      questionText,
      studentAnswer,
      correctAnswer,
      isCorrect,
      timestamp: new Date().toISOString(),
      aiDiagnosis: diagnosis,
    };

    setPerformanceLogs((prev) => [newLog, ...prev]);

    // 3. Increment study activity
    setUser((prev) => ({
      ...prev,
      totalStudyMinutes: prev.totalStudyMinutes + 5,
    }));
  };

  // Handle ForgetMeNot Spaced Revision Flash Rating
  const handleCompleteRevision = (
    conceptId: string,
    rating: 'hard' | 'good' | 'easy'
  ) => {
    const isCorrect = rating !== 'hard';
    setConcepts((prev) =>
      prev.map((c) => {
        if (c.id !== conceptId) return c;
        const updated = updateConceptAfterPractice(c, isCorrect);
        // Multiply stability according to rating
        const factor = rating === 'easy' ? 4.0 : rating === 'good' ? 2.5 : 1.0;
        return {
          ...updated,
          stabilityDays: Math.min(60, Math.round(updated.stabilityDays * factor * 10) / 10),
          retentionScore: rating === 'hard' ? 70 : 95,
        };
      })
    );
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Navigation Helpers
  const handleStartQuizOnConcept = (concept: ConceptNode) => {
    setConceptForQuiz(concept);
    setSelectedConcept(concept);
    setActiveTab('practice');
    setIsMobileMenuOpen(false);
  };

  const handleOpenAITutorWithConcept = (concept: ConceptNode) => {
    setConceptForTutor(concept);
    setSelectedConcept(concept);
    setActiveTab('aitutor');
    setIsMobileMenuOpen(false);
  };

  const handleAddSubject = (newSub: Partial<Subject>) => {
    setSubjects((prev) => [...prev, newSub as Subject]);
  };

  const handleToggleTaskComplete = (taskId: string) => {
    setLearningTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t))
    );
  };

  return (
    <div id="learniq-root" className="flex h-screen w-screen bg-[#F1F5F9] text-[#334155] overflow-hidden font-sans">
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsMobileMenuOpen(false);
        }}
        role={role}
        overdueRevisionCount={overdueCount}
        weakConceptCount={weakCount}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Stage */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <Header
          user={user}
          subjects={subjects}
          activeSubjectId={activeSubjectId}
          onSelectSubject={setActiveSubjectId}
          role={role}
          onToggleRole={(newRole) => {
            setRole(newRole);
            if (newRole === 'teacher') setActiveTab('teacherdashboard');
            else setActiveTab('dashboard');
          }}
          onOpenQuickPractice={() => {
            const weakOne = concepts.find((c) => c.status === 'weak') || concepts[0];
            handleStartQuizOnConcept(weakOne);
          }}
          onOpenAITutor={() => setActiveTab('aitutor')}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        />

        {/* Scrollable View Canvas */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto bg-[#F1F5F9]">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                user={user}
                subjects={subjects}
                concepts={concepts}
                performanceLogs={performanceLogs}
                examGoal={examGoal}
                revisionItems={revisionItems}
                onNavigate={setActiveTab}
                onSelectConcept={(c) => {
                  setSelectedConcept(c);
                  setActiveTab('skillgraph');
                }}
                onStartQuizOnConcept={handleStartQuizOnConcept}
              />
            )}

            {activeTab === 'skillgraph' && (
              <SkillGraphView
                concepts={concepts}
                edges={edges}
                subjects={subjects}
                activeSubjectId={activeSubjectId}
                selectedConcept={selectedConcept}
                onSelectConcept={setSelectedConcept}
                onStartQuizOnConcept={handleStartQuizOnConcept}
                onOpenAITutorWithConcept={handleOpenAITutorWithConcept}
              />
            )}

            {activeTab === 'practice' && (
              <PracticeQuizView
                concepts={concepts}
                subjects={subjects}
                questions={SAMPLE_QUIZ_QUESTIONS}
                activeSubjectId={activeSubjectId}
                onRecordAttempt={handleRecordAttempt}
                onOpenAITutorWithConcept={handleOpenAITutorWithConcept}
                selectedConceptForQuiz={conceptForQuiz || selectedConcept}
              />
            )}

            {activeTab === 'revision' && (
              <RevisionView
                revisionItems={revisionItems}
                concepts={concepts}
                subjects={subjects}
                onCompleteRevision={handleCompleteRevision}
                onStartQuizOnConcept={handleStartQuizOnConcept}
              />
            )}

            {activeTab === 'aitutor' && (
              <AITutorView
                user={user}
                concepts={concepts}
                subjects={subjects}
                initialConcept={conceptForTutor || selectedConcept}
              />
            )}

            {activeTab === 'subjects' && (
              <SubjectsView
                subjects={subjects}
                concepts={concepts}
                onAddSubject={handleAddSubject}
                onSelectSubjectForDetail={(subId) => setActiveSubjectId(subId)}
                onOpenPracticeWithSubject={(subId) => {
                  setActiveSubjectId(subId);
                  const subConcept = concepts.find((c) => c.subjectId === subId);
                  if (subConcept) handleStartQuizOnConcept(subConcept);
                  else setActiveTab('practice');
                }}
              />
            )}

            {activeTab === 'learningpath' && (
              <LearningPathView
                tasks={learningTasks}
                concepts={concepts}
                onToggleTaskComplete={handleToggleTaskComplete}
                onStartQuizOnConcept={handleStartQuizOnConcept}
                onOpenRevision={() => setActiveTab('revision')}
              />
            )}

            {activeTab === 'examprep' && (
              <ExamPrepView
                examGoal={examGoal}
                concepts={concepts}
                subjects={subjects}
                onStartTimedMockExam={() => {
                  const subConcepts = concepts.filter((c) => c.subjectId === examGoal.subjectId);
                  if (subConcepts[0]) handleStartQuizOnConcept(subConcepts[0]);
                }}
                onStartQuizOnConcept={handleStartQuizOnConcept}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView
                user={user}
                concepts={concepts}
                subjects={subjects}
                performanceLogs={performanceLogs}
              />
            )}

            {activeTab === 'teacherdashboard' && (
              <TeacherDashboardView
                concepts={concepts}
                subjects={subjects}
                onOpenConceptDetectiveForCohort={(c) => {
                  setSelectedConcept(c);
                  setActiveTab('skillgraph');
                }}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
