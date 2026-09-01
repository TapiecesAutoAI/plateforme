import {
  bridgeLegacyEvidenceId,
} from "../../engine/evidence/LegacyEvidenceBridge";

import {
  getCanonicalEvidenceDefinition,
} from "../../engine/evidence/CanonicalEvidenceRegistry";

import {
  createAutomotiveComplaintInterpretation,
} from "./AutomotiveComplaintInterpreter";

import {
  findEntitiesInText,
} from "./knowledge/matcher";

import type {
  AutomotiveComplaintEvidenceCandidate,
  AutomotiveComplaintInterpretation,
} from "./AutomotiveComplaintInterpreter";

export function interpretComplaintDeterministically(
  text: string,
): AutomotiveComplaintInterpretation {
  const entities =
    findEntitiesInText(
      text,
    );

  const candidates:
    AutomotiveComplaintEvidenceCandidate[] =
    [];

  for (
    const entity of entities
  ) {
    if (
      entity.type !== "symptom" &&
      entity.type !== "observation"
    ) {
      continue;
    }

    const canonicalId =
      bridgeLegacyEvidenceId(
        entity.id,
      );

    if (
      canonicalId === null
    ) {
      continue;
    }

    const definition =
      getCanonicalEvidenceDefinition(
        canonicalId,
      );

    if (
      definition === null
    ) {
      continue;
    }

    candidates.push({
      id: canonicalId,
      confidence:
          definition.defaultConfidence,

        support:
          "normalized",

        source:
          "deterministic-matcher",
      sourceText:
        text,
    });
  }

  return createAutomotiveComplaintInterpretation(
    text,
    candidates,
  );
}