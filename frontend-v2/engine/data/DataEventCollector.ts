import type {
  DataEventRecord,
  SalesChannel,
} from "./dataTypes";

export type EventInput = {
  eventType: string;

  customerId?: string;
  vehicleId?: string;
  diagnosticId?: string;
  orderId?: string;

  channel?: SalesChannel;

  storeId?: string;
  terminalId?: string;
  sellerId?: string;

  metadata?: Record<
    string,
    string | number | boolean | null
  >;
};

export function createDataEvent(
  input: EventInput,
): DataEventRecord {

  return {
    id:
      "EVT-" +
      Date.now()
        .toString(36)
        .toUpperCase() +
      "-" +
      Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase(),

    eventType:
      input.eventType,

    customerId:
      input.customerId,

    vehicleId:
      input.vehicleId,

    diagnosticId:
      input.diagnosticId,

    orderId:
      input.orderId,

    channel:
      input.channel,

    storeId:
      input.storeId,

    terminalId:
      input.terminalId,

    sellerId:
      input.sellerId,

    createdAt:
      new Date()
        .toISOString(),

    metadata:
      input.metadata ?? {},
  };
}
