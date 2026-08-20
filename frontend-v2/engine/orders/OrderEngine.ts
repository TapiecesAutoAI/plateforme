import type {
  CommercialOfferResult,
} from "../commerce";

import type {
  CommercialOrder,
  CreateOrderInput,
  OrderLine,
} from "./orderTypes";

export class OrderEngine {

  public createOrder(
    commercial:
      CommercialOfferResult,

    input:
      CreateOrderInput,
  ): CommercialOrder {

    if (
      !commercial.canOrder ||
      commercial.status !==
        "offer-ready"
    ) {
      throw new Error(
        "ORDER_NOT_AUTHORIZED",
      );
    }

    if (
      !input.compatibilityConfirmed ||
      !commercial
        .compatibilityConfirmed
    ) {
      throw new Error(
        "VEHICLE_COMPATIBILITY_REQUIRED",
      );
    }

    const offer =
      commercial.offer;

    if (!offer) {
      throw new Error(
        "COMMERCIAL_OFFER_MISSING",
      );
    }

    if (
      offer.salePriceExVat ===
      null
    ) {
      throw new Error(
        "SALE_PRICE_MISSING",
      );
    }

    const quantity =
      Math.max(
        1,
        Math.floor(
          input.quantity ?? 1,
        ),
      );

    const lineTotalExVat =
      this.money(
        offer.salePriceExVat *
        quantity,
      );

    const lineVatAmount =
      this.money(
        lineTotalExVat *
        offer.vatRate,
      );

    const lineTotalIncVat =
      this.money(
        lineTotalExVat +
        lineVatAmount,
      );

    const line:
      OrderLine = {

      offerId:
        offer.id,

      reference:
        offer.reference,

      manufacturer:
        offer.manufacturer,

      description:
        offer.genericPartName,

      quantity,

      unitPriceExVat:
        offer.salePriceExVat,

      vatRate:
        offer.vatRate,

      lineTotalExVat,

      lineVatAmount,

      lineTotalIncVat,
    };

    return {
      id:
        this.createOrderId(),

      status:
        "confirmed",

      createdAt:
        new Date()
          .toISOString(),

      lines: [
        line,
      ],

      totals: {
        totalExVat:
          lineTotalExVat,

        vatAmount:
          lineVatAmount,

        totalIncVat:
          lineTotalIncVat,

        currency:
          "EUR",
      },

      vehicleCompatibilityConfirmed:
        true,
    };
  }

  private money(
    value: number,
  ): number {

    return Number(
      value.toFixed(2),
    );
  }

  private createOrderId():
    string {

    return (
      "ORDER-" +
      Date.now()
        .toString(36)
        .toUpperCase()
    );
  }
}
