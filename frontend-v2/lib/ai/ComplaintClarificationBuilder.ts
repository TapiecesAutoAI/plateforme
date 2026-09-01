import type {
  CanonicalEvidenceId,
} from "../../engine/evidence/CanonicalEvidenceRegistry";

import type {
  ComplaintEvidenceAdmissionResult,
} from "./ComplaintEvidenceAdmissionGuard";

import type {
  ComplaintEvidenceConflictGuardResult,
} from "./ComplaintEvidenceConflictGuard";

export type ComplaintClarificationKind =
  | "evidence-confirmation"
  | "evidence-conflict";

export type ComplaintClarificationItem = {
  kind:
    ComplaintClarificationKind;

  evidenceIds:
    CanonicalEvidenceId[];

  reason:
    string;
};

export type ComplaintClarificationResult = {
  required:
    boolean;

  items:
    ComplaintClarificationItem[];
};

export function buildComplaintClarification(
  admission:
    ComplaintEvidenceAdmissionResult,

  conflictGuard:
    ComplaintEvidenceConflictGuardResult,
): ComplaintClarificationResult {

  const items:
    ComplaintClarificationItem[] =
      [];

  for (
    const admissionItem
    of admission.admissions
  ) {

    if (
      admissionItem.decision !==
        "confirmation-required"
    ) {
      continue;
    }

    items.push({
      kind:
        "evidence-confirmation",

      evidenceIds: [
        admissionItem.id,
      ],

      reason:
        admissionItem.reason,
    });
  }

  for (
    const conflict
    of conflictGuard.conflicts
  ) {

    items.push({
      kind:
        "evidence-conflict",

      evidenceIds: [
        conflict.left,
        conflict.right,
      ],

      reason:
        "Canonical evidences are mutually incompatible.",
    });
  }

  return {
    required:
      items.length > 0,

    items,
  };
}