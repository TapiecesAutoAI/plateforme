import {
  NextResponse,
} from "next/server";

import {
  VehicleIdentificationEngine,
} from "../../../engine/vehicle";

import {
  DiagnosticCommercialBridge,
} from "../../../engine/commerce";

import {
  OrderEngine,
} from "../../../engine/orders";

const vehicleEngine =
  new VehicleIdentificationEngine();

const commerce =
  new DiagnosticCommercialBridge();

const orders =
  new OrderEngine();

/*
 * POST
 *
 * mode:
 * - identify
 * - offer
 * - order
 */
export async function POST(
  request: Request,
) {

  const body =
    await request.json();

  const mode =
    body.mode ??
    "identify";

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
    mode ===
    "identify"
  ) {
    return NextResponse.json(
      identification,
    );
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
          identification.message,
      },
      {
        status: 400,
      },
    );
  }

  /*
   * MVP :
   * le diagnostic a déjà identifié
   * la pièce générique.
   *
   * Pour le moment :
   * Alternateur.
   *
   * Plus tard cette valeur viendra
   * directement de la session diagnostic.
   */
  const diagnosticPartName =
    "Alternateur";

  /*
   * Compatibilité simulée.
   *
   * Le véhicule est identifié,
   * mais cette étape sera remplacée
   * par TecDoc / fournisseur.
   */
  const compatibilityConfirmed =
    body.compatibilityConfirmed ===
    true;

  const offer =
    commerce.createOffer(
      diagnosticPartName,
      compatibilityConfirmed,
    );

  if (
    mode ===
    "offer"
  ) {
    return NextResponse.json({
      ok: true,
      identification,
      offer,
    });
  }

  if (
    mode ===
    "order"
  ) {

    if (
      !compatibilityConfirmed ||
      !offer.canOrder
    ) {
      return NextResponse.json(
        {
          ok: false,

          identification,

          offer,

          error:
            "La compatibilité exacte de la pièce avec le véhicule doit être confirmée.",
        },
        {
          status: 400,
        },
      );
    }

    const order =
      orders.createOrder(
        offer,
        {
          quantity:
            Math.max(
              1,
              Number(
                body.quantity ??
                1,
              ),
            ),

          compatibilityConfirmed:
            true,
        },
      );

    return NextResponse.json({
      ok: true,
      identification,
      offer,
      order,
    });
  }

  return NextResponse.json(
    {
      ok: false,
      error:
        "Mode inconnu.",
    },
    {
      status: 400,
    },
  );
}
