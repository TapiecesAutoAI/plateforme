import {
  NextResponse,
} from "next/server";

import {
  diagnosticSessionStore,
} from "../../../engine/core";

import {
  VehicleIdentificationEngine,
} from "../../../engine/vehicle";

import {
  DiagnosticCommercialBridge,
  DiagnosticPartResolver,
} from "../../../engine/commerce";

import {
  OrderEngine,
} from "../../../engine/orders";

const vehicleEngine =
  new VehicleIdentificationEngine();

const commerce =
  new DiagnosticCommercialBridge();

const diagnosticPartResolver =
  new DiagnosticPartResolver();

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
   * La pièce commerciale vient maintenant
   * du résultat diagnostic TPA transmis
   * par le client appelant.
   *
   * Ordre de résolution :
   * 1. partRecommendation.primaryPart
   * 2. salesRecommendation
   * 3. conclusion.possibleParts
   */
  /*
   * Source de vérité commerciale :
   * uniquement la session Diagnostic V2
   * conservée côté serveur.
   */
  const sessionId =
    typeof body.sessionId === "string"
      ? body.sessionId.trim()
      : "";

  if (!sessionId) {
    return NextResponse.json(
      {
        ok: false,

        identification,

        error:
          "sessionId est obligatoire pour une offre ou une commande.",
      },
      {
        status: 400,
      },
    );
  }

  const diagnosticSession =
    await diagnosticSessionStore.get(
      sessionId,
    );

  if (!diagnosticSession) {
    return NextResponse.json(
      {
        ok: false,

        identification,

        sessionId,

        error:
          "Session de diagnostic introuvable.",
      },
      {
        status: 404,
      },
    );
  }

    /*
   * Autorité commerciale canonique.
   *
   * conclusion.possibleParts reste une donnée
   * diagnostique et ne constitue jamais une
   * autorisation d'achat.
   */
  const commercialAuthorization =
    diagnosticSession
      .commercialAuthorization;

  if (
    !commercialAuthorization ||
    commercialAuthorization.decision !==
      "purchase-recommended" ||
    !commercialAuthorization.partName
  ) {
    return NextResponse.json(
      {
        ok: false,

        identification,

        diagnosticSessionId:
          diagnosticSession.id,

        commercialAuthorization:
          commercialAuthorization ??
          null,

        error:
          "Le diagnostic n'autorise pas encore l'achat.",
      },
      {
        status: 409,
      },
    );
  }

  const diagnosticPart =
    diagnosticPartResolver.resolve({
      salesRecommendation: {
        partName:
          commercialAuthorization
            .partName,
      },
    });

  const diagnosticPartName =
    diagnosticPart.partName;

  if (!diagnosticPartName) {
    return NextResponse.json(
      {
        ok: false,

        identification,

        diagnosticPart,

        error:
          "Aucune pièce exploitable dans le résultat diagnostic.",
      },
      {
        status: 400,
      },
    );
  }

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
      diagnosticSessionId:
        diagnosticSession?.id ?? null,
      diagnosticPart,
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
      diagnosticSessionId:
        diagnosticSession?.id ?? null,
      diagnosticPart,
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
