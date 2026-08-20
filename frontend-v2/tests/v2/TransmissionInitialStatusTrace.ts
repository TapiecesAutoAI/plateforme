import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

const realLog =
  console.log;

console.log = () => {};

const engine =
  new DiagnosticEngineV2();

const result =
  engine.createSession(
    "transmission-initial-status-trace",
    "particulier",
    "transmission",
    [],
  );

console.log =
  realLog;

console.log("");
console.log(
  "============================================================",
);

console.log(
  " TRANSMISSION INITIAL STATUS TRACE",
);

console.log(
  "============================================================",
);

console.log(
  `STATUS=${result.session.status}`,
);

console.log(
  `ACTION=${result.action?.id ?? "NONE"}`,
);

console.log(
  `PENDING=${result.session.pendingAction?.id ?? "NONE"}`,
);

console.log(
  `CURRENT=${result.session.currentActionId ?? "NONE"}`,
);

console.log(
  `COMPLETED=${result.completed}`,
);

console.log(
  `DECISION_TYPE=${result.reasoning.decision.type}`,
);

console.log(
  `SELECTED_QUESTION=${result.reasoning.decision.selectedQuestion?.id ?? "NONE"}`,
);

console.log(
  `DIAGNOSTIC=${result.reasoning.decision.diagnostic.hypothesis?.id ?? "NONE"}`,
);

console.log(
  `CONFIDENCE=${(
    result.reasoning.decision.diagnostic.confidence *
    100
  ).toFixed(2)}%`,
);

console.log("");
console.log(
  "COMPLETION ADVICE",
);

console.log(
  JSON.stringify(
    result.completionAdvice,
    null,
    2,
  ),
);

console.log("");
console.log(
  "============================================================",
);