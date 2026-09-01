import type {
  AutomotiveComplaintEvidence,
  AutomotiveComplaintInterpretation,
} from "./AutomotiveComplaintInterpreter";

export type ComplaintEvidenceAgreement =
  | "agreement"
  | "deterministic-only"
  | "semantic-only";

export type ComparedComplaintEvidence =
  AutomotiveComplaintEvidence & {
    agreement:
      ComplaintEvidenceAgreement;
  };

export type ComplaintInterpretationComparison = {
  evidenceIds:
    AutomotiveComplaintInterpretation["evidenceIds"];

  evidences:
    ComparedComplaintEvidence[];

  requiresConfirmation:
    boolean;
};

const SEMANTIC_AUTO_ACCEPT_CONFIDENCE =
  0.9;

function selectPreferredEvidence(
  deterministicEvidence:
    AutomotiveComplaintEvidence | undefined,
  semanticEvidence:
    AutomotiveComplaintEvidence | undefined,
): ComparedComplaintEvidence | null {

  if (
    deterministicEvidence &&
    semanticEvidence
  ) {
    return {
      ...(
        deterministicEvidence.confidence >=
        semanticEvidence.confidence
          ? deterministicEvidence
          : semanticEvidence
      ),
      agreement:
        "agreement",
    };
  }

  if (deterministicEvidence) {
    return {
      ...deterministicEvidence,
      agreement:
        "deterministic-only",
    };
  }

  if (semanticEvidence) {
    return {
      ...semanticEvidence,
      agreement:
        "semantic-only",
    };
  }

  return null;
}

export function compareComplaintInterpretations(
  deterministic:
    AutomotiveComplaintInterpretation,
  semantic:
    AutomotiveComplaintInterpretation,
): ComplaintInterpretationComparison {

  const allEvidenceIds =
    Array.from(
      new Set([
        ...deterministic.evidenceIds,
        ...semantic.evidenceIds,
      ]),
    );

  const evidences:
    ComparedComplaintEvidence[] = [];

  let requiresConfirmation =
    false;

  for (const evidenceId of allEvidenceIds) {

    const deterministicEvidence =
      deterministic.evidences.find(
        evidence =>
          evidence.id ===
          evidenceId,
      );

    const semanticEvidence =
      semantic.evidences.find(
        evidence =>
          evidence.id ===
          evidenceId,
      );

    const selected =
      selectPreferredEvidence(
        deterministicEvidence,
        semanticEvidence,
      );

    if (selected === null) {
      continue;
    }

    evidences.push(
      selected,
    );

    if (
      selected.agreement ===
        "semantic-only" &&
      (
        selected.support ===
          "inferred" ||
        selected.confidence <
          SEMANTIC_AUTO_ACCEPT_CONFIDENCE
      )
    ) {
      requiresConfirmation =
        true;
    }
  }

  return {
    evidenceIds:
      evidences.map(
        evidence =>
          evidence.id,
      ),

    evidences,

    requiresConfirmation,
  };
}