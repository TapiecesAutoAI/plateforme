import type {
  FluidTechnicalSpecification,
} from "./FluidTechnicalDataProvider";

export type FluidConsensusResult =
  | {
      status: "empty";
    }
  | {
      status: "single-source";
      specification:
        FluidTechnicalSpecification;
      sourceCount: 1;
    }
  | {
      status: "consensus";
      specification:
        FluidTechnicalSpecification;
      sourceCount: number;
      sources: string[];
    }
  | {
      status: "conflict";
      specifications:
        FluidTechnicalSpecification[];
      conflictingFields:
        string[];
    };

function normalizeList(
  values?: string[],
): string[] {

  return [
    ...(values ?? []),
  ]
    .map(
      value =>
        value
          .trim()
          .toUpperCase(),
    )
    .sort();
}

function sameStringList(
  left?: string[],
  right?: string[],
): boolean {

  return JSON.stringify(
    normalizeList(
      left,
    ),
  ) === JSON.stringify(
    normalizeList(
      right,
    ),
  );
}

export function buildFluidConsensus(
  specifications:
    FluidTechnicalSpecification[],
): FluidConsensusResult {

  if (
    specifications.length === 0
  ) {

    return {
      status:
        "empty",
    };
  }

  if (
    specifications.length === 1
  ) {

    return {
      status:
        "single-source",

      specification:
        specifications[0],

      sourceCount:
        1,
    };
  }

  const reference =
    specifications[0];

  const conflictingFields =
    new Set<string>();

  for (
    const candidate
    of specifications.slice(1)
  ) {


    /*
     * Deux viscosites differentes ne sont pas
     * automatiquement contradictoires.
     *
     * Elles peuvent etre deux recommandations
     * valides pour le meme vehicule lorsque
     * les deux sources concordent sur la meme
     * specification constructeur.
     *
     * En revanche, sans cette preuve commune,
     * TPA considere la divergence comme conflit.
     */
    if (
      reference.viscosity &&
      candidate.viscosity &&
      reference.viscosity.toUpperCase() !==
        candidate.viscosity.toUpperCase()
    ) {

      const sharedManufacturerSpecification =
        reference.manufacturerSpecification?.length &&
        candidate.manufacturerSpecification?.length &&
        normalizeList(
          reference.manufacturerSpecification,
        ).some(
          specification =>
            normalizeList(
              candidate.manufacturerSpecification,
            ).includes(
              specification,
            ),
        );

      if (
        !sharedManufacturerSpecification
      ) {

        conflictingFields.add(
          "viscosity",
        );
      }
    }

    if (
      reference.capacityLitres !== undefined &&
      candidate.capacityLitres !== undefined &&
      reference.capacityLitres !==
        candidate.capacityLitres
    ) {

      conflictingFields.add(
        "capacityLitres",
      );
    }

    if (
      reference.manufacturerSpecification &&
      candidate.manufacturerSpecification &&
      !sameStringList(
        reference.manufacturerSpecification,
        candidate.manufacturerSpecification,
      )
    ) {

      conflictingFields.add(
        "manufacturerSpecification",
      );
    }
  }

  if (
    conflictingFields.size > 0
  ) {

    return {
      status:
        "conflict",

      specifications,

      conflictingFields:
        [...conflictingFields],
    };
  }

  const viscosities =
    Array.from(
      new Set(
        specifications
          .map(
            item =>
              item.viscosity,
          )
          .filter(
            (
              value,
            ): value is string =>
              Boolean(value),
          ),
      ),
    );

  return {
    status:
      "consensus",

    specification: {
      ...reference,

      alternativeViscosities:
        viscosities.filter(
          value =>
            value !==
            reference.viscosity,
        ),

      confidence:
        "verified",

      notes: [
        ...(reference.notes ?? []),
        `Information concordante entre ${specifications.length} sources.`,
        viscosities.length > 1
          ? `Plusieurs viscosites compatibles sont recommandees : ${viscosities.join(" / ")}.`
          : "",
      ].filter(Boolean),
    },

    sourceCount:
      specifications.length,

    sources:
      Array.from(
        new Set(
          specifications.map(
            item =>
              item.sourceName,
          ),
        ),
      ),
  };
}