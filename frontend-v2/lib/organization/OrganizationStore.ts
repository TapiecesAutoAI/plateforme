import { Redis } from "@upstash/redis";

import type {
  CustomerAddress,
} from "../client/CentralCustomerStore";

export type OrganizationStatus =
  | "active"
  | "disabled";

export type OrganizationTerminal = {
  terminalId: string;
  deviceCode?: string;
  printerName?: string;
  printerPath?: string;
  name: string;
  status: OrganizationStatus;
};

export type OrganizationCounter = {
  counterId: string;
  number: number;
  name?: string;
  status: OrganizationStatus;
};

export type OrganizationBranchStaffRole =
  | "secretary"
  | "sales_representative"
  | "driver"
  | "custom";

export type OrganizationBranchStaff = {
  staffId: string;
  firstName: string;
  lastName: string;
  role: OrganizationBranchStaffRole;
  customRoleLabel?: string;
  photoUrl?: string;
  phone?: string;
  email?: string;
  status: OrganizationStatus;
};

export type OrganizationBranch = {
  branchId: string;
  branchCode?: string;
  name: string;
  address?: CustomerAddress;
  phone?: string;
  email?: string;

  terminals?: OrganizationTerminal[];
  counters?: OrganizationCounter[];

  staff?: OrganizationBranchStaff[];

  status: OrganizationStatus;
};

export type Organization = {
  organizationId: string;
  organizationCode?: string;

  // Identité
  name: string;
  legalName?: string;
  vatNumber?: string;
  registrationNumber?: string;

  // Coordonnées
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;

  // Implantation
  headOffice?: CustomerAddress;
  branches?: OrganizationBranch[];

  status: OrganizationStatus;
  createdAt: string;
  updatedAt: string;
};

let redisInstance: Redis | null = null;

function getRedis(): Redis {
  if (redisInstance) {
    return redisInstance;
  }

  const url =
    process.env.UPSTASH_REDIS_REST_URL?.trim();

  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!url || !token) {
    throw new Error(
      "TPA Redis organization persistence is not configured.",
    );
  }

  redisInstance = new Redis({
    url,
    token,
  });

  return redisInstance;
}

function normalizeOrganizationId(
  organizationId: string,
): string {
  return organizationId.trim();
}

function organizationKey(
  organizationId: string,
): string {
  return `tpa:organization:${normalizeOrganizationId(
    organizationId,
  )}`;
}

function organizationIndexKey(): string {
  return "tpa:organizations";
}

function branchCodeSequenceKey(): string {
  return "tpa:branch-code-sequence";
}

export async function allocateBranchCode():
  Promise<string> {
  const redis = getRedis();

  const sequence =
    await redis.incr(
      branchCodeSequenceKey(),
    );

  return `G${String(sequence).padStart(
    2,
    "0",
  )}`;
}

function counterTicketSequenceKey(): string {
  return "tpa:counter-ticket-sequence";
}

export async function allocateCounterTicketNumber():
  Promise<string> {
  const sequence =
    await getRedis().incr(
      counterTicketSequenceKey(),
    );

  return `A${String(sequence).padStart(
    3,
    "0",
  )}`;
}
export async function saveOrganization(
  organization: Organization,
): Promise<Organization> {
  const redis = getRedis();

  const organizationId =
    normalizeOrganizationId(
      organization.organizationId,
    );

  const name =
    organization.name.trim();

  const organizationCode =
    organization.organizationCode
      ?.trim()
      .toUpperCase();

  if (!organizationId) {
    throw new Error(
      "TPA organizationId is required.",
    );
  }

  if (!name) {
    throw new Error(
      "TPA organization name is required.",
    );
  }

  const normalized: Organization = {
    ...organization,
    organizationId,
    organizationCode:
      organizationCode || undefined,
    name,
  };

  await Promise.all([
    redis.set(
      organizationKey(organizationId),
      normalized,
    ),
    redis.sadd(
      organizationIndexKey(),
      organizationId,
    ),
  ]);

  return normalized;
}

export async function getOrganization(
  organizationId: string,
): Promise<Organization | null> {
  const normalizedId =
    normalizeOrganizationId(
      organizationId,
    );

  if (!normalizedId) {
    return null;
  }

  return getRedis().get<Organization>(
    organizationKey(normalizedId),
  );
}

export async function listOrganizations():
  Promise<Organization[]> {
  const redis = getRedis();

  const organizationIds =
    await redis.smembers<string[]>(
      organizationIndexKey(),
    );

  if (
    !organizationIds ||
    organizationIds.length === 0
  ) {
    return [];
  }

  const organizations =
    await Promise.all(
      organizationIds.map(
        (organizationId) =>
          redis.get<Organization>(
            organizationKey(
              organizationId,
            ),
          ),
      ),
    );

  return organizations
    .filter(
      (
        organization,
      ): organization is Organization =>
        organization !== null,
    )
    .sort(
      (a, b) =>
        a.name.localeCompare(
          b.name,
          "fr",
        ),
    );
}
