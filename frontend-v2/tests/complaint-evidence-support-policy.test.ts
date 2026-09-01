import {
  describe,
  expect,
  it,
} from "vitest";

import {
  evaluateComplaintEvidenceSupport,
  isComplaintEvidenceSupport,
} from "../lib/ai/ComplaintEvidenceSupportPolicy";

describe(
  "ComplaintEvidenceSupportPolicy",
  () => {

    it(
      "allows explicit client evidence",
      () => {

        expect(
          evaluateComplaintEvidenceSupport(
            "explicit",
          ),
        ).toEqual({
          support:
            "explicit",

          canAutoAdmit:
            true,

          requiresConfirmation:
            false,
        });
      },
    );

    it(
      "allows normalized evidence preserving client meaning",
      () => {

        expect(
          evaluateComplaintEvidenceSupport(
            "normalized",
          ),
        ).toEqual({
          support:
            "normalized",

          canAutoAdmit:
            true,

          requiresConfirmation:
            false,
        });
      },
    );

    it(
      "blocks inferred evidence from automatic admission",
      () => {

        expect(
          evaluateComplaintEvidenceSupport(
            "inferred",
          ),
        ).toEqual({
          support:
            "inferred",

          canAutoAdmit:
            false,

          requiresConfirmation:
            true,
        });
      },
    );

    it(
      "recognizes only supported provenance levels",
      () => {

        expect(
          isComplaintEvidenceSupport(
            "explicit",
          ),
        ).toBe(true);

        expect(
          isComplaintEvidenceSupport(
            "normalized",
          ),
        ).toBe(true);

        expect(
          isComplaintEvidenceSupport(
            "inferred",
          ),
        ).toBe(true);

        expect(
          isComplaintEvidenceSupport(
            "guessed",
          ),
        ).toBe(false);

        expect(
          isComplaintEvidenceSupport(
            undefined,
          ),
        ).toBe(false);
      },
    );

    it(
      "does not let confidence override inference policy",
      () => {

        const semanticCandidate = {
          id:
            "observation-battery-voltage-low",

          confidence:
            0.99,

          support:
            "inferred" as const,
        };

        const decision =
          evaluateComplaintEvidenceSupport(
            semanticCandidate.support,
          );

        expect(
          semanticCandidate.confidence,
        ).toBeGreaterThanOrEqual(
          0.90,
        );

        expect(
          decision.canAutoAdmit,
        ).toBe(false);

        expect(
          decision.requiresConfirmation,
        ).toBe(true);
      },
    );

  },
);