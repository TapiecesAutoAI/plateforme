import {
  describe,
  expect,
  it,
} from "vitest";

import {
  areCanonicalEvidencesConflicting,
  canonicalEvidenceConflicts,
  findCanonicalEvidenceConflict,
  findConflictsAmongCanonicalEvidences,
} from "../engine/evidence/CanonicalEvidenceConflictRegistry";

describe(
  "CanonicalEvidenceConflictRegistry",
  () => {

    it(
      "declares battery low versus battery normal as conflicting",
      () => {

        expect(
          areCanonicalEvidencesConflicting(
            "observation-battery-voltage-low",
            "observation-battery-voltage-normal",
          ),
        ).toBe(true);
      },
    );

    it(
      "is symmetrical",
      () => {

        expect(
          areCanonicalEvidencesConflicting(
            "observation-battery-voltage-normal",
            "observation-battery-voltage-low",
          ),
        ).toBe(true);
      },
    );

    it(
      "declares jump-start success versus failure as conflicting",
      () => {

        expect(
          areCanonicalEvidencesConflicting(
            "observation-jump-start-success",
            "observation-jump-start-fails",
          ),
        ).toBe(true);
      },
    );

    it(
      "declares starter control voltage present versus absent as conflicting",
      () => {

        expect(
          areCanonicalEvidencesConflicting(
            "observation-starter-control-voltage-present",
            "observation-starter-control-voltage-absent",
          ),
        ).toBe(true);
      },
    );

    it(
      "declares normal lights versus strongly dimmed lights as conflicting",
      () => {

        expect(
          areCanonicalEvidencesConflicting(
            "observation-lights-stay-normal",
            "observation-lights-dim-strongly",
          ),
        ).toBe(true);
      },
    );

    it(
      "declares normal lights versus slightly dimmed lights as conflicting",
      () => {

        expect(
          areCanonicalEvidencesConflicting(
            "observation-lights-stay-normal",
            "observation-lights-dim-slightly",
          ),
        ).toBe(true);
      },
    );

    it(
      "does not treat additive symptoms as conflicts",
      () => {

        expect(
          areCanonicalEvidencesConflicting(
            "symptom-no-start",
            "symptom-single-click",
          ),
        ).toBe(false);

        expect(
          areCanonicalEvidencesConflicting(
            "symptom-no-start",
            "observation-lights-dim-strongly",
          ),
        ).toBe(false);
      },
    );

    it(
      "does not mark an evidence as conflicting with itself",
      () => {

        expect(
          areCanonicalEvidencesConflicting(
            "symptom-single-click",
            "symptom-single-click",
          ),
        ).toBe(false);
      },
    );

    it(
      "returns conflict metadata",
      () => {

        const conflict =
          findCanonicalEvidenceConflict(
            "observation-battery-voltage-low",
            "observation-battery-voltage-normal",
          );

        expect(
          conflict,
        ).not.toBeNull();

        expect(
          conflict?.reason.length,
        ).toBeGreaterThan(0);
      },
    );

    it(
      "finds all explicit conflicts inside a set of evidences",
      () => {

        const conflicts =
          findConflictsAmongCanonicalEvidences([
            "symptom-no-start",
            "observation-battery-voltage-low",
            "observation-battery-voltage-normal",
            "observation-lights-stay-normal",
            "observation-lights-dim-strongly",
          ]);

        expect(
          conflicts,
        ).toHaveLength(2);
      },
    );

    it(
      "contains only the deliberately explicit conflict pairs",
      () => {

        expect(
          canonicalEvidenceConflicts,
        ).toHaveLength(5);
      },
    );

  },
);