import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

const realLog = console.log;
console.log = () => {};

const profiles = [
  "particulier",
  "bricoleur",
  "vendeur-pieces-auto",
  "mecanicien-garage",
  "depanneur",
] as const;

const rows: string[] = [];

for (const profile of profiles) {

  const engine =
    new DiagnosticEngineV2();

  const start =
    engine.createSession(
      `voltage-first-${profile}`,
      profile,
      "charging",
      [],
    );

  const first =
    start.action;

  rows.push(
    `${profile} | FIRST=${first?.id ?? "NONE"}`,
  );

  if (!first) {
    continue;
  }

  for (
    const option
    of first.options ?? []
  ) {

    const branchEngine =
      new DiagnosticEngineV2();

    let branch =
      branchEngine.createSession(
        `voltage-first-${profile}-${option.id}`,
        profile,
        "charging",
        [],
      );

    if (!branch.action) {
      continue;
    }

    branch =
      branchEngine.answer(
        branch.session,
        "charging",
        branch.action.id,
        option.id,
      );

    const top =
      branch.reasoning
        .decision
        .probabilities[0];

    rows.push(
      [
        `  ${option.id}`,
        `TOP=${top?.hypothesis.id ?? "NONE"}`,
        `P=${((top?.probability ?? 0) * 100).toFixed(2)}%`,
        `COMPLETED=${branch.completed}`,
        `NEXT=${branch.action?.id ?? "NONE"}`,
      ].join(" | "),
    );
  }
}

console.log = realLog;

console.log("");
console.log(
  "=== CHARGING FIRST ACTION OUTCOMES ===",
);

for (const row of rows) {
  console.log(row);
}
