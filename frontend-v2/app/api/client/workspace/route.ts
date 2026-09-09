import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  verifyTpaSessionToken,
} from "../../../../lib/session/TpaSessionToken";

import {
  getCentralCustomer,
} from "../../../../lib/client/CentralCustomerStore";

import {
  getCentralVehiclesByCustomerId,
} from "../../../../lib/client/CentralVehicleStore";


export async function GET(
  request: NextRequest,
) {

  const secret =
    process.env.TPA_SESSION_SECRET;

  if (!secret) {
    return NextResponse.json(
      {
        ok: false,
        error: "SESSION_NOT_CONFIGURED",
      },
      {
        status: 503,
      },
    );
  }


  const token =
    request.cookies.get(
      "tpa_session",
    )?.value;


  if (!token) {
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


  const session =
    verifyTpaSessionToken(
      token,
      secret,
    );


  if (
    !session ||
    typeof session.customerId !== "string"
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


  const centralCustomer =
    await getCentralCustomer(
      session.customerId,
    );


  if (!centralCustomer) {
    return NextResponse.json(
      {
        ok: false,
        error: "CUSTOMER_NOT_FOUND",
      },
      {
        status: 404,
      },
    );
  }


  const centralVehicles =
    await getCentralVehiclesByCustomerId(
      centralCustomer.customerId,
    );


  return NextResponse.json({
    ok: true,

    workspace: {
      customer: {
        id:
          centralCustomer.customerId,

        firstName:
          centralCustomer.firstName,

        lastName:
          centralCustomer.lastName,

        phone:
          centralCustomer.phone,

        email:
          centralCustomer.email,
      },

      vehicles:
        centralVehicles.map(
          vehicle => ({
            vehicle: {
              id:
                vehicle.id,

              vin:
                vehicle.vin,

              brand:
                vehicle.brand,

              model:
                vehicle.model,

              year:
                vehicle.year,

              fuel:
                vehicle.fuel,

              engine:
                vehicle.engine,

              powerHp:
                vehicle.powerHp,

              powerKw:
                vehicle.powerKw,

              label:
                vehicle.label,
            },

            history: [],
          }),
        ),
    },
  });
}