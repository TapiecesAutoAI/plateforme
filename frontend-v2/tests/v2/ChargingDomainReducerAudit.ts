import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

const engine =
  new DiagnosticEngineV2();

const scenarios = [
  ["battery-discharges"],
  ["electrical-weakness"],
  ["battery-light"],
] as const;

for (const scenario of scenarios) {

  let result =
    engine.createSession(
      `domain-reducer-${scenario[0]}`,
      "depanneur",
      "charging",
      [],
    );

  result =
    engine.answer(
      result.session,
      "charging",
      result.action!.id,
      scenario[0],
    );

  console.log("");
  console.log(
    `=== ${scenario[0]} ===`,
  );

  result.reasoning
    .decision
    .probabilities
    .forEach(
      (item, index) => {
        console.log(
          `${index + 1}. ${item.hypothesis.id} | ${(item.probability * 100).toFixed(2)} %`,
        );
      },
    );
}
