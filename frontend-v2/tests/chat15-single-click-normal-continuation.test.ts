import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticEngineV2,
} from "../engine/core/DiagnosticEngineV2";

describe(
  "CHAT15 single click lights normal safety",
  () => {

    it(
      "does not conclude after lights stay normal",
      () => {

        const engine =
          new DiagnosticEngineV2();

        let result =
          engine.createSession(
            "chat15-single-click-lights-normal",
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
          result.completed,
        ).toBe(false);

        expect(
          result.session.conclusion,
        ).toBeNull();

        expect(
          result.session.currentActionId,
        ).toBe(
          "starting-check-battery-terminals",
        );

        expect(
          result.action?.id,
        ).toBe(
          "starting-check-battery-terminals",
        );
      },
    );
  },
);
