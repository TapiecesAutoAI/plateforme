import type {
  CounterHandoff,
  PaymentStatus,
  SalesProfile,
} from "./salesTypes";

export interface CreateCounterHandoffInput {
  profile:
    SalesProfile;

  storeId?:
    string | null;

  terminalId?:
    string | null;

  diagnosticId?:
    string | null;

  genericPartName:
    string;

  reference:
    string;

  manufacturer:
    string;

  quantity:
    number;

  totalIncVat:
    number;

  paymentStatus:
    PaymentStatus;

  vehicleDescription?:
    string | null;

  vin?:
    string | null;
}

export class CounterHandoffEngine {

  public create(
    input:
      CreateCounterHandoffInput,
  ): CounterHandoff {

    const paid =
      input.paymentStatus ===
      "paid";

    return {
      id:
        this.createId(),

      createdAt:
        new Date()
          .toISOString(),

      status:
        paid
          ? "paid-ready-for-preparation"
          : "requested",

      profile:
        input.profile,

      storeId:
        input.storeId ??
        null,

      terminalId:
        input.terminalId ??
        null,

      diagnosticId:
        input.diagnosticId ??
        null,

      genericPartName:
        input.genericPartName,

      reference:
        input.reference,

      manufacturer:
        input.manufacturer,

      quantity:
        Math.max(
          1,
          Math.floor(
            input.quantity,
          ),
        ),

      totalIncVat:
        Number(
          input.totalIncVat
            .toFixed(2),
        ),

      paymentStatus:
        input.paymentStatus,

      vehicleDescription:
        input.vehicleDescription ??
        null,

      vin:
        input.vin ??
        null,
    };
  }

  public markReady(
    handoff:
      CounterHandoff,
  ): CounterHandoff {

    return {
      ...handoff,

      status:
        "ready-for-pickup",
    };
  }

  public markCollected(
    handoff:
      CounterHandoff,
  ): CounterHandoff {

    return {
      ...handoff,

      status:
        "collected",
    };
  }

  private createId():
    string {

    return (
      "COUNTER-" +
      Date.now()
        .toString(36)
        .toUpperCase()
    );
  }
}
