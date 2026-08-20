import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

const profiles = [
  "particulier",
  "bricoleur",
  "vendeur-pieces-auto",
  "mecanicien-garage",
  "depanneur",
] as const;

for (const profile of profiles) {
  console.log("");
  console.log(
    `=== ${profile.toUpperCase()} ===`,
  );

  const engine =
    new DiagnosticEngineV2();

  const result =
    engine.createSession(
      `charging-trace-${profile}`,
      profile,
      "charging",
      [],
    );

  console.log(
    "Action choisie :",
    result.action?.id ?? "AUCUNE",
  );

  console.log(
    "Type :",
    result.action?.type ?? "AUCUN",
  );

  console.log(
    "Question :",
    result.action?.text ?? "AUCUNE",
  );

  console.log(
    "Hypothèse TOP 1 :",
    result.reasoning.decision
      .probabilities[0]
      ?.hypothesis.id ??
      "AUCUNE",
  );

  console.log(
    "Probabilité TOP 1 :",
    (
      (
        result.reasoning.decision
          .probabilities[0]
          ?.probability ?? 0
      ) * 100
    ).toFixed(2) + " %",
  );

  console.log(
    "Question ReasoningEngine :",
    result.reasoning.decision
      .selectedQuestion?.id ??
      "AUCUNE",
  );

  console.log(
    "Top Information Gain :",
    result.reasoning.decision
      .informationGains[0]
      ?.gain ?? 0,
  );
}
