import {
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

import {
  PendingComplaintClarificationStore,
} from "../lib/ai/PendingComplaintClarificationStore";

describe(
  "PendingComplaintClarificationStore",
  () => {

    let store:
      PendingComplaintClarificationStore;

    beforeEach(
      () => {

        store =
          new PendingComplaintClarificationStore();
      },
    );

    it(
      "stores required clarification by server session id",
      async () => {

        await store.save(
          "session-1",
          {
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
                  "server-only reason",
              },
            ],
          },
        );

        const pending =
          await store.get(
            "session-1",
          );

        expect(
          pending,
        ).not.toBeNull();

        expect(
          pending?.sessionId,
        ).toBe(
          "session-1",
        );

        expect(
          pending
            ?.clarification
            .items[0]
            ?.evidenceIds,
        ).toEqual([
          "symptom-single-click",
        ]);
      },
    );

    it(
      "does not store a clarification that is not required",
      async () => {

        await store.save(
          "session-2",
          {
            required:
              false,

            items: [],
          },
        );

        expect(
          await store.has(
            "session-2",
          ),
        ).toBe(false);
      },
    );

    it(
      "replaces pending clarification for the same session",
      async () => {

        await store.save(
          "session-3",
          {
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
                  "first",
              },
            ],
          },
        );

        await store.save(
          "session-3",
          {
            required:
              true,

            items: [
              {
                kind:
                  "evidence-confirmation",

                evidenceIds: [
                  "symptom-rapid-clicking",
                ],

                reason:
                  "second",
              },
            ],
          },
        );

        expect(
          (
            await store.get(
              "session-3",
            )
          )?.clarification
            .items[0]
            ?.evidenceIds,
        ).toEqual([
          "symptom-rapid-clicking",
        ]);
      },
    );

    it(
      "clears pending clarification explicitly",
      async () => {

        await store.save(
          "session-4",
          {
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
                  "pending",
              },
            ],
          },
        );

        await store.clear(
          "session-4",
        );

        expect(
          await store.get(
            "session-4",
          ),
        ).toBeNull();
      },
    );

    it(
      "keeps sessions isolated",
      async () => {

        await store.save(
          "session-a",
          {
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
                  "a",
              },
            ],
          },
        );

        await store.save(
          "session-b",
          {
            required:
              true,

            items: [
              {
                kind:
                  "evidence-confirmation",

                evidenceIds: [
                  "symptom-rapid-clicking",
                ],

                reason:
                  "b",
              },
            ],
          },
        );

        expect(
          (
            await store.get(
              "session-a",
            )
          )?.clarification
            .items[0]
            ?.evidenceIds,
        ).toEqual([
          "symptom-single-click",
        ]);

        expect(
          (
            await store.get(
              "session-b",
            )
          )?.clarification
            .items[0]
            ?.evidenceIds,
        ).toEqual([
          "symptom-rapid-clicking",
        ]);
      },
    );

  },
);