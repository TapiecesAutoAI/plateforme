import { describe, expect, it } from "vitest";

import { DiagnosticEngineV2 } from "../engine/core/DiagnosticEngineV2";

describe("Hypothesis support/reject reconciliation", () => {
  it("shows whether support and rejection remain simultaneously aggregated", () => {
    const engine =
      new DiagnosticEngineV2() as unknown as {
        collectSupportedHypothesisIds: (
          session: unknown,
        ) => Set<string>;

        collectRejectedHypothesisIds: (
          session: unknown,
        ) => Set<string>;
      };

    const session = {
      actionResults: [
        {
          actionId: "action-a",
          completedAt: "2026-08-11T10:00:00.000Z",
          supportedHypothesisIds: [],
          rejectedHypothesisIds: [
            "problem-test",
          ],
        },
        {
          actionId: "action-b",
          completedAt: "2026-08-11T10:05:00.000Z",
          supportedHypothesisIds: [
            "problem-test",
          ],
          rejectedHypothesisIds: [],
        },
      ],
    };

    const supported =
      engine.collectSupportedHypothesisIds(
        session,
      );

    const rejected =
      engine.collectRejectedHypothesisIds(
        session,
      );

    expect(
      supported.has("problem-test"),
    ).toBe(true);

    expect(
      rejected.has("problem-test"),
    ).toBe(false);
  });
});