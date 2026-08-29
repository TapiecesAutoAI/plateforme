export const CLIENT_GARAGE_STORAGE_KEY =
  "tapiecesauto-showroom-customers";

export type ClientGarageVehicle = {
  id: string;
  vin?: string | null;
  brand?: string;
  model?: string;
  year?: number | null;
  engine?: string;
  label?: string;
  [key: string]: unknown;
};

export type ClientGarageCustomer = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  [key: string]: unknown;
};

export type ClientGarageRecord = {
  customer: ClientGarageCustomer;
  vehicles: ClientGarageVehicle[];
  [key: string]: unknown;
};

function normalizeRecords(
  value: unknown,
): ClientGarageRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (
      item,
    ): item is ClientGarageRecord => {
      if (
        !item ||
        typeof item !== "object"
      ) {
        return false;
      }

      const record =
        item as Partial<ClientGarageRecord>;

      return Boolean(
        record.customer &&
        typeof record.customer.id ===
          "string" &&
        Array.isArray(
          record.vehicles,
        ),
      );
    },
  );
}

export function loadClientGarageRecords():
  ClientGarageRecord[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(
        CLIENT_GARAGE_STORAGE_KEY,
      );

    if (!raw) {
      return [];
    }

    return normalizeRecords(
      JSON.parse(raw),
    );
  }
  catch {
    return [];
  }
}

export function saveClientGarageRecords(
  records: ClientGarageRecord[],
): void {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    CLIENT_GARAGE_STORAGE_KEY,
    JSON.stringify(
      records,
    ),
  );
}

export function getClientGarageRecord(
  customerId: string,
): ClientGarageRecord | null {
  return (
    loadClientGarageRecords()
      .find(
        record =>
          record.customer.id ===
          customerId,
      ) ??
    null
  );
}

export function getClientGarageVehicles(
  customerId: string,
): ClientGarageVehicle[] {
  return (
    getClientGarageRecord(
      customerId,
    )?.vehicles ??
    []
  );
}

export function saveClientGarageRecord(
  record: ClientGarageRecord,
): ClientGarageRecord {
  const records =
    loadClientGarageRecords();

  const index =
    records.findIndex(
      item =>
        item.customer.id ===
        record.customer.id,
    );

  if (
    index ===
    -1
  ) {
    records.push(
      record,
    );
  }
  else {
    records[index] =
      record;
  }

  saveClientGarageRecords(
    records,
  );

  return record;
}

export function addClientGarageVehicle(
  customerId: string,
  vehicle: ClientGarageVehicle,
): ClientGarageRecord | null {
  const record =
    getClientGarageRecord(
      customerId,
    );

  if (!record) {
    return null;
  }

  if (
    record.vehicles.some(
      item =>
        item.id ===
        vehicle.id,
    )
  ) {
    return record;
  }

  return saveClientGarageRecord({
    ...record,

    vehicles: [
      ...record.vehicles,
      vehicle,
    ],
  });
}

export function updateClientGarageVehicle(
  customerId: string,
  vehicleId: string,
  patch:
    Partial<ClientGarageVehicle>,
): ClientGarageRecord | null {
  const record =
    getClientGarageRecord(
      customerId,
    );

  if (!record) {
    return null;
  }

  const exists =
    record.vehicles.some(
      item =>
        item.id ===
        vehicleId,
    );

  if (!exists) {
    return null;
  }

  return saveClientGarageRecord({
    ...record,

    vehicles:
      record.vehicles.map(
        vehicle =>
          vehicle.id ===
          vehicleId
            ? {
                ...vehicle,
                ...patch,
                id:
                  vehicle.id,
              }
            : vehicle,
      ),
  });
}

export function removeClientGarageVehicle(
  customerId: string,
  vehicleId: string,
): ClientGarageRecord | null {
  const record =
    getClientGarageRecord(
      customerId,
    );

  if (!record) {
    return null;
  }

  return saveClientGarageRecord({
    ...record,

    vehicles:
      record.vehicles.filter(
        vehicle =>
          vehicle.id !==
          vehicleId,
      ),
  });
}