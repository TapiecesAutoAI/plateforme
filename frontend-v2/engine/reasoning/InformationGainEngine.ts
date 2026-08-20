import {
  InformationGain,
  Question,
  ReasoningContext,
} from "../model";

interface RankedQuestion {

  question: Question;

  gain: number;

  expectedReduction: number;

}

export class InformationGainEngine {

  public evaluate(
    context: ReasoningContext,
  ): InformationGain[] {

    const ranked: RankedQuestion[] = [];

    for (const question of context.questions.values()) {

      if (
        context.completedQuestionIds.has(
          question.id,
        )
      ) {
        continue;
      }

      if (!this.isQuestionUseful(question, context)) {
        continue;
      }

      const hypothesisScore =
        this.computeHypothesisGain(
          question,
          context,
        );

      const evidenceScore =
        this.computeEvidenceGain(
          question,
          context,
        );

      const ambiguityBonus =
        this.computeAmbiguityBonus(
          question,
          context,
        );

      const costPenalty =
        this.computeCostPenalty(
          question,
        );

      const gain =
        Math.max(
          0,
          hypothesisScore +
          evidenceScore +
          ambiguityBonus -
          costPenalty,
        );

      ranked.push({

        question,

        gain,

        expectedReduction:
          hypothesisScore,

      });

    }

    ranked.sort((a, b) => {

      if (b.gain !== a.gain) {
        return b.gain - a.gain;
      }

      if (a.question.cost !== b.question.cost) {
        return a.question.cost - b.question.cost;
      }

      return a.question.text.localeCompare(
        b.question.text,
      );

    });

    return ranked;

  }

  private isQuestionUseful(
    question: Question,
    context: ReasoningContext,
  ): boolean {

    /*
     * Une question conditionnelle ne peut être évaluée
     * que si tous ses prérequis métier sont confirmés.
     *
     * Règle générique valable pour tous les domaines.
     */
    const requiredEvidenceIds =
      question.requiredEvidenceIds ?? [];

    if (
      requiredEvidenceIds.some(
        evidenceId =>
          !context.confirmedEvidenceIds.has(
            evidenceId,
          ),
      )
    ) {
      return false;
    }

    if (
      requiredEvidenceIds.some(
        evidenceId =>
          context.rejectedEvidenceIds.has(
            evidenceId,
          ),
      )
    ) {
      return false;
    }

    for (const evidenceId of question.targetEvidenceIds) {

      if (
        !context.confirmedEvidenceIds.has(evidenceId) &&
        !context.rejectedEvidenceIds.has(evidenceId)
      ) {
        return true;
      }

    }

    for (const hypothesisId of question.targetHypothesisIds) {

      if (
        context.activeHypothesisIds.has(hypothesisId)
      ) {
        return true;
      }

    }

    return false;

  }

  private computeHypothesisGain(
    question: Question,
    context: ReasoningContext,
  ): number {

    let score = 0;

    for (const hypothesisId of question.targetHypothesisIds) {

      if (
        context.eliminatedHypothesisIds.has(
          hypothesisId,
        )
      ) {
        continue;
      }

      if (
        context.activeHypothesisIds.has(
          hypothesisId,
        )
      ) {

        score += 4;

      } else {

        score += 1;

      }

    }

    return score;

  }

  private computeEvidenceGain(
    question: Question,
    context: ReasoningContext,
  ): number {

    let score = 0;

    for (const evidenceId of question.targetEvidenceIds) {

      if (
        context.confirmedEvidenceIds.has(
          evidenceId,
        ) ||
        context.rejectedEvidenceIds.has(
          evidenceId,
        )
      ) {
        continue;
      }

      const evidence =
        context.evidences.get(
          evidenceId,
        );

      if (!evidence) {
        continue;
      }

      switch (evidence.status) {

        case "unknown":
          score += 3;
          break;

        case "uncertain":
          score += 2;
          break;

        default:
          score += 1;

      }

      score += evidence.reliability;

    }

    return score;

  }

  private computeAmbiguityBonus(
    question: Question,
    context: ReasoningContext,
  ): number {

    let activeTargets = 0;

    for (const hypothesisId of question.targetHypothesisIds) {

      if (
        context.activeHypothesisIds.has(
          hypothesisId,
        )
      ) {
        activeTargets++;
      }

    }

    if (activeTargets >= 4) {
      return 5;
    }

    if (activeTargets === 3) {
      return 3;
    }

    if (activeTargets === 2) {
      return 2;
    }

    return 0;

  }

  private computeCostPenalty(
    question: Question,
  ): number {

    if (question.cost <= 1) {
      return 0;
    }

    if (question.cost <= 3) {
      return 1;
    }

    if (question.cost <= 5) {
      return 2;
    }

    return Math.min(
      6,
      Math.floor(question.cost),
    );

  }

}
