import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

function assert(
  condition: boolean,
  message: string,
): void {

  if (!condition) {
    throw new Error(message);
  }
}

const engine =
  new DiagnosticEngineV2();

let result =
  engine.createSession(
    "braking-particulier-pulling-recovery",
    "particulier",
    "braking",
    [],
  );

assert(
  result.action?.id ===
    "braking-main-symptom",
  `Initial attendu braking-main-symptom, obtenu ${result.action?.id ?? "NONE"}`,
);

result =
  engine.answer(
    result.session,
    "braking",
    "braking-main-symptom",
    "pulling",
  );

assert(
  result.action?.id ===
    "braking-pull-direction",
  `Après pulling attendu braking-pull-direction, obtenu ${result.action?.id ?? "NONE"}`,
);

result =
  engine.answer(
    result.session,
    "braking",
    "braking-pull-direction",
    "left",
  );

console.log("");
console.log(
  "============================================",
);

console.log(
  " APRES PULLING -> LEFT",
);

console.log(
  "============================================",
);

console.log(
  `STATUS=${result.session.status}`,
);

console.log(
  `ACTION=${result.action?.id ?? "NONE"}`,
);

console.log(
  `TEXT=${result.action?.text ?? "NONE"}`,
);

assert(
  result.session.status !==
    "manual-review-required",
  "Le particulier tombe encore en manual-review immédiatement après LEFT.",
);

assert(
  result.action?.id ===
    "braking-pull-left-particulier-check",
  `Question particulier attendue, obtenu ${result.action?.id ?? "NONE"}`,
);

result =
  engine.answer(
    result.session,
    "braking",
    "braking-pull-left-particulier-check",
    "only-when-braking",
  );

console.log("");
console.log(
  "============================================",
);

console.log(
  " APRES UNIQUEMENT AU FREINAGE",
);

console.log(
  "============================================",
);

console.log(
  `STATUS=${result.session.status}`,
);

console.log(
  `ACTION=${result.action?.id ?? "NONE"}`,
);

console.log(
  `TEXT=${result.action?.text ?? "NONE"}`,
);

assert(
  result.action?.id ===
    "braking-pull-particulier-heat",
  `Observation chaleur attendue, obtenu ${result.action?.id ?? "NONE"}`,
);

result =
  engine.answer(
    result.session,
    "braking",
    "braking-pull-particulier-heat",
    "yes",
  );

console.log("");
console.log(
  "============================================",
);

console.log(
  " APRES CHALEUR / ODEUR",
);

console.log(
  "============================================",
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
  `CONCLUSION=${result.session.conclusion?.diagnosisId ?? "NONE"}`,
);

const probabilities =
  result.reasoning
    .decision
    .probabilities;

console.log("");

for (
  const row
  of probabilities.slice(0, 5)
) {

  console.log(
    `${row.hypothesis.id} | ${(row.probability * 100).toFixed(2)}%`,
  );
}

console.log("");
console.log(
  "============================================",
);

console.log(
  " PARTICULIER PULLING : PARCOURS RECUPERE",
);

console.log(
  "============================================",
);