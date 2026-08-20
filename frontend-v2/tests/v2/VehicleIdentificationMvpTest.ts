import {
  VehicleIdentificationEngine,
} from "../../engine/vehicle";

const engine =
  new VehicleIdentificationEngine();

const empty =
  engine.identify({});

if (
  empty.readyForCompatibilityCheck
) {
  throw new Error(
    "EMPTY_VEHICLE_SHOULD_BE_BLOCKED",
  );
}

const manual =
  engine.identify({
    brand:
      "Volkswagen",

    model:
      "Golf",

    year:
      2019,

    engine:
      "2.0 TDI 150",
  });

if (
  !manual.readyForCompatibilityCheck
) {
  throw new Error(
    "MANUAL_IDENTIFICATION_FAILED",
  );
}

const vin =
  engine.identify({
    vin:
      "WVWZZZ1KZ9W000001",
  });

if (
  !vin.readyForCompatibilityCheck
) {
  throw new Error(
    "VIN_IDENTIFICATION_FAILED",
  );
}

console.log("");
console.log(
  "============================================",
);
console.log(
  " VEHICLE IDENTIFICATION MVP : OK",
);
console.log(
  "============================================",
);

console.log(
  "EMPTY=BLOCKED",
);

console.log(
  "MANUAL=OK",
);

console.log(
  "VIN=OK",
);
