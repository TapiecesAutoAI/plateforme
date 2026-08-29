import type {
  TechnicalVehicle,
} from "../technical";

function normalize(
  value: string,
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

function parseGolf(
  text: string,
  vehicle:
    Partial<TechnicalVehicle>,
) {

  const match =
    text.match(
      /\bgolf\s*(4|5|6|7|8|iv|v|vi|vii|viii)\b/,
    );

  if (!match) {
    return;
  }

  const generationMap:
    Record<string, string> = {
      "4": "IV",
      "iv": "IV",
      "5": "V",
      "v": "V",
      "6": "VI",
      "vi": "VI",
      "7": "VII",
      "vii": "VII",
      "8": "VIII",
      "viii": "VIII",
    };

  vehicle.make =
    "Volkswagen";

  vehicle.model =
    "Golf";

  vehicle.generation =
    generationMap[
      match[1]
    ];
}

function parseEngine(
  text: string,
  vehicle:
    Partial<TechnicalVehicle>,
) {

  const engineMatch =
    text.match(
      /\b(\d(?:[.,]?\d))\s*(tdi|rdi|tsi|tfsi|cdti|multijet|hdi|dci|crdi)\b/,
    );

  if (!engineMatch) {
    return;
  }

  const rawDisplacement =
    engineMatch[1]
      .replace(
        ",",
        ".",
      );

  const displacement =
    rawDisplacement.includes(".")
      ? rawDisplacement
      : rawDisplacement.length === 2
        ? `${rawDisplacement[0]}.${rawDisplacement[1]}`
        : rawDisplacement;

  const rawFamily =
    engineMatch[2];

  /*
   * Tolérance de saisie conversationnelle.
   * "RDI" n'est pas conservé comme motorisation :
   * dans le contexte VW diesel, il est interprété
   * comme une faute probable pour TDI.
   */
  const family =
    rawFamily === "rdi"
      ? "tdi"
      : rawFamily;

  if (
    family === "cdti" ||
    family === "multijet"
  ) {

    vehicle.engineName =
      `${displacement} Multijet`;

    return;
  }

  vehicle.engineName =
    `${displacement} ${family.toUpperCase()}`;
}

export function parseVehicleFromText(
  value: string,
): Partial<TechnicalVehicle> {

  const text =
    normalize(
      value,
    );

  const vehicle:
    Partial<TechnicalVehicle> = {};

  parseGolf(
    text,
    vehicle,
  );

  if (
    text.includes("volkswagen") ||
    /\bvw\b/.test(text)
  ) {

    vehicle.make =
      "Volkswagen";
  }

  if (
    text.includes("opel")
  ) {

    vehicle.make =
      "Opel";
  }

  parseEngine(
    text,
    vehicle,
  );

  const yearMatch =
    text.match(
      /\b(19|20)\d{2}\b/,
    );

  if (yearMatch) {

    vehicle.year =
      Number(
        yearMatch[0],
      );
  }

  return vehicle;
}

export function mergeTechnicalVehicle(
  base:
    | TechnicalVehicle
    | undefined,
  parsed:
    Partial<TechnicalVehicle>,
): TechnicalVehicle {

  return {
    ...base,
    ...parsed,

    vin:
      parsed.vin ??
      base?.vin,

    make:
      parsed.make ??
      base?.make,

    model:
      parsed.model ??
      base?.model,

    generation:
      parsed.generation ??
      base?.generation,

    year:
      parsed.year ??
      base?.year,

    fuel:
      parsed.fuel ??
      base?.fuel,

    engineName:
      parsed.engineName ??
      base?.engineName,

    engineCode:
      parsed.engineCode ??
      base?.engineCode,

    powerKw:
      parsed.powerKw ??
      base?.powerKw,

    powerHp:
      parsed.powerHp ??
      base?.powerHp,

    transmission:
      parsed.transmission ??
      base?.transmission,
  };
}