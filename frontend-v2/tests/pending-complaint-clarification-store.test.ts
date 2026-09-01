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
      () => {

        store.save(
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
          store.get(
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
      () => {

        store.save(
          "session-2",
          {
            required:
              false,

            items: [],
          },
        );

        expect(
          store.has(
            "session-2",
          ),
        ).toBe(false);
      },
    );

    it(
      "replaces pending clarification for the same session",
      () => {

        store.save(
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

        store.save(
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
          store.get(
            "session-3",
          )
            ?.clarification
            .items[0]
            ?.evidenceIds,
        ).toEqual([
          "symptom-rapid-clicking",
        ]);
      },
    );

    it(
      "clears pending clarification explicitly",
      () => {

        store.save(
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

        store.clear(
          "session-4",
        );

        expect(
          store.get(
            "session-4",
          ),
        ).toBeNull();
      },
    );

    it(
      "keeps sessions isolated",
      () => {

        store.save(
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

        store.save(
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
          store.get(
            "session-a",
          )
            ?.clarification
            .items[0]
            ?.evidenceIds,
        ).toEqual([
          "symptom-single-click",
        ]);

        expect(
          store.get(
            "session-b",
          )
            ?.clarification
            .items[0]
            ?.evidenceIds,
        ).toEqual([
          "symptom-rapid-clicking",
        ]);
      },
    );

  },
);