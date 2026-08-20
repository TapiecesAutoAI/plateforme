import {
  DiagnosticCommercialBridge,
} from "../../engine/commerce";

import {
  OrderEngine,
} from "../../engine/orders";

const commercial =
  new DiagnosticCommercialBridge();

const orders =
  new OrderEngine();

/*
 * TEST 1
 * Impossible de commander
 * avant compatibilité.
 */
const blocked =
  commercial.createOffer(
    "Alternateur",
    false,
  );

let blockedCorrectly =
  false;

try {

  orders.createOrder(
    blocked,
    {
      quantity: 1,
      compatibilityConfirmed:
        false,
    },
  );

} catch {

  blockedCorrectly =
    true;
}

if (!blockedCorrectly) {
  throw new Error(
    "ORDER_GATE_FAILED",
  );
}

/*
 * TEST 2
 * Compatibilité confirmée.
 */
const ready =
  commercial.createOffer(
    "Alternateur",
    true,
  );

const order =
  orders.createOrder(
    ready,
    {
      quantity: 2,
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
    "ORDER_REFERENCE_FAILED",
  );
}

if (
  order.totals
    .totalExVat !==
  438
) {
  throw new Error(
    "ORDER_HT_FAILED",
  );
}

if (
  order.totals
    .vatAmount !==
  91.98
) {
  throw new Error(
    "ORDER_VAT_FAILED",
  );
}

if (
  order.totals
    .totalIncVat !==
  529.98
) {
  throw new Error(
    "ORDER_TTC_FAILED",
  );
}

console.log("");
console.log(
  "============================================",
);
console.log(
  " ORDER PIPELINE MVP : OK",
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
  "MARQUE=" +
  line.manufacturer,
);

console.log(
  "QUANTITE=" +
  line.quantity,
);

console.log(
  "UNIT_HT=" +
  line.unitPriceExVat,
);

console.log(
  "TOTAL_HT=" +
  order.totals
    .totalExVat,
);

console.log(
  "TVA=" +
  order.totals
    .vatAmount,
);

console.log(
  "TOTAL_TTC=" +
  order.totals
    .totalIncVat,
);

console.log(
  "COMPATIBILITY=" +
  order
    .vehicleCompatibilityConfirmed,
);
