import {
  describe,
  expect,
  it,
} from "vitest";

import {
  findEntitiesInText,
} from "../lib/ai/knowledge/matcher";

describe(
  "CHAT13 — lights evidence bridge",
  () => {

    it(
      "detects generic and V2 strong evidence when lights dim strongly",
      () => {

        const ids =
          findEntitiesInText(
            "ma voiture ne démarre plus et les phares diminuent fortement",
          ).map(
            entity => entity.id,
          );

        expect(ids).toContain(
          "observation-dim-lights",
        );

        expect(ids).toContain(
          "observation-lights-dim-strongly",
        );

      },
    );

    it(
      "does not infer strong intensity when intensity is unspecified",
      () => {

        const ids =
          findEntitiesInText(
            "ma voiture ne démarre plus et les phares diminuent",
          ).map(
            entity => entity.id,
          );

        expect(ids).toContain(
          "observation-dim-lights",
        );

        expect(ids).not.toContain(
          "observation-lights-dim-strongly",
        );

      },
    );

    it(
      "recognizes equivalent strong natural formulations",
      () => {

        const samples = [
          "les phares faiblissent fortement",
          "les voyants diminuent beaucoup",
          "les lumières baissent nettement",
        ];

        for (const sample of samples) {

          const ids =
            findEntitiesInText(
              sample,
            ).map(
              entity => entity.id,
            );

          expect(ids).toContain(
            "observation-lights-dim-strongly",
          );

        }

      },
    );

  },
);