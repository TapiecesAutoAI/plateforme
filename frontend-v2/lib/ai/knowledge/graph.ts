import {
  automotiveKnowledgeGraph,
} from "./data";

import type {
  KnowledgeEntity,
  KnowledgeEntityType,
  KnowledgeRelation,
  KnowledgeRelationType,
} from "./types";

const entitiesById =
  new Map<string, KnowledgeEntity>();

const entitiesByType =
  new Map<
    KnowledgeEntityType,
    KnowledgeEntity[]
  >();

const relationsFrom =
  new Map<
    string,
    KnowledgeRelation[]
  >();

const relationsTo =
  new Map<
    string,
    KnowledgeRelation[]
  >();

const relationsById =
  new Map<
    string,
    KnowledgeRelation
  >();

function registerEntity(
  entity: KnowledgeEntity,
): void {
  if (
    entitiesById.has(
      entity.id,
    )
  ) {
    throw new Error(
      `Entité dupliquée dans le graphe : ${entity.id}`,
    );
  }

  entitiesById.set(
    entity.id,
    entity,
  );

  const entities =
    entitiesByType.get(
      entity.type,
    ) ?? [];

  entities.push(
    entity,
  );

  entitiesByType.set(
    entity.type,
    entities,
  );
}

function registerRelation(
  relation: KnowledgeRelation,
): void {
  if (
    relationsById.has(
      relation.id,
    )
  ) {
    throw new Error(
      `Relation dupliquée dans le graphe : ${relation.id}`,
    );
  }

  if (
    !entitiesById.has(
      relation.from,
    )
  ) {
    throw new Error(
      `Source inconnue pour la relation ${relation.id} : ${relation.from}`,
    );
  }

  if (
    !entitiesById.has(
      relation.to,
    )
  ) {
    throw new Error(
      `Destination inconnue pour la relation ${relation.id} : ${relation.to}`,
    );
  }

  relationsById.set(
    relation.id,
    relation,
  );

  const outgoingRelations =
    relationsFrom.get(
      relation.from,
    ) ?? [];

  outgoingRelations.push(
    relation,
  );

  relationsFrom.set(
    relation.from,
    outgoingRelations,
  );

  const incomingRelations =
    relationsTo.get(
      relation.to,
    ) ?? [];

  incomingRelations.push(
    relation,
  );

  relationsTo.set(
    relation.to,
    incomingRelations,
  );
}

for (
  const entity
  of automotiveKnowledgeGraph.entities
) {
  registerEntity(
    entity,
  );
}

for (
  const relation
  of automotiveKnowledgeGraph.relations
) {
  registerRelation(
    relation,
  );
}

export function getEntityById(
  entityId: string,
): KnowledgeEntity | null {
  return (
    entitiesById.get(
      entityId,
    ) ?? null
  );
}

export function getEntitiesByType(
  type: KnowledgeEntityType,
): KnowledgeEntity[] {
  return [
    ...(
      entitiesByType.get(
        type,
      ) ?? []
    ),
  ];
}

export function getRelationById(
  relationId: string,
): KnowledgeRelation | null {
  return (
    relationsById.get(
      relationId,
    ) ?? null
  );
}

export function getRelationsFrom(
  entityId: string,
  type?: KnowledgeRelationType,
): KnowledgeRelation[] {
  const relations =
    relationsFrom.get(
      entityId,
    ) ?? [];

  if (!type) {
    return [
      ...relations,
    ];
  }

  return relations.filter(
    (relation) =>
      relation.type === type,
  );
}

export function getRelationsTo(
  entityId: string,
  type?: KnowledgeRelationType,
): KnowledgeRelation[] {
  const relations =
    relationsTo.get(
      entityId,
    ) ?? [];

  if (!type) {
    return [
      ...relations,
    ];
  }

  return relations.filter(
    (relation) =>
      relation.type === type,
  );
}

export function getConnectedEntities(
  entityId: string,
  relationType?: KnowledgeRelationType,
): KnowledgeEntity[] {
  const connectedEntityIds =
    new Set<string>();

  for (
    const relation
    of getRelationsFrom(
      entityId,
      relationType,
    )
  ) {
    connectedEntityIds.add(
      relation.to,
    );
  }

  for (
    const relation
    of getRelationsTo(
      entityId,
      relationType,
    )
  ) {
    connectedEntityIds.add(
      relation.from,
    );
  }

  return [
    ...connectedEntityIds,
  ]
    .map(
      (
        connectedEntityId,
      ) =>
        getEntityById(
          connectedEntityId,
        ),
    )
    .filter(
      (
        entity,
      ): entity is KnowledgeEntity =>
        entity !== null,
    );
}

export function getAllEntities():
  KnowledgeEntity[] {
  return [
    ...entitiesById.values(),
  ];
}

export function getAllRelations():
  KnowledgeRelation[] {
  return [
    ...relationsById.values(),
  ];
}

export function hasEntity(
  entityId: string,
): boolean {
  return entitiesById.has(
    entityId,
  );
}

export function hasRelation(
  from: string,
  to: string,
  type?: KnowledgeRelationType,
): boolean {
  return getRelationsFrom(
    from,
    type,
  ).some(
    (relation) =>
      relation.to === to,
  );
}
