import type {
  TechnicalVehicle,
} from "../technical";

export type StoredShowroomVehicle = {
  id?: string;

  vin?: string | null;
  plate?: string | null;

  brand?: string;
  model?: string;

  year?: number | null;

  engine?: string;

  fuel?: string | null;

  powerHp?: number | null;
  powerKw?: number | null;

  label?: string;
};

function cleanString(
  value:
    | string
    | null
    | undefined,
): string | undefined {

  const clean =
    value?.trim();

  return clean
    ? clean
    : undefined;
}

function inferGeneration(
  brand:
    | string
    | undefined,
  model:
    | string
    | undefined,
): string | undefined {

  const make =
    brand?.toLowerCase() ?? "";

  const vehicleModel =
    model?.toLowerCase() ?? "";

  if (
    make.includes("volkswagen") ||
    make === "vw"
  ) {

    if (
      vehicleModel.includes("golf 4") ||
      vehicleModel.includes("golf iv")
    ) {
      return "IV";
    }

    if (
      vehicleModel.includes("golf 5") ||
      vehicleModel.includes("golf v")
    ) {
      return "V";
    }

    if (
      vehicleModel.includes("golf 6") ||
      vehicleModel.includes("golf vi")
    ) {
      return "VI";
    }

    if (
      vehicleModel.includes("golf 7") ||
      vehicleModel.includes("golf vii")
    ) {
      return "VII";
    }

    if (
      vehicleModel.includes("golf 8") ||
      vehicleModel.includes("golf viii")
    ) {
      return "VIII";
    }
  }

  return undefined;
}

export function adaptShowroomVehicleToTechnical(
  vehicle: StoredShowroomVehicle,
): TechnicalVehicle {

  const make =
    cleanString(
      vehicle.brand,
    );

  const model =
    cleanString(
      vehicle.model,
    );

  return {
    vin:
      cleanString(
        vehicle.vin,
      ),

    make,

    model,

    generation:
      inferGeneration(
        make,
        model,
      ),

    year:
      vehicle.year ??
      undefined,

    fuel:
      cleanString(
        vehicle.fuel,
      ),

    engineName:
      cleanString(
        vehicle.engine,
      ),

    powerHp:
      vehicle.powerHp ??
      undefined,

    powerKw:
      vehicle.powerKw ??
      undefined,
  };
}

export function readStoredShowroomTechnicalVehicle():
  TechnicalVehicle | undefined {

  if (
    typeof window === "undefined"
  ) {
    return undefined;
  }

  try {

    const raw =
      window.sessionStorage.getItem(
        "tapiecesauto-showroom-vehicle",
      );

    if (!raw) {
      return undefined;
    }

    const parsed =
      JSON.parse(
        raw,
      ) as StoredShowroomVehicle;

    return adaptShowroomVehicleToTechnical(
      parsed,
    );

  } catch {

    return undefined;
  }
}