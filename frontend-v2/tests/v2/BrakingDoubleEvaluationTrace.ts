import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

type Choice = {
  actionId: string;
  optionId: string;
};

const path: Choice[] = [
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
];

const engine =
  new DiagnosticEngineV2();

console.log("");
console.log(
  "========================================",
);

console.log(
  " BRAKING DOUBLE EVALUATION TRACE",
);

console.log(
  "========================================",
);

let result =
  engine.createSession(
    "braking-double-trace",
    "mecanicien-garage",
    "braking",
    [],
  );

for (
  const [index, choice]
  of path.entries()
) {

  console.log("");
  console.log(
    `######## ANSWER ${index + 1} ########`,
  );

  console.log(
    `ACTION BEFORE=${result.action?.id ?? "NONE"}`,
  );

  console.log(
    `STATUS BEFORE=${result.session.status}`,
  );

  if (!result.action) {
    console.log(
      "STOP: ACTION ABSENTE",
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

  console.log("");
  console.log(
    "--- RESULT AFTER ANSWER ---",
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

  console.log(
    `CURRENT=${result.session.currentActionId ?? "NONE"}`,
  );

  console.log(
    `PENDING=${result.session.pendingAction?.id ?? "NONE"}`,
  );
}

console.log("");
console.log(
  "########################################",
);

console.log(
  " STATE BEFORE SECOND EVALUATION",
);

console.log(
  "########################################",
);

console.log(
  `STATUS=${result.session.status}`,
);

console.log(
  `ACTION=${result.action?.id ?? "NONE"}`,
);

console.log(
  `CURRENT=${result.session.currentActionId ?? "NONE"}`,
);

console.log(
  `PENDING=${result.session.pendingAction?.id ?? "NONE"}`,
);

console.log("");
console.log(
  "########################################",
);

console.log(
  " SECOND evaluateSession()",
);

console.log(
  "########################################",
);

const second =
  engine.evaluateSession(
    result.session,
    "braking",
  );

console.log("");
console.log(
  "--- SECOND RESULT ---",
);

console.log(
  `STATUS=${second.session.status}`,
);

console.log(
  `COMPLETED=${second.completed}`,
);

console.log(
  `ACTION=${second.action?.id ?? "NONE"}`,
);

console.log(
  `CURRENT=${second.session.currentActionId ?? "NONE"}`,
);

console.log(
  `PENDING=${second.session.pendingAction?.id ?? "NONE"}`,
);

console.log("");
console.log(
  "########################################",
);

console.log(
  " THIRD evaluateSession()",
);

console.log(
  "########################################",
);

const third =
  engine.evaluateSession(
    second.session,
    "braking",
  );

console.log("");
console.log(
  "--- THIRD RESULT ---",
);

console.log(
  `STATUS=${third.session.status}`,
);

console.log(
  `COMPLETED=${third.completed}`,
);

console.log(
  `ACTION=${third.action?.id ?? "NONE"}`,
);

console.log(
  `CURRENT=${third.session.currentActionId ?? "NONE"}`,
);

console.log(
  `PENDING=${third.session.pendingAction?.id ?? "NONE"}`,
);

console.log("");
console.log(
  "========================================",
);

console.log(
  " TRACE TERMINE",
);

console.log(
  "========================================",
);
