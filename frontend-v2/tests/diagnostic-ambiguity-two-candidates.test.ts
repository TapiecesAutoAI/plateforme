import {
  buildDiagnosticAmbiguity,
} from "../engine/reasoning/DiagnosticAmbiguity";

function assert(
  value: boolean,
  message: string,
): void {

  if (!value) {
    throw new Error(message);
  }
}

const result =
  buildDiagnosticAmbiguity(
    "manual-review-required",
    [
      {
        probability: 0.52,

        hypothesis: {
          id: "problem-alternator",
          name: "Alternateur défectueux",
        },
      },

      {
        probability: 0.44,

        hypothesis: {
          id: "problem-voltage-regulator",
          name: "Régulateur de tension défectueux",
        },
      },
    ],
    {
      nextBestQuestionId:
        "battery-charging-load-value",

      nextBestQuestionText:
        "Mesurer la tension de charge sous contrainte.",
    },
  );

assert(
  result !== null,
  "52/44 doit produire une ambiguite.",
);

assert(
  result?.candidates.length ===
    2,
  "Deux candidats attendus.",
);

assert(
  result?.candidates[0]
    ?.confidencePercentage ===
    52,
  "Premier candidat incorrect.",
);

assert(
  result?.candidates[1]
    ?.confidencePercentage ===
    44,
  "Second candidat incorrect.",
);

assert(
  result?.finalCheck.text ===
    "Mesurer la tension de charge sous contrainte.",
  "Controle final incorrect.",
);

const clearWinner =
  buildDiagnosticAmbiguity(
    "manual-review-required",
    [
      {
        probability: 0.75,

        hypothesis: {
          id: "A",
          name: "A",
        },
      },

      {
        probability: 0.15,

        hypothesis: {
          id: "B",
          name: "B",
        },
      },
    ],
    {
      nextBestQuestionId: null,
      nextBestQuestionText: null,
    },
  );

assert(
  clearWinner === null,
  "75/15 ne doit pas etre ambigu.",
);

const stillRunning =
  buildDiagnosticAmbiguity(
    "waiting-for-user",
    [
      {
        probability: 0.51,

        hypothesis: {
          id: "A",
          name: "A",
        },
      },

      {
        probability: 0.46,

        hypothesis: {
          id: "B",
          name: "B",
        },
      },
    ],
    {
      nextBestQuestionId: null,
      nextBestQuestionText: null,
    },
  );

assert(
  stillRunning === null,
  "Waiting-for-user ne doit pas etre terminal ambigu.",
);

console.log("");
console.log(
  "============================================"
);

console.log(
  " DIAGNOSTIC AMBIGUITY : OK"
);

console.log(
  "============================================"
);

console.log(
  JSON.stringify(
    result,
    null,
    2,
  ),
);