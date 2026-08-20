import {
  getBrandOptions,
  getModelOptions,
  getYearOptions,
  getFuelOptions,
  getFilteredEngineOptions,
  getEngineDetails,
  type VehicleAssistEngine,
} from "../showroom/vehicleAssist";


export type VehicleEngineOption =
  VehicleAssistEngine;


export interface VehicleDataProvider {

  getBrands():
    Promise<string[]>;

  getModels(
    brand:
      string,
  ):
    Promise<string[]>;

  getYears(
    brand:
      string,
    model:
      string,
  ):
    Promise<number[]>;

  getFuels(
    brand:
      string,
    model:
      string,
    year:
      string,
  ):
    Promise<string[]>;

  getEngines(
    brand:
      string,
    model:
      string,
    year:
      string,
    fuel:
      string,
  ):
    Promise<
      VehicleEngineOption[]
    >;

  getEngineDetails(
    brand:
      string,
    model:
      string,
    engineLabel:
      string,
  ):
    Promise<
      VehicleEngineOption |
      null
    >;
}


class LocalVehicleDataProvider
implements VehicleDataProvider {

  async getBrands() {
    return getBrandOptions();
  }

  async getModels(
    brand:
      string,
  ) {
    return getModelOptions(
      brand,
    );
  }

  async getYears(
    brand:
      string,
    model:
      string,
  ) {
    return getYearOptions(
      brand,
      model,
    );
  }

  async getFuels(
    brand:
      string,
    model:
      string,
    year:
      string,
  ) {
    return getFuelOptions(
      brand,
      model,
      year,
    );
  }

  async getEngines(
    brand:
      string,
    model:
      string,
    year:
      string,
    fuel:
      string,
  ) {
    return getFilteredEngineOptions(
      brand,
      model,
      year,
      fuel,
    );
  }

  async getEngineDetails(
    brand:
      string,
    model:
      string,
    engineLabel:
      string,
  ) {
    return getEngineDetails(
      brand,
      model,
      engineLabel,
    );
  }
}


export const vehicleDataProvider:
  VehicleDataProvider =
    new LocalVehicleDataProvider();
