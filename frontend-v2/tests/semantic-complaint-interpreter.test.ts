import {
  describe,
  expect,
  it,
} from "vitest";

import {
  interpretSemanticComplaintResponse,
} from "../lib/ai/SemanticComplaintInterpreter";

describe(
  "SemanticComplaintInterpreter",
  () => {

    it(
      "accepts a canonical semantic evidence",
      () => {

        const result =
          interpretSemanticComplaintResponse(
            "j'entends un clic",
            {
              evidences: [
                {
                  id:
                    "symptom-single-click",
                  confidence:
                    0.96,
                  support:
                    "explicit",
                },
              ],
            },
          );

        expect(
          result.evidenceIds,
        ).toEqual([
          "symptom-single-click",
        ]);

        expect(
          result.evidences[0]?.source,
        ).toBe(
          "semantic-interpreter",
        );

        expect(
          result.evidences[0]?.sourceText,
        ).toBe(
          "j'entends un clic",
        );
      },
    );

    it(
      "rejects an invented evidence id",
      () => {

        const result =
          interpretSemanticComplaintResponse(
            "texte",
            {
              evidences: [
                {
                  id:
                    "invented-by-model",
                  confidence:
                    0.99,
                  support:
                    "explicit",
                },
              ],
            },
          );

        expect(
          result.evidenceIds,
        ).toEqual([]);

        expect(
          result.requiresConfirmation,
        ).toBe(true);
      },
    );

    it(
      "rejects a legacy evidence id",
      () => {

        const result =
          interpretSemanticComplaintResponse(
            "clic",
            {
              evidences: [
                {
                  id:
                    "symptom-single-click-start",
                  confidence:
                    0.99,
                  support:
                    "explicit",
                },
              ],
            },
          );

        expect(
          result.evidenceIds,
        ).toEqual([]);
      },
    );

    it(
      "clamps semantic confidence above one",
      () => {

        const result =
          interpretSemanticComplaintResponse(
            "clic",
            {
              evidences: [
                {
                  id:
                    "symptom-single-click",
                  confidence:
                    8.5,
                  support:
                    "explicit",
                },
              ],
            },
          );

        expect(
          result.evidences[0]
            ?.confidence,
        ).toBe(1);
      },
    );

    it(
      "clamps semantic confidence below zero",
      () => {

        const result =
          interpretSemanticComplaintResponse(
            "clic",
            {
              evidences: [
                {
                  id:
                    "symptom-single-click",
                  confidence:
                    -2,
                  support:
                    "explicit",
                },
              ],
            },
          );

        expect(
          result.evidences[0]
            ?.confidence,
        ).toBe(0);
      },
    );

    it(
      "ignores model supplied source metadata",
      () => {

        const result =
          interpretSemanticComplaintResponse(
            "clic",
            {
              evidences: [
                {
                  id:
                    "symptom-single-click",
                  confidence:
                    0.95,
                  support:
                    "explicit",
                  source:
                    "deterministic-matcher",
                  sourceText:
                    "texte falsifie",
                },
              ],
            },
          );

        expect(
          result.evidences[0]?.source,
        ).toBe(
          "semantic-interpreter",
        );

        expect(
          result.evidences[0]?.sourceText,
        ).toBe(
          "clic",
        );
      },
    );

    it(
      "ignores malformed evidence entries",
      () => {

        const result =
          interpretSemanticComplaintResponse(
            "clic",
            {
              evidences: [
                null,
                "symptom-single-click",
                {
                  id:
                    123,
                  confidence:
                    0.9,
                },
                {
                  id:
                    "symptom-single-click",
                  confidence:
                    "0.9",
                },
              ],
            },
          );

        expect(
          result.evidenceIds,
        ).toEqual([]);
      },
    );

    it(
      "deduplicates valid semantic evidence ids",
      () => {

        const result =
          interpretSemanticComplaintResponse(
            "clic",
            {
              evidences: [
                {
                  id:
                    "symptom-single-click",
                  confidence:
                    0.91,
                  support:
                    "explicit",
                },
                {
                  id:
                    "symptom-single-click",
                  confidence:
                    0.97,
                  support:
                    "explicit",
                },
              ],
            },
          );

        expect(
          result.evidenceIds,
        ).toEqual([
          "symptom-single-click",
        ]);

        expect(
          result.evidences,
        ).toHaveLength(2);
      },
    );

    it(
      "fails closed when response structure is invalid",
      () => {

        const invalidResponses =
          [
            null,
            "invalid",
            [],
            {},
            {
              evidences:
                "not-an-array",
            },
          ];

        for (
          const rawResponse
          of invalidResponses
        ) {

          const result =
            interpretSemanticComplaintResponse(
              "texte",
              rawResponse,
            );

          expect(
            result.evidenceIds,
          ).toEqual([]);

          expect(
            result.requiresConfirmation,
          ).toBe(true);
        }
      },
    );

  },
);
describe(
  "SemanticComplaintInterpreter support safety",
  () => {

    it(
      "rejects semantic evidence without support",
      () => {

        const result =
          interpretSemanticComplaintResponse(
            "j'entends un clic",
            {
              evidences: [
                {
                  id:
                    "symptom-single-click",

                  confidence:
                    0.99,
                },
              ],
            },
          );

        expect(
          result.evidenceIds,
        ).toEqual([]);

        expect(
          result.evidences,
        ).toEqual([]);
      },
    );

    it(
      "rejects semantic evidence with invalid support",
      () => {

        const result =
          interpretSemanticComplaintResponse(
            "j'entends un clic",
            {
              evidences: [
                {
                  id:
                    "symptom-single-click",

                  confidence:
                    0.99,

                  support:
                    "guessed",
                },
              ],
            },
          );

        expect(
          result.evidenceIds,
        ).toEqual([]);

        expect(
          result.evidences,
        ).toEqual([]);
      },
    );

    it(
      "preserves inferred semantic support",
      () => {

        const result =
          interpretSemanticComplaintResponse(
            "elle ne demarre pas",
            {
              evidences: [
                {
                  id:
                    "observation-battery-voltage-low",

                  confidence:
                    0.99,

                  support:
                    "inferred",
                },
              ],
            },
          );

        expect(
          result.evidenceIds,
        ).toEqual([
          "observation-battery-voltage-low",
        ]);

        expect(
          result.evidences,
        ).toHaveLength(1);

        expect(
          result.evidences[0]?.support,
        ).toBe(
          "inferred",
        );

        expect(
          result.evidences[0]?.confidence,
        ).toBe(
          0.99,
        );

        expect(
          result.evidences[0]?.source,
        ).toBe(
          "semantic-interpreter",
        );

        expect(
          result.evidences[0]?.sourceText,
        ).toBe(
          "elle ne demarre pas",
        );
      },
    );

  },
);