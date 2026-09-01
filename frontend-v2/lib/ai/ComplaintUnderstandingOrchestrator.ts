import {
  interpretComplaintDeterministically,
} from "./DeterministicComplaintInterpreter";

import {
  interpretSemanticComplaintResponse,
} from "./SemanticComplaintInterpreter";

import {
  compareComplaintInterpretations,
} from "./ComplaintInterpretationComparator";

import {
  admitComplaintEvidences,
} from "./ComplaintEvidenceAdmissionGuard";

import {
  guardComplaintEvidenceConflicts,
} from "./ComplaintEvidenceConflictGuard";

import type {
  AutomotiveComplaintInterpretation,
} from "./AutomotiveComplaintInterpreter";

import type {
  ComplaintInterpretationComparison,
} from "./ComplaintInterpretationComparator";

import type {
  ComplaintEvidenceAdmissionResult,
} from "./ComplaintEvidenceAdmissionGuard";

import type {
  ComplaintEvidenceConflictGuardResult,
} from "./ComplaintEvidenceConflictGuard";

export type ComplaintUnderstandingInput = {
  originalText:
    string;

  deterministicText:
    string;

  semanticResponse?:
    unknown;
};

export type ComplaintUnderstandingResult = {
  originalText:
    string;

  deterministicText:
    string;

  deterministic:
    AutomotiveComplaintInterpretation;

  semantic:
    AutomotiveComplaintInterpretation;

  comparison:
    ComplaintInterpretationComparison;

  admission:
    ComplaintEvidenceAdmissionResult;

  conflictGuard:
    ComplaintEvidenceConflictGuardResult;
};

export function understandAutomotiveComplaint(
  input:
    ComplaintUnderstandingInput,
): ComplaintUnderstandingResult {

  const deterministic =
    interpretComplaintDeterministically(
      input.deterministicText,
    );

  const semantic =
    interpretSemanticComplaintResponse(
      input.originalText,
      input.semanticResponse ?? {
        evidences: [],
      },
    );

  const comparison =
    compareComplaintInterpretations(
      deterministic,
      semantic,
    );

  const admission =
    admitComplaintEvidences(
      comparison,
    );

  const conflictGuard =
    guardComplaintEvidenceConflicts(
      admission,
    );

  return {
    originalText:
      input.originalText,

    deterministicText:
      input.deterministicText,

    deterministic,

    semantic,

    comparison,
    admission,
    conflictGuard,
  };
}