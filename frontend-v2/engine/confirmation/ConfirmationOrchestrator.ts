import type {
  ProbabilityResult,
  Question,
  ReasoningContext,
} from "../model";

import {
  ConfirmationEngine,
  type ConfirmationEngineResult,
} from "./ConfirmationEngine";

export type OrchestratorDecision =
  | "continue"
  | "confirm"
  | "conclude";

export interface ConfirmationOrchestratorResult {

  decision:
    OrchestratorDecision;

  confirmation:
    ConfirmationEngineResult | null;

  selectedQuestion:
    Question | null;

  reason:
    string;

}

export class ConfirmationOrchestrator {

  private readonly confirmationEngine =
    new ConfirmationEngine();

  public evaluate(

    context:
      ReasoningContext,

    questions:
      readonly Question[],

    probabilities:
      readonly ProbabilityResult[],

  ): ConfirmationOrchestratorResult {

    const confirmation =
      this.confirmationEngine.evaluate(
        context,
        questions,
        probabilities,
      );

    if (
      confirmation.shouldConfirm &&
      confirmation.candidate
    ) {

      return {

        decision:
          "confirm",

        confirmation,

        selectedQuestion:
          confirmation
            .candidate
            .question,

        reason:
          confirmation.reason,

      };

    }

    if (
      confirmation.confidence >=
      0.95
    ) {

      return {

        decision:
          "conclude",

        confirmation,

        selectedQuestion:
          null,

        reason:
          "Le diagnostic est suffisamment fiable.",

      };

    }

    return {

      decision:
        "continue",

      confirmation,

      selectedQuestion:
        null,

      reason:
        confirmation.reason,

    };

  }

}
