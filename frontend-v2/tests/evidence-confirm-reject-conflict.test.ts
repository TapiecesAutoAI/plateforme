import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticEngineV2,
} from "../engine/core/DiagnosticEngineV2";

describe(
  "Evidence confirm/reject reconciliation",
  () => {
    it(
      "latest confirmation should override older rejection",
      () => {
        const engine =
          new DiagnosticEngineV2() as unknown as {
            collectRejectedEvidenceIds: (
              session: unknown,
            ) => Set<string>;
          };

        const session = {
          evidence: [
            {
              id: "evidence-test",
            },
          ],

          actionResults: [
            {
              actionId: "action-a",
              completedAt:
                "2026-08-11T10:00:00.000Z",
              addedEvidenceIds: [],
              rejectedEvidenceIds: [
                "evidence-test",
              ],
              supportedHypothesisIds: [],
              rejectedHypothesisIds: [],
            },

            {
              actionId: "action-b",
              completedAt:
                "2026-08-11T11:00:00.000Z",
              addedEvidenceIds: [
                "evidence-test",
              ],
              rejectedEvidenceIds: [],
              supportedHypothesisIds: [],
              rejectedHypothesisIds: [],
            },
          ],
        };

        const rejected =
          engine.collectRejectedEvidenceIds(
            session,
          );

        expect(
          rejected.has("evidence-test"),
        ).toBe(false);
      },
    );
  },
);