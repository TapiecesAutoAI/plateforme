import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

type Step = {
  actionId: string;
  optionId: string;
};

const scenarios: {
  name: string;
  path: Step[];
}[] = [
  {
    name: "CHARGE LOW + BELT MISSING",
    path: [
      {
        actionId:
          "battery-main-symptom",
        optionId:
          "warning-light",
      },
      {
        actionId:
          "battery-light-behaviour",
        optionId:
          "engine-running",
      },
      {
        actionId:
          "battery-charging-voltage-known",
        optionId:
          "yes",
      },
      {
        actionId:
          "battery-charging-voltage-value",
        optionId:
          "below-12-8",
      },
      {
        actionId:
          "battery-belt-check",
        optionId:
          "missing",
      },
    ],
  },

  {
    name: "CHARGE LOW + BELT LOOSE",
    path: [
      {
        actionId:
          "battery-main-symptom",
        optionId:
          "warning-light",
      },
      {
        actionId:
          "battery-light-behaviour",
        optionId:
          "engine-running",
      },
      {
        actionId:
          "battery-charging-voltage-known",
        optionId:
          "yes",
      },
      {
        actionId:
          "battery-charging-voltage-value",
        optionId:
          "below-12-8",
      },
      {
        actionId:
          "battery-belt-check",
        optionId:
          "loose",
      },
    ],
  },
];

for (
  const scenario
  of scenarios
) {

  const engine: any =
    new DiagnosticEngineV2();

  let result: any =
    engine.createSession(
      `battery-belt-trace-${scenario.name}`,
      "mecanicien-garage",
      "battery",
      [],
    );

  console.log("");
  console.log(
    "============================================================",
  );
  console.log(
    scenario.name,
  );
  console.log(
    "============================================================",
  );

  for (
    const step
    of scenario.path
  ) {

    if (!result.action) {
      console.log(
        "ARRET AVANT:",
        step.actionId,
      );
      break;
    }

    console.log("");
    console.log(
      "ACTION:",
      result.action.id,
    );

    console.log(
      "ATTENDU:",
      step.actionId,
    );

    if (
      result.action.id !==
      step.actionId
    ) {
      console.log(
        "ACTION INATTENDUE",
      );
      break;
    }

    const option =
      result.action.options
        ?.find(
          (candidate: any) =>
            candidate.id ===
            step.optionId,
        );

    if (!option) {
      console.log(
        "OPTION INTROUVABLE:",
        step.optionId,
      );
      break;
    }

    result =
      engine.answer(
        result.session,
        "battery",
        result.action.id,
        option.id,
      );

    const decision =
      result.reasoning
        ?.decision;

    const probabilities =
      decision
        ?.probabilities ??
      [];

    console.log(
      "CHOIX:",
      step.optionId,
    );

    console.log(
      "STATUS:",
      result.session.status,
    );

    console.log(
      "DECISION:",
      decision?.type ??
      "NONE",
    );

    console.log(
      "METRICS:",
      decision?.metrics ??
      "NONE",
    );

    console.log(
      "TOP 5:",
      probabilities
        .slice(
          0,
          5,
        )
        .map(
          (entry: any) =>
            `${entry.hypothesis.id}=${(
              entry.probability *
              100
            ).toFixed(2)}%`,
        )
        .join(" | "),
    );
  }

  console.log("");
  console.log(
    "FINAL STATUS:",
    result.session.status,
  );

  console.log(
    "FINAL ACTION:",
    result.action?.id ??
    "NONE",
  );

  console.log(
    "FINAL CONCLUSION:",
    result.session
      .conclusion
      ?.diagnosisId ??
    "NONE",
  );

  console.log(
    "CONFIRMED:",
    Array.from(
      result.reasoning
        ?.context
        ?.confirmedEvidenceIds ??
      [],
    ),
  );
}

console.log("");
console.log(
  "============================================================",
);
console.log(
  " FIN - AUCUNE MODIFICATION MOTEUR",
);
console.log(
  "============================================================",
);
