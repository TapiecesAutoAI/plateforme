import { DiagnosticCommercialBridge } from "../../engine/commerce";

const bridge = new DiagnosticCommercialBridge();

const blocked =
  bridge.createOffer("Alternateur", false);

if (
  blocked.status !== "compatibility-required" ||
  blocked.canOrder
) {
  throw new Error("COMPATIBILITY_GATE_FAILED");
}

const ready =
  bridge.createOffer("Alternateur", true);

if (!ready.canOrder) {
  throw new Error("ORDER_GATE_FAILED");
}

if (ready.offer?.reference !== "ALT-DEMO-001") {
  throw new Error("REFERENCE_FAILED");
}

console.log("");
console.log("============================================");
console.log(" COMMERCIAL PIPELINE MVP : OK");
console.log("============================================");
console.log("PART=" + ready.diagnosticPartName);
console.log("REFERENCE=" + ready.offer?.reference);
console.log("MARQUE=" + ready.offer?.manufacturer);
console.log("PRIX_HT=" + ready.offer?.salePriceExVat);
console.log("PRIX_TTC=" + ready.salePriceIncVat);
console.log("STOCK=" + ready.offer?.stockStatus);
console.log("CAN_ORDER=" + ready.canOrder);
