import {
  Question,
  ProbabilityResult,
  ReasoningContext,
} from "../model";

export interface ConfirmationCandidate {

  question: Question;

  expectedGain: number;

  expectedConfidence: number;

  remainingHypotheses: number;

}

export class ConfirmationPlanner {

  public selectBestQuestion(

    questions: readonly Question[],

    probabilities: readonly ProbabilityResult[],

    context: ReasoningContext,

  ): ConfirmationCandidate | null {

    let best: ConfirmationCandidate | null =
      null;

    for (const question of questions) {

      if (
        context.completedQuestionIds.has(
          question.id,
        )
      ) {
        continue;
      }

      const candidate: ConfirmationCandidate = {

        question,

        expectedGain:
          this.computeGain(
            question,
            probabilities,
          ),

        expectedConfidence:
          this.computeExpectedConfidence(
            probabilities,
          ),

        remainingHypotheses:
          probabilities.filter(
            probability =>
              probability.probability >
              0.05,
          ).length,

      };

      if (
        best === null ||
        candidate.expectedGain >
          best.expectedGain
      ) {
        best =
          candidate;
      }

    }

    return best;

  }

  private computeGain(

    question: Question,

    probabilities: readonly ProbabilityResult[],

  ): number {

    let gain = 0;

    gain +=
      question.targetEvidenceIds.length;

    gain +=
      question.targetHypothesisIds.length *
      2;

    for (const option of question.options) {

      if (option.evidenceId) {
        gain +=
          1;
      }

    }

    gain *=
      probabilities.length > 0
        ? 1 /
          probabilities.length
        : 1;

    return Number(
      gain.toFixed(2),
    );

  }

  private computeExpectedConfidence(

    probabilities: readonly ProbabilityResult[],

  ): number {

    const best =
      probabilities[0];

    if (!best) {
      return 0;
    }

    return Math.min(
      99,
      Math.round(
        best.probability *
          100 +
          8,
      ),
    );

  }

}
