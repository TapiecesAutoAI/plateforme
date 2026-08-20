import { DiagnosticEngineV2 } from "../../engine/core/DiagnosticEngineV2";

const profiles = [
  "particulier",
  "bricoleur",
  "vendeur-pieces-auto",
  "mecanicien-garage",
  "depanneur",
] as const;

for (const profile of profiles) {

  console.log("");
  console.log("========================================");
  console.log(`PROFILE : ${profile}`);
  console.log("========================================");

  const engine = new DiagnosticEngineV2();

  let result = engine.createSession(
    `charging-probability-audit-${profile}`,
    profile,
    "charging",
    [],
  );

  console.log("");
  console.log("AVANT REPONSE");

  for (const p of result.reasoning.decision.probabilities) {
    console.log(
      `${p.hypothesis.id} | p=${(p.probability * 100).toFixed(2)}% | score=${p.score} | support=${p.support} | contradiction=${p.contradiction}`,
    );
  }

  const action = result.action;

  if (!action) {
    console.log("AUCUNE ACTION");
    continue;
  }

  console.log("");
  console.log(`Première question : ${action.id}`);

  for (const option of action.options ?? []) {

    const testEngine = new DiagnosticEngineV2();

    let branch = testEngine.createSession(
      `charging-probability-audit-${profile}-${option.id}`,
      profile,
      "charging",
      [],
    );

    branch = testEngine.answer(
      branch.session,
      "charging",
      action.id,
      option.id,
    );

    console.log("");
    console.log(`--- OPTION : ${option.id} ---`);

    for (const p of branch.reasoning.decision.probabilities) {
      console.log(
        `${p.hypothesis.id} | p=${(p.probability * 100).toFixed(2)}% | score=${p.score} | support=${p.support} | contradiction=${p.contradiction}`,
      );
    }

    console.log(
      `NEXT=${branch.action?.id ?? "NONE"} | COMPLETED=${branch.completed}`,
    );
  }
}
