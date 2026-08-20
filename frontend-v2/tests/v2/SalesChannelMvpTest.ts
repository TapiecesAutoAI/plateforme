import {
  CounterHandoffEngine,
  SalesContextEngine,
} from "../../engine/sales";

const sales =
  new SalesContextEngine();

const counter =
  new CounterHandoffEngine();

/*
 * ===========================================================
 * ONLINE PARTICULIER
 * ===========================================================
 */

const online =
  sales.resolve({
    profile:
      "particulier",

    channel:
      "online",

    fulfillment:
      null,

    paymentStatus:
      "payment-required",

    counterHandoff:
      "none",

    storeId:
      null,

    terminalId:
      null,
  });

if (
  !online.canDeliver ||
  !online.canPayOnline ||
  online.canSendToCounter
) {
  throw new Error(
    "ONLINE_FLOW_FAILED",
  );
}

if (
  online.options.length !==
  3
) {
  throw new Error(
    "ONLINE_OPTIONS_FAILED",
  );
}

/*
 * ===========================================================
 * SHOWROOM PARTICULIER
 * ===========================================================
 */

const showroom =
  sales.resolve({
    profile:
      "particulier",

    channel:
      "showroom",

    fulfillment:
      null,

    paymentStatus:
      "not-paid",

    counterHandoff:
      "none",

    storeId:
      "GROSSISTE-DEMO",

    terminalId:
      "BORNE-01",
  });

if (
  !showroom.canSendToCounter
) {
  throw new Error(
    "SHOWROOM_COUNTER_FAILED",
  );
}

if (
  showroom.options.length !==
  3
) {
  throw new Error(
    "SHOWROOM_OPTIONS_FAILED",
  );
}

/*
 * ===========================================================
 * SHOWROOM MECANICIEN
 *
 * Important :
 * même moteur, autre profil.
 * ===========================================================
 */

const mechanic =
  sales.resolve({
    profile:
      "mecanicien-garage",

    channel:
      "showroom",

    fulfillment:
      null,

    paymentStatus:
      "not-paid",

    counterHandoff:
      "none",

    storeId:
      "GROSSISTE-DEMO",

    terminalId:
      "BORNE-02",
  });

if (
  !mechanic.canSendToCounter
) {
  throw new Error(
    "MECHANIC_SHOWROOM_FAILED",
  );
}

/*
 * ===========================================================
 * ENVOI AU COMPTOIR NON PAYE
 * ===========================================================
 */

const unpaid =
  counter.create({
    profile:
      "particulier",

    storeId:
      "GROSSISTE-DEMO",

    terminalId:
      "BORNE-01",

    diagnosticId:
      "problem-alternator",

    genericPartName:
      "Alternateur",

    reference:
      "ALT-DEMO-001",

    manufacturer:
      "Bosch",

    quantity:
      1,

    totalIncVat:
      264.99,

    paymentStatus:
      "not-paid",

    vehicleDescription:
      "Volkswagen Golf 2.0 TDI 150 2019",

    vin:
      "WVWZZZ1KZ9W000001",
  });

if (
  unpaid.status !==
  "requested"
) {
  throw new Error(
    "UNPAID_HANDOFF_FAILED",
  );
}

/*
 * ===========================================================
 * COMMANDE PAYEE -> PREPARATION COMPTOIR
 * ===========================================================
 */

const paid =
  counter.create({
    profile:
      "particulier",

    storeId:
      "GROSSISTE-DEMO",

    terminalId:
      "BORNE-01",

    diagnosticId:
      "problem-alternator",

    genericPartName:
      "Alternateur",

    reference:
      "ALT-DEMO-001",

    manufacturer:
      "Bosch",

    quantity:
      1,

    totalIncVat:
      264.99,

    paymentStatus:
      "paid",

    vehicleDescription:
      "Volkswagen Golf 2.0 TDI 150 2019",

    vin:
      "WVWZZZ1KZ9W000001",
  });

if (
  paid.status !==
  "paid-ready-for-preparation"
) {
  throw new Error(
    "PAID_HANDOFF_FAILED",
  );
}

const ready =
  counter.markReady(
    paid,
  );

if (
  ready.status !==
  "ready-for-pickup"
) {
  throw new Error(
    "READY_FAILED",
  );
}

const collected =
  counter.markCollected(
    ready,
  );

if (
  collected.status !==
  "collected"
) {
  throw new Error(
    "COLLECTED_FAILED",
  );
}

console.log("");
console.log(
  "============================================",
);
console.log(
  " SALES CHANNEL MVP : OK",
);
console.log(
  "============================================",
);

console.log(
  "ONLINE_OPTIONS=" +
  online.options
    .map(
      option =>
        option.id,
    )
    .join(","),
);

console.log(
  "SHOWROOM_OPTIONS=" +
  showroom.options
    .map(
      option =>
        option.id,
    )
    .join(","),
);

console.log(
  "PARTICULIER_SHOWROOM=OK",
);

console.log(
  "MECANICIEN_SHOWROOM=OK",
);

console.log(
  "UNPAID_COUNTER=" +
  unpaid.status,
);

console.log(
  "PAID_COUNTER=" +
  paid.status,
);

console.log(
  "READY=" +
  ready.status,
);

console.log(
  "COLLECTED=" +
  collected.status,
);

console.log("");
console.log(
  "CHANNEL_AND_PROFILE_SEPARATED=OK",
);
