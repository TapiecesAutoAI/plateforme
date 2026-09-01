import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveComplaintClarification,
} from "../lib/ai/ComplaintClarificationResolver";

describe(
  "ComplaintClarificationResolver",
  () => {

    it(
      "confirms only the server-held evidence",
      () => {

        const result =
          resolveComplaintClarification(
            {
              required: true,
              items: [
                {
                  kind:
                    "evidence-confirmation",
                  evidenceIds: [
                    "symptom-single-click",
                  ],
                  reason:
                    "server reason",
                },
              ],
            },
            "confirm",
          );

        expect(
          result.confirmedEvidenceIds,
        ).toEqual([
          "symptom-single-click",
        ]);

        expect(
          result.resolved,
        ).toBe(true);
      },
    );

    it(
      "reject does not confirm evidence",
      () => {

        const result =
          resolveComplaintClarification(
            {
              required: true,
              items: [
                {
                  kind:
                    "evidence-confirmation",
                  evidenceIds: [
                    "symptom-single-click",
                  ],
                  reason:
                    "server reason",
                },
              ],
            },
            "reject",
          );

        expect(
          result.confirmedEvidenceIds,
        ).toEqual([]);
      },
    );

    it(
      "selects the first server-held conflict evidence",
      () => {

        const result =
          resolveComplaintClarification(
            {
              required: true,
              items: [
                {
                  kind:
                    "evidence-conflict",
                  evidenceIds: [
                    "observation-battery-voltage-low",
                    "observation-battery-voltage-normal",
                  ],
                  reason:
                    "server conflict",
                },
              ],
            },
            "first",
          );

        expect(
          result.confirmedEvidenceIds,
        ).toEqual([
          "observation-battery-voltage-low",
        ]);
      },
    );

    it(
      "selects the second server-held conflict evidence",
      () => {

        const result =
          resolveComplaintClarification(
            {
              required: true,
              items: [
                {
                  kind:
                    "evidence-conflict",
                  evidenceIds: [
                    "observation-battery-voltage-low",
                    "observation-battery-voltage-normal",
                  ],
                  reason:
                    "server conflict",
                },
              ],
            },
            "second",
          );

        expect(
          result.confirmedEvidenceIds,
        ).toEqual([
          "observation-battery-voltage-normal",
        ]);
      },
    );

    it(
      "unsure confirms nothing",
      () => {

        const result =
          resolveComplaintClarification(
            {
              required: true,
              items: [
                {
                  kind:
                    "evidence-conflict",
                  evidenceIds: [
                    "observation-battery-voltage-low",
                    "observation-battery-voltage-normal",
                  ],
                  reason:
                    "server conflict",
                },
              ],
            },
            "unsure",
          );

        expect(
          result.confirmedEvidenceIds,
        ).toEqual([]);
      },
    );

    it(
      "rejects a choice incompatible with the clarification kind",
      () => {

        expect(
          () =>
            resolveComplaintClarification(
              {
                required: true,
                items: [
                  {
                    kind:
                      "evidence-confirmation",
                    evidenceIds: [
                      "symptom-single-click",
                    ],
                    reason:
                      "server reason",
                  },
                ],
              },
              "first",
            ),
        ).toThrow(
          /Choix invalide/,
        );
      },
    );

    it(
      "keeps later clarification items pending",
      () => {

        const result =
          resolveComplaintClarification(
            {
              required: true,
              items: [
                {
                  kind:
                    "evidence-confirmation",
                  evidenceIds: [
                    "symptom-single-click",
                  ],
                  reason:
                    "first",
                },
                {
                  kind:
                    "evidence-confirmation",
                  evidenceIds: [
                    "observation-lights-dim-strongly",
                  ],
                  reason:
                    "second",
                },
              ],
            },
            "confirm",
          );

        expect(
          result.resolved,
        ).toBe(false);

        expect(
          result.remainingClarification.required,
        ).toBe(true);

        expect(
          result.remainingClarification.items,
        ).toHaveLength(1);

        expect(
          result.remainingClarification
            .items[0]
            ?.evidenceIds,
        ).toEqual([
          "observation-lights-dim-strongly",
        ]);
      },
    );

  },
);