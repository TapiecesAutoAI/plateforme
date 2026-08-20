import {
  DiagnosticAutopilot,
} from "../autopilot/DiagnosticAutopilot";

import {
  CustomerExplanationEngine,
} from "../explain/CustomerExplanationEngine";

export class DiagnosticBrainV1 {

  private readonly autopilot =
    new DiagnosticAutopilot();

  private readonly explanation =
    new CustomerExplanationEngine();

  public think(
    input: any,
  ) {

    const autopilot =
      this.autopilot.execute(
        input,
      );

    if (
      !autopilot.pipeline
    ) {

      return {

        finished:
          autopilot.finished,

        nextQuestion:
          autopilot.nextQuestion ?? null,

        trust:
          autopilot.trust ?? null,

        guard:
          autopilot.guard ?? null,

      };

    }

    const prediction = {

      best: {

        hypothesisId:
          "unknown",

        probability:
          autopilot.pipeline.confidence,

        confidence:
          autopilot.pipeline.confidence,

        recommendation:
          (
            autopilot.guard.allowSell
              ? "sell"
              : autopilot.pipeline.decision.shouldTest
              ? "verify"
              : "continue"
          ) as "sell" | "verify" | "continue",

      },

      alternatives: [],

    };

    const explanation =
      this.explanation.build({

        prediction,

        decision:
          autopilot.pipeline.decision,

        similarCaseCount:
          input.similarCases,

        confirmedRepairs:
          input.validatedRepairs,

      });

    return {

      finished:
        autopilot.finished,

      nextQuestion:
        autopilot.nextQuestion,

      confidence:
        autopilot.pipeline.confidence,

      trust:
        autopilot.trust,

      guard:
        autopilot.guard,

      prediction,

      explanation,

      decision:
        autopilot.pipeline.decision,

    };

  }

}



