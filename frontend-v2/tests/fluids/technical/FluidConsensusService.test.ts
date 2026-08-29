import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildFluidConsensus,
} from "../../../lib/fluids/technical";

describe(
  "FluidConsensusService",
  () => {

    it(
      "returns consensus when sources agree",
      () => {

        const result =
          buildFluidConsensus([
            {
              fluidId:
                "engine-oil",

              viscosity:
                "5W-30",

              manufacturerSpecification: [
                "VW 507 00",
              ],

              capacityLitres:
                4.7,

              source:
                "tecalliance",

              sourceName:
                "TecAlliance",

              confidence:
                "verified",
            },

            {
              fluidId:
                "engine-oil",

              viscosity:
                "5W-30",

              manufacturerSpecification: [
                "VW 507 00",
              ],

              capacityLitres:
                4.7,

              source:
                "manufacturer",

              sourceName:
                "Castrol",

              confidence:
                "advisory",
            },
          ]);

        expect(
          result.status,
        ).toBe(
          "consensus",
        );

        if (
          result.status ===
          "consensus"
        ) {

          expect(
            result.sourceCount,
          ).toBe(
            2,
          );

          expect(
            result.specification.confidence,
          ).toBe(
            "verified",
          );
        }
      },
    );

    it(
      "detects conflicting viscosity",
      () => {

        const result =
          buildFluidConsensus([
            {
              fluidId:
                "engine-oil",

              viscosity:
                "5W-30",

              source:
                "tecalliance",

              sourceName:
                "TecAlliance",

              confidence:
                "verified",
            },

            {
              fluidId:
                "engine-oil",

              viscosity:
                "5W-40",

              source:
                "manufacturer",

              sourceName:
                "Manufacturer",

              confidence:
                "advisory",
            },
          ]);

        expect(
          result.status,
        ).toBe(
          "conflict",
        );

        if (
          result.status ===
          "conflict"
        ) {

          expect(
            result.conflictingFields,
          ).toContain(
            "viscosity",
          );
        }
      },
    );

  },
);