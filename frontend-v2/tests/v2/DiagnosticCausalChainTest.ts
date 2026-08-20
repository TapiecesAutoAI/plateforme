import {
  buildDiagnosticCausalChain,
  getDiagnosticCausalChainCount,
} from "../../engine/reasoning/DiagnosticCausalChain";

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

function h(
  id: string,
  name: string,
  supports:
    string[],
  contradicts:
    string[] = [],
) {

  return {
    id,
    name,

    supportingEvidenceIds:
      supports,

    contradictingEvidenceIds:
      contradicts,
  };
}

/*
 * ===========================================================
 * CASE 1
 * ETRIER -> DISQUE
 * ===========================================================
 */

const brake =
  buildDiagnosticCausalChain(
    "manual-review-required",
    [
      {
        probability:
          0.55,

        hypothesis:
          h(
            "problem-sticking-caliper",
            "Étrier grippé",
            [
              "wheel-hot",
              "caliper-sticking",
            ],
          ),
      },

      {
        probability:
          0.33,

        hypothesis:
          h(
            "problem-brake-discs",
            "Disque détérioré",
            [
              "disc-overheated",
            ],
          ),
      },
    ],
    new Set([
      "wheel-hot",
      "caliper-sticking",
      "disc-overheated",
    ]),
  );

assert(
  brake !== null,
  "Chaîne étrier -> disque non détectée.",
);

assert(
  brake?.primary.hypothesisId ===
    "problem-sticking-caliper",
  "Mauvaise cause primaire freinage.",
);

assert(
  brake?.secondary.hypothesisId ===
    "problem-brake-discs",
  "Mauvais défaut secondaire freinage.",
);

/*
 * ===========================================================
 * CASE 2
 * ORDRE DES PROBABILITES INVERSE
 *
 * Même si le disque est TOP1,
 * le registre causal doit remettre l'étrier
 * comme cause primaire.
 * ===========================================================
 */

const inverse =
  buildDiagnosticCausalChain(
    "manual-review-required",
    [
      {
        probability:
          0.48,

        hypothesis:
          h(
            "problem-brake-discs",
            "Disque",
            [
              "disc-hot",
            ],
          ),
      },

      {
        probability:
          0.36,

        hypothesis:
          h(
            "problem-sticking-caliper",
            "Étrier",
            [
              "caliper",
              "temperature-diff",
            ],
          ),
      },
    ],
    new Set([
      "disc-hot",
      "caliper",
      "temperature-diff",
    ]),
  );

assert(
  inverse !== null,
  "Chaîne causale inverse non détectée.",
);

assert(
  inverse?.primary.hypothesisId ===
    "problem-sticking-caliper",
  "Le classement probabiliste a écrasé le sens causal.",
);

/*
 * ===========================================================
 * CASE 3
 * PAIRE NON CAUSALE
 * ===========================================================
 */

const unrelated =
  buildDiagnosticCausalChain(
    "manual-review-required",
    [
      {
        probability:
          0.55,

        hypothesis:
          h(
            "problem-alternator",
            "Alternateur",
            [
              "charge-low",
              "load-low",
            ],
          ),
      },

      {
        probability:
          0.30,

        hypothesis:
          h(
            "problem-voltage-regulator",
            "Régulateur",
            [
              "voltage-high",
            ],
          ),
      },
    ],
    new Set([
      "charge-low",
      "load-low",
      "voltage-high",
    ]),
  );

assert(
  unrelated === null,
  "Paire non causale acceptée.",
);

/*
 * ===========================================================
 * CASE 4
 * PREUVES INSUFFISANTES
 * ===========================================================
 */

const weak =
  buildDiagnosticCausalChain(
    "manual-review-required",
    [
      {
        probability:
          0.52,

        hypothesis:
          h(
            "problem-coolant-leak",
            "Fuite",
            [
              "leak",
            ],
          ),
      },

      {
        probability:
          0.31,

        hypothesis:
          h(
            "problem-air-in-system",
            "Air",
            [
              "air",
            ],
          ),
      },
    ],
    new Set([
      "leak",
      "air",
    ]),
  );

assert(
  weak === null,
  "Chaîne avec seulement deux preuves acceptée.",
);

/*
 * ===========================================================
 * CASE 5
 * COOLING : fuite -> air
 * ===========================================================
 */

const cooling =
  buildDiagnosticCausalChain(
    "manual-review-required",
    [
      {
        probability:
          0.49,

        hypothesis:
          h(
            "problem-coolant-leak",
            "Fuite de liquide",
            [
              "visible-leak",
              "coolant-loss",
            ],
          ),
      },

      {
        probability:
          0.31,

        hypothesis:
          h(
            "problem-air-in-system",
            "Air dans circuit",
            [
              "air-lock",
            ],
          ),
      },
    ],
    new Set([
      "visible-leak",
      "coolant-loss",
      "air-lock",
    ]),
  );

assert(
  cooling !== null,
  "Chaîne fuite -> air non détectée.",
);

/*
 * ===========================================================
 * CASE 6
 * SUSPENSION : géométrie -> pneu
 * ===========================================================
 */

const suspension =
  buildDiagnosticCausalChain(
    "manual-review-required",
    [
      {
        probability:
          0.51,

        hypothesis:
          h(
            "problem-wheel-alignment",
            "Géométrie incorrecte",
            [
              "alignment-bad",
              "pull",
            ],
          ),
      },

      {
        probability:
          0.29,

        hypothesis:
          h(
            "problem-deformed-tyre",
            "Pneu détérioré",
            [
              "tyre-wear",
            ],
          ),
      },
    ],
    new Set([
      "alignment-bad",
      "pull",
      "tyre-wear",
    ]),
  );

assert(
  suspension !== null,
  "Chaîne géométrie -> pneu non détectée.",
);

/*
 * ===========================================================
 * CASE 7
 * COMPLETED
 * ===========================================================
 */

const completed =
  buildDiagnosticCausalChain(
    "completed",
    [
      {
        probability:
          0.60,

        hypothesis:
          h(
            "problem-sticking-caliper",
            "Étrier",
            [
              "a",
              "b",
            ],
          ),
      },

      {
        probability:
          0.30,

        hypothesis:
          h(
            "problem-brake-discs",
            "Disque",
            [
              "c",
            ],
          ),
      },
    ],
    new Set([
      "a",
      "b",
      "c",
    ]),
  );

assert(
  completed === null,
  "Chaîne causale active sur completed.",
);

console.log("");
console.log(
  "============================================"
);

console.log(
  " DIAGNOSTIC CAUSAL CHAIN : OK"
);

console.log(
  "============================================"
);

console.log(
  `Relations causales : ${getDiagnosticCausalChainCount()}`,
);

console.log("");

console.log(
  JSON.stringify(
    brake,
    null,
    2,
  ),
);