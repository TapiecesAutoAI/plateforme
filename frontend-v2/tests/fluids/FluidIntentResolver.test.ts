import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveFluidIntent,
} from "../../lib/fluids";

describe(
  "FluidIntentResolver",
  () => {

    it(
      "asks oil family for generic oil",
      () => {

        const result =
          resolveFluidIntent(
            "Je veux de l'huile",
          );

        expect(
          result.status,
        ).toBe(
          "needs-clarification",
        );

        if (
          result.status ===
          "needs-clarification"
        ) {

          expect(
            result.options.map(
              option =>
                option.id,
            ),
          ).toEqual([
            "engine-oil",
            "manual-transmission-fluid",
            "automatic-transmission-fluid",
            "dct-fluid",
            "cvt-fluid",
            "differential-fluid",
            "power-steering-fluid",
            "brake-fluid",
          ]);
        }
      },
    );

    it(
      "does not propose non-oil fluids for generic oil",
      () => {

        const result =
          resolveFluidIntent(
            "Je cherche de l'huile",
          );

        expect(
          result.status,
        ).toBe(
          "needs-clarification",
        );

        if (
          result.status ===
          "needs-clarification"
        ) {

          const ids =
            result.options.map(
              option =>
                option.id,
            );
expect(ids).not.toContain(
            "coolant",
          );

          expect(ids).not.toContain(
            "adblue",
          );

          expect(ids).not.toContain(
            "screenwash",
          );
        }
      },
    );

    it(
      "recognizes engine oil",
      () => {

        const result =
          resolveFluidIntent(
            "Je veux de l'huile moteur",
          );

        expect(
          result.status,
        ).toBe(
          "found",
        );

        if (
          result.status === "found"
        ) {
          expect(
            result.record.id,
          ).toBe(
            "engine-oil",
          );
        }
      },
    );

    it(
      "recognizes manual gearbox oil",
      () => {

        const result =
          resolveFluidIntent(
            "Je veux de l'huile de boite manuelle",
          );

        expect(
          result.status,
        ).toBe(
          "found",
        );

        if (
          result.status === "found"
        ) {
          expect(
            result.record.id,
          ).toBe(
            "manual-transmission-fluid",
          );
        }
      },
    );

    it(
      "recognizes ATF",
      () => {

        const result =
          resolveFluidIntent(
            "Il me faut de l'ATF",
          );

        expect(
          result.status,
        ).toBe(
          "found",
        );

        if (
          result.status === "found"
        ) {
          expect(
            result.record.id,
          ).toBe(
            "automatic-transmission-fluid",
          );
        }
      },
    );

    it(
      "recognizes DSG oil",
      () => {

        const result =
          resolveFluidIntent(
            "Je veux de l'huile DSG",
          );

        expect(
          result.status,
        ).toBe(
          "found",
        );

        if (
          result.status === "found"
        ) {
          expect(
            result.record.id,
          ).toBe(
            "dct-fluid",
          );
        }
      },
    );

    it(
      "recognizes CVT oil",
      () => {

        const result =
          resolveFluidIntent(
            "Je cherche de l'huile CVT",
          );

        expect(
          result.status,
        ).toBe(
          "found",
        );

        if (
          result.status === "found"
        ) {
          expect(
            result.record.id,
          ).toBe(
            "cvt-fluid",
          );
        }
      },
    );

    it(
      "recognizes differential oil",
      () => {

        const result =
          resolveFluidIntent(
            "Je cherche de l'huile de pont",
          );

        expect(
          result.status,
        ).toBe(
          "found",
        );

        if (
          result.status === "found"
        ) {
          expect(
            result.record.id,
          ).toBe(
            "differential-fluid",
          );
        }
      },
    );

    it(
      "recognizes steering fluid",
      () => {

        const result =
          resolveFluidIntent(
            "Je cherche de l'huile de direction",
          );

        expect(
          result.status,
        ).toBe(
          "found",
        );

        if (
          result.status === "found"
        ) {
          expect(
            result.record.id,
          ).toBe(
            "power-steering-fluid",
          );
        }
      },
    );

    it(
      "still recognizes brake fluid directly",
      () => {

        const result =
          resolveFluidIntent(
            "Je cherche du liquide de frein",
          );

        expect(
          result.status,
        ).toBe(
          "found",
        );

        if (
          result.status === "found"
        ) {
          expect(
            result.record.id,
          ).toBe(
            "brake-fluid",
          );
        }
      },
    );

    it(
      "still recognizes coolant directly",
      () => {

        const result =
          resolveFluidIntent(
            "Je veux du liquide de refroidissement",
          );

        expect(
          result.status,
        ).toBe(
          "found",
        );

        if (
          result.status === "found"
        ) {
          expect(
            result.record.id,
          ).toBe(
            "coolant",
          );
        }
      },
    );

    it(
      "still recognizes screenwash directly",
      () => {

        const result =
          resolveFluidIntent(
            "Je veux du lave-glace",
          );

        expect(
          result.status,
        ).toBe(
          "found",
        );
      },
    );

    it(
      "does not invent unknown fluid",
      () => {

        const result =
          resolveFluidIntent(
            "Je veux un produit bizarre",
          );

        expect(
          result.status,
        ).toBe(
          "unknown",
        );
      },
    );

  },
);