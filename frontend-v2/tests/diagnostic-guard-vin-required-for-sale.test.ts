import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticGuardEngine,
} from "../engine/reasoning/guard/DiagnosticGuardEngine";

describe(
  "DiagnosticGuardEngine VIN sale protection",
  () => {

    it(
      "must not allow sale when VIN compatibility has not been validated",
      () => {

        const engine =
          new DiagnosticGuardEngine();

        const result =
          engine.evaluate({
            confidence:
              96,

            trustScore:
              95,

            answerQuality:
              95,

            contradictionCount:
              0,

            similarCases:
              30,

            validatedRepairs:
              30,

            vinValidated:
              false,
          });

        expect(
          result.allowSell,
        ).toBe(false);
      },
    );

    it(
      "must allow sale when VIN compatibility has been validated and all other conditions are sufficient",
      () => {

        const engine =
          new DiagnosticGuardEngine();

        const result =
          engine.evaluate({
            confidence:
              96,

            trustScore:
              95,

            answerQuality:
              95,

            contradictionCount:
              0,

            similarCases:
              30,

            validatedRepairs:
              30,

            vinValidated:
              true,
          });

        expect(
          result.allowSell,
        ).toBe(true);
      },
    );
  },
);
