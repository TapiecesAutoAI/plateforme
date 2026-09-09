import {
  randomUUID,
} from "crypto";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  verifyTpaSessionToken,
} from "../../../../lib/session/TpaSessionToken";

import {
  deleteCentralVehicle,
  getCentralVehicle,
  getCentralVehiclesByCustomerId,
  saveCentralVehicle,
} from "../../../../lib/client/CentralVehicleStore";


function getSession(
  request: NextRequest,
) {

  const secret =
    process.env.TPA_SESSION_SECRET;

  if (!secret) {
    return null;
  }


  const token =
    request.cookies.get(
      "tpa_session",
    )?.value;


  if (!token) {
    return null;
  }


  return verifyTpaSessionToken(
    token,
    secret,
  );
}


export async function GET(
  request: NextRequest,
) {

  const session =
    getSession(
      request,
    );


  if (
    !session ||
    typeof session.customerId !==
      "string"
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "UNAUTHENTICATED",
      },
      {
        status: 401,
      },
    );
  }


  const vehicles =
    await getCentralVehiclesByCustomerId(
      session.customerId,
    );


  return NextResponse.json({
    ok: true,
    vehicles,
  });
}


export async function POST(
  request: NextRequest,
) {

  const session =
    getSession(
      request,
    );


  if (
    !session ||
    typeof session.customerId !==
      "string"
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "UNAUTHENTICATED",
      },
      {
        status: 401,
      },
    );
  }


  const body =
    await request.json();


  const brand =
    typeof body.brand === "string"
      ? body.brand.trim()
      : "";

  const model =
    typeof body.model === "string"
      ? body.model.trim()
      : "";


  if (
    !brand ||
    !model
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "INVALID_VEHICLE",
      },
      {
        status: 400,
      },
    );
  }


  const now =
    new Date().toISOString();


  const vehicle = {
    id:
      `VEH-${randomUUID()}`,

    customerId:
      session.customerId,

    vin:
      typeof body.vin === "string" &&
      body.vin.trim()
        ? body.vin.trim()
        : undefined,

    brand,

    model,

    year:
      typeof body.year === "number" &&
      Number.isFinite(
        body.year,
      )
        ? body.year
        : undefined,

    fuel:
      typeof body.fuel === "string" &&
      body.fuel.trim()
        ? body.fuel.trim()
        : undefined,

    engine:
      typeof body.engine === "string" &&
      body.engine.trim()
        ? body.engine.trim()
        : undefined,

    powerHp:
      typeof body.powerHp === "number" &&
      Number.isFinite(
        body.powerHp,
      )
        ? body.powerHp
        : undefined,

    powerKw:
      typeof body.powerKw === "number" &&
      Number.isFinite(
        body.powerKw,
      )
        ? body.powerKw
        : undefined,

    label:
      [
        brand,
        model,
        body.year,
        body.engine,
      ]
        .filter(
          Boolean,
        )
        .join(
          " ",
        ),

    createdAt:
      now,

    updatedAt:
      now,
  };


  await saveCentralVehicle(
    vehicle,
  );


  return NextResponse.json(
    {
      ok: true,
      vehicle,
    },
    {
      status: 201,
    },
  );
}

export async function DELETE(
  request: NextRequest,
) {

  const session =
    getSession(
      request,
    );

  if (
    !session ||
    typeof session.customerId !==
      "string"
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "UNAUTHENTICATED",
      },
      {
        status: 401,
      },
    );
  }

  const vehicleId =
    request.nextUrl.searchParams.get(
      "id",
    )?.trim() ?? "";

  if (!vehicleId) {
    return NextResponse.json(
      {
        ok: false,
        error: "INVALID_VEHICLE_ID",
      },
      {
        status: 400,
      },
    );
  }

  const vehicle =
    await getCentralVehicle(
      vehicleId,
    );

  if (
    !vehicle ||
    vehicle.customerId !==
      session.customerId
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "VEHICLE_NOT_FOUND",
      },
      {
        status: 404,
      },
    );
  }

  const deleted =
    await deleteCentralVehicle(
      session.customerId,
      vehicleId,
    );

  if (!deleted) {
    return NextResponse.json(
      {
        ok: false,
        error: "VEHICLE_NOT_FOUND",
      },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json({
    ok: true,
  });
}