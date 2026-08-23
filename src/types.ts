export type Role = 'student' | 'teacher' | 'admin';

export type ConceptStatus = 'mastered' | 'developing' | 'weak' | 'not_learned';

export type MisconceptionType =
  | 'missing_prerequisite'
  | 'misconception'
  | 'careless_mistake'
  | 'question_misunderstanding'
  | 'procedural_error'
  | 'partial_understanding';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  university: string;
  major: string;
  semester: number;
  studyStreakDays: number;
  lastActive: string;
  totalStudyMinutes: number;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  description: string;
  semester: number;
  targetGrade: 'A+' | 'A' | 'A-' | 'B+' | 'B';
  targetScore: number;
  examDate: string; // ISO string
  hoursPerWeek: number;
  color: string;
  iconName: string;
  totalConcepts: number;
  masteredConcepts: number;
}

export interface ConceptNode {
  id: string;
  subjectId: string;
  title: string;
  category: string;
  difficultyLevel: 1 | 2 | 3 | 4 | 5; // 1: Beginner, 5: Advanced
  status: ConceptStatus;
  masteryScore: number; // 0 - 100
  retentionScore: number; // 0 - 100 (ForgetMeNot memory retention)
  stabilityDays: number; // Half-life stability in days
  lastStudied: string; // ISO string
  nextRevisionDate: string; // ISO string
  prerequisites: string[]; // IDs of prerequisite concepts
  relatedConcepts: string[]; // IDs of related concepts
  definition: string;
  summary: string;
  keyTakeaways: string[];
  commonPitfalls: string[];
  practiceCount: number;
  mistakeCount: number;
  tags: string[];
  estimatedStudyMinutes: number;
}

export interface PrerequisiteEdge {
  fromId: string; // Prerequisite concept ID
  toId: string; // Target concept ID
  type: 'strict' | 'recommended';
}

export interface AIDiagnosis {
  rootCause: string;
  misconceptionType: MisconceptionType;
  misconceptionDetail: string;
  missingPrerequisites: string[];
  recommendedActionPlan: string[];
  confidenceScore: number;
  isSimulated?: boolean;
}

export interface PerformanceLog {
  id: string;
  studentId?: string;
  timestamp: string;
  subjectId: string;
  subjectName: string;
  conceptId: string;
  conceptTitle: string;
  questionId: string;
  questionText: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  aiDiagnosis?: AIDiagnosis;
}

export interface QuizQuestion {
  id: string;
  conceptId: string;
  conceptTitle: string;
  subjectId: string;
  questionText: string;
  codeSnippet?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  bloomsLevel: 'recall' | 'understanding' | 'application' | 'analysis' | 'problem_solving';
  prerequisiteClue?: string;
}

export interface RevisionItem {
  concept: ConceptNode;
  subjectName: string;
  urgency: 'review_now' | 'review_soon' | 'strong';
  retentionScore: number;
  daysSinceReview?: number;
  daysSinceLastStudied?: number;
  stabilityDays?: number;
  nextRevisionDate?: string;
  dueReason?: string;
}

export interface LearningTask {
  id: string;
  title: string;
  type: 'concept_review' | 'prerequisite_repair' | 'practice_quiz' | 'socratic_tutor' | 'practice' | 'revision';
  conceptId: string;
  conceptTitle: string;
  subjectId?: string;
  estimatedMinutes: number;
  isCompleted: boolean;
  reason: string;
}

export interface StudyTask {
  id: string;
  title: string;
  type: 'concept_review' | 'prerequisite_repair' | 'practice_quiz' | 'socratic_tutor';
  conceptId: string;
  conceptTitle: string;
  durationMinutes: number;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface LearningPathDay {
  dayNumber: number;
  date: string;
  title: string;
  focusArea: string;
  tasks: StudyTask[];
  isCompleted: boolean;
}

export interface ExamGoal {
  id: string;
  subjectId: string;
  subjectName: string;
  examDate: string;
  targetScore: number;
  currentEstimatedMastery: number;
  availableHoursDaily: number;
  daysRemaining: number;
  priorityTopics: {
    conceptId: string;
    title: string;
    weight: 'critical' | 'high' | 'medium';
    reason: string;
  }[];
  roadmapPhases: {
    phase: string;
    focus: string;
    topics: string[];
  }[];
  aiAdvice: string;
}

export interface AIWeeklyReport {
  overallProgressDelta: string;
  strongestArea: string;
  weakestArea: string;
  mostCommonMistake: string;
  recommendedFocus: string;
  retentionWarning: string;
  weeklyActionPlan: string[];
  generatedAt: string;
}

export interface StudentAtRisk {
  studentId: string;
  name: string;
  email: string;
  avatar: string;
  riskLevel: 'high' | 'medium' | 'low';
  riskScore: number; // 0 - 100
  riskFactors: string[];
  fallingSinceDays: number;
  averageMastery: number;
  lastActive: string;
}

export interface TeacherClass {
  id: string;
  code: string;
  name: string;
  subjectId: string;
  studentCount: number;
  averageMastery: number;
  strugglingTopicCount: number;
  weakTopics: {
    conceptId: string;
    title: string;
    strugglingPct: number;
    commonMisconception: string;
  }[];
  studentsAtRisk: StudentAtRisk[];
}

export interface ChatMessage {
  id: string;
  sender?: 'user' | 'ai' | 'assistant';
  role?: 'user' | 'assistant';
  text?: string;
  content?: string;
  timestamp: string;
  socraticPrompt?: string;
  suggestedFollowUps?: string[];
  relatedConceptId?: string;
}
