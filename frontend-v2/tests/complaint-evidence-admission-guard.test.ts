import {
  describe,
  expect,
  it,
} from "vitest";

import {
  admitComplaintEvidences,
} from "../lib/ai/ComplaintEvidenceAdmissionGuard";

import type {
  ComplaintInterpretationComparison,
} from "../lib/ai/ComplaintInterpretationComparator";

function createComparison(
  overrides:
    Partial<ComplaintInterpretationComparison> = {},
): ComplaintInterpretationComparison {

  return {
    evidenceIds:
      [],

    evidences:
      [],

    requiresConfirmation:
      false,

    ...overrides,
  };
}

describe(
  "ComplaintEvidenceAdmissionGuard",
  () => {

    it(
      "admits evidence confirmed by both interpreters",
      () => {

        const result =
          admitComplaintEvidences(
            createComparison({
              evidenceIds: [
                "symptom-single-click",
              ],

              evidences: [
                {
                  id:
                    "symptom-single-click",
                  confidence:
                    0.96,
                  support:
                    "explicit",
                  source:
                    "semantic-interpreter",
                  sourceText:
                    "clic",
                  agreement:
                    "agreement",
                },
              ],
            }),
          );

        expect(
          result.admittedEvidenceIds,
        ).toEqual([
          "symptom-single-click",
        ]);

        expect(
          result.requiresConfirmation,
        ).toBe(false);
      },
    );

    it(
      "admits deterministic-only evidence",
      () => {

        const result =
          admitComplaintEvidences(
            createComparison({
              evidenceIds: [
                "symptom-no-start",
              ],

              evidences: [
                {
                  id:
                    "symptom-no-start",
                  confidence:
                    0.85,
                  support:
                    "normalized",
                  source:
                    "deterministic-matcher",
                  sourceText:
                    "ne demarre pas",
                  agreement:
                    "deterministic-only",
                },
              ],
            }),
          );

        expect(
          result.admittedEvidenceIds,
        ).toEqual([
          "symptom-no-start",
        ]);
      },
    );

    it(
      "admits high-confidence semantic-only evidence",
      () => {

        const result =
          admitComplaintEvidences(
            createComparison({
              evidenceIds: [
                "symptom-single-click",
              ],

              evidences: [
                {
                  id:
                    "symptom-single-click",
                  confidence:
                    0.95,
                  support:
                    "explicit",
                  source:
                    "semantic-interpreter",
                  sourceText:
                    "bir click",
                  agreement:
                    "semantic-only",
                },
              ],
            }),
          );

        expect(
          result.admittedEvidenceIds,
        ).toEqual([
          "symptom-single-click",
        ]);

        expect(
          result.requiresConfirmation,
        ).toBe(false);
      },
    );

    it(
      "blocks low-confidence semantic-only evidence",
      () => {

        const result =
          admitComplaintEvidences(
            createComparison({
              evidenceIds: [
                "symptom-single-click",
              ],

              evidences: [
                {
                  id:
                    "symptom-single-click",
                  confidence:
                    0.72,
                  support:
                    "explicit",
                  source:
                    "semantic-interpreter",
                  sourceText:
                    "texte ambigu",
                  agreement:
                    "semantic-only",
                },
              ],
            }),
          );

        expect(
          result.admittedEvidenceIds,
        ).toEqual([]);

        expect(
          result.admissions[0]
            ?.decision,
        ).toBe(
          "confirmation-required",
        );

        expect(
          result.requiresConfirmation,
        ).toBe(true);
      },
    );

    it(
      "preserves comparison confirmation requirement",
      () => {

        const result =
          admitComplaintEvidences(
            createComparison({
              requiresConfirmation:
                true,
            }),
          );

        expect(
          result.requiresConfirmation,
        ).toBe(true);
      },
    );

    it(
      "deduplicates admitted evidence ids",
      () => {

        const result =
          admitComplaintEvidences(
            createComparison({
              evidenceIds: [
                "symptom-single-click",
              ],

              evidences: [
                {
                  id:
                    "symptom-single-click",
                  confidence:
                    0.92,
                  support:
                    "normalized",
                  source:
                    "deterministic-matcher",
                  sourceText:
                    "clic",
                  agreement:
                    "deterministic-only",
                },
                {
                  id:
                    "symptom-single-click",
                  confidence:
                    0.95,
                  support:
                    "explicit",
                  source:
                    "semantic-interpreter",
                  sourceText:
                    "clic",
                  agreement:
                    "agreement",
                },
              ],
            }),
          );

        expect(
          result.admittedEvidenceIds,
        ).toEqual([
          "symptom-single-click",
        ]);
      },
    );

  },
);
describe(
  "ComplaintEvidenceAdmissionGuard support policy",
  () => {

    it(
      "blocks inferred semantic-only evidence even at very high confidence",
      () => {

        const result =
          admitComplaintEvidences(
            createComparison({
              evidenceIds: [
                "observation-battery-voltage-low",
              ],

              evidences: [
                {
                  id:
                    "observation-battery-voltage-low",

                  confidence:
                    0.99,

                  support:
                    "inferred",

                  source:
                    "semantic-interpreter",

                  sourceText:
                    "elle ne demarre pas",

                  agreement:
                    "semantic-only",
                },
              ],
            }),
          );

        expect(
          result.admittedEvidenceIds,
        ).toEqual([]);

        expect(
          result.admissions[0]
            ?.decision,
        ).toBe(
          "confirmation-required",
        );

        expect(
          result.requiresConfirmation,
        ).toBe(true);
      },
    );

    it(
      "admits normalized high-confidence semantic-only evidence",
      () => {

        const result =
          admitComplaintEvidences(
            createComparison({
              evidenceIds: [
                "symptom-single-click",
              ],

              evidences: [
                {
                  id:
                    "symptom-single-click",

                  confidence:
                    0.95,

                  support:
                    "normalized",

                  source:
                    "semantic-interpreter",

                  sourceText:
                    "bir click",

                  agreement:
                    "semantic-only",
                },
              ],
            }),
          );

        expect(
          result.admittedEvidenceIds,
        ).toEqual([
          "symptom-single-click",
        ]);

        expect(
          result.requiresConfirmation,
        ).toBe(false);
      },
    );

    it(
      "admits agreement when deterministic evidence independently confirms an inferred semantic fact",
      () => {

        const result =
          admitComplaintEvidences(
            createComparison({
              evidenceIds: [
                "symptom-single-click",
              ],

              evidences: [
                {
                  id:
                    "symptom-single-click",

                  confidence:
                    0.99,

                  support:
                    "inferred",

                  source:
                    "semantic-interpreter",

                  sourceText:
                    "clic",

                  agreement:
                    "agreement",
                },
              ],
            }),
          );

        expect(
          result.admittedEvidenceIds,
        ).toEqual([
          "symptom-single-click",
        ]);

        expect(
          result.requiresConfirmation,
        ).toBe(false);
      },
    );

  },
);