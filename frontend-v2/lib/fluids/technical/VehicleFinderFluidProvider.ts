import type {
  FluidTechnicalDataProvider,
  FluidTechnicalQuery,
  FluidTechnicalResult,
} from "./FluidTechnicalDataProvider";

type VehicleFinderVehicle = {
  id: number;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  engine: string | null;
};

type VehicleSearchResponse = {
  data: VehicleFinderVehicle[];
};

type OilChangeResponse = {
  data: {
    vehicle_id: number;
    year: number;
    make: string;
    model: string;
    trim: string | null;
    engine: string | null;

    oil_spec: {
      viscosity: string | null;
      oil_type: string | null;

      capacity_with_filter:
        number | null;

      capacity_without_filter:
        number | null;

      oem_spec:
        string | null;

      source:
        string | null;

      last_verified_at:
        string | null;
    } | null;
  };
};

type FluidsResponse = {
  data: {
    vehicle_id: number;
    year: number;
    make: string;
    model: string;
    trim: string | null;
    engine: string | null;

    transmission_fluid: {
      fluid_type:
        string | null;

      capacity_quarts:
        number | null;

      change_interval_miles:
        number | null;

      change_interval_months:
        number | null;

      source:
        string | null;

      last_verified_at:
        string | null;
    } | null;

    brake_fluid: {
      dot_type:
        string | null;

      change_interval_miles:
        number | null;

      change_interval_months:
        number | null;

      source:
        string | null;

      last_verified_at:
        string | null;
    } | null;

    coolant: {
      coolant_type:
        string | null;

      color:
        string | null;

      capacity_quarts:
        number | null;

      change_interval_miles:
        number | null;

      change_interval_months:
        number | null;

      source:
        string | null;

      last_verified_at:
        string | null;
    } | null;

    power_steering_fluid: {
      fluid_type:
        string | null;

      source:
        string | null;

      last_verified_at:
        string | null;
    } | null;

    differential_fluids:
      Array<{
        fluid_type?: string | null;
        capacity_quarts?: number | null;
        source?: string | null;
        last_verified_at?: string | null;
      }>;

    transfer_case_fluid:
      unknown | null;
  };
};

function normalize(
  value?: string | null,
): string {

  return (
    value ??
    ""
  )
    .trim()
    .toLowerCase();
}

function normalizeEngine(
  value?: string | null,
): string {

  return normalize(
    value,
  ).replace(
    /[^a-z0-9]+/g,
    "",
  );
}

function quartsToLitres(
  value:
    number | null | undefined,
): number | undefined {

  if (
    value === null ||
    value === undefined
  ) {
    return undefined;
  }

  return Number(
    (
      value *
      0.946353
    ).toFixed(
      2,
    ),
  );
}

function vehicleMatchIsPreciseEnough(
  requested:
    FluidTechnicalQuery["vehicle"],

  found:
    VehicleFinderVehicle,

  fluidId:
    FluidTechnicalQuery["fluidId"],
): boolean {

  if (
    requested.make &&
    normalize(
      requested.make,
    ) !==
      normalize(
        found.make,
      )
  ) {

    return false;
  }

  if (
    requested.model &&
    normalize(
      requested.model,
    ) !==
      normalize(
        found.model,
      )
  ) {

    return false;
  }

  if (
    requested.year &&
    requested.year !==
      found.year
  ) {

    return false;
  }

  /*
   * PRECISION MOTEUR SELON LE FLUIDE
   *
   * Le liquide de frein est traite
   * au niveau vehicule + annee.
   *
   * Pour les fluides dependants
   * de la motorisation, le moteur
   * doit rester strictement verifie.
   */
  const engineRequired =
    fluidId !==
      "brake-fluid";

  if (
    engineRequired &&
    requested.engineName
  ) {

    if (
      !found.engine
    ) {

      return false;
    }

    const expected =
      normalizeEngine(
        requested.engineName,
      );

    const actual =
      normalizeEngine(
        found.engine,
      );

    if (
      !actual.includes(
        expected,
      ) &&
      !expected.includes(
        actual,
      )
    ) {

      return false;
    }
  }

  return true;
}

export class VehicleFinderFluidProvider
implements FluidTechnicalDataProvider {

  readonly id =
    "vehicle-finder-live";

  private readonly baseUrl =
    process.env
      .VEHICLE_FINDER_API_URL ??
    "https://api.vehicle-finder.com";

  private get apiKey():
    string | undefined {

    return process.env
      .VEHICLE_FINDER_API_KEY;
  }

  private async request<T>(
    path: string,
  ): Promise<T | undefined> {

    if (!this.apiKey) {

      return undefined;
    }

    const response =
      await fetch(
        `${this.baseUrl}${path}`,
        {
          method:
            "GET",

          headers: {
            "X-API-Key":
              this.apiKey,

            Accept:
              "application/json",
          },

          cache:
            "no-store",
        },
      );

    if (
      response.status === 401 ||
      response.status === 402 ||
      response.status === 403 ||
      response.status === 404 ||
      response.status === 429
    ) {

      return undefined;
    }

    if (!response.ok) {

      throw new Error(
        `Vehicle Finder HTTP ${response.status}`,
      );
    }

    return response.json() as
      Promise<T>;
  }

  private async findVehicle(
    query:
      FluidTechnicalQuery,
  ): Promise<
    VehicleFinderVehicle |
    undefined
  > {

    const requested =
      query.vehicle;

    /*
     * Nous n'avons pas encore valide
     * l'endpoint VIN avec un vrai retour.
     *
     * Donc pas d'invention ici.
     */
    if (
      requested.vin &&
      (
        !requested.make ||
        !requested.model
      )
    ) {

      return undefined;
    }

    if (
      !requested.make ||
      !requested.model
    ) {

      return undefined;
    }

    const params =
      new URLSearchParams();

    params.set(
      "make",
      requested.make,
    );

    params.set(
      "model",
      requested.model,
    );

    if (
      requested.year
    ) {

      params.set(
        "year",
        String(
          requested.year,
        ),
      );
    }

    const response =
      await this.request<
        VehicleSearchResponse
      >(
        `/v1/vehicles?${params.toString()}`,
      );

    if (
      !response ||
      !Array.isArray(
        response.data,
      ) ||
      response.data.length === 0
    ) {

      return undefined;
    }

    /*
     * On ne choisit jamais arbitrairement
     * parmi plusieurs variantes.
     */
    const matching =
      response.data.filter(
        candidate =>
          vehicleMatchIsPreciseEnough(
            requested,
            candidate,
            query.fluidId,
          ),
      );

    if (
      matching.length !== 1
    ) {

      return undefined;
    }

    return matching[0];
  }

  async resolve(
    query:
      FluidTechnicalQuery,
  ): Promise<
    FluidTechnicalResult
  > {

    if (!this.apiKey) {

      return {
        status:
          "provider-unavailable",
      };
    }

    /*
     * VEHICLE FINDER :
     * exigences minimales selon la famille.
     *
     * Pour le frein, une annee exacte ou un VIN
     * est necessaire afin d'eviter de choisir
     * une Golf generique parmi plusieurs annees.
     */
    if (
      query.fluidId === "brake-fluid" &&
      !query.vehicle.year &&
      !query.vehicle.vin
    ) {

      return {
        status:
          "vehicle-required",

        missing: [
          "annee exacte ou VIN",
        ],
      };
    }

    /*
     * Refroidissement :
     * capacite et parfois specification
     * peuvent varier avec la motorisation.
     */
    if (
      query.fluidId === "coolant" &&
      !query.vehicle.engineName &&
      !query.vehicle.vin
    ) {

      return {
        status:
          "vehicle-required",

        missing: [
          "motorisation ou VIN",
        ],
      };
    }

    /*
     * Boites :
     * impossible de choisir une huile
     * sans connaitre la transmission exacte.
     */
    if (
      (
        query.fluidId === "manual-transmission-fluid" ||
        query.fluidId === "automatic-transmission-fluid" ||
        query.fluidId === "dct-fluid" ||
        query.fluidId === "cvt-fluid"
      ) &&
      !query.vehicle.transmission &&
      !query.vehicle.vin
    ) {

      return {
        status:
          "vehicle-required",

        missing: [
          "boite / transmission exacte ou VIN",
        ],
      };
    }

    /*
     * Direction :
     * certains vehicules utilisent une direction
     * electrique sans fluide hydraulique.
     * On exige donc une identification precise.
     */
    if (
      query.fluidId === "power-steering-fluid" &&
      !query.vehicle.year &&
      !query.vehicle.vin
    ) {

      return {
        status:
          "vehicle-required",

        missing: [
          "annee exacte ou VIN",
        ],
      };
    }

    const vehicle =
      await this.findVehicle(
        query,
      );

    if (!vehicle) {

      return {
        status:
          "not-found",
      };
    }

    /*
     * HUILE MOTEUR
     */
    if (
      query.fluidId ===
      "engine-oil"
    ) {

      const response =
        await this.request<
          OilChangeResponse
        >(
          `/v1/vehicles/${vehicle.id}/oil-change`,
        );

      const oil =
        response?.data
          ?.oil_spec;

      if (!oil) {

        return {
          status:
            "not-found",
        };
      }

      const specifications =
        oil.oem_spec
          ? [
              oil.oem_spec,
            ]
          : undefined;

      return {
        status:
          "found",

        specification: {
          fluidId:
            "engine-oil",

          viscosity:
            oil.viscosity ??
            undefined,

          manufacturerSpecification:
            specifications,

          capacityLitres:
            oil.capacity_with_filter ??
            undefined,

          notes: [
            oil.oil_type
              ? `Type : ${oil.oil_type}`
              : "",

            oil.source
              ? `Source Vehicle Finder : ${oil.source}`
              : "",

            oil.last_verified_at
              ? `Derniere verification : ${oil.last_verified_at}`
              : "",
          ].filter(
            Boolean,
          ),

          source:
            "manufacturer",

          sourceName:
            "Vehicle Finder API",

          confidence:
            "advisory",
        },
      };
    }

    /*
     * AUTRES FLUIDES
     */
    const response =
      await this.request<
        FluidsResponse
      >(
        `/v1/vehicles/${vehicle.id}/fluids`,
      );

    const data =
      response?.data;

    if (!data) {

      return {
        status:
          "not-found",
      };
    }

    if (
      query.fluidId ===
      "brake-fluid"
    ) {

      const fluid =
        data.brake_fluid;

      if (!fluid?.dot_type) {

        return {
          status:
            "not-found",
        };
      }

      return {
        status:
          "found",

        specification: {
          fluidId:
            "brake-fluid",

          manufacturerSpecification: [
            fluid.dot_type,
          ],

          notes: [
            fluid.change_interval_miles
              ? `Intervalle : ${fluid.change_interval_miles} miles`
              : "",

            fluid.source
              ? `Source Vehicle Finder : ${fluid.source}`
              : "",
          ].filter(
            Boolean,
          ),

          source:
            "manufacturer",

          sourceName:
            "Vehicle Finder API",

          confidence:
            "advisory",
        },
      };
    }

    if (
      query.fluidId ===
      "coolant"
    ) {

      const fluid =
        data.coolant;

      if (!fluid?.coolant_type) {

        return {
          status:
            "not-found",
        };
      }

      return {
        status:
          "found",

        specification: {
          fluidId:
            "coolant",

          manufacturerSpecification: [
            fluid.coolant_type,
          ],

          capacityLitres:
            quartsToLitres(
              fluid.capacity_quarts,
            ),

          notes: [
            fluid.color
              ? `Couleur : ${fluid.color}`
              : "",

            fluid.source
              ? `Source Vehicle Finder : ${fluid.source}`
              : "",
          ].filter(
            Boolean,
          ),

          source:
            "manufacturer",

          sourceName:
            "Vehicle Finder API",

          confidence:
            "advisory",
        },
      };
    }

    if (
      query.fluidId ===
      "power-steering-fluid"
    ) {

      const fluid =
        data.power_steering_fluid;

      if (!fluid?.fluid_type) {

        return {
          status:
            "not-found",
        };
      }

      return {
        status:
          "found",

        specification: {
          fluidId:
            "power-steering-fluid",

          manufacturerSpecification: [
            fluid.fluid_type,
          ],

          source:
            "manufacturer",

          sourceName:
            "Vehicle Finder API",

          confidence:
            "advisory",
        },
      };
    }

    if (
      query.fluidId ===
        "manual-transmission-fluid" ||
      query.fluidId ===
        "automatic-transmission-fluid" ||
      query.fluidId ===
        "dct-fluid" ||
      query.fluidId ===
        "cvt-fluid"
    ) {

      const fluid =
        data.transmission_fluid;

      if (!fluid?.fluid_type) {

        return {
          status:
            "not-found",
        };
      }

      return {
        status:
          "found",

        specification: {
          fluidId:
            query.fluidId,

          manufacturerSpecification: [
            fluid.fluid_type,
          ],

          capacityLitres:
            quartsToLitres(
              fluid.capacity_quarts,
            ),

          notes: [
            fluid.change_interval_miles
              ? `Intervalle : ${fluid.change_interval_miles} miles`
              : "",
          ].filter(
            Boolean,
          ),

          source:
            "manufacturer",

          sourceName:
            "Vehicle Finder API",

          confidence:
            "advisory",
        },
      };
    }

    if (
      query.fluidId ===
      "differential-fluid"
    ) {

      const fluid =
        data
          .differential_fluids
          ?.[0];

      if (!fluid?.fluid_type) {

        return {
          status:
            "not-found",
        };
      }

      return {
        status:
          "found",

        specification: {
          fluidId:
            "differential-fluid",

          manufacturerSpecification: [
            fluid.fluid_type,
          ],

          capacityLitres:
            quartsToLitres(
              fluid.capacity_quarts,
            ),

          source:
            "manufacturer",

          sourceName:
            "Vehicle Finder API",

          confidence:
            "advisory",
        },
      };
    }

    return {
      status:
        "not-found",
    };
  }
}