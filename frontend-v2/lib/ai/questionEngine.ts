import type {
  Hypothesis,
  Question,
} from "./types";

import {
  getEntityById,
  getRelationsFrom,
} from "./knowledge/graph";

import {
  knowledgeQuestions,
  type KnowledgeQuestionTemplate,
} from "./knowledge/questions";

import type {
  KnowledgeEntity,
  KnowledgeRelation,
} from "./knowledge/types";

import type {
  ChiefComplaint,
} from "./chiefComplaint";

import {
  chiefComplaintExcludesQuestion,
  chiefComplaintPrefersHypothesis,
  chiefComplaintPrefersQuestion,
} from "./chiefComplaint";

import type {
  UserSkillProfile,
  UserProfileType,
  UserSkillLevel,
} from "./userProfile";

type DiagnosticDomain =
  | "starting"
  | "electrical"
  | "noise"
  | "engine"
  | "cooling"
  | "braking"
  | "transmission"
  | "steering"
  | "suspension"
  | "general";

type QuestionCandidate = {
  template: KnowledgeQuestionTemplate;

  hypothesisIds: Set<string>;
  hypothesisLabels: Set<string>;

  hypothesisScore: number;
  directRelationScore: number;
  discriminationScore: number;
  domainScore: number;
  priorityScore: number;
  continuityScore: number;
  complaintScore: number;

  finalScore: number;
};

const COMPETITIVE_HYPOTHESIS_MARGIN =
  0.18;

const MAX_COMPETITIVE_HYPOTHESES =
  5;

const STARTUP_OPENING_QUESTION_ID =
  "question-no-start";

const STARTUP_ENTRY_ENTITY_IDS =
  new Set([
    "symptom-no-start",
    "symptom-no-crank",
    "symptom-engine-cranks",
    "symptom-slow-cranking",
    "symptom-engine-turns-slowly",
  ]);

const STARTUP_ENTITY_IDS =
  new Set([
    ...STARTUP_ENTRY_ENTITY_IDS,

    "symptom-click-start",
    "symptom-single-click-start",
    "symptom-rapid-clicking-start",
    "symptom-fast-clicking",
    "symptom-starter-spins-free",
    "symptom-metallic-grinding-start",
  ]);

const CATEGORY_DOMAIN_MAP:
  Record<string, DiagnosticDomain> = {
    demarrage:
      "starting",

    starting:
      "starting",

    electricite:
      "electrical",

    electrical:
      "electrical",

    bruit:
      "noise",

    noise:
      "noise",

    moteur:
      "engine",

    engine:
      "engine",

    refroidissement:
      "cooling",

    cooling:
      "cooling",

    freinage:
      "braking",

    brakes:
      "braking",

    braking:
      "braking",

    transmission:
      "transmission",

    direction:
      "steering",

    steering:
      "steering",

    suspension:
      "suspension",

    general:
      "general",
  };

function clamp(
  value: number,
  minimum = 0,
  maximum = 1,
): number {
  if (
    !Number.isFinite(value)
  ) {
    return minimum;
  }

  return Math.min(
    Math.max(
      value,
      minimum,
    ),
    maximum,
  );
}

function normalizeProbability(
  probability: number,
): number {
  return clamp(
    probability,
  );
}

function normalizeRelationWeight(
  weight: number,
): number {
  return clamp(
    Math.abs(
      weight,
    ),
  );
}

function normalizeDomainName(
  value:
    string |
    null |
    undefined,
): DiagnosticDomain | null {
  if (
    !value
  ) {
    return null;
  }

  const normalized =
    value
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        "",
      )
      .toLowerCase()
      .trim();

  return (
    CATEGORY_DOMAIN_MAP[
      normalized
    ] ?? null
  );
}

function isDiagnosticRelation(
  relation: KnowledgeRelation,
): boolean {
  return (
    relation.type ===
      "produces" ||
    relation.type ===
      "supports" ||
    relation.type ===
      "contradicts"
  );
}

function getQuestionById(
  questionId: string,
): KnowledgeQuestionTemplate | null {
  return (
    knowledgeQuestions.find(
      (question) =>
        question.id ===
        questionId,
    ) ?? null
  );
}

/*
 * Dans les fichiers actuels, une valeur faible représente
 * une question plus prioritaire.
 */
function getPriorityScore(
  template: KnowledgeQuestionTemplate,
): number {
  const priority =
    Number.isFinite(
      template.priority,
    )
      ? Math.max(
          template.priority,
          0,
        )
      : 100;

  return (
    1 /
    (
      1 +
      priority / 20
    )
  );
}

function convertTemplateToQuestion(
  template: KnowledgeQuestionTemplate,
  hypotheses: Hypothesis[],
  expectedInformationGain = 1,
  reason?: string,
): Question {
  return {
    id:
      template.id,

    text:
      template.text,

    reason:
      reason ??
      template.purpose ??
      "Cette question permet d’affiner le diagnostic.",

    targetHypotheses:
      template.discriminates.length >
      0
        ? [
            ...template.discriminates,
          ]
        : hypotheses.map(
            (hypothesis) =>
              hypothesis.id,
          ),

    expectedInformationGain:
      clamp(
        expectedInformationGain,
      ),

    options:
      template.options,
  };
}

function selectCompetitiveHypotheses(
  hypotheses: Hypothesis[],
  complaint?: ChiefComplaint | null,
): Hypothesis[] {
  const activeHypotheses =
    hypotheses
      .filter(
        (hypothesis) =>
          !hypothesis.eliminated,
      )
      .sort(
        (
          first,
          second,
        ) => {
          const firstScore =
            normalizeProbability(
              first.probability,
            ) +
            (
              chiefComplaintPrefersHypothesis(
                complaint,
                first.id,
              )
                ? 0.12
                : 0
            );

          const secondScore =
            normalizeProbability(
              second.probability,
            ) +
            (
              chiefComplaintPrefersHypothesis(
                complaint,
                second.id,
              )
                ? 0.12
                : 0
            );

          return secondScore - firstScore;
        },
      );

  if (
    activeHypotheses.length <= 1
  ) {
    return activeHypotheses;
  }

  const strongestProbability =
    normalizeProbability(
      activeHypotheses[0]
        .probability,
    );

  const minimumProbability =
    Math.max(
      strongestProbability -
        COMPETITIVE_HYPOTHESIS_MARGIN,
      0.12,
    );

  const competitive =
    activeHypotheses.filter(
      (hypothesis) =>
        normalizeProbability(
          hypothesis.probability,
        ) >=
        minimumProbability,
    );

  const preferredHypotheses =
    activeHypotheses.filter(
      (hypothesis) =>
        chiefComplaintPrefersHypothesis(
          complaint,
          hypothesis.id,
        ),
    );

  const mergedHypotheses =
    [
      ...preferredHypotheses,
      ...(
        competitive.length > 0
          ? competitive
          : [activeHypotheses[0]]
      ),
    ].filter(
      (
        hypothesis,
        index,
        collection,
      ) =>
        collection.findIndex(
          (candidate) =>
            candidate.id ===
            hypothesis.id,
        ) === index,
    );

  return mergedHypotheses.slice(
    0,
    MAX_COMPETITIVE_HYPOTHESES,
  );
}

function shouldForceStartupOpeningQuestion(
  knownEntityIds: Set<string>,
  askedQuestionIds: Set<string>,
): boolean {
  if (
    askedQuestionIds.has(
      STARTUP_OPENING_QUESTION_ID,
    )
  ) {
    return false;
  }

  return [
    ...knownEntityIds,
  ].some(
    (entityId) =>
      STARTUP_ENTRY_ENTITY_IDS.has(
        entityId,
      ),
  );
}

function getEntityDomain(
  entity:
    KnowledgeEntity |
    null,
): DiagnosticDomain | null {
  if (
    !entity
  ) {
    return null;
  }

  return normalizeDomainName(
    entity.category,
  );
}

function calculateActiveDomainScores(
  detectedEntities:
    KnowledgeEntity[],
  hypotheses:
    Hypothesis[],
  complaint?:
    ChiefComplaint |
    null,
): Map<
  DiagnosticDomain,
  number
> {
  const scores =
    new Map<
      DiagnosticDomain,
      number
    >();

  const addScore = (
    domain:
      DiagnosticDomain |
      null,
    score: number,
  ): void => {
    if (
      !domain
    ) {
      return;
    }

    scores.set(
      domain,
      (
        scores.get(
          domain,
        ) ?? 0
      ) + score,
    );
  };

  if (
    complaint &&
    complaint.confidence >= 0.55
  ) {
    addScore(
      complaint.domain,
      2.5 *
        complaint.confidence,
    );
  }

  /*
   * Une entité explicitement détectée dans le texte
   * donne une indication forte sur le domaine actif.
   */
  for (
    const entity
    of detectedEntities
  ) {
    addScore(
      getEntityDomain(
        entity,
      ),
      1.25,
    );

    if (
      STARTUP_ENTITY_IDS.has(
        entity.id,
      )
    ) {
      addScore(
        "starting",
        1.1,
      );
    }
  }

  /*
   * Les hypothèses apportent également du contexte,
   * pondéré par leur probabilité.
   */
  for (
    const hypothesis
    of hypotheses
  ) {
    const hypothesisEntity =
      getEntityById(
        hypothesis.id,
      );

    addScore(
      getEntityDomain(
        hypothesisEntity,
      ),
      normalizeProbability(
        hypothesis.probability,
      ),
    );
  }

  return scores;
}

function getPrimaryActiveDomain(
  domainScores:
    Map<
      DiagnosticDomain,
      number
    >,
): DiagnosticDomain | null {
  let selectedDomain:
    DiagnosticDomain |
    null = null;

  let selectedScore = 0;

  for (
    const [
      domain,
      score,
    ]
    of domainScores
  ) {
    if (
      score >
      selectedScore
    ) {
      selectedDomain =
        domain;

      selectedScore =
        score;
    }
  }

  return selectedDomain;
}

function calculateDomainScore(
  template:
    KnowledgeQuestionTemplate,
  primaryDomain:
    DiagnosticDomain |
    null,
  activeDomainScores:
    Map<
      DiagnosticDomain,
      number
    >,
): number {
  const questionDomains =
    template.domains
      .map(
        (domain) =>
          normalizeDomainName(
            domain,
          ),
      )
      .filter(
        (
          domain,
        ): domain is DiagnosticDomain =>
          domain !== null,
      );

  if (
    questionDomains.length === 0
  ) {
    return 0.35;
  }

  if (
    primaryDomain &&
    questionDomains.includes(
      primaryDomain,
    )
  ) {
    return 1;
  }

  const strongestMatchingScore =
    questionDomains.reduce(
      (
        maximum,
        domain,
      ) =>
        Math.max(
          maximum,
          activeDomainScores.get(
            domain,
          ) ?? 0,
        ),
      0,
    );

  if (
    strongestMatchingScore > 0
  ) {
    return clamp(
      0.45 +
        strongestMatchingScore *
          0.12,
      0,
      0.85,
    );
  }

  return 0.08;
}

const TECHNICAL_QUESTION_IDS =
  new Set([
    "question-battery-parasitic-draw-test",
    "question-battery-drain-alternator-isolation",
    "question-battery-holds-charge-outside-vehicle",
    "question-battery-start-stop-compatibility",
  ]);

const INTERMEDIATE_QUESTION_IDS =
  new Set([
    "question-charging-voltage",
    "question-battery-discharge-charging-voltage",
    "question-jump-start",
  ]);

const BATTERY_DISCHARGE_QUESTION_IDS =
  new Set([
    "question-battery-discharge-delay",
    "question-battery-holds-charge-outside-vehicle",
    "question-battery-parasitic-draw-test",
    "question-battery-drain-alternator-isolation",
    "question-battery-replaced-discharge",
    "question-battery-discharge-charging-voltage",
    "question-battery-start-stop-compatibility",
  ]);

function getAllowedComplexity(
  level:
    UserSkillLevel |
    null |
    undefined,
): "simple" | "intermediate" | "technical" {
  if (
    level ===
    "professional"
  ) {
    return "technical";
  }

  if (
    level ===
    "amateur"
  ) {
    return "intermediate";
  }

  return "simple";
}

function getQuestionComplexity(
  template:
    KnowledgeQuestionTemplate,
): "simple" | "intermediate" | "technical" {
  if (
    template.complexity
  ) {
    return template.complexity;
  }

  if (
    TECHNICAL_QUESTION_IDS.has(
      template.id,
    )
  ) {
    return "technical";
  }

  if (
    INTERMEDIATE_QUESTION_IDS.has(
      template.id,
    )
  ) {
    return "intermediate";
  }

  return "simple";
}

function complexityIsAllowed(
  questionComplexity:
    "simple" | "intermediate" | "technical",
  allowedComplexity:
    "simple" | "intermediate" | "technical",
): boolean {
  const rank = {
    simple:
      1,

    intermediate:
      2,

    technical:
      3,
  };

  return (
    rank[questionComplexity] <=
    rank[allowedComplexity]
  );
}

function audienceIsAllowed(
  template:
    KnowledgeQuestionTemplate,
  profile:
    UserProfileType |
    null |
    undefined,
): boolean {
  if (
    !template.audiences ||
    template.audiences.length ===
      0
  ) {
    return true;
  }

  if (
    !profile
  ) {
    return false;
  }

  return template.audiences.includes(
    profile,
  );
}

function questionMatchesUserProfile(
  template:
    KnowledgeQuestionTemplate,
  userProfile:
    UserSkillProfile |
    null |
    undefined,
): boolean {
  const level =
    userProfile?.level ??
    "novice";

  const allowedComplexity =
    getAllowedComplexity(
      level,
    );

  const questionComplexity =
    getQuestionComplexity(
      template,
    );

  if (
    !complexityIsAllowed(
      questionComplexity,
      allowedComplexity,
    )
  ) {
    return false;
  }

  return audienceIsAllowed(
    template,
    userProfile?.profile,
  );
}

function questionMatchesChiefComplaint(
  template:
    KnowledgeQuestionTemplate,
  complaint:
    ChiefComplaint |
    null |
    undefined,
): boolean {
  if (
    !complaint ||
    complaint.confidence <
      0.60
  ) {
    return true;
  }

  if (
    (
      complaint.category ===
        "no-start" ||
      complaint.category ===
        "slow-cranking" ||
      complaint.category ===
        "starter"
    ) &&
    BATTERY_DISCHARGE_QUESTION_IDS.has(
      template.id,
    )
  ) {
    return false;
  }

  if (
    complaint.category ===
      "battery-discharge" &&
    (
      template.id ===
        "question-click-start" ||
      template.id ===
        "question-starter-intermittent" ||
      template.id ===
        "question-hot-engine-start"
    )
  ) {
    return false;
  }

  return true;
}

function templateRequirementsAreMet(
  template:
    KnowledgeQuestionTemplate,
  knownEntityIds:
    Set<string>,
  askedQuestionIds:
    Set<string>,
): boolean {
  if (
    askedQuestionIds.has(
      template.id,
    )
  ) {
    return false;
  }

  /*
   * Une question ne doit pas être reposée lorsque
   * l’entité qu’elle cherche est déjà connue.
   */
  if (
    knownEntityIds.has(
      template.targetEntityId,
    ) &&
    !template.repeatable
  ) {
    return false;
  }

  const prerequisites =
    template.prerequisites ??
    [];

  if (
    prerequisites.some(
      (questionId) =>
        !askedQuestionIds.has(
          questionId,
        ),
    )
  ) {
    return false;
  }

  const requiredEvidence =
    template.requiredEvidence ??
    [];

  if (
    requiredEvidence.some(
      (entityId) =>
        !knownEntityIds.has(
          entityId,
        ),
    )
  ) {
    return false;
  }

  const excludedEvidence =
    template.excludedByEvidence ??
    [];

  if (
    excludedEvidence.some(
      (entityId) =>
        knownEntityIds.has(
          entityId,
        ),
    )
  ) {
    return false;
  }

  return true;
}

function calculateHypothesisOverlap(
  template:
    KnowledgeQuestionTemplate,
  hypotheses:
    Hypothesis[],
): {
  hypothesisIds:
    Set<string>;

  hypothesisLabels:
    Set<string>;

  score: number;
} {
  const discriminatedIds =
    new Set(
      template.discriminates ??
      [],
    );

  const hypothesisIds =
    new Set<string>();

  const hypothesisLabels =
    new Set<string>();

  let score = 0;

  for (
    const hypothesis
    of hypotheses
  ) {
    if (
      !discriminatedIds.has(
        hypothesis.id,
      )
    ) {
      continue;
    }

    hypothesisIds.add(
      hypothesis.id,
    );

    hypothesisLabels.add(
      hypothesis.label,
    );

    score +=
      normalizeProbability(
        hypothesis.probability,
      );
  }

  return {
    hypothesisIds,
    hypothesisLabels,
    score:
      hypotheses.length > 0
        ? clamp(
            score /
              hypotheses.length,
          )
        : 0,
  };
}

function calculateDirectRelationScore(
  template:
    KnowledgeQuestionTemplate,
  hypotheses:
    Hypothesis[],
): number {
  let totalScore = 0;

  let matchingHypotheses = 0;

  for (
    const hypothesis
    of hypotheses
  ) {
    const matchingRelations =
      getRelationsFrom(
        hypothesis.id,
      )
        .filter(
          isDiagnosticRelation,
        )
        .filter(
          (relation) =>
            relation.to ===
            template.targetEntityId,
        );

    if (
      matchingRelations.length === 0
    ) {
      continue;
    }

    matchingHypotheses += 1;

    const strongestRelation =
      Math.max(
        ...matchingRelations.map(
          (relation) =>
            normalizeRelationWeight(
              relation.weight,
            ),
        ),
      );

    totalScore +=
      strongestRelation *
      normalizeProbability(
        hypothesis.probability,
      );
  }

  if (
    matchingHypotheses === 0
  ) {
    return 0;
  }

  return clamp(
    totalScore /
      matchingHypotheses,
  );
}

function calculateDiscriminationScore(
  template:
    KnowledgeQuestionTemplate,
  hypotheses:
    Hypothesis[],
): number {
  if (
    hypotheses.length === 0
  ) {
    return 0;
  }

  const discriminatedIds =
    new Set(
      template.discriminates ??
      [],
    );

  const matchingHypotheses =
    hypotheses.filter(
      (hypothesis) =>
        discriminatedIds.has(
          hypothesis.id,
        ),
    );

  if (
    matchingHypotheses.length === 0
  ) {
    return 0;
  }

  const coverage =
    matchingHypotheses.length /
    hypotheses.length;

  const probabilities =
    matchingHypotheses.map(
      (hypothesis) =>
        normalizeProbability(
          hypothesis.probability,
        ),
    );

  const highestProbability =
    Math.max(
      ...probabilities,
    );

  const lowestProbability =
    Math.min(
      ...probabilities,
    );

  const balance =
    matchingHypotheses.length >= 2
      ? 1 -
        (
          highestProbability -
          lowestProbability
        )
      : 0.45;

  return clamp(
    coverage * 0.65 +
      balance * 0.35,
  );
}

function calculateContinuityScore(
  template:
    KnowledgeQuestionTemplate,
  primaryDomain:
    DiagnosticDomain |
    null,
): number {
  if (
    !primaryDomain
  ) {
    return 0.5;
  }

  const questionDomains =
    template.domains
      .map(
        (domain) =>
          normalizeDomainName(
            domain,
          ),
      )
      .filter(
        (
          domain,
        ): domain is DiagnosticDomain =>
          domain !== null,
      );

  return questionDomains.includes(
    primaryDomain,
  )
    ? 1
    : 0;
}

function calculateComplaintScore(
  template:
    KnowledgeQuestionTemplate,
  complaint:
    ChiefComplaint |
    null |
    undefined,
): number {
  if (
    !complaint
  ) {
    return 0.5;
  }

  if (
    chiefComplaintExcludesQuestion(
      complaint,
      template.id,
    )
  ) {
    return 0;
  }

  if (
    chiefComplaintPrefersQuestion(
      complaint,
      template.id,
    )
  ) {
    return 1;
  }

  const questionDomains =
    template.domains
      .map(
        (domain) =>
          normalizeDomainName(
            domain,
          ),
      )
      .filter(
        (
          domain,
        ): domain is DiagnosticDomain =>
          domain !== null,
      );

  if (
    questionDomains.includes(
      complaint.domain,
    )
  ) {
    return 0.72;
  }

  return 0.18;
}

function calculateFinalScore(
  values: {
    hypothesisScore: number;
    directRelationScore: number;
    discriminationScore: number;
    domainScore: number;
    priorityScore: number;
    continuityScore: number;
    complaintScore: number;
  },
): number {
  return clamp(
    values.hypothesisScore *
      0.21 +

    values.directRelationScore *
      0.16 +

    values.discriminationScore *
      0.18 +

    values.domainScore *
      0.16 +

    values.priorityScore *
      0.06 +

    values.continuityScore *
      0.08 +

    values.complaintScore *
      0.15,
  );
}

function buildCandidates(
  hypotheses:
    Hypothesis[],
  knownEntityIds:
    Set<string>,
  askedQuestionIds:
    Set<string>,
  primaryDomain:
    DiagnosticDomain |
    null,
  activeDomainScores:
    Map<
      DiagnosticDomain,
      number
    >,
  complaint?:
    ChiefComplaint |
    null,
  userProfile?:
    UserSkillProfile |
    null,
): QuestionCandidate[] {
  const candidates:
    QuestionCandidate[] = [];

  for (
    const template
    of knowledgeQuestions
  ) {
    if (
      chiefComplaintExcludesQuestion(
        complaint,
        template.id,
      )
    ) {
      continue;
    }

    if (
      !questionMatchesUserProfile(
        template,
        userProfile,
      )
    ) {
      continue;
    }

    if (
      !questionMatchesChiefComplaint(
        template,
        complaint,
      )
    ) {
      continue;
    }

    if (
      !templateRequirementsAreMet(
        template,
        knownEntityIds,
        askedQuestionIds,
      )
    ) {
      continue;
    }

    const overlap =
      calculateHypothesisOverlap(
        template,
        hypotheses,
      );

    const directRelationScore =
      calculateDirectRelationScore(
        template,
        hypotheses,
      );

    /*
     * Une question doit être reliée aux hypothèses
     * soit par "discriminates", soit directement
     * par une relation du graphe.
     */
    if (
      overlap.hypothesisIds.size === 0 &&
      directRelationScore === 0
    ) {
      continue;
    }

    const discriminationScore =
      calculateDiscriminationScore(
        template,
        hypotheses,
      );

    const domainScore =
      calculateDomainScore(
        template,
        primaryDomain,
        activeDomainScores,
      );

    const priorityScore =
      getPriorityScore(
        template,
      );

    const continuityScore =
      calculateContinuityScore(
        template,
        primaryDomain,
      );

    const complaintScore =
      calculateComplaintScore(
        template,
        complaint,
      );

    const finalScore =
      calculateFinalScore({
        hypothesisScore:
          overlap.score,

        directRelationScore,

        discriminationScore,

        domainScore,

        priorityScore,

        continuityScore,

        complaintScore,
      });

    candidates.push({
      template,

      hypothesisIds:
        overlap.hypothesisIds,

      hypothesisLabels:
        overlap.hypothesisLabels,

      hypothesisScore:
        overlap.score,

      directRelationScore,

      discriminationScore,

      domainScore,

      priorityScore,

      continuityScore,

      complaintScore,

      finalScore,
    });
  }

  return candidates;
}

function compareCandidates(
  first:
    QuestionCandidate,
  second:
    QuestionCandidate,
): number {
  if (
    second.finalScore !==
    first.finalScore
  ) {
    return (
      second.finalScore -
      first.finalScore
    );
  }

  if (
    second.complaintScore !==
    first.complaintScore
  ) {
    return (
      second.complaintScore -
      first.complaintScore
    );
  }

  if (
    second.continuityScore !==
    first.continuityScore
  ) {
    return (
      second.continuityScore -
      first.continuityScore
    );
  }

  if (
    second.domainScore !==
    first.domainScore
  ) {
    return (
      second.domainScore -
      first.domainScore
    );
  }

  if (
    first.template.priority !==
    second.template.priority
  ) {
    return (
      first.template.priority -
      second.template.priority
    );
  }

  return first.template.id.localeCompare(
    second.template.id,
  );
}

function buildQuestionReason(
  candidate:
    QuestionCandidate,
  primaryDomain:
    DiagnosticDomain |
    null,
): string {
  const labels = [
    ...candidate.hypothesisLabels,
  ];

  if (
    labels.length === 0
  ) {
    return (
      candidate.template.purpose ??
      "Cette question permet d’affiner le diagnostic."
    );
  }

  if (
    primaryDomain
  ) {
    return (
      `Cette question reste centrée sur le motif principal ` +
      `du domaine « ${primaryDomain} » et permet de départager : ` +
      `${labels.join(", ")}.`
    );
  }

  return (
    "Cette réponse permettra de départager : " +
    `${labels.join(", ")}.`
  );
}

export function selectNextQuestion(
  hypotheses:
    Hypothesis[],
  detectedEntities:
    KnowledgeEntity[],
  askedQuestionIds:
    string[],
  complaint?:
    ChiefComplaint |
    null,
  userProfile?:
    UserSkillProfile |
    null,
): Question | null {
  const competitiveHypotheses =
    selectCompetitiveHypotheses(
      hypotheses,
      complaint,
    );

  if (
    competitiveHypotheses.length === 0
  ) {
    return null;
  }

  const knownEntityIds =
    new Set(
      detectedEntities.map(
        (entity) =>
          entity.id,
      ),
    );

  const askedIds =
    new Set(
      askedQuestionIds,
    );

  /*
   * Une conversation explicitement liée au
   * non-démarrage commence toujours par la question
   * structurante du démarrage.
   */
  if (
    !chiefComplaintExcludesQuestion(
      complaint,
      STARTUP_OPENING_QUESTION_ID,
    ) &&
    shouldForceStartupOpeningQuestion(
      knownEntityIds,
      askedIds,
    )
  ) {
    const openingQuestion =
      getQuestionById(
        STARTUP_OPENING_QUESTION_ID,
      );

    if (
      openingQuestion
    ) {
      return convertTemplateToQuestion(
        openingQuestion,
        competitiveHypotheses,
        1,
      );
    }
  }

  const activeDomainScores =
    calculateActiveDomainScores(
      detectedEntities,
      competitiveHypotheses,
      complaint,
    );

  const primaryDomain =
    complaint &&
    complaint.confidence >= 0.60
      ? complaint.domain
      : getPrimaryActiveDomain(
          activeDomainScores,
        );

  const candidates =
    buildCandidates(
      competitiveHypotheses,
      knownEntityIds,
      askedIds,
      primaryDomain,
      activeDomainScores,
      complaint,
      userProfile,
    ).sort(
      compareCandidates,
    );

  const bestCandidate =
    candidates[0];

  if (
    !bestCandidate
  ) {
    return null;
  }

  return convertTemplateToQuestion(
    bestCandidate.template,
    competitiveHypotheses,
    bestCandidate.finalScore,
    buildQuestionReason(
      bestCandidate,
      primaryDomain,
    ),
  );
}