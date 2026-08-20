import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

const engine =
  new DiagnosticEngineV2();

const result =
  engine.createSession(
    "charging-ranking-audit",
    "depanneur",
    "charging",
    [],
  );

console.log(
  "\n=== CHARGING FULL IG RANKING ===",
);

result.reasoning
  .decision
  .informationGains
  .forEach(
    (item, index) => {
      console.log(
        `${index + 1}. ${item.question.id} | gain=${item.gain.toFixed(3)} | reduction=${item.expectedReduction.toFixed(3)} | cost=${item.question.cost}`,
      );
    },
  );
