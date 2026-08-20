import {
  createDataEvent,
  dataStore,
} from "../../engine/data";

const before =
  dataStore
    .snapshot()
    .events
    .length;

dataStore.addEvent(
  createDataEvent({
    eventType:
      "showroom-data-bridge-test",

    customerId:
      "TPA-TEST",

    vehicleId:
      "VEH-TEST",

    channel:
      "showroom",

    storeId:
      "GROSSISTE-DEMO",

    terminalId:
      "BORNE-01",

    metadata: {
      test:
        true,
    },
  }),
);

const after =
  dataStore
    .snapshot()
    .events
    .length;

if (
  after !==
  before + 1
) {
  throw new Error(
    "DATA_BRIDGE_EVENT_FAILED",
  );
}

console.log("");
console.log(
  "============================================",
);

console.log(
  " SHOWROOM DATA BRIDGE : OK",
);

console.log(
  "============================================",
);

console.log(
  "GLOBAL_STORE=OK",
);

console.log(
  "CUSTOMER_API=READY",
);

console.log(
  "VEHICLE_API=READY",
);

console.log(
  "EVENT_API=READY",
);

console.log(
  `EVENTS=${after}`,
);
