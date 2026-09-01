import {
  describe,
  expect,
  it,
} from "vitest";

import {
  guardComplaintEvidenceConflicts,
} from "../lib/ai/ComplaintEvidenceConflictGuard";

import type {
  ComplaintEvidenceAdmissionResult,
} from "../lib/ai/ComplaintEvidenceAdmissionGuard";

function createAdmission(
  evidenceIds:
    ComplaintEvidenceAdmissionResult[
      "admittedEvidenceIds"
    ],

  requiresConfirmation =
    false,
): ComplaintEvidenceAdmissionResult {

  return {
    admittedEvidenceIds:
      evidenceIds,

    admissions:
      [],

    requiresConfirmation,
  };
}

describe(
  "ComplaintEvidenceConflictGuard",
  () => {

    it(
      "keeps compatible evidences",
      () => {

        const result =
          guardComplaintEvidenceConflicts(
            createAdmission([
              "symptom-no-start",
              "symptom-single-click",
              "observation-lights-dim-strongly",
            ]),
          );

        expect(
          result.admittedEvidenceIds,
        ).toEqual([
          "symptom-no-start",
          "symptom-single-click",
          "observation-lights-dim-strongly",
        ]);

        expect(
          result.blockedEvidenceIds,
        ).toEqual([]);

        expect(
          result.conflicts,
        ).toEqual([]);

        expect(
          result.requiresConfirmation,
        ).toBe(false);
      },
    );

    it(
      "blocks both sides of a battery voltage conflict",
      () => {

        const result =
          guardComplaintEvidenceConflicts(
            createAdmission([
              "symptom-no-start",
              "observation-battery-voltage-low",
              "observation-battery-voltage-normal",
            ]),
          );

        expect(
          result.admittedEvidenceIds,
        ).toEqual([
          "symptom-no-start",
        ]);

        expect(
          result.blockedEvidenceIds,
        ).toContain(
          "observation-battery-voltage-low",
        );

        expect(
          result.blockedEvidenceIds,
        ).toContain(
          "observation-battery-voltage-normal",
        );

        expect(
          result.requiresConfirmation,
        ).toBe(true);
      },
    );

    it(
      "blocks both sides of a lights conflict",
      () => {

        const result =
          guardComplaintEvidenceConflicts(
            createAdmission([
              "observation-lights-stay-normal",
              "observation-lights-dim-strongly",
            ]),
          );

        expect(
          result.admittedEvidenceIds,
        ).toEqual([]);

        expect(
          result.blockedEvidenceIds,
        ).toHaveLength(2);

        expect(
          result.conflicts,
        ).toHaveLength(1);

        expect(
          result.requiresConfirmation,
        ).toBe(true);
      },
    );

    it(
      "blocks all evidences participating in multiple conflicts",
      () => {

        const result =
          guardComplaintEvidenceConflicts(
            createAdmission([
              "symptom-no-start",

              "observation-battery-voltage-low",
              "observation-battery-voltage-normal",

              "observation-jump-start-success",
              "observation-jump-start-fails",
            ]),
          );

        expect(
          result.admittedEvidenceIds,
        ).toEqual([
          "symptom-no-start",
        ]);

        expect(
          result.blockedEvidenceIds,
        ).toHaveLength(4);

        expect(
          result.conflicts,
        ).toHaveLength(2);

        expect(
          result.requiresConfirmation,
        ).toBe(true);
      },
    );

    it(
      "preserves an existing confirmation requirement",
      () => {

        const result =
          guardComplaintEvidenceConflicts(
            createAdmission(
              [
                "symptom-single-click",
              ],
              true,
            ),
          );

        expect(
          result.admittedEvidenceIds,
        ).toEqual([
          "symptom-single-click",
        ]);

        expect(
          result.conflicts,
        ).toEqual([]);

        expect(
          result.requiresConfirmation,
        ).toBe(true);
      },
    );

    it(
      "does not invent a conflict between no-start and single-click",
      () => {

        const result =
          guardComplaintEvidenceConflicts(
            createAdmission([
              "symptom-no-start",
              "symptom-single-click",
            ]),
          );

        expect(
          result.admittedEvidenceIds,
        ).toEqual([
          "symptom-no-start",
          "symptom-single-click",
        ]);

        expect(
          result.requiresConfirmation,
        ).toBe(false);
      },
    );

    it(
      "deduplicates blocked evidence ids naturally",
      () => {

        const result =
          guardComplaintEvidenceConflicts(
            createAdmission([
              "observation-lights-stay-normal",
              "observation-lights-dim-strongly",
              "observation-lights-dim-slightly",
            ]),
          );

        expect(
          result.conflicts,
        ).toHaveLength(2);

        expect(
          result.blockedEvidenceIds,
        ).toHaveLength(3);

        expect(
          new Set(
            result.blockedEvidenceIds,
          ).size,
        ).toBe(3);
      },
    );

  },
);