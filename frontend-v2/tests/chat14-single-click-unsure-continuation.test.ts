import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticEngineV2,
} from "../engine/core/DiagnosticEngineV2";

function reachLightsUnsure(
  sessionId: string,
) {
  const engine =
    new DiagnosticEngineV2();

  let result =
    engine.createSession(
      sessionId,
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
      "unsure",
    );

  return {
    engine,
    result,
  };
}

describe(
  "CHAT14 single click unsure safety",
  () => {

    it(
      "continues after unknown light behaviour",
      () => {

        const {
          result,
        } =
          reachLightsUnsure(
            "chat14-lights-unsure",
          );

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

    const scenarios = [
      {
        answer: "bad",
        next:
          "starting-terminal-correction-result",
      },
      {
        answer: "good",
        next:
          "starting-booster-availability",
      },
      {
        answer: "unsure",
        next:
          "starting-booster-availability",
      },
    ] as const;

    for (
      const scenario
      of scenarios
    ) {

      it(
        `does not conclude after terminals=${scenario.answer}`,
        () => {

          const {
            engine,
            result: before,
          } =
            reachLightsUnsure(
              `chat14-terminals-${scenario.answer}`,
            );

          const after =
            engine.answer(
              before.session,
              "starting",
              "starting-check-battery-terminals",
              scenario.answer,
            );

          expect(
            after.completed,
          ).toBe(false);

          expect(
            after.session.status,
          ).not.toBe(
            "completed",
          );

          expect(
            after.session.conclusion,
          ).toBeNull();

          expect(
            after.session.currentActionId,
          ).toBe(
            scenario.next,
          );

          expect(
            after.action?.id,
          ).toBe(
            scenario.next,
          );
        },
      );
    }
  },
);