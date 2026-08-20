import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

const engine: any =
  new DiagnosticEngineV2();

const original =
  engine
    .selectNonRedundantAction
    .bind(engine);

engine.selectNonRedundantAction =
  function (
    session: any,
    knowledge: any,
    selectedAction: any,
  ) {

    console.log("");
    console.log(
      "============================================================",
    );
    console.log(
      " SELECT NON REDUNDANT ACTION — TRACE",
    );
    console.log(
      "============================================================",
    );

    console.log(
      "STATUS:",
      session.status,
    );

    console.log(
      "CURRENT:",
      session.currentActionId ??
        "NONE",
    );

    console.log(
      "SELECTED INPUT:",
      selectedAction?.id ??
        "NONE",
    );

    console.log("");
    console.log(
      "COMPLETED ACTIONS:",
    );

    for (
      const actionId
      of session.completedActionIds ?? []
    ) {
      console.log(
        " +",
        actionId,
      );
    }

    console.log("");
    console.log(
      "CONFIRMED EVIDENCE:",
    );

    for (
      const evidence
      of session.evidence ?? []
    ) {
      console.log(
        " +",
        evidence.id,
      );
    }

    const result =
      original(
        session,
        knowledge,
        selectedAction,
      );

    console.log("");
    console.log(
      "RECOVERY RESULT:",
      result?.id ??
        "NONE",
    );

    console.log(
      "============================================================",
    );

    return result;
  };


const path = [
  {
    actionId:
      "braking-main-symptom",
    optionId:
      "weak-braking",
  },
  {
    actionId:
      "braking-pedal-feel",
    optionId:
      "normal",
  },
  {
    actionId:
      "braking-pad-thickness",
    optionId:
      "worn",
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
      "hose",
  },
];


let result =
  engine.createSession(
    "braking-recovery-selection-trace",
    "mecanicien-garage",
    "braking",
    [],
  );


console.log("");
console.log(
  "=== SESSION INITIALE ===",
);

console.log(
  "STATUS:",
  result.session.status,
);

console.log(
  "ACTION:",
  result.action?.id ??
    "NONE",
);


for (
  let index = 0;
  index < path.length;
  index++
) {

  const step =
    path[index];

  console.log("");
  console.log(
    `######## ANSWER ${index + 1} ########`,
  );

  console.log(
    "ATTENDU:",
    step.actionId,
  );

  console.log(
    "ACTION:",
    result.action?.id ??
      "NONE",
  );

  console.log(
    "CHOIX:",
    step.optionId,
  );


  if (!result.action) {

    console.log(
      "ERREUR : aucune action disponible.",
    );

    break;
  }


  if (
    result.action.id !==
    step.actionId
  ) {

    console.log(
      "ERREUR : action inattendue.",
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
      "ERREUR : option introuvable.",
    );

    console.log(
      "OPTIONS:",
      result.action.options
        ?.map(
          (candidate: any) =>
            candidate.id,
        )
        .join(", "),
    );

    break;
  }


  result =
    engine.answer(
      result.session,
      "braking",
      result.action.id,
      option.id,
    );


  console.log("");
  console.log(
    "STATUS APRES:",
    result.session.status,
  );

  console.log(
    "NEXT:",
    result.action?.id ??
      "NONE",
  );


  const probabilities =
    result.reasoning
      ?.decision
      ?.probabilities ??
      [];


  console.log(
    "TOP:",
    probabilities
      .slice(0, 5)
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
  "============================================================",
);
console.log(
  " ETAT APRES PARCOURS",
);
console.log(
  "============================================================",
);

console.log(
  "STATUS:",
  result.session.status,
);

console.log(
  "ACTION:",
  result.action?.id ??
    "NONE",
);

console.log(
  "CURRENT:",
  result.session
    .currentActionId ??
    "NONE",
);

console.log(
  "PENDING:",
  result.session
    .pendingAction
    ?.id ??
    "NONE",
);


console.log("");
console.log(
  "=== RE-EVALUATION RECOVERY ===",
);

const recovery =
  engine.evaluateSession(
    result.session,
    "braking",
  );


console.log("");
console.log(
  "STATUS:",
  recovery.session.status,
);

console.log(
  "RECOVERY ACTION:",
  recovery.action?.id ??
    "NONE",
);

console.log(
  "CURRENT:",
  recovery.session
    .currentActionId ??
    "NONE",
);

console.log(
  "PENDING:",
  recovery.session
    .pendingAction
    ?.id ??
    "NONE",
);


const finalProbabilities =
  recovery.reasoning
    ?.decision
    ?.probabilities ??
    [];


console.log("");
console.log(
  "=== DECISION RUNTIME KEYS ===",
);

const decisionRuntime =
  recovery.reasoning
    ?.decision;

console.log(
  "DECISION EXISTS:",
  Boolean(decisionRuntime),
);

console.log(
  "DECISION KEYS:",
  decisionRuntime
    ? Object.keys(decisionRuntime)
    : [],
);

console.log("");
console.log(
  "=== DECISION RUNTIME DUMP ===",
);

console.dir(
  decisionRuntime,
  {
    depth: 6,
    colors: false,
  },
);

console.log("");
console.log(
  "TOP:",
  finalProbabilities
    .slice(0, 5)
    .map(
      (entry: any) =>
        `${entry.hypothesis.id}=${(
          entry.probability *
          100
        ).toFixed(2)}%`,
    )
    .join(" | "),
);

console.log("");
console.log(
  "=== DECISION METRICS FINALES ===",
);

console.log(
  "DECISION TYPE:",
  recovery.reasoning?.decision?.type ??
    "NONE",
);

console.log(
  "METRICS:",
  recovery.reasoning?.decision?.metrics ??
    "NONE",
);

console.log(
  "EXPLANATION:",
  recovery.reasoning?.decision?.explanation ??
    "NONE",
);

console.log(
  "DIAGNOSTIC:",
  recovery.reasoning?.decision?.diagnostic ??
    "NONE",
);


console.log("");
console.log(
  "=== FIN — AUCUNE MODIFICATION MOTEUR ===",
);


