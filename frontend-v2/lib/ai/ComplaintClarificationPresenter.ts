import {
  getCanonicalEvidenceDefinition,
} from "../../engine/evidence/CanonicalEvidenceRegistry";

import type {
  CanonicalEvidenceId,
} from "../../engine/evidence/CanonicalEvidenceRegistry";

import type {
  ComplaintClarificationItem,
  ComplaintClarificationResult,
} from "./ComplaintClarificationBuilder";

export type PresentedComplaintClarificationItem = {
  kind:
    ComplaintClarificationItem["kind"];

  evidenceIds:
    CanonicalEvidenceId[];

  labels:
    string[];

  prompt:
    string;
};

export type PresentedComplaintClarification = {
  required:
    boolean;

  items:
    PresentedComplaintClarificationItem[];
};

function getEvidenceLabel(
  evidenceId:
    CanonicalEvidenceId,
): string {

  const definition =
    getCanonicalEvidenceDefinition(
      evidenceId,
    );

  return (
    definition?.label ??
    evidenceId
  );
}

function presentItem(
  item:
    ComplaintClarificationItem,
): PresentedComplaintClarificationItem {

  const labels =
    item.evidenceIds.map(
      getEvidenceLabel,
    );

  if (
    item.kind ===
      "evidence-conflict"
  ) {

    return {
      kind:
        item.kind,

      evidenceIds:
        item.evidenceIds,

      labels,

      prompt:
        labels.length >= 2
          ? `J'ai compris deux informations qui semblent incompatibles : « ${labels[0]} » et « ${labels[1]} ». Laquelle correspond à ce que vous observez ?`
          : "J'ai besoin de préciser ce que vous observez.",
    };
  }

  return {
    kind:
      item.kind,

    evidenceIds:
      item.evidenceIds,

    labels,

    prompt:
      labels.length > 0
        ? `J'ai compris : « ${labels[0]} ». Est-ce bien cela ?`
        : "J'ai besoin de confirmer ce que vous observez.",
  };
}

export function presentComplaintClarification(
  clarification:
    ComplaintClarificationResult,
): PresentedComplaintClarification {

  return {
    required:
      clarification.required,

    items:
      clarification.items.map(
        presentItem,
      ),
  };
}