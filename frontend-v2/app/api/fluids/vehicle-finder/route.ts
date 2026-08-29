import {
  NextResponse,
} from "next/server";

import {
  VehicleFinderFluidProvider,
} from "../../../../lib/fluids/technical/VehicleFinderFluidProvider";

import type {
  FluidTechnicalQuery,
} from "../../../../lib/fluids/technical/FluidTechnicalDataProvider";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

const provider =
  new VehicleFinderFluidProvider();

export async function POST(
  request: Request,
) {

  try {

    const query =
      await request.json() as
        FluidTechnicalQuery;

    if (
      !query ||
      !query.fluidId ||
      !query.vehicle
    ) {

      return NextResponse.json(
        {
          status:
            "not-found",
        },
        {
          status:
            400,
        },
      );
    }

    const result =
      await provider.resolve(
        query,
      );

    return NextResponse.json(
      result,
      {
        status:
          200,
      },
    );

  } catch (
    error
  ) {

    console.error(
      "Vehicle Finder route error:",
      error,
    );

    return NextResponse.json(
      {
        status:
          "provider-unavailable",
      },
      {
        status:
          200,
      },
    );
  }
}