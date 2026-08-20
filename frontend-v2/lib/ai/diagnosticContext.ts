import type {
  DiagnosticDomain,
  DiagnosticMemory as DiagnosticMemoryState,
} from "./types";

import type {
  KnowledgeEntity,
  KnowledgeEntityMetadataValue,
} from "./knowledge/types";

import {
  getEntityById,
} from "./knowledge/graph";

export type DiagnosticContext = {
  detectedEntities: KnowledgeEntity[];

  confirmedEntities: KnowledgeEntity[];

  rejectedEntities: KnowledgeEntity[];

  unknownEntities: KnowledgeEntity[];

  detectedEntityIds: string[];

  confirmedEntityIds: string[];

  rejectedEntityIds: string[];

  unknownEntityIds: string[];

  activeDomain: DiagnosticDomain | null;
};

export type BuildDiagnosticContextInput = {
  detectedEntities?: KnowledgeEntity[];

  confirmedEntityIds?: string[];

  rejectedEntityIds?: string[];

  unknownEntityIds?: string[];

  memory?: DiagnosticMemoryState | null;

  anchorEntity?: KnowledgeEntity | null;
};

const CATEGORY_DOMAIN_MAP:
  Record<string, DiagnosticDomain> = {
    demarrage:
      "starting",

    starting:
      "starting",

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

    electricite:
      "electrical",

    electrical:
      "electrical",

    freinage:
      "braking",

    brake:
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

function normalizeValue(
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
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    );
}

function uniqueIds(
  values: string[],
): string[] {
  return [
    ...new Set(
      values
        .map(
          (value) =>
            value.trim(),
        )
        .filter(Boolean),
    ),
  ];
}

function readMetadataValue(
  value:
    KnowledgeEntityMetadataValue |
    undefined,
): string[] {
  if (
    typeof value ===
    "string"
  ) {
    return [
      value,
    ];
  }

  if (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item ===
        "string",
    )
  ) {
    return value;
  }

  return [];
}

function getEntityDomains(
  entity: KnowledgeEntity,
): string[] {
  const metadataDomains =
    readMetadataValue(
      entity.metadata?.domains,
    );

  const metadataDomain =
    readMetadataValue(
      entity.metadata?.domain,
    );

  const categoryDomain =
    entity.category
      ? [
          entity.category,
        ]
      : [];

  return [
    ...metadataDomains,
    ...metadataDomain,
    ...categoryDomain,
  ]
    .map(
      normalizeValue,
    )
    .filter(
      (
        domain,
        index,
        domains,
      ) =>
        domain.length > 0 &&
        domains.indexOf(
          domain,
        ) === index,
    );
}

function entitiesShareDomain(
  first: KnowledgeEntity,
  second: KnowledgeEntity,
): boolean {
  const firstDomains =
    getEntityDomains(
      first,
    );

  const secondDomains =
    getEntityDomains(
      second,
    );

  if (
    firstDomains.length === 0 ||
    secondDomains.length === 0
  ) {
    return true;
  }

  return firstDomains.some(
    (domain) =>
      secondDomains.includes(
        domain,
      ),
  );
}

function resolveEntities(
  entityIds: string[],
): KnowledgeEntity[] {
  return uniqueIds(
    entityIds,
  )
    .map(
      (entityId) =>
        getEntityById(
          entityId,
        ),
    )
    .filter(
      (
        entity,
      ): entity is KnowledgeEntity =>
        entity !== null,
    );
}

function mergeEntities(
  entities:
    KnowledgeEntity[],
): KnowledgeEntity[] {
  const entitiesById =
    new Map<
      string,
      KnowledgeEntity
    >();

  for (
    const entity
    of entities
  ) {
    entitiesById.set(
      entity.id,
      entity,
    );
  }

  return [
    ...entitiesById.values(),
  ];
}

function filterEntitiesByAnchor(
  entities: KnowledgeEntity[],
  anchorEntity:
    KnowledgeEntity |
    null |
    undefined,
): KnowledgeEntity[] {
  if (
    !anchorEntity
  ) {
    return entities;
  }

  const anchorDomains =
    getEntityDomains(
      anchorEntity,
    );

  if (
    anchorDomains.length === 0
  ) {
    return entities;
  }

  return entities.filter(
    (entity) =>
      entity.id ===
        anchorEntity.id ||
      entitiesShareDomain(
        anchorEntity,
        entity,
      ),
  );
}

function resolveDiagnosticDomain(
  entity:
    KnowledgeEntity |
    null |
    undefined,
): DiagnosticDomain | null {
  if (
    !entity
  ) {
    return null;
  }

  const candidateDomains = [
    ...getEntityDomains(
      entity,
    ),
  ];

  for (
    const candidate
    of candidateDomains
  ) {
    const domain =
      CATEGORY_DOMAIN_MAP[
        candidate
      ];

    if (
      domain
    ) {
      return domain;
    }
  }

  return null;
}

function calculateActiveDomain(
  confirmedEntities:
    KnowledgeEntity[],
  detectedEntities:
    KnowledgeEntity[],
  anchorEntity:
    KnowledgeEntity |
    null |
    undefined,
  existingDomain:
    DiagnosticDomain |
    null |
    undefined,
): DiagnosticDomain | null {
  if (
    existingDomain
  ) {
    return existingDomain;
  }

  const scores =
    new Map<
      DiagnosticDomain,
      number
    >();

  const addScore = (
    entity:
      KnowledgeEntity |
      null |
      undefined,
    value: number,
  ): void => {
    const domain =
      resolveDiagnosticDomain(
        entity,
      );

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
      ) + value,
    );
  };

  addScore(
    anchorEntity,
    4,
  );

  for (
    const entity
    of confirmedEntities
  ) {
    addScore(
      entity,
      2,
    );
  }

  for (
    const entity
    of detectedEntities
  ) {
    addScore(
      entity,
      1,
    );
  }

  let activeDomain:
    DiagnosticDomain |
    null = null;

  let strongestScore =
    0;

  for (
    const [
      domain,
      score,
    ]
    of scores
  ) {
    if (
      score >
      strongestScore
    ) {
      activeDomain =
        domain;

      strongestScore =
        score;
    }
  }

  return activeDomain;
}

export function buildDiagnosticContext(
  input:
    BuildDiagnosticContextInput,
): DiagnosticContext {
  const detectedEntities =
    mergeEntities(
      input.detectedEntities ??
      [],
    );

  const detectedEntityIds =
    uniqueIds([
      ...detectedEntities.map(
        (entity) =>
          entity.id,
      ),

      ...(
        input.memory
          ?.detectedEntityIds ??
        []
      ),
    ]);

  const rejectedEntityIds =
    uniqueIds([
      ...(
        input.rejectedEntityIds ??
        []
      ),

      ...(
        input.memory
          ?.rejectedEntityIds ??
        []
      ),
    ]);

  const unknownEntityIds =
    uniqueIds([
      ...(
        input.unknownEntityIds ??
        []
      ),

      ...(
        input.memory
          ?.unknownEntityIds ??
        []
      ),
    ]).filter(
      (entityId) =>
        !rejectedEntityIds.includes(
          entityId,
        ),
    );

  const confirmedEntityIds =
    uniqueIds([
      ...detectedEntityIds,

      ...(
        input.confirmedEntityIds ??
        []
      ),

      ...(
        input.memory
          ?.confirmedEntityIds ??
        []
      ),
    ]).filter(
      (entityId) =>
        !rejectedEntityIds.includes(
          entityId,
        ) &&
        !unknownEntityIds.includes(
          entityId,
        ),
    );

  const confirmedEntities =
    filterEntitiesByAnchor(
      resolveEntities(
        confirmedEntityIds,
      ),
      input.anchorEntity,
    );

  if (
    input.anchorEntity &&
    !confirmedEntities.some(
      (entity) =>
        entity.id ===
        input.anchorEntity?.id,
    ) &&
    !rejectedEntityIds.includes(
      input.anchorEntity.id,
    ) &&
    !unknownEntityIds.includes(
      input.anchorEntity.id,
    )
  ) {
    confirmedEntities.unshift(
      input.anchorEntity,
    );
  }

  const filteredConfirmedEntityIds =
    confirmedEntities.map(
      (entity) =>
        entity.id,
    );

  const rejectedEntities =
    filterEntitiesByAnchor(
      resolveEntities(
        rejectedEntityIds,
      ),
      input.anchorEntity,
    );

  const unknownEntities =
    filterEntitiesByAnchor(
      resolveEntities(
        unknownEntityIds,
      ),
      input.anchorEntity,
    );

  const activeDomain =
    calculateActiveDomain(
      confirmedEntities,
      detectedEntities,
      input.anchorEntity,
      input.memory?.activeDomain,
    );

  return {
    detectedEntities,

    confirmedEntities,

    rejectedEntities,

    unknownEntities,

    detectedEntityIds,

    confirmedEntityIds:
      filteredConfirmedEntityIds,

    rejectedEntityIds:
      rejectedEntities.map(
        (entity) =>
          entity.id,
      ),

    unknownEntityIds:
      unknownEntities.map(
        (entity) =>
          entity.id,
      ),

    activeDomain,
  };
}