import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

const engine: any =
  new DiagnosticEngineV2();

const prefix = [
  ["battery-main-symptom", "flat"],
  ["battery-age", "over-four"],
  ["battery-case-check", "normal"],
  ["battery-rest-voltage-known", "no"],
  ["battery-terminals-check", "good"],
  ["battery-ground-check", "good"],
  ["battery-jump-start-test", "success"],
  ["battery-restart-after-jump", "fails"],
  ["battery-post-charge-voltage-known", "yes"],
  ["battery-post-charge-voltage-value", "below-12-2"],
] as const;

function start() {
  let result: any =
    engine.createSession(
      "aged-after-postcharge",
      "mecanicien-garage",
      "battery",
      [],
    );

  for (const [actionId, optionId] of prefix) {
    if (!result.action) {
      throw new Error(
        `Action absente avant ${actionId}`,
      );
    }

    if (result.action.id !== actionId) {
      throw new Error(
        `Attendu ${actionId}, obtenu ${result.action.id}`,
      );
    }

    result =
      engine.answer(
        result.session,
        "battery",
        actionId,
        optionId,
      );
  }

  return result;
}

function dump(
  title: string,
  result: any,
) {
  console.log("");
  console.log(
    "============================================================",
  );
  console.log(title);
  console.log(
    "============================================================",
  );

  const probabilities =
    result.reasoning
      ?.decision
      ?.probabilities ?? [];

  console.log(
    "STATUS      :",
    result.session?.status,
  );

  console.log(
    "COMPLETED   :",
    result.completed,
  );

  console.log(
    "ACTION      :",
    result.action?.id ?? "NONE",
  );

  console.log(
    "DECISION    :",
    result.reasoning
      ?.decision
      ?.type ?? "NONE",
  );

  console.log(
    "CONCLUSION  :",
    result.session
      ?.conclusion
      ?.diagnosisId ?? "NONE",
  );

  console.log("");
  console.log("TOP 5:");

  for (
    const item
    of probabilities.slice(0, 5)
  ) {
    console.log({
      id: item.hypothesis.id,

      probability:
        Number(
          (
            item.probability * 100
          ).toFixed(4),
        ),

      support:
        item.support,

      contradiction:
        item.contradiction,

      score:
        item.score,
    });
  }
}

function answer(
  result: any,
  expectedAction: string,
  optionId: string,
) {
  if (!result.action) {
    throw new Error(
      `Action absente. Attendu ${expectedAction}`,
    );
  }

  if (
    result.action.id !==
    expectedAction
  ) {
    throw new Error(
      `Attendu ${expectedAction}, obtenu ${result.action.id}`,
    );
  }

  return engine.answer(
    result.session,
    "battery",
    expectedAction,
    optionId,
  );
}


// ============================================================
// BRANCHE A
// battery-test-known = YES
// battery-test-result = GOOD
// ============================================================

let a = start();

dump(
  "A0 - AVANT BATTERY TEST",
  a,
);

a = answer(
  a,
  "battery-test-known",
  "yes",
);

dump(
  "A1 - TEST CONNU = YES",
  a,
);

a = answer(
  a,
  "battery-test-result",
  "good",
);

dump(
  "A2 - BATTERY TEST = GOOD",
  a,
);


// ============================================================
// BRANCHE B
// battery-test-known = NO
// ============================================================

let b = start();

b = answer(
  b,
  "battery-test-known",
  "no",
);

dump(
  "B1 - BATTERY TEST = NO",
  b,
);


// ============================================================
// PROCHAINES ACTIONS
// ============================================================

console.log("");
console.log(
  "============================================================",
);
console.log(
  " NEXT ACTIONS",
);
console.log(
  "============================================================",
);

console.log(
  "A GOOD ->",
  a.action?.id ?? "NONE",
);

console.log(
  "B NO   ->",
  b.action?.id ?? "NONE",
);

console.log("");

if (a.action) {
  console.log(
    "OPTIONS A:",
    a.action.options?.map(
      (o: any) => ({
        id: o.id,
        next: o.nextActionId,
        evidence: o.addsEvidence,
      }),
    ),
  );
}

console.log("");

if (b.action) {
  console.log(
    "OPTIONS B:",
    b.action.options?.map(
      (o: any) => ({
        id: o.id,
        next: o.nextActionId,
        evidence: o.addsEvidence,
      }),
    ),
  );
}
