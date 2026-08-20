const CUSTOMER_STORAGE_KEY =
  "tapiecesauto-showroom-customers";

export const VEHICLE_HISTORY_STORAGE_KEY =
  "tapiecesauto-vehicle-history-v2";

type AnyObject =
  Record<string, any>;

type DemoHistoryEntry = {
  id: string;
  vehicleId: string;
  searchedAt: string;
  determinedPart: string;
  purchased: boolean;
  amount: number | null;
  emailValidation:
    | "confirmed-correct"
    | "reported-incorrect"
    | "pending"
    | "not-requested";
  emailValidatedAt:
    string | null;
};


const EXTRA_VEHICLES:
  Record<
    string,
    AnyObject
  > = {

  C1: {
    id:
      "VEH-C1-EXTRA-01",

    vin:
      "VF3DEMO0000000101",

    plate:
      "1-TPA-101",

    brand:
      "Peugeot",

    model:
      "3008",

    year:
      2022,

    engine:
      "1.5 BlueHDi 130",

    fuel:
      "Diesel",

    powerHp:
      130,

    powerKw:
      96,

    label:
      "Peugeot 3008 2022 1.5 BlueHDi 130",
  },


  C2: {
    id:
      "VEH-C2-EXTRA-01",

    vin:
      "WBADEMO0000000202",

    plate:
      "2-TPA-202",

    brand:
      "BMW",

    model:
      "320d",

    year:
      2020,

    engine:
      "2.0 Diesel 190",

    fuel:
      "Diesel",

    powerHp:
      190,

    powerKw:
      140,

    label:
      "BMW 320d 2020 2.0 Diesel 190",
  },


  C3: {
    id:
      "VEH-C3-EXTRA-01",

    vin:
      "JTDEMO00000000303",

    plate:
      "1-TPA-303",

    brand:
      "Toyota",

    model:
      "Yaris Hybrid",

    year:
      2023,

    engine:
      "1.5 Hybrid 116",

    fuel:
      "Hybride",

    powerHp:
      116,

    powerKw:
      85,

    label:
      "Toyota Yaris Hybrid 2023 1.5 116",
  },


  C4: {
    id:
      "VEH-C4-EXTRA-01",

    vin:
      "WDDDEMO0000000404",

    plate:
      "2-TPA-404",

    brand:
      "Mercedes-Benz",

    model:
      "C200",

    year:
      2018,

    engine:
      "1.5 Essence 184",

    fuel:
      "Essence",

    powerHp:
      184,

    powerKw:
      135,

    label:
      "Mercedes-Benz C200 2018 1.5 184",
  },


  C5: {
    id:
      "VEH-C5-EXTRA-01",

    vin:
      "WF0DEMO0000000505",

    plate:
      "1-TPA-505",

    brand:
      "Ford",

    model:
      "Transit",

    year:
      2021,

    engine:
      "2.0 EcoBlue 170",

    fuel:
      "Diesel",

    powerHp:
      170,

    powerKw:
      125,

    label:
      "Ford Transit 2021 2.0 EcoBlue 170",
  },
};


const EXTRA_HISTORY:
  Record<
    string,
    DemoHistoryEntry[]
  > = {

  "VEH-C1-EXTRA-01": [
    {
      id:
        "H-C1-EXTRA-01",

      vehicleId:
        "VEH-C1-EXTRA-01",

      searchedAt:
        "2026-08-14T10:20:00",

      determinedPart:
        "Batterie AGM 70 Ah",

      purchased:
        true,

      amount:
        169.90,

      emailValidation:
        "confirmed-correct",

      emailValidatedAt:
        "2026-08-18T09:10:00",
    },
  ],


  "VEH-C2-EXTRA-01": [
    {
      id:
        "H-C2-EXTRA-01",

      vehicleId:
        "VEH-C2-EXTRA-01",

      searchedAt:
        "2026-08-16T14:05:00",

      determinedPart:
        "Plaquettes de frein avant",

      purchased:
        true,

      amount:
        124.50,

      emailValidation:
        "confirmed-correct",

      emailValidatedAt:
        "2026-08-19T11:30:00",
    },

    {
      id:
        "H-C2-EXTRA-02",

      vehicleId:
        "VEH-C2-EXTRA-01",

      searchedAt:
        "2026-05-12T09:30:00",

      determinedPart:
        "Filtre à huile",

      purchased:
        true,

      amount:
        18.90,

      emailValidation:
        "confirmed-correct",

      emailValidatedAt:
        "2026-05-15T08:00:00",
    },
  ],


  "VEH-C3-EXTRA-01": [
    {
      id:
        "H-C3-EXTRA-01",

      vehicleId:
        "VEH-C3-EXTRA-01",

      searchedAt:
        "2026-08-09T11:40:00",

      determinedPart:
        "Filtre habitacle charbon actif",

      purchased:
        true,

      amount:
        29.90,

      emailValidation:
        "confirmed-correct",

      emailValidatedAt:
        "2026-08-13T10:05:00",
    },
  ],


  "VEH-C4-EXTRA-01": [
    {
      id:
        "H-C4-EXTRA-01",

      vehicleId:
        "VEH-C4-EXTRA-01",

      searchedAt:
        "2026-08-05T15:15:00",

      determinedPart:
        "Jeu de 2 ampoules H7",

      purchased:
        true,

      amount:
        32.80,

      emailValidation:
        "confirmed-correct",

      emailValidatedAt:
        "2026-08-08T09:45:00",
    },
  ],


  "VEH-C5-EXTRA-01": [
    {
      id:
        "H-C5-EXTRA-01",

      vehicleId:
        "VEH-C5-EXTRA-01",

      searchedAt:
        "2026-08-17T08:50:00",

      determinedPart:
        "Huile moteur 5W30 5 L",

      purchased:
        true,

      amount:
        74.90,

      emailValidation:
        "pending",

      emailValidatedAt:
        null,
    },

    {
      id:
        "H-C5-EXTRA-02",

      vehicleId:
        "VEH-C5-EXTRA-01",

      searchedAt:
        "2026-04-21T13:30:00",

      determinedPart:
        "Filtre à carburant",

      purchased:
        true,

      amount:
        44.50,

      emailValidation:
        "confirmed-correct",

      emailValidatedAt:
        "2026-04-25T09:00:00",
    },
  ],
};


const SAMPLE_PARTS = [
  {
    part:
      "Balais d'essuie-glace",

    amount:
      27.90,
  },

  {
    part:
      "Filtre à air",

    amount:
      24.50,
  },

  {
    part:
      "Plaquettes de frein avant",

    amount:
      89.90,
  },

  {
    part:
      "Batterie 12 V",

    amount:
      149.90,
  },

  {
    part:
      "Filtre habitacle",

    amount:
      22.90,
  },

  {
    part:
      "Démarreur",

    amount:
      219.00,
  },

  {
    part:
      "Alternateur",

    amount:
      264.99,
  },
];


function numericCustomerId(
  id:
    string,
): number {

  const match =
    /^C(\d+)$/i.exec(
      id,
    );

  return match
    ? Number(
        match[1],
      )
    : 99;
}


function fakeVin(
  customerNumber:
    number,
  vehicleIndex:
    number,
): string {

  const customer =
    String(
      customerNumber,
    ).padStart(
      4,
      "0",
    );

  const vehicle =
    String(
      vehicleIndex + 1,
    ).padStart(
      3,
      "0",
    );

  return (
    `TPA${customer}${vehicle}DEMO01X`
  ).slice(
    0,
    17,
  );
}


function defaultProfile(
  number:
    number,
): string {

  if (
    number % 5 ===
    0
  ) {
    return "mecanicien-garage";
  }

  if (
    number % 2 ===
    0
  ) {
    return "bricoleur";
  }

  return "particulier";
}


function normalizeVehicle(
  vehicle:
    AnyObject,
  customerNumber:
    number,
  vehicleIndex:
    number,
): AnyObject {

  const hp =
    Number(
      vehicle.powerHp ??
      0,
    ) ||
    (
      90 +
      (
        (
          customerNumber +
          vehicleIndex
        ) %
        8
      ) *
      10
    );

  const kw =
    Number(
      vehicle.powerKw ??
      0,
    ) ||
    Math.round(
      hp /
      1.35962,
    );

  const brand =
    String(
      vehicle.brand ??
      "",
    ).trim() ||
    "Volkswagen";

  const model =
    String(
      vehicle.model ??
      "",
    ).trim() ||
    `Modèle ${vehicleIndex + 1}`;

  const year =
    Number(
      vehicle.year ??
      0,
    ) ||
    (
      2014 +
      (
        (
          customerNumber +
          vehicleIndex
        ) %
        11
      )
    );

  const engine =
    String(
      vehicle.engine ??
      "",
    ).trim() ||
    (
      customerNumber %
      3 ===
      0
        ? "1.5 TSI"
        : "2.0 TDI"
    );

  const fuel =
    String(
      vehicle.fuel ??
      "",
    ).trim() ||
    (
      engine
        .toUpperCase()
        .includes(
          "TDI",
        )
        ? "Diesel"
        : "Essence"
    );

  return {
    ...vehicle,

    id:
      String(
        vehicle.id ??
        `VEH-C${customerNumber}-${vehicleIndex + 1}`,
      ),

    vin:
      String(
        vehicle.vin ??
        "",
      ).trim() ||
      fakeVin(
        customerNumber,
        vehicleIndex,
      ),

    plate:
      String(
        vehicle.plate ??
        "",
      ).trim() ||
      `1-DEM-${String(
        customerNumber * 10 +
        vehicleIndex +
        1,
      ).padStart(
        3,
        "0",
      )}`,

    brand,
    model,
    year,
    engine,
    fuel,

    powerHp:
      hp,

    powerKw:
      kw,

    label:
      String(
        vehicle.label ??
        "",
      ).trim() ||
      `${brand} ${model} ${year} ${engine}`,
  };
}


function normalizeRecord(
  record:
    AnyObject,
): AnyObject {

  const customer =
    {
      ...(
        record.customer ??
        {}
      ),
    };

  const number =
    numericCustomerId(
      String(
        customer.id ??
        "C99",
      ),
    );

  customer.firstName =
    String(
      customer.firstName ??
      "",
    ).trim() ||
    `Client ${number}`;

  customer.lastName =
    String(
      customer.lastName ??
      "",
    ).trim() ||
    "Démo";

  customer.phone =
    String(
      customer.phone ??
      "",
    ).trim() ||
    `0470 00 ${String(
      number,
    ).padStart(
      2,
      "0",
    )} ${String(
      number,
    ).padStart(
      2,
      "0",
    )}`;

  customer.email =
    String(
      customer.email ??
      "",
    ).trim() ||
    `client.c${number}@demo.tapiecesauto.test`;

  /*
   * IMPORTANT :
   * un consentement marketing
   * ne doit jamais être inventé.
   */
  customer.marketingEmail =
    customer.marketingEmail ===
    true;

  customer.marketingSms =
    customer.marketingSms ===
    true;

  customer.profile =
    customer.profile ||
    defaultProfile(
      number,
    );

  const currentVehicles =
    Array.isArray(
      record.vehicles,
    )
      ? record.vehicles
      : [];

  const normalizedVehicles =
    currentVehicles.map(
      (
        vehicle:
          AnyObject,
        index:
          number,
      ) =>
        normalizeVehicle(
          vehicle,
          number,
          index,
        ),
    );

  const extra =
    EXTRA_VEHICLES[
      `C${number}`
    ];

  if (
    extra &&
    !normalizedVehicles.some(
      (
        vehicle:
          AnyObject,
      ) =>
        vehicle.id ===
        extra.id,
    )
  ) {

    normalizedVehicles.push(
      extra,
    );
  }

  return {
    ...record,

    customer,

    vehicles:
      normalizedVehicles,
  };
}


function loadStoredRecords():
  AnyObject[] {

  try {

    const raw =
      window.localStorage.getItem(
        CUSTOMER_STORAGE_KEY,
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(
        raw,
      );

    return Array.isArray(
      parsed,
    )
      ? parsed
      : [];

  }
  catch {

    return [];
  }
}


function loadStoredHistory():
  Record<
    string,
    DemoHistoryEntry[]
  > {

  try {

    const raw =
      window.localStorage.getItem(
        VEHICLE_HISTORY_STORAGE_KEY,
      );

    if (!raw) {
      return {};
    }

    const parsed =
      JSON.parse(
        raw,
      );

    return (
      parsed &&
      typeof parsed ===
      "object"
    )
      ? parsed
      : {};

  }
  catch {

    return {};
  }
}


function ensureHistory(
  records:
    AnyObject[],
): void {

  const stored =
    loadStoredHistory();

  for (
    const [
      vehicleId,
      history,
    ]
    of Object.entries(
      EXTRA_HISTORY,
    )
  ) {

    if (
      !stored[
        vehicleId
      ]
    ) {

      stored[
        vehicleId
      ] =
        history;
    }
  }


  let vehicleSequence =
    0;

  for (
    const record
    of records
  ) {

    for (
      const vehicle
      of record.vehicles ??
      []
    ) {

      const vehicleId =
        String(
          vehicle.id,
        );

      if (
        stored[
          vehicleId
        ]?.length
      ) {

        vehicleSequence++;

        continue;
      }

      const sample =
        SAMPLE_PARTS[
          vehicleSequence %
          SAMPLE_PARTS.length
        ];

      const purchased =
        vehicleSequence %
        4 !==
        0;

      const day =
        String(
          2 +
          (
            vehicleSequence %
            17
          ),
        ).padStart(
          2,
          "0",
        );

      stored[
        vehicleId
      ] = [
        {
          id:
            `H-DEMO-${vehicleId}-01`,

          vehicleId,

          searchedAt:
            `2026-07-${day}T10:00:00`,

          determinedPart:
            sample.part,

          purchased,

          amount:
            purchased
              ? sample.amount
              : null,

          emailValidation:
            purchased
              ? (
                  vehicleSequence %
                  5 ===
                  0
                    ? "pending"
                    : "confirmed-correct"
                )
              : "not-requested",

          emailValidatedAt:
            purchased &&
            vehicleSequence %
            5 !==
            0
              ? `2026-07-${String(
                  Math.min(
                    28,
                    Number(
                      day,
                    ) +
                    3,
                  ),
                ).padStart(
                  2,
                  "0",
                )}T09:00:00`
              : null,
        },
      ];

      vehicleSequence++;
    }
  }

  window.localStorage.setItem(
    VEHICLE_HISTORY_STORAGE_KEY,
    JSON.stringify(
      stored,
    ),
  );
}


export function seedShowroomDemoData<
  T
>(
  demoRecords:
    T[],
): T[] {

  if (
    typeof window ===
    "undefined"
  ) {
    return demoRecords;
  }

  const existing =
    loadStoredRecords();

  const merged:
    AnyObject[] = [
      ...existing,
    ];

  for (
    const demo
    of demoRecords as
      AnyObject[]
  ) {

    const id =
      demo.customer
        ?.id;

    const index =
      merged.findIndex(
        record =>
          record.customer
            ?.id ===
          id,
      );

    if (
      index ===
      -1
    ) {

      merged.push(
        demo,
      );

      continue;
    }

    /*
     * Les données déjà saisies
     * par le client restent prioritaires.
     */
    merged[
      index
    ] = {
      ...demo,
      ...merged[
        index
      ],

      customer: {
        ...demo.customer,
        ...merged[
          index
        ].customer,
      },

      vehicles:
        Array.isArray(
          merged[
            index
          ].vehicles,
        ) &&
        merged[
          index
        ].vehicles.length >
        0
          ? merged[
              index
            ].vehicles
          : demo.vehicles,
    };
  }

  const normalized =
    merged.map(
      normalizeRecord,
    );

  window.localStorage.setItem(
    CUSTOMER_STORAGE_KEY,
    JSON.stringify(
      normalized,
    ),
  );

  ensureHistory(
    normalized,
  );

  return normalized as
    T[];
}
