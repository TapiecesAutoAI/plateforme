import {
  buildDiagnosticCoexistence,
} from "../../engine/reasoning/DiagnosticCoexistence";

import {
  buildDiagnosticAmbiguity,
} from "../../engine/reasoning/DiagnosticAmbiguity";

function assert(
  condition: boolean,
  message: string,
): void {

  if (!condition) {
    throw new Error(message);
  }
}

function h(
  id: string,
  label: string,
  support: string[],
  contradict: string[] = [],
) {

  return {
    id,
    name:
      label,

    supportingEvidenceIds:
      support,

    contradictingEvidenceIds:
      contradict,
  };
}

console.log("");
console.log(
  "============================================================",
);

console.log(
  " COEXISTENCE / AMBIGUITY - GARDE-FOUS",
);

console.log(
  "============================================================",
);

/*
 * ===========================================================
 * CASE 1
 * VRAIE COEXISTENCE
 * aged battery + alternator
 * ===========================================================
 */

const case1Probabilities = [
  {
    probability:
      0.58,

    hypothesis:
      h(
        "problem-aged-battery",
        "Batterie usée",
        [
          "age-over-four",
          "post-charge-low",
        ],
      ),
  },

  {
    probability:
      0.34,

    hypothesis:
      h(
        "problem-alternator",
        "Alternateur défectueux",
        [
          "charge-low",
        ],
      ),
  },
];

const case1Evidence =
  new Set([
    "age-over-four",
    "post-charge-low",
    "charge-low",
  ]);

const case1 =
  buildDiagnosticCoexistence(
    "manual-review-required",
    case1Probabilities,
    case1Evidence,
  );

assert(
  case1 !== null,
  "CASE 1 : coexistence attendue.",
);

console.log("");
console.log("CASE 1 : A+B réel");
console.log(
  "COEXISTENCE=",
  case1 ? "YES" : "NO",
);

console.log(
  "CHECK=",
  case1?.verification.actionId ??
    "NONE",
);

/*
 * ===========================================================
 * CASE 2
 * FAUX A+B : seulement 2 preuves au total
 * ===========================================================
 */

const case2 =
  buildDiagnosticCoexistence(
    "manual-review-required",
    [
      {
        probability:
          0.55,

        hypothesis:
          h(
            "problem-aged-battery",
            "Batterie usée",
            [
              "age",
            ],
          ),
      },

      {
        probability:
          0.35,

        hypothesis:
          h(
            "problem-alternator",
            "Alternateur",
            [
              "charge",
            ],
          ),
      },
    ],
    new Set([
      "age",
      "charge",
    ]),
  );

assert(
  case2 === null,
  "CASE 2 : coexistence trop facile.",
);

console.log("");
console.log(
  "CASE 2 : preuves insuffisantes",
);

console.log(
  "COEXISTENCE=",
  case2 ? "YES" : "NO",
);

/*
 * ===========================================================
 * CASE 3
 * CONTRADICTION SUR UNE DES DEUX PANNES
 * ===========================================================
 */

const case3 =
  buildDiagnosticCoexistence(
    "manual-review-required",
    [
      {
        probability:
          0.52,

        hypothesis:
          h(
            "problem-aged-battery",
            "Batterie usée",
            [
              "age",
              "post-low",
            ],
            [
              "battery-test-good",
            ],
          ),
      },

      {
        probability:
          0.34,

        hypothesis:
          h(
            "problem-alternator",
            "Alternateur",
            [
              "charge-low",
            ],
          ),
      },
    ],
    new Set([
      "age",
      "post-low",
      "charge-low",
      "battery-test-good",
    ]),
  );

assert(
  case3 === null,
  "CASE 3 : contradiction ignorée.",
);

console.log("");
console.log(
  "CASE 3 : contradiction",
);

console.log(
  "COEXISTENCE=",
  case3 ? "YES" : "NO",
);

/*
 * ===========================================================
 * CASE 4
 * CAS DIFFUS
 * ===========================================================
 */

const case4 =
  buildDiagnosticCoexistence(
    "manual-review-required",
    [
      {
        probability:
          0.21,

        hypothesis:
          h(
            "problem-aged-battery",
            "Batterie",
            [
              "age",
              "post",
            ],
          ),
      },

      {
        probability:
          0.13,

        hypothesis:
          h(
            "problem-alternator",
            "Alternateur",
            [
              "charge",
            ],
          ),
      },
    ],
    new Set([
      "age",
      "post",
      "charge",
    ]),
  );

assert(
  case4 === null,
  "CASE 4 : cas diffus transformé en double panne.",
);

console.log("");
console.log(
  "CASE 4 : incertitude diffuse",
);

console.log(
  "COEXISTENCE=",
  case4 ? "YES" : "NO",
);

/*
 * ===========================================================
 * CASE 5
 * PAIRE NON AUTORISEE
 * ===========================================================
 */

const case5 =
  buildDiagnosticCoexistence(
    "manual-review-required",
    [
      {
        probability:
          0.54,

        hypothesis:
          h(
            "problem-voltage-regulator",
            "Régulateur",
            [
              "high-voltage",
              "unstable",
            ],
          ),
      },

      {
        probability:
          0.33,

        hypothesis:
          h(
            "problem-parasitic-drain",
            "Consommation parasite",
            [
              "current-high",
            ],
          ),
      },
    ],
    new Set([
      "high-voltage",
      "unstable",
      "current-high",
    ]),
  );

assert(
  case5 === null,
  "CASE 5 : paire non autorisée acceptée.",
);

console.log("");
console.log(
  "CASE 5 : paire non autorisée",
);

console.log(
  "COEXISTENCE=",
  case5 ? "YES" : "NO",
);

/*
 * ===========================================================
 * CASE 6
 * DIAGNOSTIC COMPLETED
 * Une coexistence ne doit pas écraser
 * un diagnostic déjà conclu.
 * ===========================================================
 */

const case6 =
  buildDiagnosticCoexistence(
    "completed",
    case1Probabilities,
    case1Evidence,
  );

assert(
  case6 === null,
  "CASE 6 : coexistence sur diagnostic completed.",
);

console.log("");
console.log(
  "CASE 6 : completed",
);

console.log(
  "COEXISTENCE=",
  case6 ? "YES" : "NO",
);

/*
 * ===========================================================
 * CASE 7
 * AMBIGUITE A/B EXISTANTE
 *
 * Courroie / alternateur.
 * Cette paire n'est PAS déclarée coexistante en battery.
 * L'ambiguïté doit rester active.
 * ===========================================================
 */

const case7Probabilities = [
  {
    probability:
      0.6261,

    hypothesis:
      h(
        "problem-accessory-belt",
        "Courroie d'accessoires",
        [
          "belt",
        ],
      ),
  },

  {
    probability:
      0.3725,

    hypothesis:
      h(
        "problem-alternator",
        "Alternateur",
        [
          "charge",
        ],
      ),
  },
];

const case7Coexistence =
  buildDiagnosticCoexistence(
    "manual-review-required",
    case7Probabilities,
    new Set([
      "belt",
      "charge",
    ]),
  );

const case7Ambiguity =
  buildDiagnosticAmbiguity(
    "manual-review-required",
    case7Probabilities,
    null,
  );

assert(
  case7Coexistence === null,
  "CASE 7 : faux A+B sur cas A/B.",
);

assert(
  case7Ambiguity !== null,
  "CASE 7 : ambiguity A/B perdue.",
);

console.log("");
console.log(
  "CASE 7 : A/B conserve",
);

console.log(
  "COEXISTENCE=",
  case7Coexistence
    ? "YES"
    : "NO",
);

console.log(
  "AMBIGUITY=",
  case7Ambiguity
    ? "YES"
    : "NO",
);

/*
 * ===========================================================
 * CASE 8
 * TEST MULTI-DOMAINES
 * Suspension shock + mount
 * ===========================================================
 */

const case8 =
  buildDiagnosticCoexistence(
    "manual-review-required",
    [
      {
        probability:
          0.49,

        hypothesis:
          h(
            "problem-shock-absorber",
            "Amortisseur",
            [
              "shock-leak",
              "damping-poor",
            ],
          ),
      },

      {
        probability:
          0.31,

        hypothesis:
          h(
            "problem-shock-mount",
            "Coupelle",
            [
              "mount-play",
            ],
          ),
      },
    ],
    new Set([
      "shock-leak",
      "damping-poor",
      "mount-play",
    ]),
  );

assert(
  case8 !== null,
  "CASE 8 : coexistence suspension non détectée.",
);

console.log("");
console.log(
  "CASE 8 : suspension A+B",
);

console.log(
  "COEXISTENCE=",
  case8 ? "YES" : "NO",
);

console.log(
  "CHECK=",
  case8?.verification.actionId ??
    "NONE",
);

/*
 * ===========================================================
 * RESULTAT
 * ===========================================================
 */

console.log("");
console.log(
  "============================================================",
);

console.log(
  " GARDE-FOUS COEXISTENCE : OK",
);

console.log(
  "============================================================",
);