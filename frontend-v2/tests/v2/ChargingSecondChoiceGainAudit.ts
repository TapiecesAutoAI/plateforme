import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

const realLog = console.log;
console.log = () => {};

const symptoms = [
  "battery-light",
  "battery-discharges",
  "electrical-weakness",
  "overvoltage",
  "noise",
];

const rows: string[] = [];

for (const symptom of symptoms) {

  const engine =
    new DiagnosticEngineV2();

  let result =
    engine.createSession(
      `charging-second-choice-${symptom}`,
      "mecanicien-garage",
      "charging",
      [],
    );

  result =
    engine.answer(
      result.session,
      "charging",
      result.action!.id,
      symptom,
    );

  rows.push("");
  rows.push(
    `=== ${symptom} ===`,
  );

  rows.push(
    `NEXT=${result.action?.id ?? "NONE"}`,
  );

  for (
    const gain
    of result.reasoning
      .decision
      .informationGains
      .slice(0, 12)
  ) {
    rows.push(
      `${gain.question.id} | gain=${gain.gain.toFixed(3)} | reduction=${gain.expectedReduction.toFixed(3)}`,
    );
  }
}

console.log = realLog;

console.log(
  "\n=== CHARGING SECOND CHOICE GAIN AUDIT ===",
);

for (const row of rows) {
  console.log(row);
}
