import type {
  ConversationState,
} from "./types";

import {
  getEntityById,
} from "./knowledge/graph";

import {
  generateGraphHypotheses,
} from "./knowledge/reasoning";

import type {
  KnowledgeEntity,
} from "./knowledge/types";

function resolveEntities(
  entityIds: Iterable<string>,
): KnowledgeEntity[] {
  const resolvedEntities =
    new Map<string, KnowledgeEntity>();

  for (const entityId of entityIds) {
    const entity =
      getEntityById(entityId);

    if (!entity) {
      continue;
    }

    resolvedEntities.set(
      entity.id,
      entity,
    );
  }

  return [
    ...resolvedEntities.values(),
  ];
}

function getConfirmedEntityIds(
  state: ConversationState,
): Set<string> {
  const confirmedEntityIds =
    new Set<string>();

  /*
   * Les symptômes détectés par l’analyseur sont
   * considérés comme des entités confirmées.
   *
   * entityId est utilisé lorsqu’il est disponible.
   * Sinon, l’identifiant du symptôme est conservé.
   */
  for (const symptom of state.symptoms) {
    confirmedEntityIds.add(
      symptom.id,
    );
  }

  /*
   * Les preuves déjà associées aux hypothèses
   * peuvent également contenir des entités confirmées.
   */
  for (const hypothesis of state.hypotheses) {
    for (const evidence of hypothesis.evidenceFor) {
      if (evidence.entityId) {
        confirmedEntityIds.add(
          evidence.entityId,
        );
      }
    }
  }

  return confirmedEntityIds;
}

function getRejectedEntityIds(
  state: ConversationState,
  confirmedEntityIds: Set<string>,
): Set<string> {
  const rejectedEntityIds =
    new Set<string>();

  /*
   * Les preuves contraires déjà connues sont
   * utilisées comme entités rejetées.
   */
  for (const hypothesis of state.hypotheses) {
    for (const evidence of hypothesis.evidenceAgainst) {
      if (evidence.entityId) {
        rejectedEntityIds.add(
          evidence.entityId,
        );
      }
    }
  }

  /*
   * Une confirmation prend toujours priorité
   * sur un ancien rejet.
   */
  for (const confirmedEntityId of confirmedEntityIds) {
    rejectedEntityIds.delete(
      confirmedEntityId,
    );
  }

  return rejectedEntityIds;
}

export function generateHypotheses(
  state: ConversationState,
): ConversationState {
  const confirmedEntityIds =
    getConfirmedEntityIds(state);

  const rejectedEntityIds =
    getRejectedEntityIds(
      state,
      confirmedEntityIds,
    );

  const confirmedEntities =
    resolveEntities(
      confirmedEntityIds,
    );

  const rejectedEntities =
    resolveEntities(
      rejectedEntityIds,
    );

  const hypotheses =
    generateGraphHypotheses(
      confirmedEntities,
      rejectedEntities,
    );

  return {
    ...state,
    hypotheses,
  };
}

