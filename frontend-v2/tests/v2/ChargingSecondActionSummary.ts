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

const realLog =
  console.log;

console.log = () => {};

const rows:
  string[] = [];

for (
  const profile
  of profiles
) {
  const engine =
    new DiagnosticEngineV2();

  const initial =
    engine.createSession(
      `trace-${profile}`,
      profile,
      "charging",
      [],
    );

  const first =
    initial.action;

  if (!first) {
    rows.push(
      `${profile} | AUCUNE ACTION`,
    );

    continue;
  }

  for (
    const option
    of first.options ?? []
  ) {
    const localEngine =
      new DiagnosticEngineV2();

    const start =
      localEngine.createSession(
        `trace-${profile}-${option.id}`,
        profile,
        "charging",
        [],
      );

    if (!start.action) {
      continue;
    }

    const result =
      localEngine.answer(
        start.session,
        "charging",
        start.action.id,
        option.id,
      );

    const reasoning =
      result.reasoning
        .decision
        .selectedQuestion
        ?.id ??
      "AUCUNE";

    const actual =
      result.action?.id ??
      "AUCUNE";

    const top =
      result.reasoning
        .decision
        .probabilities[0];

    rows.push(
      [
        profile,
        option.id,
        `reason=${reasoning}`,
        `actual=${actual}`,
        reasoning === actual
          ? "SAME"
          : "OVERRIDE",
        `top=${top?.hypothesis.id ?? "AUCUNE"}`,
        `p=${((top?.probability ?? 0) * 100).toFixed(1)}%`,
        `ig=${(
          result.reasoning
            .decision
            .informationGains[0]
            ?.gain ?? 0
        ).toFixed(3)}`,
      ].join(
        " | ",
      ),
    );
  }
}

console.log =
  realLog;

console.log(
  "\n=== SECOND ACTION SUMMARY ===",
);

for (
  const row
  of rows
) {
  console.log(row);
}
