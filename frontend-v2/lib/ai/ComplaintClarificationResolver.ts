import type {
  CanonicalEvidenceId,
} from "../../engine/evidence/CanonicalEvidenceRegistry";

import type {
  ComplaintClarificationItem,
  ComplaintClarificationResult,
} from "./ComplaintClarificationBuilder";

export type ComplaintClarificationChoice =
  | "confirm"
  | "reject"
  | "first"
  | "second"
  | "unsure";

export type ComplaintClarificationResolution = {
  confirmedEvidenceIds:
    CanonicalEvidenceId[];

  remainingClarification:
    ComplaintClarificationResult;

  resolved:
    boolean;
};

function resolveEvidenceConfirmation(
  item:
    ComplaintClarificationItem,

  choice:
    ComplaintClarificationChoice,
): CanonicalEvidenceId[] {

  if (
    choice === "reject" ||
    choice === "unsure"
  ) {
    return [];
  }

  if (choice !== "confirm") {
    throw new Error(
      "Choix invalide pour une confirmation d'evidence.",
    );
  }

  const evidenceId =
    item.evidenceIds[0];

  if (!evidenceId) {
    throw new Error(
      "Clarification de confirmation sans evidence.",
    );
  }

  return [
    evidenceId,
  ];
}

function resolveEvidenceConflict(
  item:
    ComplaintClarificationItem,

  choice:
    ComplaintClarificationChoice,
): CanonicalEvidenceId[] {

  if (choice === "unsure") {
    return [];
  }

  if (
    choice !== "first" &&
    choice !== "second"
  ) {
    throw new Error(
      "Choix invalide pour un conflit d'evidences.",
    );
  }

  const index =
    choice === "first"
      ? 0
      : 1;

  const evidenceId =
    item.evidenceIds[index];

  if (!evidenceId) {
    throw new Error(
      "Clarification de conflit incomplete.",
    );
  }

  return [
    evidenceId,
  ];
}

export function resolveComplaintClarification(
  clarification:
    ComplaintClarificationResult,

  choice:
    ComplaintClarificationChoice,
): ComplaintClarificationResolution {

  const currentItem =
    clarification.items[0];

  if (
    !clarification.required ||
    !currentItem
  ) {
    throw new Error(
      "Aucune clarification en attente.",
    );
  }

  const confirmedEvidenceIds =
    currentItem.kind ===
      "evidence-confirmation"
      ? resolveEvidenceConfirmation(
          currentItem,
          choice,
        )
      : resolveEvidenceConflict(
          currentItem,
          choice,
        );

  const remainingItems =
    clarification.items.slice(1);

  return {
    confirmedEvidenceIds,

    remainingClarification: {
      required:
        remainingItems.length > 0,

      items:
        remainingItems,
    },

    resolved:
      remainingItems.length === 0,
  };
}