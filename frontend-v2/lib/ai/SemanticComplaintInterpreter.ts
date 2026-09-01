import {
  createAutomotiveComplaintInterpretation,
} from "./AutomotiveComplaintInterpreter";

import type {
  AutomotiveComplaintEvidenceCandidate,
  AutomotiveComplaintInterpretation,
} from "./AutomotiveComplaintInterpreter";

import {
  isComplaintEvidenceSupport,
} from "./ComplaintEvidenceSupportPolicy";

type UnknownRecord =
  Record<string, unknown>;

export type SemanticComplaintRawEvidence = {
  id:
    unknown;

  confidence:
    unknown;

  support:
    unknown;
};

export type SemanticComplaintRawResponse = {
  evidences:
    unknown;
};

function isRecord(
  value:
    unknown,
): value is UnknownRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function parseConfidence(
  value:
    unknown,
): number | null {

  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return null;
  }

  return Math.min(
    1,
    Math.max(
      0,
      value,
    ),
  );
}

function parseRawEvidence(
  value:
    unknown,
  sourceText:
    string,
): AutomotiveComplaintEvidenceCandidate | null {

  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.id !== "string" ||
    value.id.trim().length === 0
  ) {
    return null;
  }

  const confidence =
    parseConfidence(
      value.confidence,
    );

  if (confidence === null) {
    return null;
  }

  if (
    !isComplaintEvidenceSupport(
      value.support,
    )
  ) {
    return null;
  }

  return {
    id:
      value.id.trim(),

    confidence,

    support:
      value.support,

    source:
      "semantic-interpreter",

    sourceText,
  };
}

export function interpretSemanticComplaintResponse(
  originalText:
    string,
  rawResponse:
    unknown,
): AutomotiveComplaintInterpretation {

  if (!isRecord(rawResponse)) {
    return createAutomotiveComplaintInterpretation(
      originalText,
      [],
    );
  }

  if (
    !Array.isArray(
      rawResponse.evidences,
    )
  ) {
    return createAutomotiveComplaintInterpretation(
      originalText,
      [],
    );
  }

  const candidates:
    AutomotiveComplaintEvidenceCandidate[] =
    rawResponse.evidences
      .map(
        rawEvidence =>
          parseRawEvidence(
            rawEvidence,
            originalText,
          ),
      )
      .filter(
        (
          candidate,
        ): candidate is AutomotiveComplaintEvidenceCandidate =>
          candidate !== null,
      );

  return createAutomotiveComplaintInterpretation(
    originalText,
    candidates,
  );
}