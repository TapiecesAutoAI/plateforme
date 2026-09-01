import type {
  CanonicalEvidenceId,
} from "../../engine/evidence/CanonicalEvidenceRegistry";

import {
  findConflictsAmongCanonicalEvidences,
} from "../../engine/evidence/CanonicalEvidenceConflictRegistry";

import type {
  CanonicalEvidenceConflict,
} from "../../engine/evidence/CanonicalEvidenceConflictRegistry";

import type {
  ComplaintEvidenceAdmissionResult,
} from "./ComplaintEvidenceAdmissionGuard";

export type ComplaintEvidenceConflictGuardResult = {
  admittedEvidenceIds:
    CanonicalEvidenceId[];

  blockedEvidenceIds:
    CanonicalEvidenceId[];

  conflicts:
    CanonicalEvidenceConflict[];

  requiresConfirmation:
    boolean;
};

export function guardComplaintEvidenceConflicts(
  admission:
    ComplaintEvidenceAdmissionResult,
): ComplaintEvidenceConflictGuardResult {

  const conflicts =
    findConflictsAmongCanonicalEvidences(
      admission.admittedEvidenceIds,
    );

  const blockedEvidenceIds =
    new Set<CanonicalEvidenceId>();

  for (
    const conflict
    of conflicts
  ) {

    blockedEvidenceIds.add(
      conflict.left,
    );

    blockedEvidenceIds.add(
      conflict.right,
    );
  }

  const admittedEvidenceIds =
    admission.admittedEvidenceIds.filter(
      evidenceId =>
        !blockedEvidenceIds.has(
          evidenceId,
        ),
    );

  return {
    admittedEvidenceIds,

    blockedEvidenceIds:
      [
        ...blockedEvidenceIds,
      ],

    conflicts,

    requiresConfirmation:
      admission.requiresConfirmation ||
      conflicts.length > 0,
  };
}