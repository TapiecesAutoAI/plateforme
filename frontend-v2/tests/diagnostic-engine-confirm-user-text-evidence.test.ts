import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticEngineV2,
} from "../engine/core/DiagnosticEngineV2";

describe(
  "DiagnosticEngineV2 confirmUserTextEvidence",
  () => {

    it(
      "confirms a valid workflow evidence and reevaluates the same session",
      () => {

        const engine =
          new DiagnosticEngineV2();

        const initialStep =
          engine.createSession(
            crypto.randomUUID(),
            "particulier",
            "starting",
            [],
          );

        const session =
          initialStep.session;

        expect(
          session.evidence.some(
            evidence =>
              evidence.id ===
              "symptom-single-click",
          ),
        ).toBe(false);

        const nextStep =
          engine.confirmUserTextEvidence(
            session,
            "starting",
            "symptom-single-click",
          );

        const evidence =
          session.evidence.find(
            item =>
              item.id ===
              "symptom-single-click",
          );

        expect(
          evidence,
        ).toBeDefined();

        expect(
          evidence?.source,
        ).toBe(
          "user-text",
        );

        expect(
          nextStep.session,
        ).toBe(
          session,
        );
      },
    );

    it(
      "is idempotent for an already confirmed evidence",
      () => {

        const engine =
          new DiagnosticEngineV2();

        const step =
          engine.createSession(
            crypto.randomUUID(),
            "particulier",
            "starting",
            [
              "symptom-single-click",
            ],
          );

        const session =
          step.session;

        const before =
          session.evidence.filter(
            evidence =>
              evidence.id ===
              "symptom-single-click",
          ).length;

        engine.confirmUserTextEvidence(
          session,
          "starting",
          "symptom-single-click",
        );

        const after =
          session.evidence.filter(
            evidence =>
              evidence.id ===
              "symptom-single-click",
          ).length;

        expect(before).toBe(1);
        expect(after).toBe(1);
      },
    );

    it(
      "rejects an evidence that does not belong to the workflow knowledge",
      () => {

        const engine =
          new DiagnosticEngineV2();

        const step =
          engine.createSession(
            crypto.randomUUID(),
            "particulier",
            "starting",
            [],
          );

        expect(
          () =>
            engine.confirmUserTextEvidence(
              step.session,
              "starting",
              "invented-browser-evidence",
            ),
        ).toThrow(
          /Evidence inconnue/,
        );

        expect(
          step.session.evidence.some(
            evidence =>
              evidence.id ===
              "invented-browser-evidence",
          ),
        ).toBe(false);
      },
    );

  },
);