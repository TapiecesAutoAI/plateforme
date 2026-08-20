import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

const realLog = console.log;
console.log = () => {};

const firstOptions = [
  "battery-light",
  "battery-discharges",
  "electrical-weakness",
  "overvoltage",
  "noise",
];

const rows: string[] = [];

for (const firstOption of firstOptions) {
  const engine =
    new DiagnosticEngineV2();

  let result =
    engine.createSession(
      `voltage-audit-${firstOption}`,
      "mecanicien-garage",
      "charging",
      [],
    );

  if (
    !result.action ||
    result.action.id !==
      "charging-main-symptom"
  ) {
    rows.push(
      `${firstOption} | ERREUR PREMIERE ACTION`,
    );
    continue;
  }

  result =
    engine.answer(
      result.session,
      "charging",
      result.action.id,
      firstOption,
    );

  const secondAction =
    result.action;

  if (
    !secondAction ||
    secondAction.id !==
      "charging-voltage-value"
  ) {
    rows.push(
      `${firstOption} | NEXT=${secondAction?.id ?? "NONE"}`,
    );
    continue;
  }

  for (
    const voltageOption
    of secondAction.options ?? []
  ) {
    const branchEngine =
      new DiagnosticEngineV2();

    let branch =
      branchEngine.createSession(
        `voltage-${firstOption}-${voltageOption.id}`,
        "mecanicien-garage",
        "charging",
        [],
      );

    branch =
      branchEngine.answer(
        branch.session,
        "charging",
        branch.action!.id,
        firstOption,
      );

    branch =
      branchEngine.answer(
        branch.session,
        "charging",
        branch.action!.id,
        voltageOption.id,
      );

    const top =
      branch.reasoning
        .decision
        .probabilities[0];

    rows.push(
      [
        firstOption,
        voltageOption.id,
        `TOP=${top?.hypothesis.id ?? "NONE"}`,
        `P=${((top?.probability ?? 0) * 100).toFixed(2)}%`,
        `COMPLETED=${branch.completed}`,
        `NEXT=${branch.action?.id ?? "NONE"}`,
      ].join(" | "),
    );
  }
}

console.log = realLog;

console.log(
  "\n=== CHARGING VOLTAGE OUTCOME AUDIT ===",
);

for (const row of rows) {
  console.log(row);
}
