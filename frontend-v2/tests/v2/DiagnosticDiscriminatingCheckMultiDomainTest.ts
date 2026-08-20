import {
  getDiagnosticDiscriminatingCheck,
  getDiagnosticDiscriminatingCheckCount,
  getDiagnosticDiscriminatingCheckDomains,
} from "../../engine/reasoning/DiagnosticDiscriminatingCheck";

function assert(
  condition: boolean,
  message: string,
): void {

  if (!condition) {
    throw new Error(message);
  }
}

const cases = [
  [
    "problem-accessory-belt",
    "problem-alternator",
    "battery",
  ],

  [
    "problem-air-in-brake-system",
    "problem-master-cylinder",
    "braking",
  ],

  [
    "problem-radiator-fan",
    "problem-fan-control",
    "cooling",
  ],

  [
    "problem-weak-battery",
    "problem-starter",
    "starting",
  ],

  [
    "problem-outer-tie-rod",
    "problem-inner-tie-rod",
    "suspension",
  ],

  [
    "problem-dct-mechatronic",
    "problem-dct-actuator",
    "transmission",
  ],
] as const;

for (
  const [
    hypothesisA,
    hypothesisB,
    expectedDomain,
  ]
  of cases
) {

  const result =
    getDiagnosticDiscriminatingCheck(
      hypothesisA,
      hypothesisB,
    );

  assert(
    result !== null,
    `${hypothesisA} / ${hypothesisB} absent`,
  );

  assert(
    result?.domain ===
      expectedDomain,
    `${hypothesisA} / ${hypothesisB} mauvais domaine`,
  );

  console.log(
    `${expectedDomain.padEnd(13)} | ${hypothesisA} <-> ${hypothesisB} | ${result?.actionId}`,
  );
}

const domains =
  getDiagnosticDiscriminatingCheckDomains();

for (
  const domain
  of [
    "battery",
    "braking",
    "charging",
    "cooling",
    "engine",
    "starting",
    "steering",
    "suspension",
    "transmission",
  ]
) {

  assert(
    domains.includes(
      domain,
    ),
    `Domaine absent : ${domain}`,
  );
}

console.log("");
console.log(
  `REGISTRE TOTAL : ${getDiagnosticDiscriminatingCheckCount()} paires`,
);

console.log(
  `DOMAINES       : ${domains.join(", ")}`,
);

console.log("");
console.log(
  "MULTI-DOMAIN DISCRIMINATING CHECKS : OK",
);