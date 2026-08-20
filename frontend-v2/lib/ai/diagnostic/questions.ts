import type {
  KnowledgeEntity,
  KnowledgeGraphData,
  KnowledgeRelation,
} from "../knowledge/types";

import type {
  DiagnosticEvidence,
  DiagnosticHypothesis,
  DiagnosticQuestion,
  DiagnosticSession,
} from "./types";

/*
 * ============================================================
 * TYPES INTERNES
 * ============================================================
 */

type QuestionCandidate = {
  entity: KnowledgeEntity;
  score: number;
  relatedHypothesisIds: string[];
  reason: string;
};

/*
 * ============================================================
 * OUTILS
 * ============================================================
 */

function getEntityById(
  graph: KnowledgeGraphData,
  entityId: string,
): KnowledgeEntity | undefined {
  return graph.entities.find(
    (entity) => entity.id === entityId,
  );
}

function hasEvidenceForEntity(
  evidence: DiagnosticEvidence[],
  entityId: string,
): boolean {
  return evidence.some(
    (item) => item.entityId === entityId,
  );
}

function isQuestionableEntity(
  entity: KnowledgeEntity,
): boolean {
  return (
    entity.type === "symptom" ||
    entity.type === "observation"
  );
}

function getRelatedEntityId(
  relation: KnowledgeRelation,
  problemId: string,
): string | undefined {
  if (relation.from === problemId) {
    return relation.to;
  }

  if (relation.to === problemId) {
    return relation.from;
  }

  return undefined;
}

function createQuestionText(
  entity: KnowledgeEntity,
): string {
  if (entity.type === "symptom") {
    return `Le véhicule présente-t-il le symptôme suivant : ${entity.name} ?`;
  }

  if (entity.type === "observation") {
    return `Pouvez-vous confirmer l’observation suivante : ${entity.name} ?`;
  }

  return `Pouvez-vous confirmer : ${entity.name} ?`;
}

function getRelationQuestionValue(
  relation: KnowledgeRelation,
): number {
  switch (relation.type) {
    case "produces":
      return 1;

    case "supports":
      return 0.95;

    case "contradicts":
      return 0.9;

    case "affects":
      return 0.75;

    case "related-to":
      return 0.65;

    default:
      return 0;
  }
}

/*
 * ============================================================
 * CRÉATION DES CANDIDATS
 * ============================================================
 */

function buildQuestionCandidates(
  hypotheses: DiagnosticHypothesis[],
  session: DiagnosticSession,
  graph: KnowledgeGraphData,
): QuestionCandidate[] {
  const candidates = new Map<string, QuestionCandidate>();

  hypotheses.forEach((hypothesis, hypothesisIndex) => {
    const hypothesisPriority =
      hypotheses.length - hypothesisIndex;

    const relevantRelations = graph.relations.filter(
      (relation) =>
        relation.from === hypothesis.problemId ||
        relation.to === hypothesis.problemId,
    );

    relevantRelations.forEach((relation) => {
      const relatedEntityId = getRelatedEntityId(
        relation,
        hypothesis.problemId,
      );

      if (!relatedEntityId) {
        return;
      }

      if (
        hasEvidenceForEntity(
          session.evidence,
          relatedEntityId,
        )
      ) {
        return;
      }

      const entity = getEntityById(
        graph,
        relatedEntityId,
      );

      if (!entity || !isQuestionableEntity(entity)) {
        return;
      }

      const relationValue =
        getRelationQuestionValue(relation);

      if (relationValue === 0) {
        return;
      }

      const uncertainty =
        1 - Math.abs(hypothesis.score - 0.5) * 2;

      const rankingValue =
        hypothesisPriority /
        Math.max(hypotheses.length, 1);

      const candidateScore =
        relation.weight *
        relationValue *
        (0.6 + uncertainty * 0.4) *
        rankingValue;

      const existingCandidate = candidates.get(
        entity.id,
      );

      if (existingCandidate) {
        existingCandidate.score += candidateScore;

        if (
          !existingCandidate.relatedHypothesisIds.includes(
            hypothesis.problemId,
          )
        ) {
          existingCandidate.relatedHypothesisIds.push(
            hypothesis.problemId,
          );
        }

        return;
      }

      candidates.set(entity.id, {
        entity,
        score: candidateScore,
        relatedHypothesisIds: [
          hypothesis.problemId,
        ],
        reason:
          "Cette réponse permettra de départager les pannes actuellement les plus probables.",
      });
    });
  });

  return [...candidates.values()];
}

/*
 * ============================================================
 * SÉLECTION DE LA PROCHAINE QUESTION
 * ============================================================
 */

export function selectNextDiagnosticQuestion(
  hypotheses: DiagnosticHypothesis[],
  session: DiagnosticSession,
  graph: KnowledgeGraphData,
): DiagnosticQuestion | undefined {
  if (hypotheses.length === 0) {
    return undefined;
  }

  const candidates = buildQuestionCandidates(
    hypotheses,
    session,
    graph,
  )
    .filter(
      (candidate) =>
        !session.askedQuestionIds.includes(
          `question-${candidate.entity.id}`,
        ),
    )
    .sort(
      (firstCandidate, secondCandidate) =>
        secondCandidate.score -
        firstCandidate.score,
    );

  const bestCandidate = candidates[0];

  if (!bestCandidate) {
    return undefined;
  }

  return {
    id: `question-${bestCandidate.entity.id}`,
    text: createQuestionText(
      bestCandidate.entity,
    ),
    targetEntityId: bestCandidate.entity.id,
    type: "yes-no",
    options: [
      {
        value: "yes",
        label: "Oui",
      },
      {
        value: "no",
        label: "Non",
      },
      {
        value: "unknown",
        label: "Je ne sais pas",
      },
    ],
    informationGain: Math.min(
      bestCandidate.score,
      1,
    ),
    reason: bestCandidate.reason,
  };
}
