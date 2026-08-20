import {
  VEHICLE_HISTORY_STORAGE_KEY,
} from "./demoDataSeeder";
export type EmailPartValidation =
  | "confirmed-correct"
  | "reported-incorrect"
  | "pending"
  | "not-requested";

export type VehicleHistoryEntry = {
  id: string;

  vehicleId: string;

  searchedAt: string;

  determinedPart:
    string;

  purchased:
    boolean;

  amount:
    number | null;

  emailValidation:
    EmailPartValidation;

  emailValidatedAt:
    string | null;
};

export const DEMO_VEHICLE_HISTORY:
  Record<
    string,
    VehicleHistoryEntry[]
  > = {

  "VEH-0001": [
    {
      id:
        "VH-0001-A",

      vehicleId:
        "VEH-0001",

      searchedAt:
        "2026-08-17T10:15:00",

      determinedPart:
        "Plaquettes de frein avant",

      purchased:
        true,

      amount:
        84.90,

      emailValidation:
        "confirmed-correct",

      emailValidatedAt:
        "2026-08-20T09:00:00",
    },
  ],


  "VEH-0002": [
    {
      id:
        "VH-0002-A",

      vehicleId:
        "VEH-0002",

      searchedAt:
        "2026-08-18T14:35:00",

      determinedPart:
        "Alternateur Bosch",

      purchased:
        true,

      amount:
        264.99,

      emailValidation:
        "confirmed-correct",

      emailValidatedAt:
        "2026-08-20T08:30:00",
    },

    {
      id:
        "VH-0002-B",

      vehicleId:
        "VEH-0002",

      searchedAt:
        "2026-07-12T11:20:00",

      determinedPart:
        "Filtre à huile",

      purchased:
        true,

      amount:
        14.75,

      emailValidation:
        "confirmed-correct",

      emailValidatedAt:
        "2026-07-16T10:00:00",
    },
  ],


  "VEH-0003": [
    {
      id:
        "VH-0003-A",

      vehicleId:
        "VEH-0003",

      searchedAt:
        "2026-08-11T16:10:00",

      determinedPart:
        "Batterie 12 V",

      purchased:
        false,

      amount:
        null,

      emailValidation:
        "not-requested",

      emailValidatedAt:
        null,
    },
  ],


  "VEH-0004": [
    {
      id:
        "VH-0004-A",

      vehicleId:
        "VEH-0004",

      searchedAt:
        "2026-08-03T09:40:00",

      determinedPart:
        "Disques de frein avant",

      purchased:
        true,

      amount:
        189.50,

      emailValidation:
        "pending",

      emailValidatedAt:
        null,
    },
  ],


  "VEH-0005": [
    {
      id:
        "VH-0005-A",

      vehicleId:
        "VEH-0005",

      searchedAt:
        "2026-07-28T15:25:00",

      determinedPart:
        "Filtre à air",

      purchased:
        true,

      amount:
        27.90,

      emailValidation:
        "confirmed-correct",

      emailValidatedAt:
        "2026-08-01T09:15:00",
    },
  ],


  "VEH-0006": [
    {
      id:
        "VH-0006-A",

      vehicleId:
        "VEH-0006",

      searchedAt:
        "2026-07-25T13:00:00",

      determinedPart:
        "Bobine d'allumage",

      purchased:
        false,

      amount:
        null,

      emailValidation:
        "not-requested",

      emailValidatedAt:
        null,
    },
  ],


  "VEH-0007": [
    {
      id:
        "VH-0007-A",

      vehicleId:
        "VEH-0007",

      searchedAt:
        "2026-07-21T10:05:00",

      determinedPart:
        "Kit embrayage",

      purchased:
        true,

      amount:
        349.00,

      emailValidation:
        "confirmed-correct",

      emailValidatedAt:
        "2026-07-25T12:00:00",
    },
  ],


  "VEH-0008": [
    {
      id:
        "VH-0008-A",

      vehicleId:
        "VEH-0008",

      searchedAt:
        "2026-07-15T09:45:00",

      determinedPart:
        "Démarreur",

      purchased:
        true,

      amount:
        199.90,

      emailValidation:
        "confirmed-correct",

      emailValidatedAt:
        "2026-07-18T16:30:00",
    },
  ],


  "VEH-0009": [
    {
      id:
        "VH-0009-A",

      vehicleId:
        "VEH-0009",

      searchedAt:
        "2026-07-09T14:30:00",

      determinedPart:
        "Débitmètre d'air",

      purchased:
        false,

      amount:
        null,

      emailValidation:
        "not-requested",

      emailValidatedAt:
        null,
    },
  ],


  "VEH-0010": [
    {
      id:
        "VH-0010-A",

      vehicleId:
        "VEH-0010",

      searchedAt:
        "2026-06-30T11:15:00",

      determinedPart:
        "Bougies d'allumage",

      purchased:
        true,

      amount:
        39.60,

      emailValidation:
        "confirmed-correct",

      emailValidatedAt:
        "2026-07-03T11:00:00",
    },
  ],


  "VEH-0011": [
    {
      id:
        "VH-0011-A",

      vehicleId:
        "VEH-0011",

      searchedAt:
        "2026-06-22T17:10:00",

      determinedPart:
        "Roulement de roue avant",

      purchased:
        true,

      amount:
        94.90,

      emailValidation:
        "pending",

      emailValidatedAt:
        null,
    },
  ],


  "VEH-0012": [
    {
      id:
        "VH-0012-A",

      vehicleId:
        "VEH-0012",

      searchedAt:
        "2026-06-18T10:25:00",

      determinedPart:
        "Balais d'essuie-glace",

      purchased:
        true,

      amount:
        32.50,

      emailValidation:
        "confirmed-correct",

      emailValidatedAt:
        "2026-06-21T08:30:00",
    },
  ],


  "VEH-0013": [
    {
      id:
        "VH-0013-A",

      vehicleId:
        "VEH-0013",

      searchedAt:
        "2026-06-10T13:40:00",

      determinedPart:
        "Capteur ABS",

      purchased:
        true,

      amount:
        79.90,

      emailValidation:
        "reported-incorrect",

      emailValidatedAt:
        "2026-06-14T09:20:00",
    },
  ],


  "VEH-0014": [
    {
      id:
        "VH-0014-A",

      vehicleId:
        "VEH-0014",

      searchedAt:
        "2026-06-02T15:00:00",

      determinedPart:
        "Filtre habitacle",

      purchased:
        true,

      amount:
        24.90,

      emailValidation:
        "confirmed-correct",

      emailValidatedAt:
        "2026-06-05T10:00:00",
    },
  ],


  "VEH-0015": [
    {
      id:
        "VH-0015-A",

      vehicleId:
        "VEH-0015",

      searchedAt:
        "2026-05-27T09:30:00",

      determinedPart:
        "Vanne EGR",

      purchased:
        false,

      amount:
        null,

      emailValidation:
        "not-requested",

      emailValidatedAt:
        null,
    },
  ],


  "VEH-0016": [
    {
      id:
        "VH-0016-A",

      vehicleId:
        "VEH-0016",

      searchedAt:
        "2026-05-18T12:15:00",

      determinedPart:
        "Amortisseurs arrière",

      purchased:
        true,

      amount:
        219.00,

      emailValidation:
        "confirmed-correct",

      emailValidatedAt:
        "2026-05-22T08:45:00",
    },
  ],


  "VEH-0017": [
    {
      id:
        "VH-0017-A",

      vehicleId:
        "VEH-0017",

      searchedAt:
        "2026-05-11T14:50:00",

      determinedPart:
        "Courroie accessoires",

      purchased:
        true,

      amount:
        58.90,

      emailValidation:
        "pending",

      emailValidatedAt:
        null,
    },
  ],


  "VEH-0018": [
    {
      id:
        "VH-0018-A",

      vehicleId:
        "VEH-0018",

      searchedAt:
        "2026-05-03T11:10:00",

      determinedPart:
        "Batterie hybride auxiliaire",

      purchased:
        false,

      amount:
        null,

      emailValidation:
        "not-requested",

      emailValidatedAt:
        null,
    },
  ],


  "VEH-0019": [
    {
      id:
        "VH-0019-A",

      vehicleId:
        "VEH-0019",

      searchedAt:
        "2026-04-26T16:20:00",

      determinedPart:
        "Sonde lambda",

      purchased:
        true,

      amount:
        89.50,

      emailValidation:
        "confirmed-correct",

      emailValidatedAt:
        "2026-04-30T11:00:00",
    },
  ],


  "VEH-0020": [
    {
      id:
        "VH-0020-A",

      vehicleId:
        "VEH-0020",

      searchedAt:
        "2026-04-18T10:35:00",

      determinedPart:
        "Plaquettes de frein arrière",

      purchased:
        true,

      amount:
        67.90,

      emailValidation:
        "confirmed-correct",

      emailValidatedAt:
        "2026-04-22T09:30:00",
    },
  ],


  "VEH-0020-B": [
    {
      id:
        "VH-0020-B-A",

      vehicleId:
        "VEH-0020-B",

      searchedAt:
        "2026-08-01T13:15:00",

      determinedPart:
        "Filtre à carburant",

      purchased:
        true,

      amount:
        29.95,

      emailValidation:
        "confirmed-correct",

      emailValidatedAt:
        "2026-08-05T09:00:00",
    },
  ],
};


export function getVehicleHistory(
  vehicleId:
    string,
): VehicleHistoryEntry[] {

  const staticHistory =
    DEMO_VEHICLE_HISTORY[
      vehicleId
    ] ?? [];

  if (
    typeof window ===
    "undefined"
  ) {
    return staticHistory;
  }

  try {

    const raw =
      window.localStorage.getItem(
        VEHICLE_HISTORY_STORAGE_KEY,
      );

    if (!raw) {
      return staticHistory;
    }

    const parsed =
      JSON.parse(
        raw,
      ) as Record<
        string,
        VehicleHistoryEntry[]
      >;

    const storedHistory =
      parsed[
        vehicleId
      ] ?? [];

    const merged =
      new Map<
        string,
        VehicleHistoryEntry
      >();

    for (
      const entry
      of staticHistory
    ) {

      merged.set(
        entry.id,
        entry,
      );
    }

    for (
      const entry
      of storedHistory
    ) {

      merged.set(
        entry.id,
        entry,
      );
    }

    return [
      ...merged.values(),
    ];

  }
  catch {

    return staticHistory;
  }
}


export function getLatestVehicleHistory(
  vehicleId:
    string,
): VehicleHistoryEntry | null {

  const history =
    getVehicleHistory(
      vehicleId,
    );

  if (
    history.length ===
    0
  ) {
    return null;
  }

  return [...history]
    .sort(
      (a, b) =>
        new Date(
          b.searchedAt,
        ).getTime() -
        new Date(
          a.searchedAt,
        ).getTime(),
    )[0] ?? null;
}

