import {
  describe,
  expect,
  it,
} from "vitest";

import {
  correctAutomotiveText,
} from "../lib/ai/AutomotiveTextCorrector";

import {
  findEntitiesInText,
} from "../lib/ai/knowledge/matcher";


describe(
  "CHAT13 - real typo fortemen chain",
  () => {

    it(
      "corrects the real user phrase and detects strong lights evidence",
      () => {

        const input =
          "ma voiture ne démarre pas et mes phares s’éteignent fortemen";

        const correction =
          correctAutomotiveText(
            input,
          );

        expect(
          correction.correctedText,
        ).toContain(
          "fortement",
        );

        expect(
          correction.correctedText,
        ).not.toContain(
          "fortemen ",
        );

        const entities =
          findEntitiesInText(
            correction.correctedText,
          );

        const ids =
          entities.map(
            entity => entity.id,
          );

        expect(
          ids,
        ).toContain(
          "symptom-no-start",
        );

        expect(
          ids,
        ).toContain(
          "observation-lights-dim-strongly",
        );

      },
    );

  },
);