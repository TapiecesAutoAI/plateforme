import {
  describe,
  expect,
  test,
} from "vitest";

import {
  ChargingQuestionPlanner,
  chargingQuestions,
  chargingRules,
} from "../engine/knowledge/charging";

describe(
  "Pack 02 Charging",
  () => {
    test(
      "contient une base de règles pondérées",
      () => {
        expect(
          chargingRules.length,
        ).toBeGreaterThanOrEqual(
          30,
        );
      },
    );

    test(
      "contient des questions simples et techniques",
      () => {
        expect(
          chargingQuestions.length,
        ).toBeGreaterThanOrEqual(
          10,
        );

        expect(
          chargingQuestions.some(
            (question) =>
              question.requiresMeasurement,
          ),
        ).toBe(
          true,
        );

        expect(
          chargingQuestions.some(
            (question) =>
              !question.requiresMeasurement,
          ),
        ).toBe(
          true,
        );
      },
    );

    test(
      "le particulier ne reçoit pas de mesure au multimètre",
      () => {
        const planner =
          new ChargingQuestionPlanner();

        const questions =
          planner.getAvailableQuestions(
            "particulier",
          );

        expect(
          questions.length,
        ).toBeGreaterThan(
          0,
        );

        expect(
          questions.some(
            (question) =>
              question.requiresMeasurement,
          ),
        ).toBe(
          false,
        );
      },
    );

    test(
      "le garage peut recevoir la question de tension",
      () => {
        const planner =
          new ChargingQuestionPlanner();

        const questions =
          planner.getAvailableQuestions(
            "garage",
          );

        expect(
          questions.some(
            (question) =>
              question.id ===
              "charging-question-voltage",
          ),
        ).toBe(
          true,
        );
      },
    );

    test(
      "la meilleure première question du particulier ne nécessite pas de mesure",
      () => {
        const planner =
          new ChargingQuestionPlanner();

        const candidate =
          planner.selectNextQuestion(
            "particulier",
            [],
          );

        expect(
          candidate,
        ).not.toBeNull();

        expect(
          candidate?.question
            .requiresMeasurement,
        ).toBe(
          false,
        );
      },
    );

    test(
      "le garage privilégie la tension quand l’alternateur et le régulateur sont en concurrence",
      () => {
        const planner =
          new ChargingQuestionPlanner();

        const candidate =
          planner.selectNextQuestion(
            "garage",
            [],
            [],
            [
              "charging-alternator-not-charging",
              "charging-voltage-regulator-failure",
            ],
          );

        expect(
          candidate?.question.id,
        ).toBe(
          "charging-question-voltage",
        );
      },
    );

    test(
      "une question déjà terminée n’est pas reposée",
      () => {
        const planner =
          new ChargingQuestionPlanner();

        const first =
          planner.selectNextQuestion(
            "particulier",
            [],
          );

        expect(
          first,
        ).not.toBeNull();

        const second =
          planner.selectNextQuestion(
            "particulier",
            [],
            [
              first!.question.id,
            ],
          );

        expect(
          second?.question.id,
        ).not.toBe(
          first?.question.id,
        );
      },
    );

    test(
      "toutes les règles ont un poids valide",
      () => {
        for (
          const rule
          of chargingRules
        ) {
          expect(
            rule.weight,
          ).toBeGreaterThan(
            0,
          );

          expect(
            rule.weight,
          ).toBeLessThanOrEqual(
            1,
          );
        }
      },
    );
  },
);
