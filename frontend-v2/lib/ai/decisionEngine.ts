import type {
  Hypothesis,
  Question,
} from "./types";

import {
  getEntityById,
} from "./knowledge/graph";

export type DecisionStatus =
  | "continue"
  | "complete"
  | "insufficient";

export type DecisionReason =
  | "critical-evidence"
  | "high-confidence"
  | "clear-lead"
  | "maximum-questions-reached"
  | "no-question-available"
  | "more-information-required"
  | "minimum-questions-not-reached"
  | "credible-competitor-remains"
  | "strong-contradiction"
  | "no-hypothesis";

export type DecisionEngineInput = {
  hypotheses: Hypothesis[];

  nextQuestion?: Question | null;

  askedQuestionIds?: string[];

  confirmedEntityIds?: string[];

  rejectedEntityIds?: string[];

  minimumConfidence?: number;

  minimumLead?: number;

  minimumPositiveEvidence?: number;

  minimumQuestionsBeforeConclusion?: number;

  maximumQuestions?: number;
};

export type DecisionEngineResult = {
  status: DecisionStatus;

  reason: DecisionReason;

  diagnosisComplete: boolean;

  shouldAskQuestion: boolean;

  primaryHypothesisId: string | null;

  secondaryHypothesisId: string | null;

  confidence: number;

  confidencePercentage: number;

  lead: number;

  positiveEvidenceCount: number;

  negativeEvidenceCount: number;

  missingEvidenceCount: number;

  askedQuestionCount: number;

  nextQuestion: Question | null;

  explanation: string;
};

const DEFAULT_MINIMUM_CONFIDENCE =
  0.82;

const DEFAULT_MINIMUM_LEAD =
  0.16;

const DEFAULT_MINIMUM_POSITIVE_EVIDENCE =
  2;

const DEFAULT_MINIMUM_QUESTIONS_BEFORE_CONCLUSION =
  3;

const DEFAULT_MAXIMUM_QUESTIONS =
  6;

const MINIMUM_CONFIDENCE_AT_MAXIMUM_QUESTIONS =
  0.62;

const MINIMUM_CONFIDENCE_WITH_CLEAR_LEAD =
  0.72;

const CREDIBLE_COMPETITOR_CONFIDENCE =
  0.58;

const STRONG_CONTRADICTION_COUNT =
  2;

const CRITICAL_EVIDENCE_MINIMUM_WEIGHT =
  0.85;

const CRITICAL_EVIDENCE_MINIMUM_CONFIDENCE =
  0.70;

const CRITICAL_EVIDENCE_MINIMUM_LEAD =
  0.08;

const CRITICAL_EVIDENCE_MINIMUM_QUESTIONS =
  2;

function clampProbability(
  value: number,
): number {
  if (
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      value,
      1,
    ),
  );
}

function getEvidenceCount(
  value: unknown,
): number {
  return Array.isArray(value)
    ? value.length
    : 0;
}

function sortHypotheses(
  hypotheses: Hypothesis[],
): Hypothesis[] {
  return [
    ...hypotheses,
  ]
    .filter(
      (hypothesis) =>
        !hypothesis.eliminated,
    )
    .sort(
      (
        first,
        second,
      ) =>
        clampProbability(
          second.probability,
        ) -
        clampProbability(
          first.probability,
        ),
    );
}

function hasCredibleCompetitor(
  primaryConfidence: number,
  secondaryConfidence: number,
  lead: number,
  minimumLead: number,
): boolean {
  if (
    secondaryConfidence <
    CREDIBLE_COMPETITOR_CONFIDENCE
  ) {
    return false;
  }

  return (
    lead <
      minimumLead ||
    secondaryConfidence >=
      primaryConfidence *
        0.85
  );
}

function hasCriticalEvidence(
  hypothesis: Hypothesis,
): boolean {
  return hypothesis.evidenceFor.some(
    (evidence) => {
      if (
        evidence.weight <
        CRITICAL_EVIDENCE_MINIMUM_WEIGHT
      ) {
        return false;
      }

      if (
        !evidence.entityId
      ) {
        return false;
      }

      const entity =
        getEntityById(
          evidence.entityId,
        );

      return (
        entity?.severity ===
        "critical"
      );
    },
  );
}

function getCriticalEvidenceLabel(
  hypothesis: Hypothesis,
): string | null {
  const evidence =
    hypothesis.evidenceFor.find(
      (currentEvidence) => {
        if (
          currentEvidence.weight <
          CRITICAL_EVIDENCE_MINIMUM_WEIGHT
        ) {
          return false;
        }

        if (
          !currentEvidence.entityId
        ) {
          return false;
        }

        const entity =
          getEntityById(
            currentEvidence.entityId,
          );

        return (
          entity?.severity ===
          "critical"
        );
      },
    );

  return (
    evidence?.label ??
    null
  );
}

function buildExplanation(
  params: {
    status: DecisionStatus;

    reason: DecisionReason;

    primaryHypothesis:
      Hypothesis | null;

    confidence: number;

    lead: number;

    positiveEvidenceCount: number;

    negativeEvidenceCount: number;

    missingEvidenceCount: number;

    askedQuestionCount: number;

    minimumQuestionsBeforeConclusion:
      number;
  },
): string {
  const {
    status,
    reason,
    primaryHypothesis,
    confidence,
    lead,
    positiveEvidenceCount,
    negativeEvidenceCount,
    missingEvidenceCount,
    askedQuestionCount,
    minimumQuestionsBeforeConclusion,
  } = params;

  if (
    !primaryHypothesis
  ) {
    return (
      "Aucune hypothèse suffisamment pertinente " +
      "n’a encore été identifiée."
    );
  }

  const confidencePercentage =
    Math.round(
      confidence *
        100,
    );

  const leadPercentage =
    Math.round(
      lead *
        100,
    );

  if (
    status ===
    "complete"
  ) {
    if (
      reason ===
      "critical-evidence"
    ) {
      const criticalEvidenceLabel =
        getCriticalEvidenceLabel(
          primaryHypothesis,
        );

      return (
        `L’hypothèse « ${primaryHypothesis.label} » est fortement confirmée ` +
        `par l’observation critique « ${criticalEvidenceLabel ?? "preuve critique détectée"} ». ` +
        `Le niveau de confiance atteint ${confidencePercentage} %.`
      );
    }

    if (
      reason ===
      "high-confidence"
    ) {
      return (
        `L’hypothèse « ${primaryHypothesis.label} » ` +
        `atteint ${confidencePercentage} % de confiance avec ` +
        `${positiveEvidenceCount} élément(s) favorable(s).`
      );
    }

    if (
      reason ===
      "clear-lead"
    ) {
      return (
        `L’hypothèse « ${primaryHypothesis.label} » ` +
        `est en tête avec ${confidencePercentage} % de confiance ` +
        `et ${leadPercentage} point(s) d’avance.`
      );
    }

    return (
      "Le nombre maximal de questions a été atteint. " +
      `L’hypothèse principale est « ${primaryHypothesis.label} » ` +
      `avec ${confidencePercentage} % de confiance.`
    );
  }

  if (
    reason ===
    "minimum-questions-not-reached"
  ) {
    return (
      `Seulement ${askedQuestionCount} question(s) ont été traitées. ` +
      `Au moins ${minimumQuestionsBeforeConclusion} sont nécessaires.`
    );
  }

  if (
    reason ===
    "credible-competitor-remains"
  ) {
    return (
      `L’hypothèse « ${primaryHypothesis.label} » reste en tête à ` +
      `${confidencePercentage} %, mais une hypothèse concurrente ` +
      "reste encore crédible."
    );
  }

  if (
    reason ===
    "strong-contradiction"
  ) {
    return (
      `L’hypothèse « ${primaryHypothesis.label} » présente encore ` +
      `${negativeEvidenceCount} contradiction(s) importante(s).`
    );
  }

  if (
    reason ===
    "no-question-available"
  ) {
    return (
      `L’hypothèse principale est « ${primaryHypothesis.label} » ` +
      `avec ${confidencePercentage} % de confiance, mais les ` +
      "informations restent insuffisantes pour conclure."
    );
  }

  return (
    `L’hypothèse principale est « ${primaryHypothesis.label} » ` +
    `avec ${confidencePercentage} % de confiance. ` +
    `${positiveEvidenceCount} élément(s) favorable(s), ` +
    `${negativeEvidenceCount} contradiction(s) et ` +
    `${missingEvidenceCount} information(s) manquante(s).`
  );
}

export function makeDiagnosticDecision(
  input: DecisionEngineInput,
): DecisionEngineResult {
  const {
    hypotheses,

    nextQuestion =
      null,

    askedQuestionIds =
      [],

    minimumConfidence =
      DEFAULT_MINIMUM_CONFIDENCE,

    minimumLead =
      DEFAULT_MINIMUM_LEAD,

    minimumPositiveEvidence =
      DEFAULT_MINIMUM_POSITIVE_EVIDENCE,

    minimumQuestionsBeforeConclusion =
      DEFAULT_MINIMUM_QUESTIONS_BEFORE_CONCLUSION,

    maximumQuestions =
      DEFAULT_MAXIMUM_QUESTIONS,
  } = input;

  const sortedHypotheses =
    sortHypotheses(
      hypotheses,
    );

  const primaryHypothesis =
    sortedHypotheses[0] ??
    null;

  const secondaryHypothesis =
    sortedHypotheses[1] ??
    null;

  const askedQuestionCount =
    askedQuestionIds.length;

  if (
    !primaryHypothesis
  ) {
    return {
      status:
        "insufficient",

      reason:
        "no-hypothesis",

      diagnosisComplete:
        false,

      shouldAskQuestion:
        nextQuestion !==
        null,

      primaryHypothesisId:
        null,

      secondaryHypothesisId:
        null,

      confidence:
        0,

      confidencePercentage:
        0,

      lead:
        0,

      positiveEvidenceCount:
        0,

      negativeEvidenceCount:
        0,

      missingEvidenceCount:
        0,

      askedQuestionCount,

      nextQuestion,

      explanation:
        "Aucune hypothèse suffisamment pertinente n’a encore été identifiée.",
    };
  }

  const confidence =
    clampProbability(
      primaryHypothesis.probability,
    );

  const secondaryConfidence =
    secondaryHypothesis
      ? clampProbability(
          secondaryHypothesis.probability,
        )
      : 0;

  const lead =
    Math.max(
      0,
      confidence -
        secondaryConfidence,
    );

  const positiveEvidenceCount =
    getEvidenceCount(
      primaryHypothesis.evidenceFor,
    );

  const negativeEvidenceCount =
    getEvidenceCount(
      primaryHypothesis.evidenceAgainst,
    );

  const missingEvidenceCount =
    getEvidenceCount(
      primaryHypothesis.missingEvidence,
    );

  const hasEnoughPositiveEvidence =
    positiveEvidenceCount >=
    minimumPositiveEvidence;

  const hasAnsweredEnoughQuestions =
    askedQuestionCount >=
    minimumQuestionsBeforeConclusion;

  const reachedMaximumQuestions =
    askedQuestionCount >=
    maximumQuestions;

  const hasAvailableQuestion =
    nextQuestion !==
    null;

  const credibleCompetitorRemains =
    hasCredibleCompetitor(
      confidence,
      secondaryConfidence,
      lead,
      minimumLead,
    );

  const hasStrongContradiction =
    negativeEvidenceCount >=
    STRONG_CONTRADICTION_COUNT;

  const criticalEvidenceDetected =
    hasCriticalEvidence(
      primaryHypothesis,
    );

  const canConcludeFromCriticalEvidence =
    criticalEvidenceDetected &&
    askedQuestionCount >=
      CRITICAL_EVIDENCE_MINIMUM_QUESTIONS &&
    confidence >=
      CRITICAL_EVIDENCE_MINIMUM_CONFIDENCE &&
    lead >=
      CRITICAL_EVIDENCE_MINIMUM_LEAD &&
    hasEnoughPositiveEvidence &&
    !hasStrongContradiction;

  let status:
    DecisionStatus =
      "continue";

  let reason:
    DecisionReason =
      "more-information-required";

  if (
    canConcludeFromCriticalEvidence
  ) {
    status =
      "complete";

    reason =
      "critical-evidence";
  } else if (
    !hasAnsweredEnoughQuestions &&
    hasAvailableQuestion
  ) {
    status =
      "continue";

    reason =
      "minimum-questions-not-reached";
  } else if (
    hasStrongContradiction &&
    hasAvailableQuestion &&
    !reachedMaximumQuestions
  ) {
    status =
      "continue";

    reason =
      "strong-contradiction";
  } else if (
    credibleCompetitorRemains &&
    hasAvailableQuestion &&
    !reachedMaximumQuestions
  ) {
    status =
      "continue";

    reason =
      "credible-competitor-remains";
  } else if (
    hasAvailableQuestion &&
    !reachedMaximumQuestions
  ) {
    status =
      "continue";

    reason =
      "more-information-required";
  } else if (
    reachedMaximumQuestions &&
    confidence >=
      MINIMUM_CONFIDENCE_AT_MAXIMUM_QUESTIONS &&
    hasEnoughPositiveEvidence &&
    !hasStrongContradiction
  ) {
    status =
      "complete";

    reason =
      "maximum-questions-reached";
  } else if (
    !hasAvailableQuestion &&
    hasAnsweredEnoughQuestions &&
    confidence >=
      minimumConfidence &&
    hasEnoughPositiveEvidence &&
    !credibleCompetitorRemains &&
    !hasStrongContradiction
  ) {
    status =
      "complete";

    reason =
      "high-confidence";
  } else if (
    !hasAvailableQuestion &&
    hasAnsweredEnoughQuestions &&
    confidence >=
      MINIMUM_CONFIDENCE_WITH_CLEAR_LEAD &&
    lead >=
      minimumLead &&
    hasEnoughPositiveEvidence &&
    !credibleCompetitorRemains &&
    !hasStrongContradiction
  ) {
    status =
      "complete";

    reason =
      "clear-lead";
  } else if (
    !hasAvailableQuestion
  ) {
    status =
      "insufficient";

    reason =
      "no-question-available";
  }

  const diagnosisComplete =
    status ===
    "complete";

  const shouldAskQuestion =
    status ===
      "continue" &&
    hasAvailableQuestion;

  return {
    status,

    reason,

    diagnosisComplete,

    shouldAskQuestion,

    primaryHypothesisId:
      primaryHypothesis.id,

    secondaryHypothesisId:
      secondaryHypothesis?.id ??
      null,

    confidence,

    confidencePercentage:
      Math.round(
        confidence *
          100,
      ),

    lead,

    positiveEvidenceCount,

    negativeEvidenceCount,

    missingEvidenceCount,

    askedQuestionCount,

    nextQuestion:
      shouldAskQuestion
        ? nextQuestion
        : null,

    explanation:
      buildExplanation({
        status,

        reason,

        primaryHypothesis,

        confidence,

        lead,

        positiveEvidenceCount,

        negativeEvidenceCount,

        missingEvidenceCount,

        askedQuestionCount,

        minimumQuestionsBeforeConclusion,
      }),
  };
}