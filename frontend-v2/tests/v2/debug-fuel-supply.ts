import { ScenarioExecutor } from "./ScenarioExecutor";
import { STARTING_REFERENCE_SCENARIOS_V2 } from "./StartingReferenceScenariosV2";

const scenario =
  STARTING_REFERENCE_SCENARIOS_V2.find(
    item => item.id === "starting-v2-fuel-supply",
  );

if (!scenario) {
  throw new Error("Scénario introuvable.");
}

const executor = new ScenarioExecutor();

const result = executor.execute(scenario);

console.log(
  JSON.stringify(
    result.steps.map((step, index) => ({
      step: index + 1,
      selected: step.questionId,
      selectedOption: step.selectedOptionId,
    })),
    null,
    2,
  ),
);

console.log("\nRESULTAT FINAL");
console.log(
  JSON.stringify(
    {
      conclusionId: result.conclusionId,
      confidence: result.confidence,
      failures: result.failures,
    },
    null,
    2,
  ),
);
