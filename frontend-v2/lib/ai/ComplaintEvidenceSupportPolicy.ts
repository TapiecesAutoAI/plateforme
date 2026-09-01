export type ComplaintEvidenceSupport =
  | "explicit"
  | "normalized"
  | "inferred";

export type ComplaintEvidenceSupportDecision = {
  support:
    ComplaintEvidenceSupport;

  canAutoAdmit:
    boolean;

  requiresConfirmation:
    boolean;
};

export function evaluateComplaintEvidenceSupport(
  support:
    ComplaintEvidenceSupport,
): ComplaintEvidenceSupportDecision {

  switch (support) {

    case "explicit":
    case "normalized":

      return {
        support,
        canAutoAdmit:
          true,
        requiresConfirmation:
          false,
      };

    case "inferred":

      return {
        support,
        canAutoAdmit:
          false,
        requiresConfirmation:
          true,
      };

  }
}

export function isComplaintEvidenceSupport(
  value:
    unknown,
): value is ComplaintEvidenceSupport {

  return (
    value === "explicit" ||
    value === "normalized" ||
    value === "inferred"
  );
}