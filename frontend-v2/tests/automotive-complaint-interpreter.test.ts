import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createAutomotiveComplaintInterpretation,
  validateAutomotiveComplaintEvidence,
} from "../lib/ai/AutomotiveComplaintInterpreter";

describe(
  "AutomotiveComplaintInterpreter contract",
  () => {
    it(
      "accepts canonical evidence ids",
      () => {
        const result =
          validateAutomotiveComplaintEvidence({
            id: "symptom-single-click",
            confidence: 0.93,
            support:
                  "explicit",
                source: "semantic-interpreter",
            sourceText:
              "j'entends un seul clic",
          });

        expect(
          result,
        ).toEqual({
          id: "symptom-single-click",
          confidence: 0.93,
          support:
                  "explicit",
                source: "semantic-interpreter",
          sourceText:
            "j'entends un seul clic",
        });
      },
    );

    it(
      "rejects non canonical evidence ids",
      () => {
        expect(
          validateAutomotiveComplaintEvidence({
            id: "symptom-single-click-start",
            confidence: 0.95,
            support:
                  "explicit",
                source: "semantic-interpreter",
            sourceText:
              "un seul clic",
          }),
        ).toBeNull();

        expect(
          validateAutomotiveComplaintEvidence({
            id: "invented-by-ai",
            confidence: 0.99,
            support:
                  "explicit",
                source: "semantic-interpreter",
            sourceText:
              "texte quelconque",
          }),
        ).toBeNull();
      },
    );

    it(
      "clamps confidence between zero and one",
      () => {
        const tooHigh =
          validateAutomotiveComplaintEvidence({
            id: "symptom-no-start",
            confidence: 4.2,
            support:
                  "explicit",
                source: "semantic-interpreter",
            sourceText:
              "la voiture ne demarre pas",
          });

        const tooLow =
          validateAutomotiveComplaintEvidence({
            id: "symptom-no-crank",
            confidence: -3,
            source: "deterministic-matcher",
            sourceText:
              "le moteur ne tourne pas",
          });

        expect(
          tooHigh?.confidence,
        ).toBe(1);

        expect(
          tooLow?.confidence,
        ).toBe(0);
      },
    );

    it(
      "requires confirmation when no valid evidence survives",
      () => {
        const result =
          createAutomotiveComplaintInterpretation(
            "texte incompris",
            [
              {
                id: "invented-by-ai",
                confidence: 0.99,
                support:
                  "explicit",
                source:
                  "semantic-interpreter",
                sourceText:
                  "texte incompris",
              },
            ],
          );

        expect(
          result.evidenceIds,
        ).toEqual([]);

        expect(
          result.evidences,
        ).toEqual([]);

        expect(
          result.requiresConfirmation,
        ).toBe(true);
      },
    );

    it(
      "deduplicates evidence ids while preserving provenance",
      () => {
        const result =
          createAutomotiveComplaintInterpretation(
            "un clic au demarrage",
            [
              {
                id: "symptom-single-click",
                confidence: 0.92,
                source:
                  "deterministic-matcher",
                sourceText:
                  "un clic au demarrage",
              },
              {
                id: "symptom-single-click",
                confidence: 0.96,
                support:
                  "explicit",
                source:
                  "semantic-interpreter",
                sourceText:
                  "un clic au demarrage",
              },
            ],
          );

        expect(
          result.evidenceIds,
        ).toEqual([
          "symptom-single-click",
        ]);

        expect(
          result.evidences,
        ).toHaveLength(2);

        expect(
          result.requiresConfirmation,
        ).toBe(false);
      },
    );
  },
);