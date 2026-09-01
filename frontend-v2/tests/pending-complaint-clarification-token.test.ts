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
      () => {

        const store =
          new PendingComplaintClarificationStore();

        store.save(
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
          store.get(
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
      () => {

        const store =
          new PendingComplaintClarificationStore();

        store.save(
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
          store.get(
            "rotate-session",
          )?.clarificationToken;

        expect(firstToken).toBeTruthy();

        const updated =
          store.update(
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
          store.get(
            "rotate-session",
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
      () => {

        const store =
          new PendingComplaintClarificationStore();

        store.save(
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
          store.get(
            "complete-session",
          )?.clarificationToken,
        ).toBeTruthy();

        store.update(
          "complete-session",
          {
            required: false,
            items: [],
          },
        );

        expect(
          store.get(
            "complete-session",
          ),
        ).toBeNull();
      },
    );

  },
);