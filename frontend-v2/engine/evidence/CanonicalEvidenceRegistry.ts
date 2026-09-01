import {
  startingEvidenceDefinitions,
} from "../workflows/starting/evidences";

import type {
  StartingEvidenceDefinition,
  StartingEvidenceId,
} from "../workflows/starting/evidences";

export type CanonicalEvidenceDomain =
  | "starting";

export type CanonicalEvidenceId =
  StartingEvidenceId;

export type CanonicalEvidenceDefinition =
  StartingEvidenceDefinition & {
    domain: CanonicalEvidenceDomain;
  };

export const canonicalEvidenceDefinitions:
  CanonicalEvidenceDefinition[] =
  startingEvidenceDefinitions.map(
    (definition) => ({
      ...definition,
      domain: "starting",
    }),
  );

const canonicalEvidenceById =
  new Map<
    CanonicalEvidenceId,
    CanonicalEvidenceDefinition
  >(
    canonicalEvidenceDefinitions.map(
      (definition) => [
        definition.id,
        definition,
      ],
    ),
  );

const canonicalEvidenceIds =
  new Set<string>(
    canonicalEvidenceDefinitions.map(
      (definition) =>
        definition.id,
    ),
  );

export function isCanonicalEvidenceId(
  value: string,
): value is CanonicalEvidenceId {
  return canonicalEvidenceIds.has(
    value,
  );
}

export function getCanonicalEvidenceDefinition(
  evidenceId: CanonicalEvidenceId,
): CanonicalEvidenceDefinition | null {
  return (
    canonicalEvidenceById.get(
      evidenceId,
    ) ?? null
  );
}