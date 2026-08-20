import type {
  Evidence,
  Hypothesis,
} from "./types";

import {
  getRelationsTo,
} from "./knowledge/graph";

import type {
  KnowledgeRelation,
} from "./knowledge/types";

export type ScoringEngineOptions = {
  originalProbabilityWeight?: number;

  evidenceScoreWeight?: number;

  strongEvidenceThreshold?: number;

  nearExclusiveEvidenceThreshold?: number;

  contradictionMultiplier?: number;

  minimumProbability?: number;

  maximumProbability?: number;
};

type EvidenceStrength =
  | "weak"
  | "moderate"
  | "strong"
  | "near-exclusive";

type ScoredHypothesis = {
  hypothesis: Hypothesis;

  originalProbability: number;

  positiveScore: number;

  contradictionScore: number;

  specificityBonus: number;

  finalProbability: number;
};

const DEFAULT_OPTIONS:
  Required<ScoringEngineOptions> = {
    originalProbabilityWeight:
      0.35,

    evidenceScoreWeight:
      0.65,

    strongEvidenceThreshold:
      0.82,

    nearExclusiveEvidenceThreshold:
      0.95,

    contradictionMultiplier:
      1.15,

    minimumProbability:
      0,

    maximumProbability:
      0.98,
  };

function clamp(
  value: number,
  minimum = 0,
  maximum = 1,
): number {
  if (
    !Number.isFinite(
      value,
    )
  ) {
    return minimum;
  }

  return Math.max(
    minimum,
    Math.min(
      value,
      maximum,
    ),
  );
}

function normalizeWeight(
  weight: number,
): number {
  return clamp(
    Math.abs(
      weight,
    ),
  );
}

function isPositiveDiagnosticRelation(
  relation: KnowledgeRelation,
): boolean {
  return (
    relation.type ===
      "produces" ||
    relation.type ===
      "supports"
  );
}

function isContradictionRelation(
  relation: KnowledgeRelation,
): boolean {
  return (
    relation.type ===
    "contradicts"
  );
}

function getEvidenceEntityId(
  evidence: Evidence,
): string | null {
  if (
    !evidence.entityId
  ) {
    return null;
  }

  const entityId =
    evidence.entityId.trim();

  return entityId.length > 0
    ? entityId
    : null;
}

function getEvidenceStrength(
  evidence: Evidence,
  options:
    Required<ScoringEngineOptions>,
): EvidenceStrength {
  const weight =
    normalizeWeight(
      evidence.weight,
    );

  if (
    weight >=
    options.nearExclusiveEvidenceThreshold
  ) {
    return "near-exclusive";
  }

  if (
    weight >=
    options.strongEvidenceThreshold
  ) {
    return "strong";
  }

  if (
    weight >=
    0.55
  ) {
    return "moderate";
  }

  return "weak";
}

/*
 * Plus une observation est reliée à peu de problèmes,
 * plus elle est discriminante.
 *
 * Exemple :
 * "Le démarreur tourne dans le vide" est presque uniquement
 * relié au lanceur de démarreur.
 */
function calculateEvidenceSpecificity(
  evidence: Evidence,
  hypothesisId: string,
): number {
  const entityId =
    getEvidenceEntityId(
      evidence,
    );

  if (
    !entityId
  ) {
    return 0.35;
  }

  const incomingRelations =
    getRelationsTo(
      entityId,
    ).filter(
      (relation) =>
        isPositiveDiagnosticRelation(
          relation,
        ),
    );

  if (
    incomingRelations.length ===
    0
  ) {
    return 0.35;
  }

  const relatedProblemIds =
    new Set(
      incomingRelations.map(
        (relation) =>
          relation.from,
      ),
    );

  if (
    !relatedProblemIds.has(
      hypothesisId,
    )
  ) {
    return 0;
  }

  const problemCount =
    relatedProblemIds.size;

  if (
    problemCount <= 1
  ) {
    return 1;
  }

  if (
    problemCount === 2
  ) {
    return 0.78;
  }

  if (
    problemCount === 3
  ) {
    return 0.58;
  }

  if (
    problemCount === 4
  ) {
    return 0.42;
  }

  return 0.28;
}

function calculateStrengthMultiplier(
  strength: EvidenceStrength,
): number {
  if (
    strength ===
    "near-exclusive"
  ) {
    return 1.35;
  }

  if (
    strength ===
    "strong"
  ) {
    return 1.15;
  }

  if (
    strength ===
    "moderate"
  ) {
    return 0.90;
  }

  return 0.62;
}

function calculatePositiveEvidenceValue(
  evidence: Evidence,
  hypothesisId: string,
  options:
    Required<ScoringEngineOptions>,
): {
  value: number;

  specificityBonus: number;
} {
  const weight =
    normalizeWeight(
      evidence.weight,
    );

  const specificity =
    calculateEvidenceSpecificity(
      evidence,
      hypothesisId,
    );

  const strength =
    getEvidenceStrength(
      evidence,
      options,
    );

  const strengthMultiplier =
    calculateStrengthMultiplier(
      strength,
    );

  const value =
    clamp(
      weight *
      (
        0.55 +
        specificity *
          0.45
      ) *
      strengthMultiplier,
    );

  const specificityBonus =
    clamp(
      weight *
      specificity *
      (
        strength ===
        "near-exclusive"
          ? 0.30
          : strength ===
              "strong"
            ? 0.18
            : 0.08
      ),
      0,
      0.30,
    );

  return {
    value,

    specificityBonus,
  };
}

function calculateContradictionValue(
  evidence: Evidence,
  hypothesisId: string,
  options:
    Required<ScoringEngineOptions>,
): number {
  const weight =
    normalizeWeight(
      evidence.weight,
    );

  const entityId =
    getEvidenceEntityId(
      evidence,
    );

  let relationSpecificity =
    0.65;

  if (
    entityId
  ) {
    const contradictionRelations =
      getRelationsTo(
        entityId,
      ).filter(
        (relation) =>
          isContradictionRelation(
            relation,
          ),
      );

    const matchingRelation =
      contradictionRelations.find(
        (relation) =>
          relation.from ===
          hypothesisId,
      );

    if (
      matchingRelation
    ) {
      relationSpecificity =
        normalizeWeight(
          matchingRelation.weight,
        );
    }
  }

  return clamp(
    weight *
    (
      0.55 +
      relationSpecificity *
        0.45
    ) *
    options.contradictionMultiplier,
    0,
    1,
  );
}

function combineIndependentValues(
  values: number[],
): number {
  if (
    values.length ===
    0
  ) {
    return 0;
  }

  const remainingUncertainty =
    values.reduce(
      (
        remaining,
        value,
      ) =>
        remaining *
        (
          1 -
          clamp(
            value,
          )
        ),
      1,
    );

  return clamp(
    1 -
    remainingUncertainty,
  );
}

function scoreHypothesis(
  hypothesis: Hypothesis,
  options:
    Required<ScoringEngineOptions>,
): ScoredHypothesis {
  const positiveValues:
    number[] = [];

  let specificityBonus =
    0;

  for (
    const evidence
    of hypothesis.evidenceFor
  ) {
    const scoredEvidence =
      calculatePositiveEvidenceValue(
        evidence,
        hypothesis.id,
        options,
      );

    positiveValues.push(
      scoredEvidence.value,
    );

    specificityBonus +=
      scoredEvidence.specificityBonus;
  }

  const contradictionValues =
    hypothesis.evidenceAgainst.map(
      (evidence) =>
        calculateContradictionValue(
          evidence,
          hypothesis.id,
          options,
        ),
    );

  const positiveScore =
    combineIndependentValues(
      positiveValues,
    );

  const contradictionScore =
    combineIndependentValues(
      contradictionValues,
    );

  const originalProbability =
    clamp(
      hypothesis.probability,
    );

  const evidenceDrivenScore =
    clamp(
      positiveScore +
      Math.min(
        specificityBonus,
        0.30,
      ),
    );

  const blendedScore =
    (
      originalProbability *
      options.originalProbabilityWeight
    ) +
    (
      evidenceDrivenScore *
      options.evidenceScoreWeight
    );

  /*
   * Les contradictions réduisent la probabilité de façon
   * multiplicative. Une contradiction forte ne peut donc
   * plus être compensée par plusieurs indices faibles.
   */
  const finalProbability =
    clamp(
      blendedScore *
      (
        1 -
        contradictionScore
      ),
      options.minimumProbability,
      options.maximumProbability,
    );

  return {
    hypothesis,

    originalProbability,

    positiveScore,

    contradictionScore,

    specificityBonus:
      Math.min(
        specificityBonus,
        0.30,
      ),

    finalProbability,
  };
}

function compareScoredHypotheses(
  first: ScoredHypothesis,
  second: ScoredHypothesis,
): number {
  if (
    second.finalProbability !==
    first.finalProbability
  ) {
    return (
      second.finalProbability -
      first.finalProbability
    );
  }

  if (
    second.specificityBonus !==
    first.specificityBonus
  ) {
    return (
      second.specificityBonus -
      first.specificityBonus
    );
  }

  if (
    second.positiveScore !==
    first.positiveScore
  ) {
    return (
      second.positiveScore -
      first.positiveScore
    );
  }

  return first.hypothesis.id.localeCompare(
    second.hypothesis.id,
  );
}

export function rescoreHypotheses(
  hypotheses: Hypothesis[],
  customOptions:
    ScoringEngineOptions = {},
): Hypothesis[] {
  const options:
    Required<ScoringEngineOptions> = {
      ...DEFAULT_OPTIONS,
      ...customOptions,
    };

  return hypotheses
    .map(
      (hypothesis) =>
        scoreHypothesis(
          hypothesis,
          options,
        ),
    )
    .sort(
      compareScoredHypotheses,
    )
    .map(
      (
        scoredHypothesis,
      ): Hypothesis => ({
        ...scoredHypothesis.hypothesis,

        probability:
          scoredHypothesis.finalProbability,

        eliminated:
          scoredHypothesis.finalProbability <=
            0.05 ||
          (
            scoredHypothesis.hypothesis
              .evidenceFor.length ===
              0 &&
            scoredHypothesis.hypothesis
              .evidenceAgainst.length >
              0
          ),

        evidenceFor: [
          ...scoredHypothesis.hypothesis
            .evidenceFor,
        ],

        evidenceAgainst: [
          ...scoredHypothesis.hypothesis
            .evidenceAgainst,
        ],

        missingEvidence: [
          ...scoredHypothesis.hypothesis
            .missingEvidence,
        ],
      }),
    );
}

export function getStrongestEvidence(
  hypothesis: Hypothesis,
): Evidence | null {
  if (
    hypothesis.evidenceFor.length ===
    0
  ) {
    return null;
  }

  return [
    ...hypothesis.evidenceFor,
  ].sort(
    (
      first,
      second,
    ) =>
      normalizeWeight(
        second.weight,
      ) -
      normalizeWeight(
        first.weight,
      ),
  )[0] ?? null;
}

export function hasNearExclusiveEvidence(
  hypothesis: Hypothesis,
  threshold = 0.95,
): boolean {
  return hypothesis.evidenceFor.some(
    (evidence) =>
      normalizeWeight(
        evidence.weight,
      ) >=
      clamp(
        threshold,
      ) &&
      calculateEvidenceSpecificity(
        evidence,
        hypothesis.id,
      ) >=
      0.78,
  );
}
