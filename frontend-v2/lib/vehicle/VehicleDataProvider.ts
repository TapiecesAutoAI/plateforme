import {
  getBrandOptions,
  getModelOptions,
  getYearOptions,
  getFuelOptions,
  getFilteredEngineOptions,
  getEngineDetails,
  type VehicleAssistEngine,
} from "../showroom/vehicleAssist";

export type VehicleEngineOption = VehicleAssistEngine;

export interface VehicleDataProvider {
  getBrands(): Promise<string[]>;
  getModels(brand: string, year: string): Promise<string[]>;
  getYears(brand: string): Promise<number[]>;
  getFuels(brand: string, model: string, year: string): Promise<string[]>;
  getEngines(
    brand: string,
    model: string,
    year: string,
    fuel: string,
  ): Promise<VehicleEngineOption[]>;
  getEngineDetails(
    brand: string,
    model: string,
    engineLabel: string,
  ): Promise<VehicleEngineOption | null>;
}

async function requestCatalogue<T>(
  params: Record<string, string>,
): Promise<T> {
  const search = new URLSearchParams(params);

  const response = await fetch(
    `/api/vehicle-catalogue?${search.toString()}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(`Catalogue TPA ${response.status}`);
  }

  return response.json() as Promise<T>;
}

class CentralVehicleDataProvider implements VehicleDataProvider {
  private engineCache = new Map<string, VehicleEngineOption[]>();

  async getBrands() {
    try {
      const result = await requestCatalogue<{ values: string[] }>({
        mode: "brands",
      });

      if (result.values.length) {
        return result.values;
      }
    } catch {}

    return getBrandOptions();
  }

  async getModels(brand: string, year: string) {
    try {
      const result = await requestCatalogue<{ values: string[] }>({
        mode: "models",
        brand,
        year,
      });

      if (result.values.length) {
        return result.values;
      }
    } catch {}

    return getModelOptions(brand);
  }

  async getYears(brand: string) {
    try {
      const result = await requestCatalogue<{ values: number[] }>({
        mode: "years",
        brand,
      });

      if (result.values.length) {
        return result.values;
      }
    } catch {}

    return [];
  }

  async getFuels(
    brand: string,
    model: string,
    year: string,
  ) {
    try {
      const result = await requestCatalogue<{ values: string[] }>({
        mode: "fuels",
        brand,
        model,
        year,
      });

      if (result.values.length) {
        return result.values;
      }
    } catch {}

    return getFuelOptions(brand, model, year);
  }

  async getEngines(
    brand: string,
    model: string,
    year: string,
    fuel: string,
  ) {
    const cacheKey = [brand, model, year, fuel].join("|");

    try {
      const result = await requestCatalogue<{
        engines: VehicleEngineOption[];
      }>({
        mode: "engines",
        brand,
        model,
        year,
        fuel,
      });

      if (result.engines.length) {
        this.engineCache.set(cacheKey, result.engines);
        return result.engines;
      }
    } catch {}

    const local = getFilteredEngineOptions(
      brand,
      model,
      year,
      fuel,
    );

    this.engineCache.set(cacheKey, local);

    return local;
  }

  async getEngineDetails(
    brand: string,
    model: string,
    engineLabel: string,
  ) {
    for (const [key, engines] of this.engineCache) {
      if (!key.startsWith(`${brand}|${model}|`)) {
        continue;
      }

      const found = engines.find(
        engine => engine.label === engineLabel,
      );

      if (found) {
        return found;
      }
    }

    return getEngineDetails(
      brand,
      model,
      engineLabel,
    );
  }
}

export const vehicleDataProvider: VehicleDataProvider =
  new CentralVehicleDataProvider();