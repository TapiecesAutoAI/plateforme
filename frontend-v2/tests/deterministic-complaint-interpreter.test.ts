import {
  describe,
  expect,
  it,
} from "vitest";

import {
  interpretComplaintDeterministically,
} from "../lib/ai/DeterministicComplaintInterpreter";

describe(
  "DeterministicComplaintInterpreter",
  () => {
    it(
      "maps a single-click complaint to canonical evidence",
      () => {
        const result =
          interpretComplaintDeterministically(
            "ma voiture ne démarre pas et j'entends 1 clic",
          );

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
      },
    );

    it(
      "maps rapid clicking to canonical evidence",
      () => {
        const result =
          interpretComplaintDeterministically(
            "j'entends plusieurs clics rapides quand j'essaie de démarrer",
          );

        expect(
          result.evidenceIds,
        ).toContain(
          "symptom-rapid-clicking",
        );
      },
    );

    it(
      "maps normal lights to canonical evidence",
      () => {
        const result =
          interpretComplaintDeterministically(
            "les phares restent normaux quand j'essaie de démarrer",
          );

        expect(
          result.evidenceIds,
        ).toContain(
          "observation-lights-stay-normal",
        );
      },
    );

    it(
      "does not blindly map ambiguous dim-light evidence",
      () => {
        const result =
          interpretComplaintDeterministically(
            "les phares diminuent quand j'essaie de démarrer",
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

    it(
      "preserves deterministic provenance",
      () => {
        const text =
          "j'entends un seul clic au démarrage";

        const result =
          interpretComplaintDeterministically(
            text,
          );

        expect(
          result.evidences.some(
            (evidence) =>
              evidence.id ===
                "symptom-single-click" &&
              evidence.source ===
                "deterministic-matcher" &&
              evidence.sourceText ===
                text,
          ),
        ).toBe(true);
      },
    );
  },
);