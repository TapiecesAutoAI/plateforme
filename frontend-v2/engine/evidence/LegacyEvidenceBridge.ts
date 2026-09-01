import {
  isCanonicalEvidenceId,
} from "./CanonicalEvidenceRegistry";

import type {
  CanonicalEvidenceId,
} from "./CanonicalEvidenceRegistry";

const legacyToCanonicalEvidence = {
  "symptom-single-click-start":
    "symptom-single-click",

  "symptom-rapid-clicking-start":
    "symptom-rapid-clicking",

  "symptom-metallic-grinding-start":
    "symptom-metallic-grinding",

  "symptom-starter-intermittent":
    "observation-starts-intermittently",

  "observation-control-voltage-present":
    "observation-starter-control-voltage-present",

  "observation-no-control-voltage-starter":
    "observation-starter-control-voltage-absent",

  "observation-full-lights":
    "observation-lights-stay-normal",

  "observation-jump-start-no-effect":
    "observation-jump-start-fails",
} as const satisfies Record<
  string,
  CanonicalEvidenceId
>;

export type LegacyBridgedEvidenceId =
  keyof typeof legacyToCanonicalEvidence;

export function bridgeLegacyEvidenceId(
  evidenceId: string,
): CanonicalEvidenceId | null {
  if (
    isCanonicalEvidenceId(
      evidenceId,
    )
  ) {
    return evidenceId;
  }

  if (
    evidenceId in
    legacyToCanonicalEvidence
  ) {
    return legacyToCanonicalEvidence[
      evidenceId as LegacyBridgedEvidenceId
    ];
  }

  return null;
}