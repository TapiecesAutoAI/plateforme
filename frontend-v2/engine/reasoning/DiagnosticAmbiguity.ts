import {
  getDiagnosticDiscriminatingCheck,
} from "./DiagnosticDiscriminatingCheck";
export interface DiagnosticAmbiguityCandidate {
  hypothesisId: string;
  label: string;
  probability: number;
  confidencePercentage: number;
}

export interface DiagnosticAmbiguity {
  active: true;

  reason:
    "two-close-hypotheses";

  candidates:
    DiagnosticAmbiguityCandidate[];

  lead: number;

  finalCheck: {
    questionId: string | null;
    text: string | null;
  };

  message: string;
}

interface ProbabilityLike {
  probability: number;

  hypothesis: {
    id: string;
    name: string;
  };
}

interface CompletionAdviceLike {
  nextBestQuestionId:
    string | null;

  nextBestQuestionText:
    string | null;
}

export function buildDiagnosticAmbiguity(
  status: string,
  probabilities:
    readonly ProbabilityLike[],
  completionAdvice:
    CompletionAdviceLike | null,
): DiagnosticAmbiguity | null {

  if (
    status !==
    "manual-review-required"
  ) {
    return null;
  }

  const first =
    probabilities[0] ??
    null;

  const second =
    probabilities[1] ??
    null;

  if (
    !first ||
    !second
  ) {
    return null;
  }

  const firstProbability =
    Math.max(
      0,
      Math.min(
        1,
        first.probability,
      ),
    );

  const secondProbability =
    Math.max(
      0,
      Math.min(
        1,
        second.probability,
      ),
    );

  const lead =
    Math.max(
      0,
      firstProbability -
      secondProbability,
    );

  const discriminatingCheck =
    getDiagnosticDiscriminatingCheck(
      first.hypothesis.id,
      second.hypothesis.id,
    );

  /*
   * Le second diagnostic doit représenter
   * au moins 20 % de probabilité.
   */
  if (
    secondProbability < 0.25
  ) {
    return null;
  }

  /*
   * Écart maximal accepté :
   * 30 points.
   *
   * Ex:
   * 63 / 37 -> ambigu
   * 70 / 20 -> non ambigu
   */
  if (
    lead > 0.30
  ) {
    return null;
  }

  return {
    active:
      true,

    reason:
      "two-close-hypotheses",

    candidates: [
      {
        hypothesisId:
          first.hypothesis.id,

        label:
          first.hypothesis.name,

        probability:
          firstProbability,

        confidencePercentage:
          Math.round(
            firstProbability *
            100,
          ),
      },

      {
        hypothesisId:
          second.hypothesis.id,

        label:
          second.hypothesis.name,

        probability:
          secondProbability,

        confidencePercentage:
          Math.round(
            secondProbability *
            100,
          ),
      },
    ],

    lead,

    finalCheck: {
      questionId:
        completionAdvice
          ?.nextBestQuestionId ??
        discriminatingCheck
          ?.actionId ??
        null,

      text:
        completionAdvice
          ?.nextBestQuestionText ??
        discriminatingCheck
          ?.text ??
        null,
    },

    message:
      "Deux causes restent techniquement plausibles. " +
      "Un contr\u00f4le final est recommand\u00e9 avant de remplacer une pi\u00e8ce.",
  };
}
