import {
  NextResponse,
} from "next/server";

import {
  findCentralCustomerByEmail,
  findCentralCustomerByPhone,
  getCentralCustomer,
} from "../../../../lib/client/CentralCustomerStore";

import {
  getCentralVehiclesByCustomerId,
} from "../../../../lib/client/CentralVehicleStore";

export async function POST(
  request: Request,
) {

  const body =
    await request.json();

  const search =
    String(
      body.search ?? "",
    )
      .trim()
      .toLowerCase();

  if (!search) {

    return NextResponse.json(
      {
        ok: false,
        error: "SEARCH_REQUIRED",
      },
      {
        status: 400,
      },
    );
  }

  let customer =
    null;

  if (
    search.includes("@")
  ) {

    customer =
      await findCentralCustomerByEmail(
        search,
      );

  } else {

    customer =
      await findCentralCustomerByPhone(
        search,
      );

    if (
      !customer &&
      /^c-/i.test(search)
    ) {

      customer =
        await getCentralCustomer(
          search,
        );
    }
  }

  if (!customer) {

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
      customer.customerId,
    );

  const diagnosticProfile =
    customer.profile
      ?.diagnosticProfile;

  const profile =
    diagnosticProfile === "particulier" ||
    diagnosticProfile === "bricoleur" ||
    diagnosticProfile === "mecanicien-garage"
      ? diagnosticProfile
      : undefined;

  return NextResponse.json({
    ok: true,

    record: {
      customer: {
        id:
          customer.customerId,

        firstName:
          customer.firstName,

        lastName:
          customer.lastName,

        phone:
          customer.phone,

        email:
          customer.email,

        marketingEmail:
          customer.marketingConsents
            .email
            .granted,

        marketingSms:
          customer.marketingConsents
            .sms
            .granted,

        profile,
      },

      vehicles:
        centralVehicles.map(
          vehicle => ({
            id:
              vehicle.id,

            vin:
              vehicle.vin ??
              null,

            brand:
              vehicle.brand,

            model:
              vehicle.model,

            year:
              vehicle.year ??
              null,

            engine:
              vehicle.engine ??
              "",

            fuel:
              vehicle.fuel ??
              null,

            powerHp:
              vehicle.powerHp ??
              null,

            powerKw:
              vehicle.powerKw ??
              null,

            label:
              vehicle.label,
          }),
        ),
    },
  });
}