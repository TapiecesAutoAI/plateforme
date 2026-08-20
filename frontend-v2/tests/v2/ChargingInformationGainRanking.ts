import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

const engine =
  new DiagnosticEngineV2();

const result =
  engine.createSession(
    "charging-ig-audit",
    "mecanicien-garage",
    "charging",
    [],
  );

const gains =
  result.reasoning
    .decision
    .informationGains;

console.log(
  "\n=== CHARGING INFORMATION GAIN RANKING ===",
);

for (
  const item
  of gains.slice(0, 25)
) {
  console.log(
    `${item.question.id} | gain=${item.gain.toFixed(3)} | reduction=${item.expectedReduction.toFixed(3)} | cost=${item.question.cost}`,
  );
}
