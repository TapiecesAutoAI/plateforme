import type {
  DiagnosticDomain,
} from "./types";

import type {
  KnowledgeEntity,
} from "./knowledge/types";

import {
  findEntitiesInText,
} from "./knowledge/matcher";

export type ChiefComplaintCategory =
  | "no-start"
  | "slow-cranking"
  | "battery-discharge"
  | "charging-system"
  | "starter"
  | "noise"
  | "braking"
  | "suspension"
  | "transmission"
  | "unknown";

export type ChiefComplaintPriority =
  | "critical"
  | "high"
  | "medium"
  | "low";

export type ChiefComplaint = {
  rawText: string;

  normalizedText: string;

  domain:
    DiagnosticDomain;

  category:
    ChiefComplaintCategory;

  priority:
    ChiefComplaintPriority;

  anchorEntityId:
    string | null;

  detectedEntityIds:
    string[];

  preferredHypothesisIds:
    string[];

  preferredQuestionIds:
    string[];

  excludedQuestionIds:
    string[];

  confidence:
    number;

  explanation:
    string;
};

type ComplaintRule = {
  id: string;

  category:
    ChiefComplaintCategory;

  domain:
    DiagnosticDomain;

  priority:
    ChiefComplaintPriority;

  patterns:
    RegExp[];

  entityIds?: string[];

  preferredHypothesisIds:
    string[];

  preferredQuestionIds:
    string[];

  excludedQuestionIds?: string[];

  confidence:
    number;

  explanation:
    string;
};

const COMPLAINT_RULES:
  ComplaintRule[] = [
    {
      id:
        "battery-discharge-parked",

      category:
        "battery-discharge",

      domain:
        "electrical",

      priority:
        "high",

      patterns: [
        /\bbatterie (?:se )?(?:vide|decharge) (?:pendant )?(?:la )?nuit\b/,

        /\bbatterie (?:vide|a plat) (?:le )?matin\b/,

        /\bbatterie se decharge a l arret\b/,

        /\bbatterie se vide a l arret\b/,

        /\bbatterie se vide toute seule\b/,

        /\bbatterie ne tient pas la charge\b/,

        /\bmeme apres une recharge\b/,

        /\bapres une nuit\b/,

        /\bapres plusieurs jours sans rouler\b/,
      ],

      entityIds: [
        "symptom-battery-repeatedly-flat",
        "observation-battery-does-not-hold-charge",
        "observation-problem-after-long-parking",
      ],

      preferredHypothesisIds: [
        "problem-battery-parasitic-drain",
        "problem-battery-internal-failure",
        "problem-alternator-diode",
        "problem-alternator-connection",
      ],

      preferredQuestionIds: [
        "question-repeated-battery-replacement",
        "question-battery-warning-light",
        "question-charging-voltage",
      ],

      excludedQuestionIds: [
        "question-no-start",
        "question-click-start",
        "question-hot-engine-start",
        "question-starter-intermittent",
      ],

      confidence:
        0.96,

      explanation:
        "Le problème principal concerne une batterie qui se décharge lorsque le véhicule est arrêté.",
    },

    {
      id:
        "charging-warning-light",

      category:
        "charging-system",

      domain:
        "electrical",

      priority:
        "high",

      patterns: [
        /\bvoyant batterie\b/,

        /\btemoin batterie\b/,

        /\bvoyant rouge de batterie\b/,

        /\bvoyant alternateur\b/,

        /\bdefaut de charge\b/,

        /\bbatterie se vide en roulant\b/,

        /\bperte electrique en roulant\b/,
      ],

      entityIds: [
        "symptom-battery-warning-light",
        "observation-battery-discharges-while-driving",
      ],

      preferredHypothesisIds: [
        "problem-alternator-no-charge",
        "problem-alternator-low-output",
        "problem-alternator-regulator",
        "problem-alternator-belt",
        "problem-alternator-connection",
        "problem-smart-charging-system",
      ],

      preferredQuestionIds: [
        "question-battery-discharges-driving",
        "question-charging-voltage",
        "question-accessory-belt",
        "question-alternator-noise",
      ],

      excludedQuestionIds: [
        "question-no-start",
        "question-click-start",
        "question-hot-engine-start",
      ],

      confidence:
        0.94,

      explanation:
        "Le problème principal concerne le circuit de charge pendant le fonctionnement du moteur.",
    },

    {
      id:
        "no-start",

      category:
        "no-start",

      domain:
        "starting",

      priority:
        "high",

      patterns: [
        /\bne demarre pas\b/,

        /\bplus moyen de demarrer\b/,

        /\brien ne se passe quand je demarre\b/,

        /\ble moteur ne part pas\b/,

        /\bimpossible de demarrer\b/,
      ],

      entityIds: [
        "symptom-no-start",
      ],

      preferredHypothesisIds: [
        "problem-weak-battery",
        "problem-battery-internal-failure",
        "problem-battery-connection",
        "problem-starter",
        "problem-starter-solenoid",
        "problem-starter-relay",
        "problem-starter-control-circuit",
        "problem-engine-mechanical-lock",
      ],

      preferredQuestionIds: [
        "question-no-start",
        "question-click-start",
        "question-jump-start",
        "question-dim-lights",
      ],

      confidence:
        0.92,

      explanation:
        "Le problème principal est une impossibilité de démarrer le véhicule.",
    },

    {
      id:
        "slow-cranking",

      category:
        "slow-cranking",

      domain:
        "starting",

      priority:
        "high",

      patterns: [
        /\bmoteur tourne lentement\b/,

        /\bdemarreur tourne lentement\b/,

        /\bca rame au demarrage\b/,

        /\belle peine a demarrer\b/,

        /\bdemarrage tres lent\b/,
      ],

      entityIds: [
        "symptom-slow-cranking",
      ],

      preferredHypothesisIds: [
        "problem-weak-battery",
        "problem-battery-internal-failure",
        "problem-battery-connection",
        "problem-starter",
      ],

      preferredQuestionIds: [
        "question-dim-lights",
        "question-jump-start",
        "question-starter-intermittent",
      ],

      excludedQuestionIds: [
        "question-click-start",
      ],

      confidence:
        0.94,

      explanation:
        "Le problème principal est une rotation trop lente du moteur pendant le démarrage.",
    },

    {
      id:
        "starter-click",

      category:
        "starter",

      domain:
        "starting",

      priority:
        "high",

      patterns: [
        /\bun seul clic\b/,

        /\bclic unique\b/,

        /\bun seul clac\b/,

        /\btac puis rien\b/,

        /\bdemarreur tourne dans le vide\b/,

        /\bplusieurs clics rapides\b/,
      ],

      entityIds: [
        "symptom-single-click-start",
        "symptom-rapid-clicking-start",
        "symptom-starter-spins-free",
      ],

      preferredHypothesisIds: [
        "problem-starter",
        "problem-starter-solenoid",
        "problem-starter-worn-brushes",
        "problem-starter-drive",
        "problem-weak-battery",
        "problem-battery-connection",
      ],

      preferredQuestionIds: [
        "question-click-start",
        "question-jump-start",
        "question-dim-lights",
        "question-starter-intermittent",
      ],

      confidence:
        0.93,

      explanation:
        "Le problème principal concerne le démarreur, son alimentation ou son mécanisme d’engagement.",
    },

    {
      id:
        "mechanical-noise",

      category:
        "noise",

      domain:
        "noise",

      priority:
        "medium",

      patterns: [
        /\bbruit metallique\b/,

        /\bgrondement\b/,

        /\bsifflement\b/,

        /\bgrincement\b/,

        /\bclaquement\b/,

        /\bcouinement\b/,
      ],

      preferredHypothesisIds:
        [],

      preferredQuestionIds: [
        "question-noise-source",
      ],

      confidence:
        0.72,

      explanation:
        "Le motif principal est un bruit anormal qui doit être localisé avant de privilégier une pièce.",
    },
  ];

function normalizeText(
  value: string,
): string {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .replace(
      /[^\p{L}\p{N}\s]/gu,
      " ",
    )
    .replace(
      /\s+/g,
      " ",
    )
    .trim();
}

function uniqueValues(
  values: string[],
): string[] {
  return [
    ...new Set(
      values.filter(
        (value) =>
          value.trim().length >
          0,
      ),
    ),
  ];
}

function clampConfidence(
  value: number,
): number {
  if (
    !Number.isFinite(
      value,
    )
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

function calculatePatternScore(
  normalizedText: string,
  rule: ComplaintRule,
): number {
  let matchCount =
    0;

  let longestMatch =
    0;

  for (
    const pattern
    of rule.patterns
  ) {
    const match =
      normalizedText.match(
        pattern,
      );

    if (
      !match
    ) {
      continue;
    }

    matchCount +=
      1;

    longestMatch =
      Math.max(
        longestMatch,
        match[0]?.length ??
          0,
      );
  }

  if (
    matchCount === 0
  ) {
    return 0;
  }

  const frequencyScore =
    Math.min(
      matchCount * 0.12,
      0.36,
    );

  const lengthScore =
    Math.min(
      longestMatch / 80,
      0.20,
    );

  return clampConfidence(
    rule.confidence +
      frequencyScore +
      lengthScore,
  );
}

function calculateEntityScore(
  detectedEntities:
    KnowledgeEntity[],
  rule: ComplaintRule,
): number {
  const expectedEntityIds =
    new Set(
      rule.entityIds ??
        [],
    );

  if (
    expectedEntityIds.size ===
    0
  ) {
    return 0;
  }

  const matchingCount =
    detectedEntities.filter(
      (entity) =>
        expectedEntityIds.has(
          entity.id,
        ),
    ).length;

  if (
    matchingCount === 0
  ) {
    return 0;
  }

  return clampConfidence(
    matchingCount /
      expectedEntityIds.size,
  );
}

function findBestRule(
  normalizedText: string,
  detectedEntities:
    KnowledgeEntity[],
): {
  rule: ComplaintRule;
  score: number;
} | null {
  let bestRule:
    ComplaintRule |
    null = null;

  let bestScore =
    0;

  for (
    const rule
    of COMPLAINT_RULES
  ) {
    const patternScore =
      calculatePatternScore(
        normalizedText,
        rule,
      );

    const entityScore =
      calculateEntityScore(
        detectedEntities,
        rule,
      );

    if (
      patternScore === 0 &&
      entityScore === 0
    ) {
      continue;
    }

    const finalScore =
      clampConfidence(
        patternScore * 0.75 +
          entityScore * 0.25,
      );

    if (
      finalScore <=
      bestScore
    ) {
      continue;
    }

    bestRule =
      rule;

    bestScore =
      finalScore;
  }

  if (
    !bestRule
  ) {
    return null;
  }

  return {
    rule:
      bestRule,

    score:
      bestScore,
  };
}

function selectAnchorEntity(
  detectedEntities:
    KnowledgeEntity[],
  rule:
    ComplaintRule |
    null,
): KnowledgeEntity | null {
  if (
    rule?.entityIds
  ) {
    for (
      const entityId
      of rule.entityIds
    ) {
      const entity =
        detectedEntities.find(
          (candidate) =>
            candidate.id ===
            entityId,
        );

      if (
        entity
      ) {
        return entity;
      }
    }
  }

  return (
    detectedEntities.find(
      (entity) =>
        entity.type ===
        "symptom",
    ) ??
    detectedEntities.find(
      (entity) =>
        entity.type ===
        "observation",
    ) ??
    detectedEntities[0] ??
    null
  );
}

export function detectChiefComplaint(
  rawText: string,
): ChiefComplaint {
  const normalizedText =
    normalizeText(
      rawText,
    );

  const detectedEntities =
    findEntitiesInText(
      rawText,
    );

  const bestMatch =
    findBestRule(
      normalizedText,
      detectedEntities,
    );

  const rule =
    bestMatch?.rule ??
    null;

  const anchorEntity =
    selectAnchorEntity(
      detectedEntities,
      rule,
    );

  if (
    !rule
  ) {
    return {
      rawText,

      normalizedText,

      domain:
        "general",

      category:
        "unknown",

      priority:
        "low",

      anchorEntityId:
        anchorEntity?.id ??
        null,

      detectedEntityIds:
        uniqueValues(
          detectedEntities.map(
            (entity) =>
              entity.id,
          ),
        ),

      preferredHypothesisIds:
        [],

      preferredQuestionIds:
        [],

      excludedQuestionIds:
        [],

      confidence:
        detectedEntities.length >
        0
          ? 0.40
          : 0,

      explanation:
        "Le motif principal n’est pas encore suffisamment précis pour imposer une stratégie particulière.",
    };
  }

  return {
    rawText,

    normalizedText,

    domain:
      rule.domain,

    category:
      rule.category,

    priority:
      rule.priority,

    anchorEntityId:
      anchorEntity?.id ??
      null,

    detectedEntityIds:
      uniqueValues(
        detectedEntities.map(
          (entity) =>
            entity.id,
        ),
      ),

    preferredHypothesisIds:
      uniqueValues(
        rule.preferredHypothesisIds,
      ),

    preferredQuestionIds:
      uniqueValues(
        rule.preferredQuestionIds,
      ),

    excludedQuestionIds:
      uniqueValues(
        rule.excludedQuestionIds ??
          [],
      ),

    confidence:
      clampConfidence(
        bestMatch?.score ??
          rule.confidence,
      ),

    explanation:
      rule.explanation,
  };
}

export function chiefComplaintPrefersHypothesis(
  complaint:
    ChiefComplaint |
    null |
    undefined,
  hypothesisId: string,
): boolean {
  return (
    complaint?.preferredHypothesisIds.includes(
      hypothesisId,
    ) ??
    false
  );
}

export function chiefComplaintPrefersQuestion(
  complaint:
    ChiefComplaint |
    null |
    undefined,
  questionId: string,
): boolean {
  return (
    complaint?.preferredQuestionIds.includes(
      questionId,
    ) ??
    false
  );
}

export function chiefComplaintExcludesQuestion(
  complaint:
    ChiefComplaint |
    null |
    undefined,
  questionId: string,
): boolean {
  return (
    complaint?.excludedQuestionIds.includes(
      questionId,
    ) ??
    false
  );
}
