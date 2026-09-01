import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildComplaintClarification,
} from "../lib/ai/ComplaintClarificationBuilder";

import {
  admitComplaintEvidences,
} from "../lib/ai/ComplaintEvidenceAdmissionGuard";

import {
  guardComplaintEvidenceConflicts,
} from "../lib/ai/ComplaintEvidenceConflictGuard";

import {
  createAutomotiveComplaintInterpretation,
} from "../lib/ai/AutomotiveComplaintInterpreter";

import {
  compareComplaintInterpretations,
} from "../lib/ai/ComplaintInterpretationComparator";

function buildPipeline(
  deterministicIds:
    string[],

  semanticEvidences:
    Array<{
      id:
        string;

      confidence:
        number;

      support:
        "explicit" |
        "normalized" |
        "inferred";
    }>,
) {

  const deterministic =
    createAutomotiveComplaintInterpretation(
      "deterministic",
      deterministicIds.map(
        id => ({
          id,

          confidence:
            0.95,

          source:
            "deterministic-matcher" as const,

          sourceText:
            "deterministic",

          support:
            "normalized" as const,
        }),
      ),
    );

  const semantic =
    createAutomotiveComplaintInterpretation(
      "original",
      semanticEvidences.map(
        evidence => ({
          ...evidence,

          source:
            "semantic-interpreter" as const,

          sourceText:
            "original",
        }),
      ),
    );

  const comparison =
    compareComplaintInterpretations(
      deterministic,
      semantic,
    );

  const admission =
    admitComplaintEvidences(
      comparison,
    );

  const conflictGuard =
    guardComplaintEvidenceConflicts(
      admission,
    );

  return {
    admission,
    conflictGuard,
  };
}

describe(
  "ComplaintClarificationBuilder",
  () => {

    it(
      "returns no clarification when all evidence is safely admitted",
      () => {

        const {
          admission,
          conflictGuard,
        } =
          buildPipeline(
            [
              "symptom-single-click",
            ],
            [],
          );

        const result =
          buildComplaintClarification(
            admission,
            conflictGuard,
          );

        expect(
          result,
        ).toEqual({
          required:
            false,

          items: [],
        });
      },
    );

    it(
      "creates confirmation for inferred semantic-only evidence",
      () => {

        const {
          admission,
          conflictGuard,
        } =
          buildPipeline(
            [],
            [
              {
                id:
                  "symptom-single-click",

                confidence:
                  0.99,

                support:
                  "inferred",
              },
            ],
          );

        const result =
          buildComplaintClarification(
            admission,
            conflictGuard,
          );

        expect(
          result.required,
        ).toBe(true);

        expect(
          result.items,
        ).toHaveLength(1);

        expect(
          result.items[0]?.kind,
        ).toBe(
          "evidence-confirmation",
        );

        expect(
          result.items[0]
            ?.evidenceIds,
        ).toEqual([
          "symptom-single-click",
        ]);
      },
    );

    it(
      "creates confirmation for low-confidence semantic evidence",
      () => {

        const {
          admission,
          conflictGuard,
        } =
          buildPipeline(
            [],
            [
              {
                id:
                  "symptom-single-click",

                confidence:
                  0.65,

                support:
                  "explicit",
              },
            ],
          );

        const result =
          buildComplaintClarification(
            admission,
            conflictGuard,
          );

        expect(
          result.required,
        ).toBe(true);

        expect(
          result.items[0]?.kind,
        ).toBe(
          "evidence-confirmation",
        );
      },
    );

    it(
      "creates conflict clarification for incompatible admitted evidence",
      () => {

        const {
          admission,
          conflictGuard,
        } =
          buildPipeline(
            [],
            [
              {
                id:
                  "observation-battery-voltage-low",

                confidence:
                  0.99,

                support:
                  "explicit",
              },
              {
                id:
                  "observation-battery-voltage-normal",

                confidence:
                  0.99,

                support:
                  "explicit",
              },
            ],
          );

        const result =
          buildComplaintClarification(
            admission,
            conflictGuard,
          );

        const conflict =
          result.items.find(
            item =>
              item.kind ===
                "evidence-conflict",
          );

        expect(
          result.required,
        ).toBe(true);

        expect(
          conflict?.evidenceIds,
        ).toEqual([
          "observation-battery-voltage-low",
          "observation-battery-voltage-normal",
        ]);
      },
    );

    it(
      "does not expose diagnostic or commerce authority",
      () => {

        const {
          admission,
          conflictGuard,
        } =
          buildPipeline(
            [],
            [
              {
                id:
                  "symptom-single-click",

                confidence:
                  0.99,

                support:
                  "inferred",
              },
            ],
          );

        const result =
          buildComplaintClarification(
            admission,
            conflictGuard,
          );

        expect(
          result,
        ).not.toHaveProperty(
          "diagnosis",
        );

        expect(
          result,
        ).not.toHaveProperty(
          "part",
        );

        expect(
          result,
        ).not.toHaveProperty(
          "price",
        );

        expect(
          result,
        ).not.toHaveProperty(
          "order",
        );
      },
    );

  },
);