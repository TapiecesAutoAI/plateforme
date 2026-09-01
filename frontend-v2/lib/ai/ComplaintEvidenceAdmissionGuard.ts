import type {
  CanonicalEvidenceId,
} from "../../engine/evidence/CanonicalEvidenceRegistry";

import type {
  ComplaintInterpretationComparison,
  ComparedComplaintEvidence,
} from "./ComplaintInterpretationComparator";

export type ComplaintEvidenceAdmissionDecision =
  | "admitted"
  | "confirmation-required"
  | "rejected";

export type ComplaintEvidenceAdmission = {
  id:
    CanonicalEvidenceId;

  decision:
    ComplaintEvidenceAdmissionDecision;

  reason:
    string;

  evidence:
    ComparedComplaintEvidence;
};

export type ComplaintEvidenceAdmissionResult = {
  admittedEvidenceIds:
    CanonicalEvidenceId[];

  admissions:
    ComplaintEvidenceAdmission[];

  requiresConfirmation:
    boolean;
};

const SEMANTIC_ADMISSION_CONFIDENCE =
  0.9;

function decideEvidenceAdmission(
  evidence:
    ComparedComplaintEvidence,
): ComplaintEvidenceAdmission {

  if (
    evidence.agreement ===
    "agreement"
  ) {
    return {
      id:
        evidence.id,

      decision:
        "admitted",

      reason:
        "Accord entre interprétation déterministe et sémantique.",

      evidence,
    };
  }

  if (
    evidence.agreement ===
    "deterministic-only"
  ) {
    return {
      id:
        evidence.id,

      decision:
        "admitted",

      reason:
        "Evidence issue du matcher déterministe.",

      evidence,
    };
  }

  if (
    evidence.agreement ===
      "semantic-only" &&
    evidence.support ===
      "inferred"
  ) {
    return {
      id:
        evidence.id,

      decision:
        "confirmation-required",

      reason:
        "Evidence semantique inferee : confirmation obligatoire.",

      evidence,
    };
  }

  if (
    evidence.agreement ===
      "semantic-only" &&
    evidence.confidence >=
      SEMANTIC_ADMISSION_CONFIDENCE
  ) {
    return {
      id:
        evidence.id,

      decision:
        "admitted",

      reason:
        "Evidence sémantique seule avec confiance suffisante.",

      evidence,
    };
  }

  if (
    evidence.agreement ===
    "semantic-only"
  ) {
    return {
      id:
        evidence.id,

      decision:
        "confirmation-required",

      reason:
        "Evidence sémantique seule avec confiance insuffisante.",

      evidence,
    };
  }

  return {
    id:
      evidence.id,

    decision:
      "rejected",

    reason:
      "Evidence non admissible.",

    evidence,
  };
}

export function admitComplaintEvidences(
  comparison:
    ComplaintInterpretationComparison,
): ComplaintEvidenceAdmissionResult {

  const admissions =
    comparison.evidences.map(
      decideEvidenceAdmission,
    );

  const admittedEvidenceIds =
    admissions
      .filter(
        admission =>
          admission.decision ===
          "admitted",
      )
      .map(
        admission =>
          admission.id,
      );

  const requiresConfirmation =
    comparison.requiresConfirmation ||
    admissions.some(
      admission =>
        admission.decision ===
        "confirmation-required",
    );

  return {
    admittedEvidenceIds:
      Array.from(
        new Set(
          admittedEvidenceIds,
        ),
      ),

    admissions,

    requiresConfirmation,
  };
}