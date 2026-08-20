import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

const engine =
  new DiagnosticEngineV2();

let result =
  engine.createSession(
    "braking-terminal-mask",
    "mecanicien-garage",
    "braking",
    [],
  );

const path = [
  {
    actionId: "braking-main-symptom",
    optionId: "vibration",
  },
  {
    actionId: "braking-vibration-location",
    optionId: "vehicle",
  },
  {
    actionId: "braking-rear-brakes-check",
    optionId: "good",
  },
];

for (
  const [index, choice]
  of path.entries()
) {

  if (!result.action) {
    throw new Error(
      `Action absente étape ${index + 1}`,
    );
  }

  console.log("");
  console.log(
    `=== AVANT ANSWER ${index + 1} ===`,
  );

  console.log(
    `ACTION=${result.action.id}`,
  );

  console.log(
    `CURRENT=${result.session.currentActionId ?? "NONE"}`,
  );

  console.log(
    `CHOIX=${choice.optionId}`,
  );

  result =
    engine.answer(
      result.session,
      "braking",
      result.action.id,
      choice.optionId,
    );

  console.log("");
  console.log(
    `=== APRES ANSWER ${index + 1} ===`,
  );

  console.log(
    `STATUS=${result.session.status}`,
  );

  console.log(
    `RETURNED ACTION=${result.action?.id ?? "NONE"}`,
  );

  console.log(
    `CURRENT=${result.session.currentActionId ?? "NONE"}`,
  );

  console.log(
    `PENDING=${result.session.pendingAction?.id ?? "NONE"}`,
  );

  console.log(
    `DECISION TYPE=${result.reasoning.decision.type}`,
  );

  console.log(
    `DECISION SELECTED QUESTION=${
      result.reasoning.decision
        .selectedQuestion?.id ??
      "NONE"
    }`,
  );

  console.log(
    `DIAGNOSTIC=${
      result.reasoning.decision
        .diagnostic
        .hypothesis?.id ??
      "NONE"
    }`,
  );

  console.log(
    `CONFIDENCE=${
      (
        result.reasoning.decision
          .diagnostic
          .confidence *
        100
      ).toFixed(2)
    }%`,
  );
}

console.log("");
console.log(
  "=== RE-EVALUATION ===",
);

const second =
  engine.evaluateSession(
    result.session,
    "braking",
  );

console.log(
  `STATUS=${second.session.status}`,
);

console.log(
  `ACTION=${second.action?.id ?? "NONE"}`,
);

console.log(
  `DECISION TYPE=${second.reasoning.decision.type}`,
);

console.log(
  `DECISION SELECTED QUESTION=${
    second.reasoning.decision
      .selectedQuestion?.id ??
    "NONE"
  }`,
);
