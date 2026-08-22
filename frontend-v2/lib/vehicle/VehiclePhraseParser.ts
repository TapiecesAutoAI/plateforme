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

export function parseVehicleFromText(
  value: string,
): Partial<TechnicalVehicle> {

  const text =
    normalize(
      value,
    );

  const vehicle:
    Partial<TechnicalVehicle> = {};

  if (
    text.includes("golf 4") ||
    text.includes("golf iv")
  ) {

    vehicle.make =
      "Volkswagen";

    vehicle.model =
      "Golf";

    vehicle.generation =
      "IV";
  }

  if (
    text.includes("opel")
  ) {

    vehicle.make =
      "Opel";
  }

  if (
    text.includes("1.3 multijet") ||
    text.includes("1.3 cdti")
  ) {

    vehicle.engineName =
      "1.3 Multijet";
  }

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