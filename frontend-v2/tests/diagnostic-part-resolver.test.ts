import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticPartResolver,
} from "../engine/commerce";

describe(
  "DiagnosticPartResolver",
  () => {
    const resolver =
      new DiagnosticPartResolver();

    it(
      "uses the primary diagnostic recommendation first",
      () => {
        const result =
          resolver.resolve({
            partRecommendation: {
              primaryPart: {
                partName:
                  "Alternateur",
              },
            },

            salesRecommendation: {
              partName:
                "Démarreur",
            },

            conclusion: {
              possibleParts: [
                "Batterie",
              ],
            },
          });

        expect(
          result,
        ).toEqual({
          partName:
            "Alternateur",

          source:
            "part-recommendation",
        });
      },
    );

    it(
      "falls back to sales recommendation",
      () => {
        const result =
          resolver.resolve({
            partRecommendation:
              null,

            salesRecommendation: {
              partName:
                "Démarreur",
            },
          });

        expect(
          result.partName,
        ).toBe(
          "Démarreur",
        );

        expect(
          result.source,
        ).toBe(
          "sales-recommendation",
        );
      },
    );

    it(
      "falls back to diagnostic conclusion",
      () => {
        const result =
          resolver.resolve({
            conclusion: {
              possibleParts: [
                "Batterie",
              ],
            },
          });

        expect(
          result.partName,
        ).toBe(
          "Batterie",
        );

        expect(
          result.source,
        ).toBe(
          "conclusion",
        );
      },
    );

    it(
      "returns no part when diagnostic has no usable part",
      () => {
        const result =
          resolver.resolve({});

        expect(
          result,
        ).toEqual({
          partName:
            null,

          source:
            "none",
        });
      },
    );
  },
);
