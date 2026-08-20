import type {
  ConversationState,
  Symptom,
} from "./types";

import {
  getUserConversationText,
  normalizeText,
  type ChatMessage,
} from "./conversation";

import {
  getEntitiesByType,
} from "./knowledge/graph";

import type {
  KnowledgeEntity,
} from "./knowledge/types";

type SymptomDetectionRule = {
  entityId: string;
  category: string;
  expressions: string[];
  confidence: number;
};

type DetectedSymptom = {
  symptom: Symptom;
  matchLength: number;
};

const MIN_EXPRESSION_LENGTH = 3;

const symptomDetectionRules:
  SymptomDetectionRule[] = [
    {
      entityId:
        "symptom-no-start",

      category:
        "demarrage",

      expressions: [
        "ne demarre pas",
        "ne demarre plus",
        "refuse de demarrer",
        "impossible de demarrer",
        "moteur ne demarre pas",
        "voiture ne demarre pas",
        "vehicule ne demarre pas",
      ],

      confidence: 0.97,
    },

    {
      entityId:
        "symptom-click-start",

      category:
        "demarrage",

      expressions: [
        "clic au demarrage",
        "clac au demarrage",
        "plusieurs clics",
        "clics rapides",
        "un seul clic",
        "entends un clic",
        "entends des clics",
      ],

      confidence: 0.95,
    },

    {
      entityId:
        "symptom-noise",

      category:
        "bruit",

      expressions: [
        "bruit anormal",
        "bruit bizarre",
        "claquement",
        "grincement",
        "sifflement",
        "grondement",
      ],

      confidence: 0.86,
    },

    {
      entityId:
        "symptom-turning-noise",

      category:
        "direction-transmission",

      expressions: [
        "bruit en tournant",
        "bruit quand je tourne",
        "claquement en tournant",
        "bruit en braquant",
        "claquement en braquant",
        "bruit dans les virages",
      ],

      confidence: 0.95,
    },

    {
      entityId:
        "symptom-braking-vibration",

      category:
        "freinage",

      expressions: [
        "tremble au freinage",
        "vibre au freinage",
        "vibration au freinage",
        "volant tremble quand je freine",
        "pedale tremble quand je freine",
      ],

      confidence: 0.96,
    },

    {
      entityId:
        "symptom-warning-light",

      category:
        "electronique",

      expressions: [
        "voyant allume",
        "temoin allume",
        "voyant moteur",
        "voyant orange",
        "voyant rouge",
      ],

      confidence: 0.93,
    },

    {
      entityId:
        "symptom-loss-of-power",

      category:
        "moteur",

      expressions: [
        "perte de puissance",
        "manque de puissance",
        "n avance plus",
        "accelere mal",
        "mode degrade",
      ],

      confidence: 0.94,
    },

    {
      entityId:
        "symptom-smoke",

      category:
        "moteur",

      expressions: [
        "fumee inhabituelle",
        "fumee blanche",
        "fumee noire",
        "fumee bleue",
        "fait de la fumee",
      ],

      confidence: 0.93,
    },
  ];

function clampConfidence(
  value: number,
): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(value, 1),
  );
}

function getSymptomEntities():
  Map<string, KnowledgeEntity> {
  return new Map(
    getEntitiesByType(
      "symptom",
    ).map(
      (entity) => [
        entity.id,
        entity,
      ],
    ),
  );
}

function getEntityExpressions(
  entity: KnowledgeEntity,
): string[] {
  const expressions = [
    entity.name,
    ...(entity.aliases ?? []),
  ]
    .map(normalizeText)
    .filter(
      (expression) =>
        expression.length >=
        MIN_EXPRESSION_LENGTH,
    );

  return [
    ...new Set(expressions),
  ];
}

function findLongestMatch(
  normalizedText: string,
  expressions: string[],
): number {
  let longestMatch = 0;

  for (const expression of expressions) {
    const normalizedExpression =
      normalizeText(expression);

    if (
      normalizedExpression.length <
      MIN_EXPRESSION_LENGTH
    ) {
      continue;
    }

    if (
      normalizedText.includes(
        normalizedExpression,
      )
    ) {
      longestMatch = Math.max(
        longestMatch,
        normalizedExpression.length,
      );
    }
  }

  return longestMatch;
}

function calculateMatchConfidence(
  baseConfidence: number,
  matchLength: number,
): number {
  const specificityBonus =
    Math.min(
      matchLength / 200,
      0.05,
    );

  return clampConfidence(
    baseConfidence +
      specificityBonus,
  );
}

function detectRuleSymptoms(
  normalizedText: string,
  symptomEntities: Map<
    string,
    KnowledgeEntity
  >,
): DetectedSymptom[] {
  const detectedSymptoms:
    DetectedSymptom[] = [];

  for (
    const rule
    of symptomDetectionRules
  ) {
    const entity =
      symptomEntities.get(
        rule.entityId,
      );

    if (!entity) {
      continue;
    }

    const expressions = [
      ...rule.expressions,
      ...getEntityExpressions(
        entity,
      ),
    ];

    const matchLength =
      findLongestMatch(
        normalizedText,
        expressions,
      );

    if (matchLength === 0) {
      continue;
    }

    detectedSymptoms.push({
      symptom: {
        id: entity.id,
        label: entity.name,
        category:
          rule.category,
        confidence:
          calculateMatchConfidence(
            rule.confidence,
            matchLength,
          ),
      },

      matchLength,
    });
  }

  return detectedSymptoms;
}

function detectGraphSymptoms(
  normalizedText: string,
  symptomEntities: Map<
    string,
    KnowledgeEntity
  >,
  alreadyDetectedIds: Set<string>,
): DetectedSymptom[] {
  const detectedSymptoms:
    DetectedSymptom[] = [];

  for (
    const entity
    of symptomEntities.values()
  ) {
    if (
      alreadyDetectedIds.has(
        entity.id,
      )
    ) {
      continue;
    }

    const expressions =
      getEntityExpressions(
        entity,
      );

    const matchLength =
      findLongestMatch(
        normalizedText,
        expressions,
      );

    if (matchLength === 0) {
      continue;
    }

    detectedSymptoms.push({
      symptom: {
        id: entity.id,
        label: entity.name,
        category:
          "knowledge-graph",
        confidence:
          calculateMatchConfidence(
            0.82,
            matchLength,
          ),
      },

      matchLength,
    });
  }

  return detectedSymptoms;
}

function mergeDetectedSymptoms(
  detections: DetectedSymptom[],
): Symptom[] {
  const bestDetectionById =
    new Map<
      string,
      DetectedSymptom
    >();

  for (const detection of detections) {
    const existing =
      bestDetectionById.get(
        detection.symptom.id,
      );

    if (
      !existing ||
      detection.symptom.confidence >
        existing.symptom.confidence ||
      (
        detection.symptom.confidence ===
          existing.symptom.confidence &&
        detection.matchLength >
          existing.matchLength
      )
    ) {
      bestDetectionById.set(
        detection.symptom.id,
        detection,
      );
    }
  }

  return [
    ...bestDetectionById.values(),
  ].map(
    (detection) =>
      detection.symptom,
  );
}

function mergeSymptoms(
  currentSymptoms: Symptom[],
  detectedSymptoms: Symptom[],
): Symptom[] {
  const symptomsById =
    new Map<string, Symptom>();

  for (
    const symptom
    of currentSymptoms
  ) {
    symptomsById.set(
      symptom.id,
      {
        ...symptom,
        confidence:
          clampConfidence(
            symptom.confidence,
          ),
      },
    );
  }

  for (
    const symptom
    of detectedSymptoms
  ) {
    const existing =
      symptomsById.get(
        symptom.id,
      );

    if (
      !existing ||
      symptom.confidence >
        existing.confidence
    ) {
      symptomsById.set(
        symptom.id,
        symptom,
      );
    }
  }

  return [
    ...symptomsById.values(),
  ].sort(
    (first, second) =>
      second.confidence -
      first.confidence,
  );
}

export function analyzeConversation(
  state: ConversationState,
  messages: ChatMessage[],
): ConversationState {
  const conversationText =
    getUserConversationText(
      messages,
    );

  const normalizedText =
    normalizeText(
      conversationText,
    );

  if (!normalizedText) {
    return state;
  }

  const symptomEntities =
    getSymptomEntities();

  const ruleDetections =
    detectRuleSymptoms(
      normalizedText,
      symptomEntities,
    );

  const ruleDetectedIds =
    new Set(
      ruleDetections.map(
        (detection) =>
          detection.symptom.id,
      ),
    );

  const graphDetections =
    detectGraphSymptoms(
      normalizedText,
      symptomEntities,
      ruleDetectedIds,
    );

  const detectedSymptoms =
    mergeDetectedSymptoms([
      ...ruleDetections,
      ...graphDetections,
    ]);

  return {
    ...state,

    symptoms:
      mergeSymptoms(
        state.symptoms,
        detectedSymptoms,
      ),
  };
}
