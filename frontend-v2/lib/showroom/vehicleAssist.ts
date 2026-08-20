export type VehicleAssistEngine = {
  label: string;
  fuel: string;
  hp: number;
  kw: number;
};

export type VehicleAssistModel = {
  model: string;
  fromYear: number;
  toYear: number;
  engines: VehicleAssistEngine[];
};

export type VehicleAssistBrand = {
  brand: string;
  models: VehicleAssistModel[];
};


const CURRENT_YEAR =
  new Date().getFullYear();


export const VEHICLE_ASSIST:
  VehicleAssistBrand[] = [

  {
    brand: "Audi",
    models: [
      {
        model: "A1",
        fromYear: 2010,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "1.0 TFSI 95", fuel: "Essence", hp: 95, kw: 70 },
          { label: "1.0 TFSI 110", fuel: "Essence", hp: 110, kw: 81 },
          { label: "1.5 TFSI 150", fuel: "Essence", hp: 150, kw: 110 },
          { label: "1.6 TDI 116", fuel: "Diesel", hp: 116, kw: 85 },
        ],
      },
      {
        model: "A2",
        fromYear: 1999,
        toYear: 2005,
        engines: [
          { label: "1.4 75", fuel: "Essence", hp: 75, kw: 55 },
          { label: "1.4 TDI 75", fuel: "Diesel", hp: 75, kw: 55 },
          { label: "1.4 TDI 90", fuel: "Diesel", hp: 90, kw: 66 },
        ],
      },
      {
        model: "A3",
        fromYear: 1996,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "1.0 TFSI 110", fuel: "Essence", hp: 110, kw: 81 },
          { label: "1.5 TFSI 150", fuel: "Essence", hp: 150, kw: 110 },
          { label: "1.6 TDI 116", fuel: "Diesel", hp: 116, kw: 85 },
          { label: "2.0 TDI 150", fuel: "Diesel", hp: 150, kw: 110 },
          { label: "2.0 TDI 184", fuel: "Diesel", hp: 184, kw: 135 },
        ],
      },
      {
        model: "A4",
        fromYear: 1994,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "1.4 TFSI 150", fuel: "Essence", hp: 150, kw: 110 },
          { label: "2.0 TFSI 190", fuel: "Essence", hp: 190, kw: 140 },
          { label: "2.0 TDI 136", fuel: "Diesel", hp: 136, kw: 100 },
          { label: "2.0 TDI 150", fuel: "Diesel", hp: 150, kw: 110 },
          { label: "2.0 TDI 190", fuel: "Diesel", hp: 190, kw: 140 },
        ],
      },
      {
        model: "Q3",
        fromYear: 2011,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "1.5 TFSI 150", fuel: "Essence", hp: 150, kw: 110 },
          { label: "2.0 TDI 150", fuel: "Diesel", hp: 150, kw: 110 },
        ],
      },
      {
        model: "Q5",
        fromYear: 2008,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "2.0 TFSI 204", fuel: "Essence", hp: 204, kw: 150 },
          { label: "2.0 TDI 163", fuel: "Diesel", hp: 163, kw: 120 },
          { label: "2.0 TDI 204", fuel: "Diesel", hp: 204, kw: 150 },
        ],
      },
    ],
  },


  {
    brand: "BMW",
    models: [
      {
        model: "Série 1",
        fromYear: 2004,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "116i", fuel: "Essence", hp: 109, kw: 80 },
          { label: "118i", fuel: "Essence", hp: 136, kw: 100 },
          { label: "116d", fuel: "Diesel", hp: 116, kw: 85 },
          { label: "118d", fuel: "Diesel", hp: 150, kw: 110 },
        ],
      },
      {
        model: "Série 3",
        fromYear: 1982,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "318i", fuel: "Essence", hp: 156, kw: 115 },
          { label: "320i", fuel: "Essence", hp: 184, kw: 135 },
          { label: "318d", fuel: "Diesel", hp: 150, kw: 110 },
          { label: "320d", fuel: "Diesel", hp: 190, kw: 140 },
        ],
      },
      {
        model: "X1",
        fromYear: 2009,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "sDrive18i", fuel: "Essence", hp: 136, kw: 100 },
          { label: "sDrive18d", fuel: "Diesel", hp: 150, kw: 110 },
        ],
      },
      {
        model: "X3",
        fromYear: 2003,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "xDrive20i", fuel: "Essence", hp: 184, kw: 135 },
          { label: "xDrive20d", fuel: "Diesel", hp: 190, kw: 140 },
        ],
      },
    ],
  },


  {
    brand: "Citroën",
    models: [
      {
        model: "C3",
        fromYear: 2002,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "1.2 PureTech 83", fuel: "Essence", hp: 83, kw: 61 },
          { label: "1.2 PureTech 110", fuel: "Essence", hp: 110, kw: 81 },
          { label: "1.5 BlueHDi 100", fuel: "Diesel", hp: 100, kw: 74 },
        ],
      },
      {
        model: "C4",
        fromYear: 2004,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "1.2 PureTech 130", fuel: "Essence", hp: 130, kw: 96 },
          { label: "1.5 BlueHDi 130", fuel: "Diesel", hp: 130, kw: 96 },
        ],
      },
      {
        model: "Berlingo",
        fromYear: 1996,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "1.2 PureTech 110", fuel: "Essence", hp: 110, kw: 81 },
          { label: "1.5 BlueHDi 100", fuel: "Diesel", hp: 100, kw: 74 },
          { label: "1.5 BlueHDi 130", fuel: "Diesel", hp: 130, kw: 96 },
        ],
      },
    ],
  },


  {
    brand: "Dacia",
    models: [
      {
        model: "Sandero",
        fromYear: 2008,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "1.0 SCe 65", fuel: "Essence", hp: 65, kw: 48 },
          { label: "1.0 TCe 90", fuel: "Essence", hp: 90, kw: 67 },
          { label: "1.0 ECO-G 100", fuel: "LPG", hp: 100, kw: 74 },
        ],
      },
      {
        model: "Duster",
        fromYear: 2010,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "1.0 TCe 100", fuel: "Essence", hp: 100, kw: 74 },
          { label: "1.3 TCe 130", fuel: "Essence", hp: 130, kw: 96 },
          { label: "1.5 Blue dCi 115", fuel: "Diesel", hp: 115, kw: 85 },
        ],
      },
    ],
  },


  {
    brand: "Ford",
    models: [
      {
        model: "Fiesta",
        fromYear: 1976,
        toYear: 2023,
        engines: [
          { label: "1.0 EcoBoost 100", fuel: "Essence", hp: 100, kw: 74 },
          { label: "1.0 EcoBoost 125", fuel: "Essence", hp: 125, kw: 92 },
          { label: "1.5 TDCi 85", fuel: "Diesel", hp: 85, kw: 63 },
        ],
      },
      {
        model: "Focus",
        fromYear: 1998,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "1.0 EcoBoost 125", fuel: "Essence", hp: 125, kw: 92 },
          { label: "1.5 EcoBlue 120", fuel: "Diesel", hp: 120, kw: 88 },
        ],
      },
      {
        model: "Transit",
        fromYear: 1965,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "2.0 EcoBlue 105", fuel: "Diesel", hp: 105, kw: 77 },
          { label: "2.0 EcoBlue 130", fuel: "Diesel", hp: 130, kw: 96 },
          { label: "2.0 EcoBlue 170", fuel: "Diesel", hp: 170, kw: 125 },
        ],
      },
    ],
  },


  {
    brand: "Mercedes-Benz",
    models: [
      {
        model: "Classe A",
        fromYear: 1997,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "A180", fuel: "Essence", hp: 136, kw: 100 },
          { label: "A200", fuel: "Essence", hp: 163, kw: 120 },
          { label: "A180d", fuel: "Diesel", hp: 116, kw: 85 },
          { label: "A200d", fuel: "Diesel", hp: 150, kw: 110 },
        ],
      },
      {
        model: "Classe C",
        fromYear: 1993,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "C180", fuel: "Essence", hp: 170, kw: 125 },
          { label: "C200", fuel: "Essence", hp: 204, kw: 150 },
          { label: "C200d", fuel: "Diesel", hp: 163, kw: 120 },
          { label: "C220d", fuel: "Diesel", hp: 200, kw: 147 },
        ],
      },
      {
        model: "Vito",
        fromYear: 1996,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "114 CDI", fuel: "Diesel", hp: 136, kw: 100 },
          { label: "116 CDI", fuel: "Diesel", hp: 163, kw: 120 },
          { label: "119 CDI", fuel: "Diesel", hp: 190, kw: 140 },
        ],
      },
    ],
  },


  {
    brand: "Opel",
    models: [
      {
        model: "Corsa",
        fromYear: 1982,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "1.2 75", fuel: "Essence", hp: 75, kw: 55 },
          { label: "1.2 Turbo 100", fuel: "Essence", hp: 100, kw: 74 },
          { label: "1.5 Diesel 102", fuel: "Diesel", hp: 102, kw: 75 },
        ],
      },
      {
        model: "Astra",
        fromYear: 1991,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "1.2 Turbo 110", fuel: "Essence", hp: 110, kw: 81 },
          { label: "1.5 Diesel 130", fuel: "Diesel", hp: 130, kw: 96 },
        ],
      },
    ],
  },


  {
    brand: "Peugeot",
    models: [
      {
        model: "208",
        fromYear: 2012,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "1.2 PureTech 75", fuel: "Essence", hp: 75, kw: 55 },
          { label: "1.2 PureTech 100", fuel: "Essence", hp: 100, kw: 74 },
          { label: "1.5 BlueHDi 100", fuel: "Diesel", hp: 100, kw: 74 },
        ],
      },
      {
        model: "308",
        fromYear: 2007,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "1.2 PureTech 110", fuel: "Essence", hp: 110, kw: 81 },
          { label: "1.2 PureTech 130", fuel: "Essence", hp: 130, kw: 96 },
          { label: "1.5 BlueHDi 130", fuel: "Diesel", hp: 130, kw: 96 },
        ],
      },
      {
        model: "3008",
        fromYear: 2009,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "1.2 PureTech 130", fuel: "Essence", hp: 130, kw: 96 },
          { label: "1.5 BlueHDi 130", fuel: "Diesel", hp: 130, kw: 96 },
          { label: "Hybrid 225", fuel: "Hybride", hp: 225, kw: 165 },
        ],
      },
      {
        model: "Partner",
        fromYear: 1996,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "1.5 BlueHDi 100", fuel: "Diesel", hp: 100, kw: 74 },
          { label: "1.5 BlueHDi 130", fuel: "Diesel", hp: 130, kw: 96 },
        ],
      },
    ],
  },


  {
    brand: "Renault",
    models: [
      {
        model: "Clio",
        fromYear: 1990,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "1.0 SCe 65", fuel: "Essence", hp: 65, kw: 48 },
          { label: "1.0 TCe 90", fuel: "Essence", hp: 90, kw: 67 },
          { label: "1.0 TCe 100", fuel: "Essence", hp: 100, kw: 74 },
          { label: "1.5 Blue dCi 100", fuel: "Diesel", hp: 100, kw: 74 },
        ],
      },
      {
        model: "Captur",
        fromYear: 2013,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "1.0 TCe 90", fuel: "Essence", hp: 90, kw: 67 },
          { label: "1.3 TCe 140", fuel: "Essence", hp: 140, kw: 103 },
          { label: "E-Tech Hybrid 145", fuel: "Hybride", hp: 145, kw: 107 },
        ],
      },
      {
        model: "Mégane",
        fromYear: 1995,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "1.3 TCe 140", fuel: "Essence", hp: 140, kw: 103 },
          { label: "1.5 Blue dCi 115", fuel: "Diesel", hp: 115, kw: 85 },
        ],
      },
    ],
  },


  {
    brand: "Škoda",
    models: [
      {
        model: "Fabia",
        fromYear: 1999,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "1.0 MPI 80", fuel: "Essence", hp: 80, kw: 59 },
          { label: "1.0 TSI 95", fuel: "Essence", hp: 95, kw: 70 },
          { label: "1.0 TSI 110", fuel: "Essence", hp: 110, kw: 81 },
        ],
      },
      {
        model: "Octavia",
        fromYear: 1996,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "1.0 TSI 110", fuel: "Essence", hp: 110, kw: 81 },
          { label: "1.5 TSI 150", fuel: "Essence", hp: 150, kw: 110 },
          { label: "2.0 TDI 115", fuel: "Diesel", hp: 115, kw: 85 },
          { label: "2.0 TDI 150", fuel: "Diesel", hp: 150, kw: 110 },
        ],
      },
    ],
  },


  {
    brand: "Toyota",
    models: [
      {
        model: "Yaris",
        fromYear: 1999,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "1.0 VVT-i 72", fuel: "Essence", hp: 72, kw: 53 },
          { label: "1.5 Hybrid 116", fuel: "Hybride", hp: 116, kw: 85 },
          { label: "1.5 Hybrid 130", fuel: "Hybride", hp: 130, kw: 96 },
        ],
      },
      {
        model: "Corolla",
        fromYear: 1966,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "1.8 Hybrid 140", fuel: "Hybride", hp: 140, kw: 103 },
          { label: "2.0 Hybrid 196", fuel: "Hybride", hp: 196, kw: 144 },
        ],
      },
      {
        model: "RAV4",
        fromYear: 1994,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "2.5 Hybrid 218", fuel: "Hybride", hp: 218, kw: 160 },
          { label: "2.5 Hybrid AWD 222", fuel: "Hybride", hp: 222, kw: 163 },
        ],
      },
    ],
  },


  {
    brand: "Volkswagen",
    models: [
      {
        model: "Polo",
        fromYear: 1975,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "1.0 MPI 80", fuel: "Essence", hp: 80, kw: 59 },
          { label: "1.0 TSI 95", fuel: "Essence", hp: 95, kw: 70 },
          { label: "1.0 TSI 110", fuel: "Essence", hp: 110, kw: 81 },
        ],
      },
      {
        model: "Golf",
        fromYear: 1974,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "1.0 TSI 110", fuel: "Essence", hp: 110, kw: 81 },
          { label: "1.5 TSI 130", fuel: "Essence", hp: 130, kw: 96 },
          { label: "1.5 TSI 150", fuel: "Essence", hp: 150, kw: 110 },
          { label: "1.6 TDI 115", fuel: "Diesel", hp: 115, kw: 85 },
          { label: "2.0 TDI 115", fuel: "Diesel", hp: 115, kw: 85 },
          { label: "2.0 TDI 150", fuel: "Diesel", hp: 150, kw: 110 },
        ],
      },
      {
        model: "Passat",
        fromYear: 1973,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "1.5 TSI 150", fuel: "Essence", hp: 150, kw: 110 },
          { label: "2.0 TDI 150", fuel: "Diesel", hp: 150, kw: 110 },
          { label: "2.0 TDI 200", fuel: "Diesel", hp: 200, kw: 147 },
        ],
      },
      {
        model: "Tiguan",
        fromYear: 2007,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "1.5 TSI 150", fuel: "Essence", hp: 150, kw: 110 },
          { label: "2.0 TDI 150", fuel: "Diesel", hp: 150, kw: 110 },
        ],
      },
      {
        model: "Transporter",
        fromYear: 1950,
        toYear: CURRENT_YEAR,
        engines: [
          { label: "2.0 TDI 110", fuel: "Diesel", hp: 110, kw: 81 },
          { label: "2.0 TDI 150", fuel: "Diesel", hp: 150, kw: 110 },
          { label: "2.0 TDI 204", fuel: "Diesel", hp: 204, kw: 150 },
        ],
      },
    ],
  },

];


function normalize(
  value:
    string,
): string {

  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .trim()
    .toLowerCase();
}


function findBrand(
  value:
    string,
): VehicleAssistBrand | undefined {

  const wanted =
    normalize(
      value,
    );

  return VEHICLE_ASSIST.find(
    item =>
      normalize(
        item.brand,
      ) ===
      wanted,
  );
}


function findModel(
  brand:
    string,
  model:
    string,
): VehicleAssistModel | undefined {

  const brandRecord =
    findBrand(
      brand,
    );

  if (!brandRecord) {
    return undefined;
  }

  const wanted =
    normalize(
      model,
    );

  return brandRecord.models.find(
    item =>
      normalize(
        item.model,
      ) ===
      wanted,
  );
}


export function getBrandOptions():
  string[] {

  return VEHICLE_ASSIST
    .map(
      item =>
        item.brand,
    )
    .sort(
      (
        a,
        b,
      ) =>
        a.localeCompare(
          b,
          "fr",
        ),
    );
}


export function getModelOptions(
  brand:
    string,
): string[] {

  const record =
    findBrand(
      brand,
    );

  return (
    record?.models
      .map(
        item =>
          item.model,
      )
      .sort(
        (
          a,
          b,
        ) =>
          a.localeCompare(
            b,
            "fr",
          ),
      ) ??
    []
  );
}


export function getYearOptions(
  brand:
    string,
  model:
    string,
): number[] {

  const record =
    findModel(
      brand,
      model,
    );

  if (!record) {
    return [];
  }

  const result:
    number[] = [];

  const max =
    Math.min(
      record.toYear,
      CURRENT_YEAR + 1,
    );

  for (
    let value = max;
    value >= record.fromYear;
    value--
  ) {

    result.push(
      value,
    );
  }

  return result;
}


export function getEngineOptions(
  brand:
    string,
  model:
    string,
): VehicleAssistEngine[] {

  return (
    findModel(
      brand,
      model,
    )
      ?.engines ??
    []
  );
}


export function getFuelOptions(
  brand:
    string,
  model:
    string,
  year:
    string,
): string[] {

  const record =
    findModel(
      brand,
      model,
    );

  if (!record) {
    return [];
  }

  const parsedYear =
    Number(
      year,
    );

  if (
    Number.isFinite(
      parsedYear,
    )
  ) {

    if (
      parsedYear <
        record.fromYear ||
      parsedYear >
        record.toYear
    ) {
      return [];
    }
  }

  return [
    ...new Set(
      record.engines.map(
        engine =>
          engine.fuel,
      ),
    ),
  ].sort();
}


export function getFilteredEngineOptions(
  brand:
    string,
  model:
    string,
  year:
    string,
  fuel:
    string,
): VehicleAssistEngine[] {

  const record =
    findModel(
      brand,
      model,
    );

  if (!record) {
    return [];
  }

  const parsedYear =
    Number(
      year,
    );

  if (
    Number.isFinite(
      parsedYear,
    )
  ) {

    if (
      parsedYear <
        record.fromYear ||
      parsedYear >
        record.toYear
    ) {
      return [];
    }
  }

  const normalizedFuel =
    normalize(
      fuel,
    );

  return record.engines.filter(
    engine => {

      if (!fuel) {
        return true;
      }

      return (
        normalize(
          engine.fuel,
        ) ===
        normalizedFuel
      );
    },
  );
}


export function getEngineDetails(
  brand:
    string,
  model:
    string,
  engineLabel:
    string,
): VehicleAssistEngine | null {

  const record =
    findModel(
      brand,
      model,
    );

  if (!record) {
    return null;
  }

  const wanted =
    normalize(
      engineLabel,
    );

  return (
    record.engines.find(
      engine =>
        normalize(
          engine.label,
        ) ===
        wanted,
    ) ??
    null
  );
}
