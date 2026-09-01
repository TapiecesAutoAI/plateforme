import {
  describe,
  expect,
  it,
} from "vitest";

import {
  understandAutomotiveComplaint,
} from "../lib/ai/ComplaintUnderstandingOrchestrator";

describe(
  "ComplaintUnderstandingOrchestrator",
  () => {

    it(
      "uses deterministic evidence when semantic branch is empty",
      () => {

        const result =
          understandAutomotiveComplaint({
            originalText:
              "j entends 1 clic",
            deterministicText:
              "j entends un seul clic",
          });

        expect(
          result.admission
            .admittedEvidenceIds,
        ).toContain(
          "symptom-single-click",
        );
      },
    );

    it(
      "preserves original text for semantic provenance",
      () => {

        const originalText =
          "marş basmıyor, j'entends bir click";

        const result =
          understandAutomotiveComplaint({
            originalText,

            deterministicText:
              "texte corrige pour matcher",

            semanticResponse: {
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
          });

        expect(
          result.semantic
            .evidences[0]
            ?.sourceText,
        ).toBe(
          originalText,
        );

        expect(
          result.originalText,
        ).toBe(
          originalText,
        );
      },
    );

    it(
      "keeps deterministic and semantic source texts separate",
      () => {

        const result =
          understandAutomotiveComplaint({
            originalText:
              "1 clik",

            deterministicText:
              "un seul clic",

            semanticResponse: {
              evidences: [
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
          });

        const deterministicEvidence =
          result.deterministic
            .evidences.find(
              evidence =>
                evidence.id ===
                "symptom-single-click",
            );

        const semanticEvidence =
          result.semantic
            .evidences.find(
              evidence =>
                evidence.id ===
                "symptom-single-click",
            );

        expect(
          deterministicEvidence
            ?.sourceText,
        ).toBe(
          "un seul clic",
        );

        expect(
          semanticEvidence
            ?.sourceText,
        ).toBe(
          "1 clik",
        );
      },
    );

    it(
      "admits agreement between deterministic and semantic branches",
      () => {

        const result =
          understandAutomotiveComplaint({
            originalText:
              "un seul clic",

            deterministicText:
              "un seul clic",

            semanticResponse: {
              evidences: [
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
          });

        expect(
          result.comparison
            .evidences.find(
              evidence =>
                evidence.id ===
                "symptom-single-click",
            )
            ?.agreement,
        ).toBe(
          "agreement",
        );

        expect(
          result.admission
            .admittedEvidenceIds,
        ).toContain(
          "symptom-single-click",
        );
      },
    );

    it(
      "admits high-confidence semantic-only evidence",
      () => {

        const result =
          understandAutomotiveComplaint({
            originalText:
              "bir click geliyor",

            deterministicText:
              "formulation inconnue du matcher",

            semanticResponse: {
              evidences: [
                {
                  id:
                    "symptom-single-click",
                  confidence:
                    0.95,
                  support:
                    "explicit",
                },
              ],
            },
          });

        expect(
          result.admission
            .admittedEvidenceIds,
        ).toContain(
          "symptom-single-click",
        );

        expect(
          result.admission
            .requiresConfirmation,
        ).toBe(false);
      },
    );

    it(
      "blocks low-confidence semantic-only evidence",
      () => {

        const result =
          understandAutomotiveComplaint({
            originalText:
              "peut etre un clic",

            deterministicText:
              "formulation inconnue",

            semanticResponse: {
              evidences: [
                {
                  id:
                    "symptom-single-click",
                  confidence:
                    0.65,
                  support:
                    "explicit",
                },
              ],
            },
          });

        expect(
          result.admission
            .admittedEvidenceIds,
        ).not.toContain(
          "symptom-single-click",
        );

        expect(
          result.admission
            .requiresConfirmation,
        ).toBe(true);
      },
    );

    it(
      "cannot admit an invented semantic evidence",
      () => {

        const result =
          understandAutomotiveComplaint({
            originalText:
              "texte",

            deterministicText:
              "texte",

            semanticResponse: {
              evidences: [
                {
                  id:
                    "replace-alternator-now",
                  confidence:
                    0.999,
                },
              ],
            },
          });

        expect(
          result.semantic
            .evidenceIds,
        ).toEqual([]);

        expect(
          result.admission
            .admittedEvidenceIds,
        ).not.toContain(
          "replace-alternator-now",
        );
      },
    );

    it(
      "fails closed for malformed semantic output",
      () => {

        const result =
          understandAutomotiveComplaint({
            originalText:
              "texte libre",

            deterministicText:
              "texte libre",

            semanticResponse:
              "malformed-response",
          });

        expect(
          result.semantic
            .evidenceIds,
        ).toEqual([]);
      },
    );
    it(
      "passes compatible admitted evidence through conflict guard",
      () => {

        const result =
          understandAutomotiveComplaint({
            originalText:
              "un seul clic",

            deterministicText:
              "un seul clic",

            semanticResponse: {
              evidences: [],
            },
          });

        expect(
          result.conflictGuard
            .admittedEvidenceIds,
        ).toContain(
          "symptom-single-click",
        );

        expect(
          result.conflictGuard
            .requiresConfirmation,
        ).toBe(false);
      },
    );

    it(
      "blocks contradictory admitted evidence before engine consumption",
      () => {

        const result =
          understandAutomotiveComplaint({
            originalText:
              "tension batterie contradictoire",

            deterministicText:
              "",

            semanticResponse: {
              evidences: [
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
            },
          });

        expect(
          result.admission
            .admittedEvidenceIds,
        ).toContain(
          "observation-battery-voltage-low",
        );

        expect(
          result.admission
            .admittedEvidenceIds,
        ).toContain(
          "observation-battery-voltage-normal",
        );

        expect(
          result.conflictGuard
            .admittedEvidenceIds,
        ).toEqual([]);

        expect(
          result.conflictGuard
            .blockedEvidenceIds,
        ).toHaveLength(2);

        expect(
          result.conflictGuard
            .requiresConfirmation,
        ).toBe(true);
      },
    );
  },
);