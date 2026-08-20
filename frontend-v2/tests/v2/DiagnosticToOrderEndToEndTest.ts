import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

import {
  DiagnosticCommercialBridge,
} from "../../engine/commerce";

import {
  OrderEngine,
} from "../../engine/orders";

type SearchNode = {
  result: any;
  path: string[];
  depth: number;
};

const TARGET =
  "problem-alternator";

const engine =
  new DiagnosticEngineV2();

/*
 * ===========================================================
 * POINT DE DEPART REEL
 * ===========================================================
 */

const initial =
  engine.createSession(
    "e2e-autosearch-alternator",
    "particulier",
    "battery",
    [],
  );

const queue: SearchNode[] = [
  {
    result: initial,
    path: [],
    depth: 0,
  },
];

let explored = 0;

const MAX_EXPLORED =
  4000;

const MAX_DEPTH =
  14;

let found:
  SearchNode | null =
  null;

/*
 * ===========================================================
 * RECHERCHE AUTOMATIQUE D'UN VRAI PARCOURS ALTERNATEUR
 * ===========================================================
 */

const realLog =
  console.log;

/*
 * Le moteur est très bavard.
 * On coupe temporairement ses logs internes.
 */
console.log = () => {};

while (
  queue.length > 0 &&
  explored < MAX_EXPLORED
) {

  const node =
    queue.shift();

  if (!node) {
    break;
  }

  explored++;

  const probabilities =
    node.result.reasoning
      ?.decision
      ?.probabilities ??
    [];

  const conclusion =
    node.result.session
      ?.conclusion
      ?.diagnosisId ??
    null;

  const top1 =
    probabilities[0]
      ?.hypothesis
      ?.id ??
    null;

  /*
   * Pour le MVP :
   * une conclusion Alternateur
   * OU Alternateur TOP1
   * suffit pour alimenter la vente.
   */
  if (
    conclusion === TARGET ||
    top1 === TARGET
  ) {

    /*
     * On demande quand même quelques
     * observations avant d'accepter un
     * résultat immédiat trop superficiel.
     */
    if (
      node.path.length >= 3
    ) {
      found =
        node;

      break;
    }
  }

  if (
    node.depth >=
    MAX_DEPTH
  ) {
    continue;
  }

  if (
    node.result.completed
  ) {
    continue;
  }

  const action =
    node.result.action;

  if (!action) {
    continue;
  }

  const options =
    action.options ?? [];

  if (
    !Array.isArray(options) ||
    options.length === 0
  ) {
    continue;
  }

  /*
   * Exploration de toutes les réponses.
   *
   * Chaque branche reçoit sa propre
   * copie de session.
   */
  for (
    const option
    of options
  ) {

    try {

      const next =
        engine.answer(
          structuredClone(
            node.result.session,
          ),
          "battery",
          action.id,
          option.id,
        );

      queue.push({
        result:
          next,

        depth:
          node.depth + 1,

        path: [
          ...node.path,
          `${action.id}=${option.id}`,
        ],
      });

    } catch {
      /*
       * Une branche invalide n'empêche
       * pas les autres d'être testées.
       */
    }
  }
}

console.log =
  realLog;

/*
 * ===========================================================
 * RESULTAT RECHERCHE
 * ===========================================================
 */

console.log("");
console.log(
  "============================================",
);
console.log(
  " RECHERCHE DIAGNOSTIC",
);
console.log(
  "============================================",
);

console.log(
  "EXPLORED=" +
  explored,
);

if (!found) {

  throw new Error(
    "AUCUN_PARCOURS_ALTERNATEUR_TROUVE",
  );
}

console.log(
  "PATH_LENGTH=" +
  found.path.length,
);

for (
  const step
  of found.path
) {
  console.log(
    "PATH=" +
    step,
  );
}

const probabilities =
  found.result.reasoning
    ?.decision
    ?.probabilities ??
  [];

const top1 =
  probabilities[0];

const top2 =
  probabilities[1];

const conclusion =
  found.result.session
    ?.conclusion
    ?.diagnosisId ??
  null;

console.log("");
console.log(
  "STATUS=" +
  found.result.session.status,
);

console.log(
  "CONCLUSION=" +
  (conclusion ?? "NONE"),
);

console.log(
  "TOP1=" +
  (
    top1?.hypothesis?.id ??
    "NONE"
  ) +
  ":" +
  (
    (top1?.probability ?? 0) *
    100
  ).toFixed(2) +
  "%",
);

console.log(
  "TOP2=" +
  (
    top2?.hypothesis?.id ??
    "NONE"
  ) +
  ":" +
  (
    (top2?.probability ?? 0) *
    100
  ).toFixed(2) +
  "%",
);

const selectedDiagnosis =
  conclusion === TARGET
    ? conclusion
    : top1?.hypothesis?.id ??
      null;

if (
  selectedDiagnosis !==
  TARGET
) {
  throw new Error(
    "ALTERNATOR_SELECTION_FAILED",
  );
}

/*
 * ===========================================================
 * DIAGNOSTIC -> PIECE
 * ===========================================================
 */

const partName =
  "Alternateur";

console.log("");
console.log(
  "============================================",
);
console.log(
  " COMMERCIAL",
);
console.log(
  "============================================",
);

console.log(
  "DIAGNOSTIC=" +
  selectedDiagnosis,
);

console.log(
  "PART=" +
  partName,
);

/*
 * ===========================================================
 * PIECE -> CATALOGUE
 * ===========================================================
 */

const commerce =
  new DiagnosticCommercialBridge();

const beforeCompatibility =
  commerce.createOffer(
    partName,
    false,
  );

if (
  beforeCompatibility
    .canOrder
) {
  throw new Error(
    "COMPATIBILITY_GATE_FAILED",
  );
}

console.log(
  "CAN_ORDER_BEFORE_COMPATIBILITY=false",
);

const offer =
  commerce.createOffer(
    partName,
    true,
  );

if (
  !offer.canOrder ||
  !offer.offer
) {
  throw new Error(
    "COMMERCIAL_OFFER_FAILED",
  );
}

console.log(
  "REFERENCE=" +
  offer.offer.reference,
);

console.log(
  "MARQUE=" +
  offer.offer.manufacturer,
);

console.log(
  "STOCK=" +
  offer.offer.stockStatus,
);

console.log(
  "PRICE_HT=" +
  offer.offer.salePriceExVat,
);

console.log(
  "PRICE_TTC=" +
  offer.salePriceIncVat,
);

/*
 * ===========================================================
 * OFFRE -> COMMANDE
 * ===========================================================
 */

const orderEngine =
  new OrderEngine();

const order =
  orderEngine.createOrder(
    offer,
    {
      quantity:
        1,

      compatibilityConfirmed:
        true,
    },
  );

const line =
  order.lines[0];

if (!line) {
  throw new Error(
    "ORDER_LINE_MISSING",
  );
}

if (
  line.reference !==
  "ALT-DEMO-001"
) {
  throw new Error(
    "WRONG_REFERENCE",
  );
}

if (
  order.totals
    .totalIncVat !==
  264.99
) {
  throw new Error(
    "WRONG_TOTAL",
  );
}

console.log("");
console.log(
  "============================================",
);
console.log(
  " COMMANDE",
);
console.log(
  "============================================",
);

console.log(
  "ORDER_ID=" +
  order.id,
);

console.log(
  "STATUS=" +
  order.status,
);

console.log(
  "REFERENCE=" +
  line.reference,
);

console.log(
  "QUANTITY=" +
  line.quantity,
);

console.log(
  "TOTAL_HT=" +
  order.totals.totalExVat,
);

console.log(
  "TVA=" +
  order.totals.vatAmount,
);

console.log(
  "TOTAL_TTC=" +
  order.totals.totalIncVat,
);

console.log("");
console.log(
  "============================================================",
);
console.log(
  " TA PIECES AUTO - PREMIERE VENTE E2E : OK",
);
console.log(
  "============================================================",
);

console.log(
  "REAL_DIAGNOSTIC_PATH=OK",
);

console.log(
  "DIAGNOSTIC=" +
  TARGET,
);

console.log(
  "PART=Alternateur",
);

console.log(
  "CATALOG=ALT-DEMO-001",
);

console.log(
  "VEHICLE_GATE=OK",
);

console.log(
  "ORDER=CONFIRMED",
);

console.log(
  "TOTAL=264.99 EUR TTC",
);
