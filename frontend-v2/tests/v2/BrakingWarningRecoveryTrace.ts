import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

type Choice = {
  actionId: string;
  optionId: string;
};

const MAX_PATHS = 3000;
const MAX_DEPTH = 25;

const queue: Choice[][] = [
  [],
];

const silentLog =
  console.log;

console.log = () => {};

let explored = 0;

let foundPath:
  Choice[] | null =
  null;

while (
  queue.length > 0 &&
  explored < MAX_PATHS &&
  !foundPath
) {

  const path =
    queue.shift()!;

  explored++;

  const engine =
    new DiagnosticEngineV2();

  let result =
    engine.createSession(
      `braking-warning-search-${explored}`,
      "mecanicien-garage",
      "braking",
      [],
    );

  let valid = true;

  for (
    const choice
    of path
  ) {

    if (
      result.completed ||
      !result.action ||
      result.action.id !==
        choice.actionId
    ) {

      valid = false;
      break;
    }

    const option =
      result.action.options?.find(
        item =>
          item.id ===
          choice.optionId,
      );

    if (!option) {

      valid = false;
      break;
    }

    result =
      engine.answer(
        result.session,
        "braking",
        result.action.id,
        option.id,
      );
  }

  if (!valid) {
    continue;
  }

  if (result.completed) {
    continue;
  }

  if (
    !result.action &&
    result.session.status ===
      "manual-review-required"
  ) {

    const recovery =
      engine.evaluateSession(
        result.session,
        "braking",
      );

    if (
      recovery.session.status ===
        "waiting-for-user" &&
      recovery.action?.id ===
        "braking-warning-type"
    ) {

      foundPath =
        path;

      break;
    }

    continue;
  }

  if (
    result.action?.type ===
      "complete-diagnosis"
  ) {

    const evaluated =
      engine.evaluateSession(
        result.session,
        "braking",
      );

    if (
      !evaluated.completed &&
      evaluated.session.status ===
        "manual-review-required"
    ) {

      const recovery =
        engine.evaluateSession(
          evaluated.session,
          "braking",
        );

      if (
        recovery.session.status ===
          "waiting-for-user" &&
        recovery.action?.id ===
          "braking-warning-type"
      ) {

        foundPath =
          path;

        break;
      }
    }

    continue;
  }

  if (
    !result.action ||
    path.length >=
      MAX_DEPTH
  ) {

    continue;
  }

  for (
    const option
    of result.action.options ?? []
  ) {

    queue.push([
      ...path,
      {
        actionId:
          result.action.id,

        optionId:
          option.id,
      },
    ]);
  }
}

console.log =
  silentLog;

if (!foundPath) {

  console.log(
    "AUCUN CAS WARNING-TYPE TROUVE",
  );

  process.exit(1);
}

console.log("");
console.log(
  "========================================",
);

console.log(
  " BRAKING WARNING RECOVERY TRACE",
);

console.log(
  "========================================",
);

console.log("");
console.log(
  "PATH:",
);

for (
  const choice
  of foundPath
) {

  console.log(
    `${choice.actionId}=${choice.optionId}`,
  );
}

console.log("");
console.log(
  "=== REPLAY AVEC LOGS ===",
);

const engine =
  new DiagnosticEngineV2();

let result =
  engine.createSession(
    "braking-warning-trace",
    "mecanicien-garage",
    "braking",
    [],
  );

for (
  const [
    index,
    choice,
  ]
  of foundPath.entries()
) {

  console.log("");
  console.log(
    `######## ANSWER ${index + 1} ########`,
  );

  console.log(
    `ACTION=${result.action?.id ?? "NONE"}`,
  );

  console.log(
    `CHOIX=${choice.optionId}`,
  );

  if (!result.action) {
    break;
  }

  result =
    engine.answer(
      result.session,
      "braking",
      result.action.id,
      choice.optionId,
    );

  console.log(
    `STATUS=${result.session.status}`,
  );

  console.log(
    `NEXT=${result.action?.id ?? "NONE"}`,
  );

  const top =
    result.reasoning
      .decision
      .probabilities
      .slice(0, 5);

  console.log(
    "TOP=" +
    top
      .map(
        item =>
          `${item.hypothesis.id}=${(item.probability * 100).toFixed(2)}%`,
      )
      .join(" | "),
  );
}

console.log("");
console.log(
  "=== ETAT APRES PARCOURS ===",
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
  "=== EVALUATE #1 ===",
);

const first =
  engine.evaluateSession(
    result.session,
    "braking",
  );

console.log("");
console.log(
  `STATUS=${first.session.status}`,
);

console.log(
  `ACTION=${first.action?.id ?? "NONE"}`,
);

console.log(
  `CURRENT=${first.session.currentActionId ?? "NONE"}`,
);

console.log(
  `PENDING=${first.session.pendingAction?.id ?? "NONE"}`,
);

console.log("");
console.log(
  "=== EVALUATE #2 ===",
);

const second =
  engine.evaluateSession(
    first.session,
    "braking",
  );

console.log("");
console.log(
  `STATUS=${second.session.status}`,
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
  "=== DECISION FINALE ===",
);

console.log(
  `TYPE=${second.reasoning.decision.type}`,
);

console.log(
  `SELECTED QUESTION=${second.reasoning.decision.selectedQuestion?.id ?? "NONE"}`,
);

console.log(
  "TOP=" +
  second.reasoning
    .decision
    .probabilities
    .slice(0, 5)
    .map(
      item =>
        `${item.hypothesis.id}=${(item.probability * 100).toFixed(2)}%`,
    )
    .join(" | "),
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
