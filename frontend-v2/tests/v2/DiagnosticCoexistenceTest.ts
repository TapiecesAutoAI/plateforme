import {
  buildDiagnosticCoexistence,
  getDiagnosticCoexistencePairCount,
} from "../../engine/reasoning/DiagnosticCoexistence";

function assert(
  condition: boolean,
  message: string,
): void {

  if (!condition) {
    throw new Error(
      message,
    );
  }
}

function hypothesis(
  id: string,
  name: string,
  supports:
    string[],
) {

  return {
    id,
    name,
    supportingEvidenceIds:
      supports,
    contradictingEvidenceIds:
      [],
  };
}

/*
 * CAS POSITIF :
 * batterie usée + alternateur
 */
const positive =
  buildDiagnosticCoexistence(
    "manual-review-required",
    [
      {
        probability:
          0.58,

        hypothesis:
          hypothesis(
            "problem-aged-battery",
            "Batterie usée",
            [
              "age",
              "battery-test",
            ],
          ),
      },

      {
        probability:
          0.34,

        hypothesis:
          hypothesis(
            "problem-alternator",
            "Alternateur défectueux",
            [
              "charging-low",
            ],
          ),
      },
    ],
    new Set([
      "age",
      "battery-test",
      "charging-low",
    ]),
  );

assert(
  positive !== null,
  "Double panne valide non détectée.",
);

assert(
  positive?.candidates.length ===
    2,
  "Deux candidats attendus.",
);

/*
 * CAS DIFFUS :
 * 20 / 12 ne doit PAS devenir
 * une double panne.
 */
const diffuse =
  buildDiagnosticCoexistence(
    "manual-review-required",
    [
      {
        probability:
          0.20,

        hypothesis:
          hypothesis(
            "problem-aged-battery",
            "Batterie usée",
            [
              "age",
            ],
          ),
      },

      {
        probability:
          0.12,

        hypothesis:
          hypothesis(
            "problem-alternator",
            "Alternateur",
            [
              "charging",
            ],
          ),
      },
    ],
    new Set([
      "age",
      "charging",
    ]),
  );

assert(
  diffuse === null,
  "Cas diffus faussement détecté.",
);

/*
 * UNE SEULE PREUVE POUR B :
 * insuffisant.
 */
const weakEvidence =
  buildDiagnosticCoexistence(
    "manual-review-required",
    [
      {
        probability:
          0.55,

        hypothesis:
          hypothesis(
            "problem-aged-battery",
            "Batterie",
            [
              "age",
            ],
          ),
      },

      {
        probability:
          0.35,

        hypothesis:
          hypothesis(
            "problem-alternator",
            "Alternateur",
            [
              "charging",
            ],
          ),
      },
    ],
    new Set([
      "age",
      "charging",
    ]),
  );

assert(
  weakEvidence === null,
  "Double panne insuffisamment documentée.",
);

console.log("");
console.log(
  "============================================"
);

console.log(
  " DIAGNOSTIC COEXISTENCE : OK"
);

console.log(
  "============================================"
);

console.log(
  `Paires coexistantes : ${getDiagnosticCoexistencePairCount()}`,
);

console.log("");

console.log(
  JSON.stringify(
    positive,
    null,
    2,
  ),
);