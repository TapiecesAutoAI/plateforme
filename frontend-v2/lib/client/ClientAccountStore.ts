import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";

import { promisify } from "node:util";

import { Redis } from "@upstash/redis";

const scrypt =
  promisify(scryptCallback);

export type ClientAccountRole =
  | "client"
  | "seller"
  | "wholesaler_admin"
  | "super_admin"
  | "admin";

export type SellerCounterCapabilities = {
  generalAdvice: boolean;
  partsOrder: boolean;
  quickPurchase: boolean;
  pickup: boolean;
  merchandiseReturn: boolean;
  refund: boolean;
  diagnostic: boolean;
  professionalCustomer: boolean;
};

export type SellerCounterPermissions = {
  manualTicketSelection: boolean;
  viewFullQueue: boolean;
  counterSupervisor: boolean;
      deputySupervisor: boolean;
};

export type SellerCounterSettings = {
  capabilities: SellerCounterCapabilities;
  permissions: SellerCounterPermissions;
};

export type ClientAccount = {
  customerId: string;
  role?: ClientAccountRole;
  organizationId?: string;
  sellerCounterSettings?: SellerCounterSettings;

  sellerBranchAssignment?: {
    primaryBranchId?: string;
    allowedBranchIds: string[];
  };
  userCode?: string;
  loginEmail: string;

  passwordHash: string;
  passwordSalt: string;
  passwordAlgorithm: "scrypt-v1";

  status:
    | "active"
    | "disabled";

  verificationStatus:
    | "verified"
    | "pending_verification";

  verificationSource:
    | "web"
    | "showroom"
    | "counter";

  verifiedAt?: string;

  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
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
      "TPA Redis account persistence is not configured.",
    );
  }

  redisInstance = new Redis({
    url,
    token,
  });

  return redisInstance;
}

export function normalizeLoginEmail(
  email: string,
): string {
  return email
    .trim()
    .toLowerCase();
}

export function normalizeUserCode(
  userCode: string,
): string {
  return userCode
    .trim()
    .toUpperCase();
}

function userCodeIndexKey(
  userCode: string,
): string {
  return `tpa:account-usercode:${normalizeUserCode(userCode)}`;
}

function accountKey(
  customerId: string,
): string {
  return `tpa:account:${customerId.trim()}`;
}

function emailIndexKey(
  email: string,
): string {
  return `tpa:account-email:${normalizeLoginEmail(email)}`;
}

async function derivePasswordHash(
  password: string,
  salt: string,
): Promise<Buffer> {
  return (
    await scrypt(
      password,
      salt,
      64,
    )
  ) as Buffer;
}

export async function hashClientPassword(
  password: string,
): Promise<{
  hash: string;
  salt: string;
}> {
  const salt =
    randomBytes(16).toString("hex");

  const hash =
    await derivePasswordHash(
      password,
      salt,
    );

  return {
    salt,
    hash: hash.toString("hex"),
  };
}

export async function verifyClientPassword(
  password: string,
  account: ClientAccount,
): Promise<boolean> {
  if (
    account.passwordAlgorithm !==
    "scrypt-v1"
  ) {
    return false;
  }

  const candidate =
    await derivePasswordHash(
      password,
      account.passwordSalt,
    );

  const expected =
    Buffer.from(
      account.passwordHash,
      "hex",
    );

  if (
    candidate.length !==
    expected.length
  ) {
    return false;
  }

  return timingSafeEqual(
    candidate,
    expected,
  );
}

export async function getClientAccount(
  customerId: string,
): Promise<ClientAccount | null> {
  return getRedis().get<ClientAccount>(
    accountKey(customerId),
  );
}

export async function findClientAccountByEmail(
  email: string,
): Promise<ClientAccount | null> {
  const redis =
    getRedis();

  const customerId =
    await redis.get<string>(
      emailIndexKey(email),
    );

  if (!customerId) {
    return null;
  }

  return getClientAccount(customerId);
}

function userInitial(
  value: string,
): string {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .charAt(0)
    .toUpperCase();
}

export async function generateUserCode(
  firstName: string,
  lastName: string,
): Promise<string> {
  const firstInitial = userInitial(firstName);
  const lastInitial = userInitial(lastName);

  if (!firstInitial || !lastInitial) {
    throw new Error("USER_CODE_INITIALS_REQUIRED");
  }

  const sequence =
    await getRedis().incr(
      "tpa:account-usercode-sequence",
    );

  return `${firstInitial}${lastInitial}${String(sequence).padStart(2, "0")}`;
}

export async function findClientAccountByUserCode(
  userCode: string,
): Promise<ClientAccount | null> {
  const redis = getRedis();

  const customerId =
    await redis.get<string>(
      userCodeIndexKey(userCode),
    );

  if (!customerId) {
    return null;
  }

  return getClientAccount(customerId);
}

export async function saveClientAccount(
  account: ClientAccount,
): Promise<ClientAccount> {
  const redis =
    getRedis();

  const normalized: ClientAccount = {
    ...account,

    customerId:
      account.customerId.trim(),

    userCode:
      account.userCode
        ? normalizeUserCode(account.userCode)
        : undefined,

    loginEmail:
      normalizeLoginEmail(
        account.loginEmail,
      ),

    updatedAt:
      new Date().toISOString(),
  };

  if (normalized.userCode) {
    const existingOwner =
      await redis.get<string>(
        userCodeIndexKey(normalized.userCode),
      );

    if (
      existingOwner &&
      existingOwner !== normalized.customerId
    ) {
      throw new Error(
        "ACCOUNT_USER_CODE_ALREADY_EXISTS",
      );
    }
  }

  await Promise.all([
    redis.set(
      accountKey(
        normalized.customerId,
      ),
      normalized,
    ),

    redis.set(
      emailIndexKey(
        normalized.loginEmail,
      ),
      normalized.customerId,
    ),

    normalized.userCode
      ? redis.set(
          userCodeIndexKey(normalized.userCode),
          normalized.customerId,
        )
      : Promise.resolve(null),

    normalized.organizationId
      ? redis.sadd(
          `tpa:organization-accounts:${normalized.organizationId}`,
          normalized.customerId,
        )
      : Promise.resolve(0),
  ]);

  return normalized;
}

export async function listOrganizationAccounts(
  organizationId: string,
): Promise<ClientAccount[]> {
  const redis = getRedis();

  const customerIds =
    await redis.smembers(
      `tpa:organization-accounts:${organizationId.trim()}`,
    );

  if (customerIds.length === 0) {
    return [];
  }

  const accounts =
    await Promise.all(
      customerIds.map(
        (customerId) =>
          getClientAccount(customerId),
      ),
    );

  return accounts.filter(
    (account): account is ClientAccount =>
      account !== null &&
      account.organizationId ===
        organizationId.trim(),
  );
}

export async function markClientLogin(
  customerId: string,
): Promise<void> {
  const account =
    await getClientAccount(customerId);

  if (!account) {
    return;
  }

  await saveClientAccount({
    ...account,
    lastLoginAt:
      new Date().toISOString(),
  });
}