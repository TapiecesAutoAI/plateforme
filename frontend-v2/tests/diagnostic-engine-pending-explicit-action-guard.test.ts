import {
  readFileSync,
} from "node:fs";

import {
  describe,
  expect,
  it,
} from "vitest";

describe(
  "DiagnosticEngineV2 pending explicit workflow action guard",
  () => {

    const source =
      readFileSync(
        new URL(
          "../engine/core/DiagnosticEngineV2.ts",
          import.meta.url,
        ),
        "utf8",
      );

    it(
      "defines a valid pending explicit workflow action guard",
      () => {

        expect(source).toMatch(
          /const hasPendingExplicitWorkflowAction =[\s\S]*?pendingExplicitWorkflowAction !== null[\s\S]*?!session\.completedActionIds\.includes/,
        );

        expect(source).toMatch(
          /hasPendingExplicitWorkflowAction[\s\S]*?this\.isAllowedForProfile/,
        );

        expect(source).toMatch(
          /hasPendingExplicitWorkflowAction[\s\S]*?this\.isTransmissionActionCompatible/,
        );
      },
    );

    it(
      "blocks the main automatic conclusion while an explicit workflow action remains",
      () => {

        expect(source).toMatch(
          /!mustContinueWithConfirmationV2 &&\s*!hasForcedCurrentAction &&\s*!hasPendingExplicitWorkflowAction &&/,
        );
      },
    );

    it(
      "blocks the fallback conclusion while an explicit workflow action remains",
      () => {

        expect(source).toMatch(
          /hasUsableHypothesis &&\s*decision\.type === "conclude" &&\s*!mustContinueWithConfirmationV2 &&\s*!hasPendingExplicitWorkflowAction/,
        );
      },
    );

  },
);