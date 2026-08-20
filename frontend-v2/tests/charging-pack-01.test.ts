import {
  describe,
  expect,
  test,
} from "vitest";

import {
  chargingEvidences,
  chargingHypotheses,
  chargingParts,
} from "../engine/knowledge/charging";

describe(
  "Pack 01 Charging",
  () => {
    test(
      "contient une première base métier suffisante",
      () => {
        expect(
          chargingEvidences.length,
        ).toBeGreaterThanOrEqual(
          18,
        );

        expect(
          chargingHypotheses.length,
        ).toBeGreaterThanOrEqual(
          10,
        );

        expect(
          chargingParts.length,
        ).toBeGreaterThanOrEqual(
          9,
        );
      },
    );

    test(
      "ne contient aucun identifiant dupliqué",
      () => {
        const allIds = [
          ...chargingEvidences.map(
            (item) => item.id,
          ),

          ...chargingHypotheses.map(
            (item) => item.id,
          ),

          ...chargingParts.map(
            (item) => item.id,
          ),
        ];

        expect(
          new Set(allIds).size,
        ).toBe(
          allIds.length,
        );
      },
    );

    test(
      "chaque pièce référencée par une hypothèse existe",
      () => {
        const partIds =
          new Set(
            chargingParts.map(
              (part) =>
                part.id,
            ),
          );

        for (
          const hypothesis
          of chargingHypotheses
        ) {
          if (
            hypothesis.primaryPartId
          ) {
            expect(
              partIds.has(
                hypothesis.primaryPartId,
              ),
            ).toBe(
              true,
            );
          }

          for (
            const alternativePartId
            of hypothesis.alternativePartIds
          ) {
            expect(
              partIds.has(
                alternativePartId,
              ),
            ).toBe(
              true,
            );
          }
        }
      },
    );

    test(
      "les mesures techniques ne sont pas imposées au particulier",
      () => {
        const measurements =
          chargingEvidences.filter(
            (evidence) =>
              evidence.kind ===
              "measurement",
          );

        expect(
          measurements.length,
        ).toBeGreaterThan(
          0,
        );

        for (
          const measurement
          of measurements
        ) {
          expect(
            measurement.audiences,
          ).not.toContain(
            "particulier",
          );
        }
      },
    );

    test(
      "la panne de courroie conduit vers une pièce vendable",
      () => {
        const hypothesis =
          chargingHypotheses.find(
            (item) =>
              item.id ===
              "charging-accessory-belt-broken",
          );

        expect(
          hypothesis?.primaryPartId,
        ).toBe(
          "part-accessory-belt",
        );
      },
    );

    test(
      "une décharge à l’arrêt ne force pas une vente de pièce",
      () => {
        const hypothesis =
          chargingHypotheses.find(
            (item) =>
              item.id ===
              "charging-parasitic-drain-not-charging-failure",
          );

        expect(
          hypothesis?.primaryPartId,
        ).toBeNull();
      },
    );
  },
);
