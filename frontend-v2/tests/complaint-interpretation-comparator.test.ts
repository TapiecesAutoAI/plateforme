import {
  describe,
  expect,
  it,
} from "vitest";

import {
  compareComplaintInterpretations,
} from "../lib/ai/ComplaintInterpretationComparator";

import {
  createAutomotiveComplaintInterpretation,
} from "../lib/ai/AutomotiveComplaintInterpreter";

describe(
  "ComplaintInterpretationComparator",
  () => {

    it(
      "marks agreement when both interpreters find the same evidence",
      () => {

        const deterministic =
          createAutomotiveComplaintInterpretation(
            "1 clic",
            [
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
                  "1 clic",
              },
            ],
          );

        const semantic =
          createAutomotiveComplaintInterpretation(
            "1 clic",
            [
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
                  "1 clic",
              },
            ],
          );

        const result =
          compareComplaintInterpretations(
            deterministic,
            semantic,
          );

        expect(
          result.evidenceIds,
        ).toEqual([
          "symptom-single-click",
        ]);

        expect(
          result.evidences[0]
            ?.agreement,
        ).toBe(
          "agreement",
        );

        expect(
          result.requiresConfirmation,
        ).toBe(false);
      },
    );

    it(
      "keeps deterministic evidence when semantic finds nothing",
      () => {

        const deterministic =
          createAutomotiveComplaintInterpretation(
            "clic",
            [
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
              },
            ],
          );

        const semantic =
          createAutomotiveComplaintInterpretation(
            "clic",
            [],
          );

        const result =
          compareComplaintInterpretations(
            deterministic,
            semantic,
          );

        expect(
          result.evidences[0]
            ?.agreement,
        ).toBe(
          "deterministic-only",
        );

        expect(
          result.requiresConfirmation,
        ).toBe(false);
      },
    );

    it(
      "accepts high-confidence semantic-only evidence",
      () => {

        const deterministic =
          createAutomotiveComplaintInterpretation(
            "texte inconnu matcher",
            [],
          );

        const semantic =
          createAutomotiveComplaintInterpretation(
            "texte inconnu matcher",
            [
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
                  "texte inconnu matcher",
              },
            ],
          );

        const result =
          compareComplaintInterpretations(
            deterministic,
            semantic,
          );

        expect(
          result.evidenceIds,
        ).toContain(
          "symptom-single-click",
        );

        expect(
          result.requiresConfirmation,
        ).toBe(false);
      },
    );

    it(
      "requires confirmation for low-confidence semantic-only evidence",
      () => {

        const deterministic =
          createAutomotiveComplaintInterpretation(
            "texte ambigu",
            [],
          );

        const semantic =
          createAutomotiveComplaintInterpretation(
            "texte ambigu",
            [
              {
                id:
                  "symptom-single-click",
                confidence:
                  0.7,
                support:
                  "explicit",
                source:
                  "semantic-interpreter",
                sourceText:
                  "texte ambigu",
              },
            ],
          );

        const result =
          compareComplaintInterpretations(
            deterministic,
            semantic,
          );

        expect(
          result.requiresConfirmation,
        ).toBe(true);
      },
    );

    it(
      "keeps separate different evidences from both interpreters",
      () => {

        const deterministic =
          createAutomotiveComplaintInterpretation(
            "texte",
            [
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
                  "texte",
              },
            ],
          );

        const semantic =
          createAutomotiveComplaintInterpretation(
            "texte",
            [
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
                  "texte",
              },
            ],
          );

        const result =
          compareComplaintInterpretations(
            deterministic,
            semantic,
          );

        expect(
          result.evidenceIds.sort(),
        ).toEqual([
          "symptom-no-start",
          "symptom-single-click",
        ].sort());
      },
    );

  },
);
describe(
  "ComplaintInterpretationComparator support policy",
  () => {

    it(
      "requires confirmation for high-confidence inferred semantic-only evidence",
      () => {

        const deterministic =
          createAutomotiveComplaintInterpretation(
            "texte",
            [],
          );

        const semantic =
          createAutomotiveComplaintInterpretation(
            "texte",
            [
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
              },
            ],
          );

        const result =
          compareComplaintInterpretations(
            deterministic,
            semantic,
          );

        expect(
          result.evidenceIds,
        ).toContain(
          "observation-battery-voltage-low",
        );

        expect(
          result.evidences[0]
            ?.support,
        ).toBe(
          "inferred",
        );

        expect(
          result.requiresConfirmation,
        ).toBe(true);
      },
    );

  },
);