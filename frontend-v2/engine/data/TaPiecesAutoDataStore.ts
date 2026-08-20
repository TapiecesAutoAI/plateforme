import type {
  CampaignInteractionRecord,
  CommercialPartRecord,
  CounterTicketRecord,
  CustomerRecord,
  DataEventRecord,
  DiagnosticRecord,
  FulfillmentRecord,
  InstallationFeedbackRecord,
  OrderRecord,
  PaymentRecord,
  VehicleRecord,
} from "./dataTypes";

export type TaPiecesAutoDataSnapshot = {
  customers: CustomerRecord[];
  vehicles: VehicleRecord[];
  diagnostics: DiagnosticRecord[];
  parts: CommercialPartRecord[];
  orders: OrderRecord[];
  payments: PaymentRecord[];
  fulfillments: FulfillmentRecord[];
  counterTickets: CounterTicketRecord[];
  installationFeedback: InstallationFeedbackRecord[];
  campaignInteractions: CampaignInteractionRecord[];
  events: DataEventRecord[];
};

export class TaPiecesAutoDataStore {

  private customers =
    new Map<string, CustomerRecord>();

  private vehicles =
    new Map<string, VehicleRecord>();

  private diagnostics =
    new Map<string, DiagnosticRecord>();

  private parts =
    new Map<string, CommercialPartRecord>();

  private orders =
    new Map<string, OrderRecord>();

  private payments =
    new Map<string, PaymentRecord>();

  private fulfillments =
    new Map<string, FulfillmentRecord>();

  private counterTickets =
    new Map<string, CounterTicketRecord>();

  private installationFeedback =
    new Map<string, InstallationFeedbackRecord>();

  private campaignInteractions =
    new Map<string, CampaignInteractionRecord>();

  private events: DataEventRecord[] = [];

  saveCustomer(
    record: CustomerRecord,
  ): CustomerRecord {

    this.customers.set(
      record.id,
      record,
    );

    return record;
  }

  getCustomer(
    id: string,
  ): CustomerRecord | null {

    return (
      this.customers.get(id) ??
      null
    );
  }

  findCustomer(
    query: string,
  ): CustomerRecord | null {

    const normalized =
      query
        .trim()
        .toLowerCase();

    for (
      const customer
      of this.customers.values()
    ) {

      if (
        customer.id
          .toLowerCase() ===
        normalized
      ) {
        return customer;
      }

      if (
        customer.phone?.value
          .toLowerCase() ===
        normalized
      ) {
        return customer;
      }

      if (
        customer.email?.value
          .toLowerCase() ===
        normalized
      ) {
        return customer;
      }
    }

    return null;
  }

  saveVehicle(
    record: VehicleRecord,
  ): VehicleRecord {

    this.vehicles.set(
      record.id,
      record,
    );

    return record;
  }

  getVehicle(
    id: string,
  ): VehicleRecord | null {

    return (
      this.vehicles.get(id) ??
      null
    );
  }

  getVehiclesForCustomer(
    customerId: string,
  ): VehicleRecord[] {

    return [
      ...this.vehicles.values(),
    ].filter(
      vehicle =>
        vehicle.customerId ===
        customerId,
    );
  }

  saveDiagnostic(
    record: DiagnosticRecord,
  ): DiagnosticRecord {

    this.diagnostics.set(
      record.id,
      record,
    );

    return record;
  }

  getDiagnostic(
    id: string,
  ): DiagnosticRecord | null {

    return (
      this.diagnostics.get(id) ??
      null
    );
  }

  savePart(
    record: CommercialPartRecord,
  ): CommercialPartRecord {

    this.parts.set(
      record.id,
      record,
    );

    return record;
  }

  saveOrder(
    record: OrderRecord,
  ): OrderRecord {

    this.orders.set(
      record.id,
      record,
    );

    return record;
  }

  savePayment(
    record: PaymentRecord,
  ): PaymentRecord {

    this.payments.set(
      record.id,
      record,
    );

    return record;
  }

  saveFulfillment(
    record: FulfillmentRecord,
  ): FulfillmentRecord {

    this.fulfillments.set(
      record.id,
      record,
    );

    return record;
  }

  saveCounterTicket(
    record: CounterTicketRecord,
  ): CounterTicketRecord {

    this.counterTickets.set(
      record.id,
      record,
    );

    return record;
  }

  saveInstallationFeedback(
    record: InstallationFeedbackRecord,
  ): InstallationFeedbackRecord {

    this.installationFeedback.set(
      record.id,
      record,
    );

    return record;
  }

  saveCampaignInteraction(
    record: CampaignInteractionRecord,
  ): CampaignInteractionRecord {

    this.campaignInteractions.set(
      record.id,
      record,
    );

    return record;
  }

  addEvent(
    event: DataEventRecord,
  ): DataEventRecord {

    this.events.push(
      event,
    );

    return event;
  }

  getEventsForCustomer(
    customerId: string,
  ): DataEventRecord[] {

    return this.events.filter(
      event =>
        event.customerId ===
        customerId,
    );
  }

  getOrdersForVehicle(
    vehicleId: string,
  ): OrderRecord[] {

    return [
      ...this.orders.values(),
    ].filter(
      order =>
        order.vehicleId ===
        vehicleId,
    );
  }

  getFeedbackForVehicle(
    vehicleId: string,
  ): InstallationFeedbackRecord[] {

    return [
      ...this.installationFeedback.values(),
    ].filter(
      feedback =>
        feedback.vehicleId ===
        vehicleId,
    );
  }

  snapshot():
    TaPiecesAutoDataSnapshot {

    return {
      customers: [
        ...this.customers.values(),
      ],

      vehicles: [
        ...this.vehicles.values(),
      ],

      diagnostics: [
        ...this.diagnostics.values(),
      ],

      parts: [
        ...this.parts.values(),
      ],

      orders: [
        ...this.orders.values(),
      ],

      payments: [
        ...this.payments.values(),
      ],

      fulfillments: [
        ...this.fulfillments.values(),
      ],

      counterTickets: [
        ...this.counterTickets.values(),
      ],

      installationFeedback: [
        ...this.installationFeedback.values(),
      ],

      campaignInteractions: [
        ...this.campaignInteractions.values(),
      ],

      events: [
        ...this.events,
      ],
    };
  }
}
