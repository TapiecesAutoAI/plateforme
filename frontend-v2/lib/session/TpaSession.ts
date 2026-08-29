export type TpaChannel =
  | "showroom-kiosk"
  | "customer-web"
  | "counter"
  | "professional"
  | "admin";

export type TpaRole =
  | "kiosk"
  | "customer"
  | "professional"
  | "seller"
  | "administrator";

export type TpaPermission =
  | "vehicle:identify"
  | "diagnostic:basic"
  | "diagnostic:advanced"
  | "parts:search"
  | "parts:technical"
  | "fluids:search"
  | "tools:search"
  | "procedure:view"
  | "order:create"
  | "order:view-own"
  | "order:view-store"
  | "pricing:retail"
  | "pricing:professional"
  | "pricing:margin"
  | "stock:view"
  | "supplier:view"
  | "supplier:order"
  | "request:send-counter"
  | "request:receive-counter"
  | "customer:view"
  | "admin:configure"
  | "admin:users"
  | "admin:technical-sources";

export type TpaSession = {
  userId: string | null;

  customerId?:
    string;



  channel:
    TpaChannel;

  role:
    TpaRole;

  permissions:
    TpaPermission[];

  deviceId?: string;

  storeId?: string;

  displayName?: string;

  authenticated:
    boolean;
};