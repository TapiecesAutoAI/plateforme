import type {
  ProbabilityResult,
  Question,
  ReasoningContext,
} from "../model";

import {
  ConfirmationDecisionEngine,
} from "./ConfirmationDecisionEngine";

import {
  ConfirmationGainEngine,
  type ConfirmationGain,
} from "./ConfirmationGainEngine";

import type {
  ConfirmationCandidate,
} from "./ConfirmationPlanner";

export interface ConfirmationEngineResult {
  candidate:
    ConfirmationCandidate | null;

  gain:
    ConfirmationGain | null;

  shouldConfirm:
    boolean;

  confidence:
    number;

  reason:
    string;
}

export class ConfirmationEngine {
  private readonly decisionEngine =
    new ConfirmationDecisionEngine();

  private readonly gainEngine =
    new ConfirmationGainEngine();

  public evaluate(
    context:
      ReasoningContext,

    questions:
      readonly Question[],

    probabilities:
      readonly ProbabilityResult[],
  ): ConfirmationEngineResult {
    const confidence =
      probabilities[0]
        ?.probability ??
      0;

    const availableQuestions =
      questions.filter(
        question =>
          !context
            .completedQuestionIds
            .has(
              question.id,
            ),
      );

    if (
      confidence >=
      0.95
    ) {
      return {
        candidate:
          null,

        gain:
          null,

        shouldConfirm:
          false,

        confidence,

        reason:
          "Le niveau de certitude est déjà suffisant.",
      };
    }

    if (
      availableQuestions.length ===
      0
    ) {
      return {
        candidate:
          null,

        gain:
          null,

        shouldConfirm:
          false,

        confidence,

        reason:
          "Aucune question de confirmation n'est disponible.",
      };
    }

    const candidate =
      this.decisionEngine.choose(
        availableQuestions,
        probabilities,
      );

    if (!candidate) {
      return {
        candidate:
          null,

        gain:
          null,

        shouldConfirm:
          false,

        confidence,

        reason:
          "Aucune question suffisamment utile n'a été trouvée.",
      };
    }

    const gain =
      this.gainEngine.evaluate(
        candidate.question,
        probabilities,
      );

    const shouldConfirm =
      gain.expectedGain >
        0.01 ||
      confidence <
        0.85;

    return {
      candidate,

      gain,

      shouldConfirm,

      confidence,

      reason:
        shouldConfirm
          ? "Une question supplémentaire peut améliorer le diagnostic."
          : "Le gain attendu d'une question supplémentaire est trop faible.",
    };
  }
}
