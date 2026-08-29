import {
  buildFluidConsensus,
} from "./FluidConsensusService";

import {
  LocalFluidTechnicalDataProvider,
} from "./LocalFluidTechnicalDataProvider";

import {
  ManufacturerFluidProvider,
} from "./ManufacturerFluidProvider";

import {
  VehicleFinderProxyFluidProvider,
} from "./VehicleFinderProxyFluidProvider";

import {
  TecAllianceFluidProvider,
} from "./TecAllianceFluidProvider";

import type {
  FluidTechnicalDataProvider,
  FluidTechnicalQuery,
  FluidTechnicalResult,
} from "./FluidTechnicalDataProvider";

export class FluidTechnicalService {

  constructor(
    private readonly providers:
      FluidTechnicalDataProvider[],
  ) {}

  async resolve(
    query: FluidTechnicalQuery,
  ) {

    const results =
      await Promise.all(
        this.providers.map(
          provider =>
            provider.resolve(
              query,
            ),
        ),
      );

    const vehicleRequired =
      results.find(
        result =>
          result.status ===
          "vehicle-required",
      );

    const found =
      results.flatMap(
        result =>
          result.status === "found"
            ? [
                result.specification,
              ]
            : [],
      );

    if (
      found.length > 0
    ) {

      return buildFluidConsensus(
        found,
      );
    }

    if (
      vehicleRequired &&
      vehicleRequired.status ===
        "vehicle-required"
    ) {

      return {
        status:
          "vehicle-required" as const,

        missing:
          vehicleRequired.missing,
      };
    }

    const allUnavailable =
      results.every(
        result =>
          result.status ===
            "provider-unavailable",
      );

    if (allUnavailable) {

      return {
        status:
          "provider-unavailable" as const,
      };
    }

    return {
      status:
        "not-found" as const,
    };
  }

}

export const fluidTechnicalService =
  new FluidTechnicalService([
    new LocalFluidTechnicalDataProvider(),

    /*
     * Provider experimental uniquement.
     * Cas temoin verifie manuellement.
     */

    /*
     * Vehicle Finder passe obligatoirement
     * par notre API serveur.
     *
     * La cle Vehicle Finder ne quitte jamais
     * le serveur TPA.
     */
    new VehicleFinderProxyFluidProvider(),

    new TecAllianceFluidProvider(),

    new ManufacturerFluidProvider(
      "castrol",
    ),

    new ManufacturerFluidProvider(
      "liqui-moly",
    ),

    new ManufacturerFluidProvider(
      "shell",
    ),
  ]);

export type {
  FluidTechnicalResult,
};