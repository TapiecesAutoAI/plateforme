import {
  describe,
  expect,
  it,
} from "vitest";

import {
  bridgeLegacyEvidenceId,
} from "../engine/evidence/LegacyEvidenceBridge";

describe(
  "LegacyEvidenceBridge",
  () => {
    it(
      "passes canonical evidence ids through unchanged",
      () => {
        expect(
          bridgeLegacyEvidenceId(
            "symptom-single-click",
          ),
        ).toBe(
          "symptom-single-click",
        );

        expect(
          bridgeLegacyEvidenceId(
            "observation-lights-stay-normal",
          ),
        ).toBe(
          "observation-lights-stay-normal",
        );
      },
    );

    it(
      "bridges safe legacy ids to canonical V2 ids",
      () => {
        const cases = [
          [
            "symptom-single-click-start",
            "symptom-single-click",
          ],
          [
            "symptom-rapid-clicking-start",
            "symptom-rapid-clicking",
          ],
          [
            "symptom-metallic-grinding-start",
            "symptom-metallic-grinding",
          ],
          [
            "symptom-starter-intermittent",
            "observation-starts-intermittently",
          ],
          [
            "observation-control-voltage-present",
            "observation-starter-control-voltage-present",
          ],
          [
            "observation-no-control-voltage-starter",
            "observation-starter-control-voltage-absent",
          ],
          [
            "observation-full-lights",
            "observation-lights-stay-normal",
          ],
          [
            "observation-jump-start-no-effect",
            "observation-jump-start-fails",
          ],
        ] as const;

        for (
          const [
            legacyId,
            canonicalId,
          ] of cases
        ) {
          expect(
            bridgeLegacyEvidenceId(
              legacyId,
            ),
          ).toBe(
            canonicalId,
          );
        }
      },
    );

    it(
      "does not bridge ambiguous light dimming evidence",
      () => {
        expect(
          bridgeLegacyEvidenceId(
            "observation-dim-lights",
          ),
        ).toBeNull();
      },
    );

    it(
      "rejects unknown evidence ids",
      () => {
        expect(
          bridgeLegacyEvidenceId(
            "invented-by-ai",
          ),
        ).toBeNull();

        expect(
          bridgeLegacyEvidenceId(
            "symptom-unknown-future-problem",
          ),
        ).toBeNull();
      },
    );
  },
);