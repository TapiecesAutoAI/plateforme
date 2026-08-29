import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticEngineV2,
} from "../engine/core/DiagnosticEngineV2";

import {
  findEntitiesInText,
} from "../lib/ai/knowledge/matcher";

describe(
  "CHAT13 — plainte initiale avec 1 clic",
  () => {
    it(
      "reconnait 1 clic et ne redemande pas le type de demarrage",
      () => {
        const complaint =
          "ma voiture ne démarre pas , et j'entends 1 clic";

        const detectedIds =
          findEntitiesInText(
            complaint,
          ).map(
            entity => entity.id,
          );

        expect(
          detectedIds,
        ).toContain(
          "symptom-single-click-start",
        );

        const bridgedIds =
          detectedIds.flatMap(
            evidenceId => {
              switch (evidenceId) {
                case "symptom-single-click-start":
                  return [
                    evidenceId,
                    "symptom-single-click",
                  ];

                case "symptom-rapid-clicking-start":
                  return [
                    evidenceId,
                    "symptom-rapid-clicking",
                  ];

                default:
                  return [
                    evidenceId,
                  ];
              }
            },
          );

        expect(
          bridgedIds,
        ).toContain(
          "symptom-single-click",
        );

        const engine =
          new DiagnosticEngineV2();

        const result =
          engine.createSession(
            "chat13-single-click-test",
            "bricoleur",
            "starting",
            bridgedIds,
          );

        expect(
          result.action?.id,
        ).not.toBe(
          "starting-mode",
        );

        expect(
          result.action?.id,
        ).not.toBe(
          "starting-single-click-lights",
        );

        const questionText =
          result.action?.question ??
          result.action?.label ??
          "";

        expect(
          questionText.toLowerCase(),
        ).not.toContain(
          "que se passe-t-il lorsque vous essayez de démarrer",
        );
      },
    );
  },
);