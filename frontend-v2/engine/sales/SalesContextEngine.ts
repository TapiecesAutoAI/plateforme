import type {
  SalesContext,
  SalesDecision,
  SalesOption,
} from "./salesTypes";

export class SalesContextEngine {

  public resolve(
    context:
      SalesContext,
  ): SalesDecision {

    if (
      context.channel ===
      "online"
    ) {

      const options:
        SalesOption[] = [
        {
          id:
            "deliver-home",

          label:
            "Livraison à domicile",

          description:
            "Recevoir la pièce directement à l'adresse choisie.",

          fulfillment:
            "home-delivery",

          requiresPayment:
            true,

          sendsToCounter:
            false,
        },

        {
          id:
            "deliver-pickup-point",

          label:
            "Point relais",

          description:
            "Recevoir la pièce dans un point relais.",

          fulfillment:
            "pickup-point",

          requiresPayment:
            true,

          sendsToCounter:
            false,
        },

        {
          id:
            "deliver-locker",

          label:
            "Casier",

          description:
            "Recevoir la pièce dans un casier de retrait.",

          fulfillment:
            "locker",

          requiresPayment:
            true,

          sendsToCounter:
            false,
        },
      ];

      return {
        context,

        options,

        canPayOnline:
          true,

        canSendToCounter:
          false,

        canDeliver:
          true,

        message:
          "Choisissez le mode de livraison puis procédez au paiement.",
      };
    }

    /*
     * SHOWROOM
     *
     * Le profil ne détermine PAS
     * le canal.
     *
     * Particulier, bricoleur et
     * mécanicien peuvent tous utiliser
     * cette branche.
     */

    const options:
      SalesOption[] = [
      {
        id:
          "send-to-counter",

        label:
          "Envoyer au comptoir",

        description:
          "Transmettre le diagnostic, le véhicule et la pièce proposée à un vendeur.",

        fulfillment:
          "counter-pickup",

        requiresPayment:
          false,

        sendsToCounter:
          true,
      },

      {
        id:
          "pay-and-counter-pickup",

        label:
          "Payer et retirer au comptoir",

        description:
          "Payer maintenant et transmettre automatiquement la pièce au comptoir pour préparation.",

        fulfillment:
          "counter-pickup",

        requiresPayment:
          true,

        sendsToCounter:
          true,
      },

      {
        id:
          "continue-with-seller",

        label:
          "Continuer avec un vendeur",

        description:
          "Transmettre le dossier au comptoir lorsqu'un conseil ou une vérification supplémentaire est nécessaire.",

        fulfillment:
          null,

        requiresPayment:
          false,

        sendsToCounter:
          true,
      },
    ];

    return {
      context,

      options,

      canPayOnline:
        true,

      canSendToCounter:
        true,

      canDeliver:
        false,

      message:
        "Choisissez comment poursuivre dans le showroom.",
    };
  }
}
