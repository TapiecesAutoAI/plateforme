import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticEngineV2,
} from "../engine/core/DiagnosticEngineV2";

describe(
  "DiagnosticEngineV2 action information value",
  () => {
    const engine =
      new DiagnosticEngineV2();

    const internal =
      engine as unknown as {
        actionCanAddInformation: (
          action: unknown,
          confirmed: ReadonlySet<string>,
          rejected: ReadonlySet<string>,
        ) => boolean;
      };

    it(
      "rejects an action without evidence or hypothesis effects",
      () => {
        const action = {
          id: "empty-action",
          options: [
            {
              id: "yes",
              label: "Oui",
              value: "Oui",
            },
          ],
        };

        expect(
          internal.actionCanAddInformation(
            action,
            new Set(),
            new Set(),
          ),
        ).toBe(false);
      },
    );

    it(
      "keeps an action that supports a hypothesis",
      () => {
        const action = {
          id: "hypothesis-action",
          options: [
            {
              id: "yes",
              label: "Oui",
              value: "Oui",
              supportsHypotheses: [
                "problem-test",
              ],
            },
          ],
        };

        expect(
          internal.actionCanAddInformation(
            action,
            new Set(),
            new Set(),
          ),
        ).toBe(true);
      },
    );
  },
);