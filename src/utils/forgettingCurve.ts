/**
 * ForgetMeNot Algorithm: Half-Life Memory Decay & Spaced Repetition Engine
 * 
 * Formula: R = e^(-t / S)
 * Where:
 *  - R is predicted retention probability (0.0 to 1.0)
 *  - t is elapsed time (days) since last study
 *  - S is memory stability factor (higher = slower decay)
 *
 * Stability updates:
 *  - On Successful Recall: S_new = S_old * (1.5 + 0.5 * (1 - R)) * difficultyModifier
 *  - On Failed Recall: S_new = max(1.0, S_old * 0.4)
 */

export interface DecayCalculation {
  currentRetentionPct: number; // 0 to 100
  urgency: 'review_now' | 'review_soon' | 'strong';
  daysElapsed: number;
  recommendedNextRevision: Date;
  decayExplanation: string;
}

export function calculateMemoryDecay(
  lastStudiedDateISO: string,
  stabilityDays: number = 3.5,
  difficultyLevel: number = 3,
  masteryScore: number = 70
): DecayCalculation {
  const now = new Date();
  const lastStudied = new Date(lastStudiedDateISO);
  const diffTime = Math.max(0, now.getTime() - lastStudied.getTime());
  const daysElapsed = Math.max(0.1, diffTime / (1000 * 60 * 60 * 24));

  // Adjust stability based on difficulty (1 = easy, 5 = hard)
  // Higher difficulty decreases stability factor
  const difficultyModifier = Math.max(0.6, 1.3 - (difficultyLevel - 1) * 0.15);
  const adjustedStability = Math.max(0.8, stabilityDays * difficultyModifier);

  // Retention equation: R = e^(-t / S)
  const retentionFraction = Math.exp(-daysElapsed / adjustedStability);
  // Blend with student baseline mastery score
  const blendedRetention = Math.round(
    Math.min(100, Math.max(10, retentionFraction * 100 * 0.7 + masteryScore * 0.3))
  );

  let urgency: 'review_now' | 'review_soon' | 'strong' = 'strong';
  let decayExplanation = 'Concept is strongly consolidated in memory.';

  if (blendedRetention < 65) {
    urgency = 'review_now';
    decayExplanation = `High risk of forgetting! Retention dropped to ${blendedRetention}%. Active recall required today.`;
  } else if (blendedRetention < 82) {
    urgency = 'review_soon';
    decayExplanation = `Retention is decaying (${blendedRetention}%). Schedule a rapid 5-minute refresher in the next 24-48 hours.`;
  }

  // Calculate recommended next revision timestamp
  // We target revision when retention is predicted to reach 75%
  // 0.75 = e^(-t / S) => t = -S * ln(0.75) ≈ 0.2877 * S
  const optimalIntervalDays = Math.max(1, Math.round(adjustedStability * 0.6));
  const recommendedNextRevision = new Date(lastStudied.getTime() + optimalIntervalDays * 24 * 60 * 60 * 1000);

  return {
    currentRetentionPct: blendedRetention,
    urgency,
    daysElapsed: parseFloat(daysElapsed.toFixed(1)),
    recommendedNextRevision,
    decayExplanation,
  };
}

export function updateStabilityAfterAttempt(
  currentStability: number,
  isCorrect: boolean,
  currentRetentionFraction: number,
  difficultyLevel: number
): { newStability: number; newMastery: number; nextRevisionDate: string } {
  let newStability: number;
  let masteryDelta: number;

  const difficultyMultiplier = Math.max(0.7, 1.2 - (difficultyLevel - 1) * 0.1);

  if (isCorrect) {
    // Memory consolidation bonus: spacing effect increases stability more if retrieved at lower retention
    const memoryEffortBonus = 1.0 + (1.0 - Math.min(1, Math.max(0, currentRetentionFraction)));
    newStability = Math.min(60, currentStability * (1.4 + 0.3 * memoryEffortBonus) * difficultyMultiplier);
    masteryDelta = Math.min(15, 8 + Math.round(difficultyLevel * 1.5));
  } else {
    // Mistake penalty: collapse stability to trigger quick re-testing tomorrow
    newStability = Math.max(1.2, currentStability * 0.45);
    masteryDelta = -6;
  }

  const nextDays = isCorrect ? Math.max(2, Math.round(newStability * 0.7)) : 1;
  const nextRevision = new Date(Date.now() + nextDays * 24 * 60 * 60 * 1000);

  return {
    newStability: parseFloat(newStability.toFixed(2)),
    newMastery: masteryDelta,
    nextRevisionDate: nextRevision.toISOString(),
  };
}

import { ConceptNode, Subject, RevisionItem } from '../types';

export function computeRevisionSchedule(
  concepts: ConceptNode[],
  subjects: Subject[]
): RevisionItem[] {
  return concepts
    .map((concept) => {
      const decay = calculateMemoryDecay(
        concept.lastStudied,
        concept.stabilityDays,
        concept.difficultyLevel,
        concept.masteryScore
      );

      const subject = subjects.find((s) => s.id === concept.subjectId);

      const item: RevisionItem = {
        concept: {
          ...concept,
          retentionScore: decay.currentRetentionPct,
        },
        subjectName: subject?.name || 'Computer Science',
        retentionScore: decay.currentRetentionPct,
        urgency: decay.urgency,
        daysSinceReview: Math.round(decay.daysElapsed),
        stabilityDays: concept.stabilityDays,
        nextRevisionDate: decay.recommendedNextRevision.toISOString(),
      };
      return item;
    })
    .sort((a, b) => a.retentionScore - b.retentionScore);
}

export function updateConceptAfterPractice(
  concept: ConceptNode,
  isCorrect: boolean
): ConceptNode {
  const currentRetention = concept.retentionScore / 100;
  const update = updateStabilityAfterAttempt(
    concept.stabilityDays,
    isCorrect,
    currentRetention,
    concept.difficultyLevel
  );

  const newMastery = Math.min(
    100,
    Math.max(10, concept.masteryScore + update.newMastery)
  );

  let newStatus = concept.status;
  if (newMastery >= 80) newStatus = 'mastered';
  else if (newMastery >= 55) newStatus = 'developing';
  else newStatus = 'weak';

  return {
    ...concept,
    masteryScore: newMastery,
    retentionScore: isCorrect ? 95 : 60,
    stabilityDays: update.newStability,
    lastStudied: new Date().toISOString(),
    nextRevisionDate: update.nextRevisionDate,
    status: newStatus,
    practiceCount: concept.practiceCount + 1,
    mistakeCount: isCorrect ? concept.mistakeCount : concept.mistakeCount + 1,
  };
}

