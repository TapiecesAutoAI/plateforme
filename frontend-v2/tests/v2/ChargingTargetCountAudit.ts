import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

const engine =
  new DiagnosticEngineV2();

const result =
  engine.createSession(
    "charging-target-count-audit",
    "mecanicien-garage",
    "charging",
    [],
  );

const context =
  result.reasoning.context;

console.log(
  "\n=== CHARGING TARGET COUNT AUDIT ===",
);

for (
  const gain
  of result.reasoning
    .decision
    .informationGains
    .slice(0, 25)
) {
  const question =
    gain.question;

  console.log(
    [
      question.id,
      `gain=${gain.gain.toFixed(3)}`,
      `reduction=${gain.expectedReduction.toFixed(3)}`,
      `evidences=${question.targetEvidenceIds.length}`,
      `hypotheses=${question.targetHypothesisIds.length}`,
      `targets=[${question.targetHypothesisIds.join(",")}]`,
    ].join(
      " | ",
    ),
  );
}
