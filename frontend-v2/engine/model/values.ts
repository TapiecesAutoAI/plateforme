export type Confidence = number;
export type Probability = number;
export type Reliability = number;
export type Score = number;

export type Severity =
  | "info"
  | "low"
  | "medium"
  | "high"
  | "critical";

export type VehicleType =
  | "car"
  | "van"
  | "truck"
  | "motorcycle"
  | "other";

export type FuelType =
  | "petrol"
  | "diesel"
  | "hybrid"
  | "plug_in_hybrid"
  | "electric"
  | "lpg"
  | "cng"
  | "hydrogen"
  | "other"
  | "unknown";

export type TransmissionType =
  | "manual"
  | "automatic"
  | "robotized"
  | "cvt"
  | "dual_clutch"
  | "unknown";

export type DriveType =
  | "front_wheel_drive"
  | "rear_wheel_drive"
  | "all_wheel_drive"
  | "four_wheel_drive"
  | "unknown";
