import { DiagnosticStopPolicy } from "./DiagnosticStopPolicy";
import { buildStopSuggestion } from "./StopSuggestion";

import {
  Contradiction,
  ProbabilityResult,
  ReasoningContext,
} from "../model";

export interface DiagnosticDecision {
  stop: ReturnType<DiagnosticStopPolicy["evaluate"]>;
  suggestion: ReturnType<typeof buildStopSuggestion>;
}

export class DiagnosticDecisionEngine {

  private readonly stopPolicy =
    new DiagnosticStopPolicy();

  public evaluate(
    context: ReasoningContext,
    probabilities: ProbabilityResult[],
    contradictions: Contradiction[],
  ): DiagnosticDecision {

    const stop =
      this.stopPolicy.evaluate(
        context,
        probabilities,
        contradictions,
      );

    const suggestion =
      buildStopSuggestion(
        stop.recommended,
        stop.confidencePercentage,
      );

    return {
      stop,
      suggestion,
    };
  }
}
