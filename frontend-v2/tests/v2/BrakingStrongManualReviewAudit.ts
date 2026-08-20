import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

type Choice = {
  actionId: string;
  optionId: string;
};

const scenarios: {
  name: string;
  path: Choice[];
}[] = [
  {
    name:
      "DISC OVERHEATED + CALIPER",
    path: [
      {
        actionId:
          "braking-main-symptom",
        optionId:
          "vibration",
      },
      {
        actionId:
          "braking-vibration-location",
        optionId:
          "steering-wheel",
      },
      {
        actionId:
          "braking-front-disc-runout",
        optionId:
          "not-tested",
      },
      {
        actionId:
          "braking-disc-condition",
        optionId:
          "overheated",
      },
      {
        actionId:
          "braking-caliper-hose-check",
        optionId:
          "caliper",
      },
    ],
  },

  {
    name:
      "PULL LEFT + HOSE",
    path: [
      {
        actionId:
          "braking-main-symptom",
        optionId:
          "pulling",
      },
      {
        actionId:
          "braking-pull-direction",
        optionId:
          "left",
      },
      {
        actionId:
          "braking-left-right-temperature",
        optionId:
          "yes",
      },
      {
        actionId:
          "braking-caliper-hose-check",
        optionId:
          "hose",
      },
    ],
  },

  {
    name:
      "PULL RIGHT + HOSE",
    path: [
      {
        actionId:
          "braking-main-symptom",
        optionId:
          "pulling",
      },
      {
        actionId:
          "braking-pull-direction",
        optionId:
          "right",
      },
      {
        actionId:
          "braking-left-right-temperature",
        optionId:
          "yes",
      },
      {
        actionId:
          "braking-caliper-hose-check",
        optionId:
          "hose",
      },
    ],
  },
];

const realLog =
  console.log;

for (
  const [
    scenarioIndex,
    scenario,
  ]
  of scenarios.entries()
) {

  console.log("");
  console.log(
    "============================================================",
  );

  console.log(
    `SCENARIO ${scenarioIndex + 1} — ${scenario.name}`,
  );

  console.log(
    "============================================================",
  );

  const engine =
    new DiagnosticEngineV2();

  let result =
    engine.createSession(
      `braking-strong-review-${scenarioIndex}`,
      "mecanicien-garage",
      "braking",
      [],
    );

  for (
    const [
      index,
      choice,
    ]
    of scenario.path.entries()
  ) {

    if (!result.action) {

      console.log(
        `ERREUR : action absente avant etape ${index + 1}`,
      );

      break;
    }

    console.log("");
    console.log(
      `ETAPE ${index + 1}`,
    );

    console.log(
      `ACTION=${result.action.id}`,
    );

    console.log(
      `CHOIX=${choice.optionId}`,
    );

    if (
      result.action.id !==
      choice.actionId
    ) {

      console.log(
        `INCOHERENCE attendu=${choice.actionId}`,
      );

      break;
    }

    result =
      engine.answer(
        result.session,
        "braking",
        result.action.id,
        choice.optionId,
      );

    const ranking =
      result.reasoning
        .decision
        .probabilities
        .slice(0, 5)
        .map(
          item =>
            `${item.hypothesis.id}=${(item.probability * 100).toFixed(2)}%`,
        )
        .join(" | ");

    console.log(
      `STATUS=${result.session.status}`,
    );

    console.log(
      `COMPLETED=${result.completed}`,
    );

    console.log(
      `NEXT=${result.action?.id ?? "NONE"}`,
    );

    console.log(
      `RANKING=${ranking}`,
    );

    console.log(
      "STOP SUGGESTION=",
      JSON.stringify(
        result.stopSuggestion ??
        null,
      ),
    );

    console.log(
      "COMPLETION ADVICE=",
      JSON.stringify(
        result.completionAdvice ??
        null,
      ),
    );
  }

  console.log("");
  console.log(
    "=== FINAL BEFORE/AFTER EVALUATE ===",
  );

  console.log(
    `STATUS=${result.session.status}`,
  );

  console.log(
    `COMPLETED=${result.completed}`,
  );

  console.log(
    `ACTION=${result.action?.id ?? "NONE"}`,
  );

  const before =
    result.reasoning
      .decision
      .probabilities
      .slice(0, 5);

  for (
    const item
    of before
  ) {

    console.log(
      `${item.hypothesis.id} ${(item.probability * 100).toFixed(2)}%`,
    );
  }

  console.log("");
  console.log(
    "--- evaluateSession() ---",
  );

  const evaluated =
    engine.evaluateSession(
      result.session,
      "braking",
    );

  console.log(
    `STATUS=${evaluated.session.status}`,
  );

  console.log(
    `COMPLETED=${evaluated.completed}`,
  );

  console.log(
    `ACTION=${evaluated.action?.id ?? "NONE"}`,
  );

  console.log(
    `CONCLUSION=${evaluated.session.conclusion?.diagnosisId ?? "NONE"}`,
  );

  console.log(
    "STOP SUGGESTION=",
    JSON.stringify(
      evaluated.stopSuggestion ??
      null,
    ),
  );

  console.log(
    "COMPLETION ADVICE=",
    JSON.stringify(
      evaluated.completionAdvice ??
      null,
    ),
  );

  console.log("");
  console.log(
    "TOP FINAL:",
  );

  for (
    const item
    of evaluated.reasoning
      .decision
      .probabilities
      .slice(0, 5)
  ) {

    console.log(
      `${item.hypothesis.id} ${(item.probability * 100).toFixed(2)}%`,
    );
  }
}

console.log =
  realLog;
