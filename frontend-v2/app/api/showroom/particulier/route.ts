import {
  NextResponse,
} from "next/server";

import {
  VehicleIdentificationEngine,
} from "../../../../engine/vehicle";

import {
  DiagnosticCommercialBridge,
} from "../../../../engine/commerce";

import {
  CounterHandoffEngine,
} from "../../../../engine/sales";

import {
  saveCounterTicket,
  type CounterTicket,
} from "../../../../lib/counter/CounterTicketStore";

import {
  allocateCounterTicketNumber,
} from "../../../../lib/organization/OrganizationStore";

const vehicleEngine =
  new VehicleIdentificationEngine();

const commerce =
  new DiagnosticCommercialBridge();

const counter =
  new CounterHandoffEngine();

export async function POST(
  request: Request,
) {

  const body =
    await request.json();

  const command =
    String(
      body.command ?? "",
    );

  /*
   * =========================================================
   * IDENTIFICATION VEHICULE
   * =========================================================
   */

  const identification =
    vehicleEngine.identify({
      vin:
        body.vin,

      brand:
        body.brand,

      model:
        body.model,

      year:
        body.year
          ? Number(
              body.year,
            )
          : null,

      engine:
        body.engine,
    });

  if (
    command ===
    "identify-vehicle"
  ) {

    return NextResponse.json({
      ok: true,
      identification,
    });
  }

  if (
    !identification
      .readyForCompatibilityCheck
  ) {

    return NextResponse.json(
      {
        ok: false,

        identification,

        error:
          "Le véhicule doit être identifié avant de rechercher une référence.",
      },
      {
        status: 400,
      },
    );
  }

  /*
   * =========================================================
   * RECHERCHE COMMERCIALE
   * =========================================================
   */

  const partName =
    typeof body.partName ===
      "string"
      ? body.partName.trim()
      : "";

  if (!partName) {

    return NextResponse.json(
      {
        ok: false,

        error:
          "Aucune pièce issue du diagnostic.",
      },
      {
        status: 400,
      },
    );
  }

  if (
    command ===
    "find-offer"
  ) {

    /*
     * MVP :
     * identification véhicule présente,
     * compatibilité fournisseur simulée.
     *
     * Plus tard :
     * TecDoc / Doyen / Salto.
     */
    const offer =
      commerce.createOffer(
        partName,
        true,
      );

    return NextResponse.json({
      ok: true,

      identification,

      offer,
    });
  }

  /*
   * =========================================================
   * ENVOI AU COMPTOIR
   * =========================================================
   */

  if (
    command ===
    "send-to-counter"
  ) {

    const origin =
      body.origin === "known-part" ||
      body.origin === "diagnostic" ||
      body.origin === "direct"
        ? body.origin
        : "direct";

    const offer =
      commerce.createOffer(
        partName,
        true,
      );

    if (
      !offer.offer
    ) {

      return NextResponse.json(
        {
          ok: false,

          error:
            "Aucune référence commerciale n'est disponible pour cette pièce.",
        },
        {
          status: 400,
        },
      );
    }

    const vehicle =
      identification.vehicle;

    const vehicleDescription =
      [
        vehicle.brand,
        vehicle.model,
        vehicle.year,
        vehicle.engine,
      ]
        .filter(Boolean)
        .join(" ");

    const handoff =
      counter.create({
        profile:
          "particulier",

        storeId:
          body.storeId ??
          "GROSSISTE-DEMO",

        terminalId:
          body.terminalId ??
          "BORNE-01",

        diagnosticId:
          body.diagnosticId ??
          null,

        genericPartName:
          partName,

        reference:
          offer.offer.reference,

        manufacturer:
          offer.offer.manufacturer,

        quantity:
          Math.max(
            1,
            Number(
              body.quantity ??
              1,
            ),
          ),

        totalIncVat:
          Number(
            (
              (offer.salePriceIncVat ?? 0) *
              Math.max(
                1,
                Number(
                  body.quantity ??
                  1,
                ),
              )
            ).toFixed(2),
          ),

        paymentStatus:
          "not-paid",

        vehicleDescription:
          vehicleDescription ||
          "Véhicule identifié par VIN",

        vin:
          vehicle.vin,
      });

    let ticket:
      CounterTicket | null =
      null;

    const hasShowroomContext =
      Boolean(
        body.storeId &&
        body.branchId &&
        body.terminalId &&
        body.customer,
      );

    if (hasShowroomContext) {
      const ticketNumber =
        await allocateCounterTicketNumber();

      const reason =
        origin === "known-part"
          ? "parts-order"
          : origin === "diagnostic"
            ? "diagnostic"
            : "counter-request";

      ticket = {
        id:
          "CT-" +
          Date.now()
            .toString(36)
            .toUpperCase(),

        number:
          ticketNumber,

        createdAt:
          new Date().toISOString(),

        calledAt:
          null,

        startedAt:
          null,

        completedAt:
          null,

        status:
          "waiting",

        customer: {
          id:
            String(
              body.customer?.id ?? "",
            ),

          firstName:
            String(
              body.customer?.firstName ?? "",
            ),

          lastName:
            String(
              body.customer?.lastName ?? "",
            ),

          phone:
            String(
              body.customer?.phone ?? "",
            ),

          email:
            String(
              body.customer?.email ?? "",
            ),
        },

        vehicle: {
          id:
            String(
              body.vehicleId ?? "",
            ),

          vin:
            vehicle.vin
              ? String(vehicle.vin)
              : null,

          brand:
            String(
              vehicle.brand ?? "",
            ),

          model:
            String(
              vehicle.model ?? "",
            ),

          year:
            vehicle.year
              ? Number(vehicle.year)
              : null,

          engine:
            String(
              vehicle.engine ?? "",
            ),

          label:
            vehicleDescription,
        },

        profile:
          String(
            body.profile ??
            "particulier",
          ),

        reason,

        storeId:
          String(body.storeId),

        branchId:
          String(body.branchId),

        terminalId:
          String(body.terminalId),

        sellerId:
          null,

        sellerName:
          null,
      };

      await saveCounterTicket(
        ticket,
      );
    }

    return NextResponse.json({
      ok: true,

      identification,

      offer,

      handoff: {
        ...handoff,
        origin,
      },

      ticket,
    });
  }

  return NextResponse.json(
    {
      ok: false,

      error:
        "Commande showroom inconnue.",
    },
    {
      status: 400,
    },
  );
}
