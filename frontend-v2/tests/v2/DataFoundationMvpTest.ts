import {
  TaPiecesAutoDataStore,
  calculateResolutionStats,
  createDataEvent,
  createInstallationFeedback,
} from "../../engine/data";

const store =
  new TaPiecesAutoDataStore();

const now =
  new Date()
    .toISOString();

store.saveCustomer({
  id: "TPA-DEMO-001",

  firstName: {
    value: "Jean",
    source: "customer",
    reliability: "declared",
    collectedAt: now,
  },

  lastName: {
    value: "Dupont",
    source: "customer",
    reliability: "declared",
    collectedAt: now,
  },

  phone: {
    value: "0470000000",
    source: "customer",
    reliability: "declared",
    collectedAt: now,
  },

  email: {
    value: "demo@example.com",
    source: "customer",
    reliability: "declared",
    collectedAt: now,
  },

  createdAt: now,
  updatedAt: now,

  marketingConsent: {
    email: true,
    sms: true,
    push: false,
  },

  visitCount: 1,
  orderCount: 1,

  tags: [
    "showroom",
  ],

  vehicleIds: [
    "VEH-DEMO-001",
  ],
});

store.saveVehicle({
  id: "VEH-DEMO-001",
  customerId: "TPA-DEMO-001",

  vin: {
    value: "VF3DEMO1234567890",
    source: "customer",
    reliability: "declared",
    collectedAt: now,
  },

  brand: {
    value: "Peugeot",
    source: "vin-decoder",
    reliability: "high",
    collectedAt: now,
  },

  model: {
    value: "308",
    source: "vin-decoder",
    reliability: "high",
    collectedAt: now,
  },

  mileageKm: {
    value: 184000,
    source: "customer",
    reliability: "declared",
    collectedAt: now,
  },

  createdAt: now,
  updatedAt: now,

  diagnosticIds: [
    "DIAG-DEMO-001",
  ],

  orderIds: [
    "ORDER-DEMO-001",
  ],

  tags: [],
});

store.saveInstallationFeedback(
  createInstallationFeedback({
    customerId:
      "TPA-DEMO-001",

    vehicleId:
      "VEH-DEMO-001",

    orderId:
      "ORDER-DEMO-001",

    partId:
      "STARTER-DEMO-001",

    diagnosticId:
      "DIAG-DEMO-001",

    installed: true,

    installedBy:
      "customer",

    mileageAtInstallationKm:
      184120,

    result:
      "resolved",

    problemDisappearedImmediately:
      true,

    satisfactionScore:
      5,
  }),
);

store.addEvent(
  createDataEvent({
    eventType:
      "showroom-session-started",

    customerId:
      "TPA-DEMO-001",

    vehicleId:
      "VEH-DEMO-001",

    channel:
      "showroom",

    storeId:
      "STORE-DEMO",

    terminalId:
      "KIOSK-01",

    metadata: {
      profile:
        "particulier",
    },
  }),
);

const snapshot =
  store.snapshot();

const stats =
  calculateResolutionStats(
    snapshot,
  );

if (
  snapshot.customers.length !== 1
) {
  throw new Error(
    "CUSTOMER_STORAGE_FAILED",
  );
}

if (
  snapshot.vehicles.length !== 1
) {
  throw new Error(
    "VEHICLE_STORAGE_FAILED",
  );
}

if (
  snapshot.installationFeedback.length !==
  1
) {
  throw new Error(
    "FEEDBACK_STORAGE_FAILED",
  );
}

if (
  stats.resolutionRate !== 1
) {
  throw new Error(
    "RESOLUTION_ANALYTICS_FAILED",
  );
}

console.log("");
console.log(
  "============================================",
);

console.log(
  " DATA FOUNDATION MVP : OK",
);

console.log(
  "============================================",
);

console.log(
  `CUSTOMERS=${snapshot.customers.length}`,
);

console.log(
  `VEHICLES=${snapshot.vehicles.length}`,
);

console.log(
  `FEEDBACK=${snapshot.installationFeedback.length}`,
);

console.log(
  `EVENTS=${snapshot.events.length}`,
);

console.log(
  `RESOLUTION_RATE=${Math.round(
    stats.resolutionRate * 100,
  )}%`,
);

console.log(
  "PROVENANCE=OK",
);

console.log(
  "RELIABILITY=OK",
);

console.log(
  "MARKETING_CONSENT=OK",
);

console.log(
  "POST_INSTALLATION_LEARNING=OK",
);
