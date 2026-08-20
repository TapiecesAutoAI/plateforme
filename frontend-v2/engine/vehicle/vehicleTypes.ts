export interface VehicleIdentification {
  vin: string | null;
  brand: string | null;
  model: string | null;
  year: number | null;
  engine: string | null;
}

export type VehicleIdentificationStatus =
  | "identified-by-vin"
  | "identified-manually"
  | "insufficient";

export interface VehicleIdentificationResult {
  status: VehicleIdentificationStatus;
  vehicle: VehicleIdentification;
  readyForCompatibilityCheck: boolean;
  message: string;
}
