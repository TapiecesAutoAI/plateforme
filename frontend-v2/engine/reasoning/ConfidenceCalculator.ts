import type {
  HypothesisScore,
} from "./HypothesisScorer";

export type ConfidenceDecision =
  | "continue"
  | "confirm"
  | "conclude"
  | "manual-review";

export type ConfidenceResult = {
  decision:
    ConfidenceDecision;

  primary:
    HypothesisScore | null;

  secondary:
    HypothesisScore | null;

  confidence:
    number;

  lead:
    number;

  minimumQuestionsReached:
    boolean;

  reason:
    string;
};

export type ConfidenceCalculatorOptions = {
  completedActionCount:
    number;

  minimumQuestions?:
    number;

  conclusionThreshold?:
    number;

  confirmationThreshold?:
    number;

  minimumLead?:
    number;
};

export class ConfidenceCalculator {
  public calculate(
    hypotheses:
      HypothesisScore[],
    options:
      ConfidenceCalculatorOptions,
  ): ConfidenceResult {
    const activeHypotheses =
      hypotheses.filter(
        (hypothesis) =>
          hypothesis.probability >
          0,
      );

    const primary =
      activeHypotheses[0] ??
      null;

    const secondary =
      activeHypotheses[1] ??
      null;

    const confidence =
      primary?.probability ??
      0;

    const lead =
      primary
        ? Math.max(
            0,
            confidence -
              (
                secondary
                  ?.probability ??
                0
              ),
          )
        : 0;

    const minimumQuestions =
      options.minimumQuestions ??
      2;

    const conclusionThreshold =
      options.conclusionThreshold ??
      0.82;

    const confirmationThreshold =
      options.confirmationThreshold ??
      0.65;

    const minimumLead =
      options.minimumLead ??
      0.20;

    const minimumQuestionsReached =
      options.completedActionCount >=
      minimumQuestions;

    if (
      !primary
    ) {
      return {
        decision:
          "manual-review",

        primary:
          null,

        secondary:
          null,

        confidence:
          0,

        lead:
          0,

        minimumQuestionsReached,

        reason:
          "Aucune hypothèse ne possède actuellement un score exploitable.",
      };
    }

    if (
      minimumQuestionsReached &&
      confidence >=
        conclusionThreshold &&
      lead >=
        minimumLead
    ) {
      return {
        decision:
          "conclude",

        primary,

        secondary,

        confidence,

        lead,

        minimumQuestionsReached,

        reason:
          "L’hypothèse principale est suffisamment forte et nettement devant les alternatives.",
      };
    }

    if (
      confidence >=
        confirmationThreshold
    ) {
      return {
        decision:
          "confirm",

        primary,

        secondary,

        confidence,

        lead,

        minimumQuestionsReached,

        reason:
          "Une hypothèse domine, mais une question de confirmation reste nécessaire.",
      };
    }

    return {
      decision:
        "continue",

      primary,

      secondary,

      confidence,

      lead,

      minimumQuestionsReached,

      reason:
        "Les informations disponibles ne permettent pas encore de conclure.",
    };
  }
}
