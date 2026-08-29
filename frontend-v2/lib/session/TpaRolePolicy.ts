import type {
  TpaPermission,
  TpaRole,
} from "./TpaSession";

const ROLE_PERMISSIONS:
  Record<
    TpaRole,
    TpaPermission[]
  > = {

    kiosk: [
      "vehicle:identify",
      "diagnostic:basic",
      "parts:search",
      "fluids:search",
      "tools:search",
      "pricing:retail",
      "request:send-counter",
    ],

    customer: [
      "vehicle:identify",
      "diagnostic:basic",
      "parts:search",
      "fluids:search",
      "tools:search",
      "order:create",
      "order:view-own",
      "pricing:retail",
    ],

    professional: [
      "vehicle:identify",
      "diagnostic:basic",
      "diagnostic:advanced",
      "parts:search",
      "parts:technical",
      "fluids:search",
      "tools:search",
      "procedure:view",
      "order:create",
      "order:view-own",
      "pricing:professional",
      "stock:view",
    ],

    seller: [
      "vehicle:identify",
      "diagnostic:basic",
      "diagnostic:advanced",
      "parts:search",
      "parts:technical",
      "fluids:search",
      "tools:search",
      "procedure:view",
      "order:create",
      "order:view-store",
      "pricing:retail",
      "pricing:professional",
      "pricing:margin",
      "stock:view",
      "supplier:view",
      "supplier:order",
      "request:receive-counter",
      "customer:view",
    ],

    administrator: [
      "vehicle:identify",
      "diagnostic:basic",
      "diagnostic:advanced",
      "parts:search",
      "parts:technical",
      "fluids:search",
      "tools:search",
      "procedure:view",
      "order:create",
      "order:view-own",
      "order:view-store",
      "pricing:retail",
      "pricing:professional",
      "pricing:margin",
      "stock:view",
      "supplier:view",
      "supplier:order",
      "request:send-counter",
      "request:receive-counter",
      "customer:view",
      "admin:configure",
      "admin:users",
      "admin:technical-sources",
    ],
  };

export function permissionsForRole(
  role:
    TpaRole,
): TpaPermission[] {

  return [
    ...ROLE_PERMISSIONS[
      role
    ],
  ];
}

export function roleHasPermission(
  role:
    TpaRole,

  permission:
    TpaPermission,
): boolean {

  return ROLE_PERMISSIONS[
    role
  ].includes(
    permission,
  );
}