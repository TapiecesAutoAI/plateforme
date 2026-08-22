import {
  TOOL_KNOWLEDGE_BASE,
} from "../tools/ToolKnowledgeBase";

import type {
  ToolKnowledgeRecord,
  VehicleMatcher,
} from "../tools/ToolKnowledgeBase";

import type {
  TechnicalDataProvider,
  TechnicalDataResult,
  TechnicalOperationRequest,
  TechnicalVehicle,
} from "./TechnicalDataProvider";

function normalize(
  value:
    | string
    | undefined,
): string {

  return (
    value
      ?.normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        "",
      )
      .trim()
      .toLowerCase()
    ?? ""
  );
}

function matchesString(
  expected:
    | string
    | undefined,
  actual:
    | string
    | undefined,
): boolean {

  if (!expected) {
    return true;
  }

  if (!actual) {
    return false;
  }

  return normalize(actual)
    .includes(
      normalize(expected),
    );
}

function vehicleMatches(
  matcher: VehicleMatcher,
  vehicle: TechnicalVehicle,
): boolean {

  if (
    !matchesString(
      matcher.make,
      vehicle.make,
    )
  ) {
    return false;
  }

  if (
    !matchesString(
      matcher.model,
      vehicle.model,
    )
  ) {
    return false;
  }

  if (
    !matchesString(
      matcher.generation,
      vehicle.generation,
    )
  ) {
    return false;
  }

  if (
    !matchesString(
      matcher.engineFamily,
      vehicle.engineName,
    )
  ) {
    return false;
  }

  if (
    !matchesString(
      matcher.engineCode,
      vehicle.engineCode,
    )
  ) {
    return false;
  }

  if (
    !matchesString(
      matcher.transmission,
      vehicle.transmission,
    )
  ) {
    return false;
  }

  if (
    matcher.fromYear !== undefined &&
    vehicle.year !== undefined &&
    vehicle.year < matcher.fromYear
  ) {
    return false;
  }

  if (
    matcher.toYear !== undefined &&
    vehicle.year !== undefined &&
    vehicle.year > matcher.toYear
  ) {
    return false;
  }

  return true;
}

function getMissingVehicleFields(
  records: ToolKnowledgeRecord[],
  vehicle:
    | TechnicalVehicle
    | undefined,
): string[] {

  if (!vehicle) {

    return [
      "vehicule",
    ];
  }

  const missing =
    new Set<string>();

  const labels = {
    make:
      "marque",

    model:
      "modele",

    generation:
      "generation",

    year:
      "annee",

    engineName:
      "motorisation",

    engineCode:
      "code moteur",

    transmission:
      "boite / transmission",
  } as const;

  for (const record of records) {

    if (
      record.requiredVehicleFields
    ) {

      for (
        const field
        of record.requiredVehicleFields
      ) {

        if (
          vehicle[field] === undefined ||
          vehicle[field] === null ||
          vehicle[field] === ""
        ) {

          missing.add(
            labels[field],
          );
        }
      }
    }

    const matcher =
      record.vehicle;

    if (!matcher) {
      continue;
    }

    if (
      matcher.make &&
      !vehicle.make
    ) {
      missing.add("marque");
    }

    if (
      matcher.model &&
      !vehicle.model
    ) {
      missing.add("modele");
    }

    if (
      matcher.generation &&
      !vehicle.generation
    ) {
      missing.add("generation");
    }

    if (
      matcher.engineFamily &&
      !vehicle.engineName
    ) {
      missing.add("motorisation");
    }

    if (
      matcher.engineCode &&
      !vehicle.engineCode
    ) {
      missing.add("code moteur");
    }

    if (
      matcher.transmission &&
      !vehicle.transmission
    ) {
      missing.add("boite");
    }

    if (
      (
        matcher.fromYear !== undefined ||
        matcher.toYear !== undefined
      ) &&
      vehicle.year === undefined
    ) {
      missing.add("annee");
    }
  }

  return Array.from(
    missing,
  );
}

export class LocalTechnicalDataProvider
implements TechnicalDataProvider {

  async resolveTools(
    request: TechnicalOperationRequest,
  ): Promise<TechnicalDataResult> {

    const candidates =
      TOOL_KNOWLEDGE_BASE.filter(
        record =>
          record.operation ===
          request.operation,
      );

    if (
      candidates.length === 0
    ) {

      return {
        status: "not-found",
      };
    }

    const universal =
      candidates.find(
        record =>
          !record.vehicleRequired,
      );

    if (universal) {

      return {
        status: "found",
        record:
          universal,
      };
    }

    const missing =
      getMissingVehicleFields(
        candidates,
        request.vehicle,
      );

    if (
      missing.length > 0
    ) {

      return {
        status:
          "vehicle-required",

        missing,
      };
    }

    if (!request.vehicle) {

      return {
        status:
          "vehicle-required",

        missing: [
          "vehicule",
        ],
      };
    }

    const exact =
      candidates.find(
        record =>
          record.vehicle &&
          vehicleMatches(
            record.vehicle,
            request.vehicle!,
          ),
      );

    if (!exact) {

      return {
        status:
          "not-found",
      };
    }

    /*
     * Une fiche "demo-only" peut servir a tester
     * le parcours et l'interface, mais ne doit pas
     * etre consideree comme une donnee technique
     * suffisamment fiable pour une recommandation
     * specifique vehicule.
     */
    if (
      exact.usage === "demo-only" &&
      exact.vehicleRequired
    ) {

      return {
        status:
          "not-found",
      };
    }

    return {
      status: "found",
      record:
        exact,
    };
  }

}