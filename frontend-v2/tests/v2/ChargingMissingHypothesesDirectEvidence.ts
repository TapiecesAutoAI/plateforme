import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

const cases = [
  {
    expected:
      "problem-alternator-connections",
    evidence:
      "observation-alternator-connection-bad",
  },
  {
    expected:
      "problem-ground-circuit",
    evidence:
      "measurement-ground-voltage-drop-high",
  },
  {
    expected:
      "problem-positive-cable",
    evidence:
      "measurement-positive-voltage-drop-high",
  },
  {
    expected:
      "problem-alternator-command",
    evidence:
      "measurement-alternator-command-missing",
  },
  {
    expected:
      "problem-battery-sensor",
    evidence:
      "observation-battery-sensor-bad",
  },
  {
    expected:
      "problem-freewheel-pulley",
    evidence:
      "observation-alternator-freewheel-pulley-bad",
  },
] as const;

console.log(
  "\n=== CHARGING DIRECT EVIDENCE AUDIT ===",
);

for (
  const testCase
  of cases
) {
  const engine =
    new DiagnosticEngineV2();

  const result =
    engine.createSession(
      `charging-direct-${testCase.expected}`,
      "mecanicien-garage",
      "charging",
      [
        testCase.evidence,
      ],
    );

  const top =
    result.reasoning
      .decision
      .probabilities[0] ??
    null;

  console.log("");
  console.log(
    testCase.expected,
  );

  console.log(
    `  preuve       : ${testCase.evidence}`,
  );

  console.log(
    `  TOP 1        : ${top?.hypothesis.id ?? "aucune"}`,
  );

  console.log(
    `  probabilité  : ${((top?.probability ?? 0) * 100).toFixed(2)} %`,
  );

  console.log(
    `  attendu      : ${
      top?.hypothesis.id ===
      testCase.expected
        ? "OK"
        : "ECHEC"
    }`,
  );
}