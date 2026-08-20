import { STARTING_REFERENCE_SCENARIOS_V2 } from "./StartingReferenceScenarios";
import { ScenarioExecutor } from "./ScenarioExecutor";
import { ScenarioValidator } from "./ScenarioValidator";

export function runScenarioSuite() {
  const executor = new ScenarioExecutor();
  const validator = new ScenarioValidator();

  const results = STARTING_REFERENCE_SCENARIOS_V2.map((scenario) =>
    validator.validate(
      scenario,
      executor.execute(scenario),
    ),
  );

  let pass = 0;
  let fail = 0;

  console.log("");
  console.log("========================================");
  console.log(" STARTING SCENARIO RUNNER V2");
  console.log("========================================");
  console.log("");

  for (const result of results) {
    if (result.passed) {
      pass++;
      console.log(`PASS | ${result.scenarioId}`);
    } else {
      fail++;
      console.log(`FAIL | ${result.scenarioId}`);

      for (const failure of result.failures) {
        console.log(`  - ${failure}`);
      }
    }

    console.log(`Hypothèse : ${result.conclusionId ?? "aucune"}`);
    console.log(`Confiance : ${(result.confidence * 100).toFixed(1)} %`);
    console.log(`Pièce     : ${result.recommendedPart ?? "aucune"}`);
    console.log(`Questions : ${result.questionCount}`);
    console.log("");
  }

  const total = results.length;
  const coverage = total === 0 ? 0 : (pass / total) * 100;

  console.log("========================================");
  console.log(`TOTAL    : ${total}`);
  console.log(`PASS     : ${pass}`);
  console.log(`FAIL     : ${fail}`);
  console.log(`COVERAGE : ${coverage.toFixed(1)} %`);
  console.log(`REGRESSION : ${fail > 0 ? "YES" : "NO"}`);
  console.log("========================================");

  return {
    results,
    total,
    pass,
    fail,
    coverage,
    regression: fail > 0,
  };
}

runScenarioSuite();


