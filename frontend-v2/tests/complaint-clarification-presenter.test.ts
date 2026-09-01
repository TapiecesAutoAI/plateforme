import {
  describe,
  expect,
  it,
} from "vitest";

import {
  presentComplaintClarification,
} from "../lib/ai/ComplaintClarificationPresenter";

describe(
  "ComplaintClarificationPresenter",
  () => {

    it(
      "presents a canonical evidence confirmation without exposing its internal reason",
      () => {

        const result =
          presentComplaintClarification({
            required:
              true,

            items: [
              {
                kind:
                  "evidence-confirmation",

                evidenceIds: [
                  "symptom-single-click",
                ],

                reason:
                  "semantic evidence requires confirmation",
              },
            ],
          });

        expect(
          result.required,
        ).toBe(true);

        expect(
          result.items[0]
            ?.labels,
        ).toEqual([
          "Un seul clic est entendu au démarrage",
        ]);

        expect(
          result.items[0]
            ?.prompt,
        ).toContain(
          "Un seul clic est entendu au démarrage",
        );

        expect(
          JSON.stringify(result),
        ).not.toContain(
          "semantic evidence requires confirmation",
        );
      },
    );

    it(
      "presents both canonical facts when evidence conflicts",
      () => {

        const result =
          presentComplaintClarification({
            required:
              true,

            items: [
              {
                kind:
                  "evidence-conflict",

                evidenceIds: [
                  "observation-battery-voltage-low",
                  "observation-battery-voltage-normal",
                ],

                reason:
                  "Canonical evidences are mutually incompatible.",
              },
            ],
          });

        expect(
          result.items[0]
            ?.labels,
        ).toEqual([
          "La tension de batterie est insuffisante",
          "La tension de batterie est normale",
        ]);

        expect(
          result.items[0]
            ?.prompt,
        ).toContain(
          "incompatibles",
        );
      },
    );

    it(
      "keeps an empty clarification empty",
      () => {

        expect(
          presentComplaintClarification({
            required:
              false,

            items: [],
          }),
        ).toEqual({
          required:
            false,

          items: [],
        });
      },
    );

  },
);