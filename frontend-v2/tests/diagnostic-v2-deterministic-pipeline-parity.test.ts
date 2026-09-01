import {
  describe,
  expect,
  it,
} from "vitest";

import {
  interpretComplaintDeterministically,
} from "../lib/ai/DeterministicComplaintInterpreter";

describe(
  "Diagnostic V2 deterministic pipeline parity",
  () => {
    const cases = [
      {
        text:
          "ma voiture ne démarre pas et j'entends 1 clic",
        expected: [
          "symptom-no-start",
          "symptom-single-click",
        ],
      },
      {
        text:
          "j'entends plusieurs clics rapides quand j'essaie de démarrer",
        expected: [
          "symptom-rapid-clicking",
        ],
      },
      {
        text:
          "bruit metallique au demarrage",
        expected: [
          "symptom-metallic-grinding",
        ],
      },
      {
        text:
          "elle démarre une fois sur deux",
        expected: [
          "observation-starts-intermittently",
        ],
      },
      {
        text:
          "les phares restent normaux quand j'essaie de démarrer",
        expected: [
          "observation-lights-stay-normal",
        ],
      },
      {
        text:
          "le booster ne change rien",
        expected: [
          "observation-jump-start-fails",
        ],
      },
    ] as const;

    for (
      const testCase of cases
    ) {
      it(
        `canonicalizes: ${testCase.text}`,
        () => {
          const result =
            interpretComplaintDeterministically(
              testCase.text,
            );

          for (
            const expectedId
            of testCase.expected
          ) {
            expect(
              result.evidenceIds,
            ).toContain(
              expectedId,
            );
          }
        },
      );
    }

    it(
      "never exposes known legacy ids to DiagnosticEngineV2",
      () => {
        const result =
          interpretComplaintDeterministically(
            "ma voiture ne démarre pas, j'entends 1 clic et le booster ne change rien",
          );

        const forbiddenLegacyIds = [
          "symptom-single-click-start",
          "symptom-rapid-clicking-start",
          "symptom-metallic-grinding-start",
          "symptom-starter-intermittent",
          "observation-control-voltage-present",
          "observation-no-control-voltage-starter",
          "observation-full-lights",
          "observation-jump-start-no-effect",
        ];

        for (
          const evidenceId
          of result.evidenceIds
        ) {
          expect(
            forbiddenLegacyIds,
          ).not.toContain(
            evidenceId,
          );
        }

        expect(
          result.evidenceIds,
        ).toContain(
          "symptom-no-start",
        );

        expect(
          result.evidenceIds,
        ).toContain(
          "symptom-single-click",
        );

        expect(
          result.evidenceIds,
        ).toContain(
          "observation-jump-start-fails",
        );
      },
    );

    it(
      "does not invent a strong or slight dimming level from ambiguous wording",
      () => {
        const result =
          interpretComplaintDeterministically(
            "les phares diminuent quand je démarre",
          );

        expect(
          result.evidenceIds,
        ).not.toContain(
          "observation-lights-dim-strongly",
        );

        expect(
          result.evidenceIds,
        ).not.toContain(
          "observation-lights-dim-slightly",
        );
      },
    );
  },
);