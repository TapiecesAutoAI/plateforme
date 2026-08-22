import type {
  TechnicalVehicle,
} from "../technical";

export type VehicleIdentityResult =
  | {
      status: "found";
      vehicle: TechnicalVehicle;
    }
  | {
      status: "provider-unavailable";
      vin: string;
    }
  | {
      status: "not-found";
      vin: string;
    };

export interface VehicleIdentityProvider {

  resolveVin(
    vin: string,
  ): Promise<VehicleIdentityResult>;

}