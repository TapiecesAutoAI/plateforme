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
    "========================================",
  );
  console.log(
    `PROFILE : ${profile.toUpperCase()}`,
  );
  console.log(
    "========================================",
  );

  const initialEngine =
    new DiagnosticEngineV2();

  const initial =
    initialEngine.createSession(
      `charging-second-${profile}`,
      profile,
      "charging",
      [],
    );

  const firstAction =
    initial.action;

  if (!firstAction) {
    console.log(
      "AUCUNE PREMIERE ACTION",
    );
    continue;
  }

  console.log(
    "Première action :",
    firstAction.id,
  );

  for (
    const option
    of firstAction.options ?? []
  ) {
    console.log("");
    console.log(
      "----------------------------------------",
    );
    console.log(
      `REPONSE : ${option.id}`,
    );
    console.log(
      "----------------------------------------",
    );

    const engine =
      new DiagnosticEngineV2();

    const start =
      engine.createSession(
        `charging-second-${profile}-${option.id}`,
        profile,
        "charging",
        [],
      );

    if (!start.action) {
      console.log(
        "Aucune action initiale.",
      );
      continue;
    }

    const result =
      engine.answer(
        start.session,
        "charging",
        start.action.id,
        option.id,
      );

    const reasoningQuestion =
      result.reasoning
        .decision
        .selectedQuestion
        ?.id ??
      "AUCUNE";

    const realAction =
      result.action?.id ??
      "AUCUNE";

    const top =
      result.reasoning
        .decision
        .probabilities[0];

    console.log(
      "ReasoningEngine :",
      reasoningQuestion,
    );

    console.log(
      "Action réelle   :",
      realAction,
    );

    console.log(
      "IDENTIQUES      :",
      reasoningQuestion ===
        realAction
        ? "OUI"
        : "NON <<<",
    );

    console.log(
      "TOP hypothèse   :",
      top?.hypothesis.id ??
        "AUCUNE",
    );

    console.log(
      "TOP probabilité :",
      (
        (
          top?.probability ??
          0
        ) * 100
      ).toFixed(2) + " %",
    );

    console.log(
      "Top IG          :",
      result.reasoning
        .decision
        .informationGains[0]
        ?.gain ??
        0,
    );

    console.log(
      "Completed       :",
      result.completed,
    );
  }
}
