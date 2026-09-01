import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticEngineV2,
} from "../engine/core/DiagnosticEngineV2";

describe(
  "CHAT15 single click booster unavailable safety",
  () => {

    it(
      "does not conclude abusively when booster is unavailable",
      () => {

        const engine =
          new DiagnosticEngineV2();

        let result =
          engine.createSession(
            "chat15-single-click-booster-unavailable",
            "particulier",
            "starting",
            [],
          );

        result =
          engine.answer(
            result.session,
            "starting",
            "starting-main-behaviour",
            "engine-not-turning",
          );

        result =
          engine.answer(
            result.session,
            "starting",
            "starting-no-crank-sound",
            "single-click",
          );

        result =
          engine.answer(
            result.session,
            "starting",
            "starting-single-click-lights",
            "normal",
          );

        result =
          engine.answer(
            result.session,
            "starting",
            "starting-check-battery-terminals",
            "good",
          );

        result =
          engine.answer(
            result.session,
            "starting",
            "starting-booster-availability",
            "no",
          );

        console.log({
          completed: result.completed,
          status: result.session.status,
          conclusion: result.session.conclusion,
          currentActionId:
            result.session.currentActionId,
          returnedActionId:
            result.action?.id ?? null,
        });

        expect(
          result.completed &&
          result.session.conclusion?.confidence >= 0.90,
        ).toBe(false);
      },
    );
  },
);
