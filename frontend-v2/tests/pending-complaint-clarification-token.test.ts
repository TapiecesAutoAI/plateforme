import {
  describe,
  expect,
  it,
} from "vitest";

import {
  PendingComplaintClarificationStore,
} from "../lib/ai/PendingComplaintClarificationStore";

describe(
  "PendingComplaintClarificationStore anti replay token",
  () => {

    it(
      "creates an opaque token for a pending clarification",
      async () => {

        const store =
          new PendingComplaintClarificationStore();

        await store.save(
          "token-session",
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
                  "server",
              },
            ],
          },
        );

        const record =
          await store.get(
            "token-session",
          );

        expect(record).not.toBeNull();

        expect(
          typeof record?.clarificationToken,
        ).toBe("string");

        expect(
          record?.clarificationToken.length,
        ).toBeGreaterThan(10);
      },
    );

    it(
      "rotates the token when moving to the next clarification",
      async () => {

        const store =
          new PendingComplaintClarificationStore();

        await store.save(
          "rotate-session",
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

        const firstToken =
          (
            await store.get(
              "rotate-session",
            )
          )?.clarificationToken;

        expect(firstToken).toBeTruthy();

        const updated =
          await store.update(
            "rotate-session",
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

        const secondToken =
          (
            await store.get(
              "rotate-session",
            )
          )?.clarificationToken;

        expect(secondToken).toBeTruthy();

        expect(
          secondToken,
        ).not.toBe(
          firstToken,
        );
      },
    );

    it(
      "removes the token with the record when clarification is complete",
      async () => {

        const store =
          new PendingComplaintClarificationStore();

        await store.save(
          "complete-session",
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

        expect(
          (
            await store.get(
              "complete-session",
            )
          )?.clarificationToken,
        ).toBeTruthy();

        await store.update(
          "complete-session",
          {
            required: false,
            items: [],
          },
        );

        expect(
          await store.get(
            "complete-session",
          ),
        ).toBeNull();
      },
    );

  },
);