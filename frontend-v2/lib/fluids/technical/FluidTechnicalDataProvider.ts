import type {
  TechnicalVehicle,
} from "../../technical";

export type FluidTechnicalSource =
  | "local"
  | "tecalliance"
  | "manufacturer";

export type FluidConfidence =
  | "verified"
  | "advisory"
  | "conflict";

export type FluidTechnicalQuery = {
  fluidId: string;
  vehicle: TechnicalVehicle;
};

export type FluidTechnicalSpecification = {
  fluidId: string;

  viscosity?: string;

  alternativeViscosities?: string[];

  manufacturerSpecification?: string[];
  capacityLitres?: number;

  intervalKm?: number;
  intervalMonths?: number;

  notes?: string[];

  source: FluidTechnicalSource;
  sourceName: string;

  confidence:
    Exclude<
      FluidConfidence,
      "conflict"
    >;
};

export type FluidTechnicalResult =
  | {
      status: "found";
      specification:
        FluidTechnicalSpecification;
    }
  | {
      status: "vehicle-required";
      missing: string[];
    }
  | {
      status: "not-found";
    }
  | {
      status: "provider-unavailable";
    };

export interface FluidTechnicalDataProvider {

  readonly id: string;

  resolve(
    query: FluidTechnicalQuery,
  ): Promise<FluidTechnicalResult>;

}