import {
  describe,
  expect,
  test,
} from "vitest";

import {
  createChargingKnowledgePackage,
} from "../engine/knowledge/charging/ChargingKnowledgeAdapter";

import {
  HypothesisScorer,
} from "../engine/reasoning/HypothesisScorer";

describe(
  "ChargingKnowledgeAdapter",
  () => {
    test(
      "convertit le pack Charging au format KnowledgePackage",
      () => {
        const knowledge =
          createChargingKnowledgePackage();

        expect(
          knowledge.domain,
        ).toBe(
          "charging",
        );

        expect(
          knowledge.evidences.length,
        ).toBeGreaterThan(
          0,
        );

        expect(
          knowledge.hypotheses.length,
        ).toBeGreaterThan(
          0,
        );

        expect(
          knowledge.rules.length,
        ).toBeGreaterThan(
          0,
        );

        expect(
          knowledge.parts.length,
        ).toBeGreaterThan(
          0,
        );
      },
    );

    test(
      "une courroie cassée place la panne de courroie en tête",
      () => {
        const scorer =
          new HypothesisScorer();

        const result =
          scorer.score(
            createChargingKnowledgePackage(),
            [
              "charging-belt-missing-or-broken",
            ],
          );

        expect(
          result[0]?.id,
        ).toBe(
          "charging-accessory-belt-broken",
        );
      },
    );

    test(
      "une surtension place le régulateur en tête",
      () => {
        const scorer =
          new HypothesisScorer();

        const result =
          scorer.score(
            createChargingKnowledgePackage(),
            [
              "charging-voltage-above-15",
            ],
          );

        expect(
          result[0]?.id,
        ).toBe(
          "charging-voltage-regulator-failure",
        );
      },
    );

    test(
      "une mauvaise connexion B+ place la liaison positive en tête",
      () => {
        const scorer =
          new HypothesisScorer();

        const result =
          scorer.score(
            createChargingKnowledgePackage(),
            [
              "charging-bplus-connection-bad",
            ],
          );

        expect(
          result[0]?.id,
        ).toBe(
          "charging-bplus-connection-failure",
        );
      },
    );

    test(
      "une mauvaise masse place le défaut de masse en tête",
      () => {
        const scorer =
          new HypothesisScorer();

        const result =
          scorer.score(
            createChargingKnowledgePackage(),
            [
              "charging-ground-connection-bad",
            ],
          );

        expect(
          result[0]?.id,
        ).toBe(
          "charging-ground-connection-failure",
        );
      },
    );

    test(
      "un fusible principal coupé place le fusible en tête",
      () => {
        const scorer =
          new HypothesisScorer();

        const result =
          scorer.score(
            createChargingKnowledgePackage(),
            [
              "charging-main-fuse-blown",
            ],
          );

        expect(
          result[0]?.id,
        ).toBe(
          "charging-main-fuse-failure",
        );
      },
    );
  },
);