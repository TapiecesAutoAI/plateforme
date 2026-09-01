import {
  describe,
  expect,
  it,
} from "vitest";

import {
  PendingComplaintClarificationStore,
} from "../lib/ai/PendingComplaintClarificationStore";

describe(
  "PendingComplaintClarificationStore update",
  () => {

    it(
      "updates an existing pending clarification",
      async () => {

        const store =
          new PendingComplaintClarificationStore();

        await store.save(
          "session-update",
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
        );

        const updated =
          await store.update(
            "session-update",
            {
              required: true,
              items: [
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
          );

        expect(updated).toBe(true);

        expect(
          (
            await store.get(
            "session-update",
            )
          )?.clarification.items,
        ).toHaveLength(1);

        expect(
          (
            await store.get(
            "session-update",
            )
          )?.clarification
            .items[0]
            ?.evidenceIds,
        ).toEqual([
          "observation-lights-dim-strongly",
        ]);
      },
    );

    it(
      "consumes the pending record when no clarification remains",
      async () => {

        const store =
          new PendingComplaintClarificationStore();

        await store.save(
          "session-consume",
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
                  "only",
              },
            ],
          },
        );

        const updated =
          await store.update(
            "session-consume",
            {
              required: false,
              items: [],
            },
          );

        expect(updated).toBe(true);

        expect(
          await store.has(
            "session-consume",
          ),
        ).toBe(false);
      },
    );

    it(
      "refuses to update a missing pending session",
      async () => {

        const store =
          new PendingComplaintClarificationStore();

        const updated =
          await store.update(
            "missing-session",
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
                    "missing",
                },
              ],
            },
          );

        expect(updated).toBe(false);

        expect(
          await store.has(
            "missing-session",
          ),
        ).toBe(false);
      },
    );

  },
);