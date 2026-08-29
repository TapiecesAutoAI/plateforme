export const CLIENT_ORDER_STORAGE_KEY =
  "tapiecesauto-client-orders";


export type ClientOrderStatus =
  | "confirmed"
  | "processing"
  | "ready"
  | "shipped"
  | "completed"
  | "cancelled";


export type ClientOrderItem = {
  reference: string;

  brand?: string | null;

  label: string;

  quantity: number;

  unitPriceIncVat: number;

  totalIncVat: number;
};


export type ClientOrder = {
  id: string;

  customerId: string;

  vehicleId?: string | null;

  createdAt: string;

  status:
    ClientOrderStatus;

  items:
    ClientOrderItem[];

  totalIncVat: number;

  invoiceNumber?:
    string | null;
};


function normalizeOrders(
  value:
    unknown,
): ClientOrder[] {

  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (
      item,
    ): item is ClientOrder => {

      if (
        !item ||
        typeof item !==
          "object"
      ) {
        return false;
      }

      const order =
        item as Partial<
          ClientOrder
        >;

      return Boolean(
        typeof order.id ===
          "string" &&
        typeof order.customerId ===
          "string" &&
        typeof order.createdAt ===
          "string" &&
        typeof order.totalIncVat ===
          "number" &&
        Array.isArray(
          order.items,
        ),
      );
    },
  );
}


export function loadClientOrders():
  ClientOrder[] {

  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  try {

    const raw =
      window.localStorage.getItem(
        CLIENT_ORDER_STORAGE_KEY,
      );

    if (!raw) {
      return [];
    }

    return normalizeOrders(
      JSON.parse(
        raw,
      ),
    );

  }
  catch {

    return [];
  }
}


export function saveClientOrders(
  orders:
    ClientOrder[],
): void {

  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    CLIENT_ORDER_STORAGE_KEY,
    JSON.stringify(
      orders,
    ),
  );
}


export function getClientOrders(
  customerId:
    string,
): ClientOrder[] {

  return loadClientOrders()
    .filter(
      order =>
        order.customerId ===
        customerId,
    )
    .sort(
      (
        a,
        b,
      ) =>
        new Date(
          b.createdAt,
        ).getTime() -
        new Date(
          a.createdAt,
        ).getTime(),
    );
}


export function getClientOrder(
  customerId:
    string,

  orderId:
    string,
): ClientOrder | null {

  return (
    getClientOrders(
      customerId,
    ).find(
      order =>
        order.id ===
        orderId,
    ) ??
    null
  );
}


export function saveClientOrder(
  order:
    ClientOrder,
): ClientOrder {

  const orders =
    loadClientOrders();

  const index =
    orders.findIndex(
      current =>
        current.id ===
        order.id,
    );

  if (
    index ===
    -1
  ) {

    orders.push(
      order,
    );
  }
  else {

    orders[index] =
      order;
  }

  saveClientOrders(
    orders,
  );

  return order;
}