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

    return NextResponse.json({
      ok: true,

      identification,

      offer,

      handoff,
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
