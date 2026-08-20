import {
  NextResponse,
} from "next/server";

import {
  createDataEvent,
  dataStore,
} from "../../../../engine/data";

import type {
  CustomerProfile,
  CustomerRecord,
  VehicleRecord,
} from "../../../../engine/data";

function now() {
  return new Date().toISOString();
}

export async function GET() {

  const snapshot =
    dataStore.snapshot();

  return NextResponse.json({
    ok: true,

    counts: {
      customers:
        snapshot.customers.length,

      vehicles:
        snapshot.vehicles.length,

      diagnostics:
        snapshot.diagnostics.length,

      orders:
        snapshot.orders.length,

      events:
        snapshot.events.length,

      feedback:
        snapshot.installationFeedback.length,
    },
  });
}

export async function POST(
  request: Request,
) {

  const body =
    await request.json();

  const action =
    String(
      body.action ?? "",
    );

  /*
   * =========================================================
   * CUSTOMER
   * =========================================================
   */

  if (
    action ===
    "save-customer"
  ) {

    const timestamp =
      now();

    const id =
      String(
        body.customer?.id ??
        "",
      );

    if (!id) {

      return NextResponse.json(
        {
          ok: false,
          error:
            "CUSTOMER_ID_REQUIRED",
        },
        {
          status: 400,
        },
      );
    }

    const existing =
      dataStore.getCustomer(
        id,
      );

    const customer:
      CustomerRecord = {

      id,

      firstName:
        body.customer
          ?.firstName
          ? {
              value:
                String(
                  body.customer
                    .firstName,
                ),

              source:
                "customer",

              reliability:
                "declared",

              collectedAt:
                timestamp,
            }
          : existing
              ?.firstName,

      lastName:
        body.customer
          ?.lastName
          ? {
              value:
                String(
                  body.customer
                    .lastName,
                ),

              source:
                "customer",

              reliability:
                "declared",

              collectedAt:
                timestamp,
            }
          : existing
              ?.lastName,

      phone:
        body.customer
          ?.phone
          ? {
              value:
                String(
                  body.customer
                    .phone,
                ),

              source:
                "customer",

              reliability:
                "declared",

              collectedAt:
                timestamp,
            }
          : existing
              ?.phone,

      email:
        body.customer
          ?.email
          ? {
              value:
                String(
                  body.customer
                    .email,
                ),

              source:
                "customer",

              reliability:
                "declared",

              collectedAt:
                timestamp,
            }
          : existing
              ?.email,

      profile:
        body.profile
          ? {
              value:
                body.profile as
                  CustomerProfile,

              source:
                "customer",

              reliability:
                "declared",

              collectedAt:
                timestamp,
            }
          : existing
              ?.profile,

      createdAt:
        existing
          ?.createdAt ??
        timestamp,

      updatedAt:
        timestamp,

      marketingConsent: {

        email:
          Boolean(
            body.customer
              ?.marketingEmail,
          ),

        sms:
          Boolean(
            body.customer
              ?.marketingSms,
          ),

        push:
          false,

        emailUpdatedAt:
          timestamp,

        smsUpdatedAt:
          timestamp,
      },

      preferredStoreId:
        body.storeId ??
        existing
          ?.preferredStoreId,

      preferredLanguage:
        existing
          ?.preferredLanguage ??
        "fr",

      customerSince:
        existing
          ?.customerSince ??
        timestamp,

      lastVisitAt:
        timestamp,

      visitCount:
        existing
          ? existing
              .visitCount
          : 1,

      orderCount:
        existing
          ?.orderCount ??
        0,

      totalSpentGross:
        existing
          ?.totalSpentGross ??
        0,

      averageBasketGross:
        existing
          ?.averageBasketGross ??
        0,

      tags: [
        ...new Set([
          ...(existing
            ?.tags ?? []),

          "showroom",
        ]),
      ],

      vehicleIds:
        existing
          ?.vehicleIds ??
        [],
    };

    dataStore.saveCustomer(
      customer,
    );

    dataStore.addEvent(
      createDataEvent({

        eventType:
          existing
            ? "customer-returned"
            : "customer-created",

        customerId:
          customer.id,

        channel:
          "showroom",

        storeId:
          body.storeId ??
          "GROSSISTE-DEMO",

        terminalId:
          body.terminalId ??
          "BORNE-01",

        metadata: {
          marketingEmail:
            customer
              .marketingConsent
              .email,

          marketingSms:
            customer
              .marketingConsent
              .sms,
        },
      }),
    );

    return NextResponse.json({
      ok: true,
      customer,
    });
  }


  /*
   * =========================================================
   * VEHICLE
   * =========================================================
   */

  if (
    action ===
    "save-vehicle"
  ) {

    const timestamp =
      now();

    const input =
      body.vehicle ?? {};

    const vehicleId =
      String(
        input.id ??
        "",
      );

    if (!vehicleId) {

      return NextResponse.json(
        {
          ok: false,
          error:
            "VEHICLE_ID_REQUIRED",
        },
        {
          status: 400,
        },
      );
    }

    const vehicle:
      VehicleRecord = {

      id:
        vehicleId,

      customerId:
        body.customerId ??
        undefined,

      vin:
        input.vin
          ? {
              value:
                String(
                  input.vin,
                ),

              source:
                "customer",

              reliability:
                "declared",

              collectedAt:
                timestamp,
            }
          : undefined,

      brand:
        input.brand
          ? {
              value:
                String(
                  input.brand,
                ),

              source:
                "customer",

              reliability:
                "declared",

              collectedAt:
                timestamp,
            }
          : undefined,

      model:
        input.model
          ? {
              value:
                String(
                  input.model,
                ),

              source:
                "customer",

              reliability:
                "declared",

              collectedAt:
                timestamp,
            }
          : undefined,

      productionYear:
        input.year
          ? {
              value:
                Number(
                  input.year,
                ),

              source:
                "customer",

              reliability:
                "declared",

              collectedAt:
                timestamp,
            }
          : undefined,

      engineDescription:
        input.engine
          ? {
              value:
                String(
                  input.engine,
                ),

              source:
                "customer",

              reliability:
                "declared",

              collectedAt:
                timestamp,
            }
          : undefined,

      createdAt:
        timestamp,

      updatedAt:
        timestamp,

      diagnosticIds:
        [],

      orderIds:
        [],

      tags: [
        "showroom",
      ],
    };

    dataStore.saveVehicle(
      vehicle,
    );

    const customerId =
      body.customerId
        ? String(
            body.customerId,
          )
        : null;

    if (customerId) {

      const customer =
        dataStore.getCustomer(
          customerId,
        );

      if (customer) {

        const vehicleIds =
          [
            ...new Set([
              ...customer
                .vehicleIds,

              vehicle.id,
            ]),
          ];

        dataStore.saveCustomer({
          ...customer,

          vehicleIds,

          updatedAt:
            timestamp,
        });
      }
    }

    dataStore.addEvent(
      createDataEvent({

        eventType:
          "vehicle-added",

        customerId:
          customerId ??
          undefined,

        vehicleId:
          vehicle.id,

        channel:
          "showroom",

        storeId:
          body.storeId ??
          "GROSSISTE-DEMO",

        terminalId:
          body.terminalId ??
          "BORNE-01",

        metadata: {
          hasVin:
            Boolean(
              input.vin,
            ),
        },
      }),
    );

    return NextResponse.json({
      ok: true,
      vehicle,
    });
  }


  /*
   * =========================================================
   * GENERIC EVENT
   * =========================================================
   */

  if (
    action ===
    "event"
  ) {

    const event =
      createDataEvent({

        eventType:
          String(
            body.eventType ??
            "unknown-event",
          ),

        customerId:
          body.customerId ??
          undefined,

        vehicleId:
          body.vehicleId ??
          undefined,

        diagnosticId:
          body.diagnosticId ??
          undefined,

        orderId:
          body.orderId ??
          undefined,

        channel:
          body.channel ??
          "showroom",

        storeId:
          body.storeId ??
          "GROSSISTE-DEMO",

        terminalId:
          body.terminalId ??
          "BORNE-01",

        sellerId:
          body.sellerId ??
          undefined,

        metadata:
          body.metadata ??
          {},
      });

    dataStore.addEvent(
      event,
    );

    return NextResponse.json({
      ok: true,
      event,
    });
  }


  return NextResponse.json(
    {
      ok: false,
      error:
        "DATA_ACTION_UNKNOWN",
    },
    {
      status: 400,
    },
  );
}
