export type TpaAccessRole =
  | "client"
  | "seller"
  | "wholesaler_admin"
  | "super_admin";

export type TpaPermission =
  // Client
  | "customer.profile.read"
  | "customer.profile.update"
  | "customer.vehicle.manage"
  | "diagnostic.customer.use"

  // Vendeur comptoir
  | "counter.use"
  | "diagnostic.counter.use"
  | "customer.lookup"
  | "customer.create"
  | "order.create"

  // Administration grossiste
  | "organization.read"
  | "organization.seller.create"
  | "organization.seller.disable"
  | "organization.seller.read"
  | "organization.branch.read"
  | "organization.branch.manage"
  | "organization.stats.read"
  | "organization.customer.stats.read"

  // Administration TPA
  | "organization.create"
  | "organization.update"
  | "organization.disable"
  | "organization.admin.create"
  | "organization.admin.disable"
  | "organization.global.read"
  | "stats.global.read"
  | "account.global.manage"
  | "diagnostic.profile.override"
  | "system.sensitive.manage";

export type TpaOrganizationScope = {
  organizationId?: string;
};

export type TpaAccessContext = {
  role: TpaAccessRole;
  organizationId?: string;
};

const ROLE_PERMISSIONS: Record<
  TpaAccessRole,
  readonly TpaPermission[]
> = {
  client: [
    "customer.profile.read",
    "customer.profile.update",
    "customer.vehicle.manage",
    "diagnostic.customer.use",
  ],

  seller: [
    "counter.use",
    "diagnostic.counter.use",
    "customer.lookup",
    "customer.create",
    "order.create",
  ],

  wholesaler_admin: [
    "organization.read",
    "organization.seller.create",
    "organization.seller.disable",
    "organization.seller.read",
    "organization.branch.read",
    "organization.branch.manage",
    "organization.stats.read",
    "organization.customer.stats.read",
  ],

  super_admin: [
    "organization.read",
    "organization.seller.create",
    "organization.seller.disable",
    "organization.seller.read",
    "organization.branch.read",
    "organization.branch.manage",
    "organization.stats.read",
    "organization.customer.stats.read",

    "organization.create",
    "organization.update",
    "organization.disable",
    "organization.admin.create",
    "organization.admin.disable",
    "organization.global.read",
    "stats.global.read",
    "account.global.manage",
    "diagnostic.profile.override",
    "system.sensitive.manage",

    "counter.use",
    "diagnostic.counter.use",
    "customer.lookup",
    "customer.create",
    "order.create",

    "customer.profile.read",
    "customer.profile.update",
    "customer.vehicle.manage",
    "diagnostic.customer.use",
  ],
};

export function permissionsForRole(
  role: TpaAccessRole,
): readonly TpaPermission[] {
  return ROLE_PERMISSIONS[role];
}

export function hasTpaPermission(
  role: TpaAccessRole,
  permission: TpaPermission,
): boolean {
  return ROLE_PERMISSIONS[role].includes(
    permission,
  );
}

export function canCreateRole(
  actorRole: TpaAccessRole,
  targetRole: TpaAccessRole,
): boolean {
  if (actorRole === "super_admin") {
    return (
      targetRole === "wholesaler_admin" ||
      targetRole === "seller"
    );
  }

  if (actorRole === "wholesaler_admin") {
    return targetRole === "seller";
  }

  return false;
}

export function canManageRole(
  actorRole: TpaAccessRole,
  targetRole: TpaAccessRole,
): boolean {
  if (actorRole === "super_admin") {
    return targetRole !== "super_admin";
  }

  if (actorRole === "wholesaler_admin") {
    return targetRole === "seller";
  }

  return false;
}

export function isOrganizationScopedRole(
  role: TpaAccessRole,
): boolean {
  return (
    role === "seller" ||
    role === "wholesaler_admin"
  );
}

export function canAccessOrganization(
  actor: TpaAccessContext,
  targetOrganizationId: string,
): boolean {
  if (actor.role === "super_admin") {
    return true;
  }

  if (
    !isOrganizationScopedRole(actor.role)
  ) {
    return false;
  }

  return (
    typeof actor.organizationId === "string" &&
    actor.organizationId.length > 0 &&
    actor.organizationId ===
      targetOrganizationId
  );
}

export function canCreateAccountInOrganization(
  actor: TpaAccessContext,
  targetRole: TpaAccessRole,
  targetOrganizationId: string,
): boolean {
  if (
    !canCreateRole(
      actor.role,
      targetRole,
    )
  ) {
    return false;
  }

  if (actor.role === "super_admin") {
    return true;
  }

  if (
    actor.role === "wholesaler_admin"
  ) {
    return (
      targetRole === "seller" &&
      actor.organizationId ===
        targetOrganizationId
    );
  }

  return false;
}

export function assertOrganizationAccess(
  actor: TpaAccessContext,
  targetOrganizationId: string,
): void {
  if (
    !canAccessOrganization(
      actor,
      targetOrganizationId,
    )
  ) {
    throw new Error(
      "ORGANIZATION_ACCESS_DENIED",
    );
  }
}

export function assertPermission(
  role: TpaAccessRole,
  permission: TpaPermission,
): void {
  if (
    !hasTpaPermission(
      role,
      permission,
    )
  ) {
    throw new Error(
      "TPA_PERMISSION_DENIED",
    );
  }
}