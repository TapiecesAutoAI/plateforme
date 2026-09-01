import {
  isCanonicalEvidenceId,
} from "../../engine/evidence/CanonicalEvidenceRegistry";

import type {
  CanonicalEvidenceId,
} from "../../engine/evidence/CanonicalEvidenceRegistry";

import type {
  ComplaintEvidenceSupport,
} from "./ComplaintEvidenceSupportPolicy";

export type AutomotiveComplaintEvidenceSource =
  | "deterministic-matcher"
  | "semantic-interpreter";

export type AutomotiveComplaintEvidence = {
  id: CanonicalEvidenceId;
  confidence: number;
  support: ComplaintEvidenceSupport;
  source: AutomotiveComplaintEvidenceSource;
  sourceText: string;
};

export type AutomotiveComplaintInterpretation = {
  originalText: string;
  evidenceIds: CanonicalEvidenceId[];
  evidences: AutomotiveComplaintEvidence[];
  requiresConfirmation: boolean;
};

export type AutomotiveComplaintEvidenceCandidate = {
  id: string;
  confidence: number;
  support?: ComplaintEvidenceSupport;
  source: AutomotiveComplaintEvidenceSource;
  sourceText: string;
};

function normalizeConfidence(
  confidence: number,
): number {
  if (
    !Number.isFinite(
      confidence,
    )
  ) {
    return 0;
  }

  return Math.min(
    1,
    Math.max(
      0,
      confidence,
    ),
  );
}

export function validateAutomotiveComplaintEvidence(
  candidate: AutomotiveComplaintEvidenceCandidate,
): AutomotiveComplaintEvidence | null {
  if (
    !isCanonicalEvidenceId(
      candidate.id,
    )
  ) {
    return null;
  }

  const support =
    candidate.support ??
    (
      candidate.source ===
        "deterministic-matcher"
        ? "normalized"
        : null
    );

  if (support === null) {
    return null;
  }

  return {
    id:
      candidate.id,

    confidence:
      normalizeConfidence(
        candidate.confidence,
      ),

    support,

    source:
      candidate.source,

    sourceText:
      candidate.sourceText,
  };
}

export function createAutomotiveComplaintInterpretation(
  originalText: string,
  candidates: AutomotiveComplaintEvidenceCandidate[],
): AutomotiveComplaintInterpretation {
  const validated =
    candidates
      .map(
        validateAutomotiveComplaintEvidence,
      )
      .filter(
        (
          evidence,
        ): evidence is AutomotiveComplaintEvidence =>
          evidence !== null,
      );

  const evidenceIds =
    Array.from(
      new Set(
        validated.map(
          (evidence) =>
            evidence.id,
        ),
      ),
    );

  return {
    originalText,
    evidenceIds,
    evidences:
      validated,
    requiresConfirmation:
      evidenceIds.length === 0,
  };
}