import {
  VehicleId,
} from "./identifiers";

import {
  Confidence,
  VehicleType,
  FuelType,
  TransmissionType,
  DriveType,
} from "./values";

export interface Vehicle {

  id?: VehicleId;

  vin?: string;

  make?: string;

  model?: string;

  generation?: string;

  variant?: string;

  registrationYear?: number;

  productionYear?: number;

  engineCode?: string;

  engineName?: string;

  displacementCc?: number;

  powerKw?: number;

  powerHp?: number;

  fuelType?: FuelType;

  transmissionType?: TransmissionType;

  driveType?: DriveType;

  vehicleType?: VehicleType;

  mileageKm?: number;

  registrationCountry?: string;

  equipmentCodes?: string[];

  identificationConfidence: Confidence;

}
