import { Redis } from "@upstash/redis";

export type VatOwnerType =
  | "customer"
  | "organization";

export type VatOwner = {
  ownerType: VatOwnerType;
  ownerId: string;
  vatNumber: string;
  createdAt: string;
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
      "TPA Redis VAT persistence is not configured.",
    );
  }

  redisInstance = new Redis({
    url,
    token,
  });

  return redisInstance;
}

export function normalizeVatNumber(
  vatNumber: string,
): string {
  const normalized = vatNumber
    .trim()
    .toUpperCase()
    .replace(/[\s.\-\/]/g, "");

  if (/^\d{10}$/.test(normalized)) {
    return `BE${normalized}`;
  }

  return normalized;
}

export const TPA_FALLBACK_VAT_NUMBER =
  "BE0000000000";

export function isTpaFallbackVatNumber(
  vatNumber: string,
): boolean {
  return normalizeVatNumber(vatNumber) ===
    TPA_FALLBACK_VAT_NUMBER;
}

export function isBelgianVatFormatValid(
  vatNumber: string,
): boolean {
  const normalized =
    normalizeVatNumber(vatNumber);

  return /^BE\d{10}$/.test(normalized);
}

function vatKey(
  vatNumber: string,
): string {
  return `tpa:vat:${normalizeVatNumber(
    vatNumber,
  )}`;
}

export async function findVatOwner(
  vatNumber: string,
): Promise<VatOwner | null> {
  const normalized =
    normalizeVatNumber(vatNumber);

  if (!normalized) {
    return null;
  }

  return getRedis().get<VatOwner>(
    vatKey(normalized),
  );
}

export async function releaseVatNumber(
  vatNumber: string,
  ownerType: VatOwnerType,
  ownerId: string,
): Promise<boolean> {
  const redis = getRedis();

  const existing =
    await findVatOwner(vatNumber);

  if (
    !existing ||
    existing.ownerType !== ownerType ||
    existing.ownerId !== ownerId
  ) {
    return false;
  }

  await redis.del(
    vatKey(vatNumber),
  );

  return true;
}

export async function registerVatNumber(
  vatNumber: string,
  ownerType: VatOwnerType,
  ownerId: string,
): Promise<VatOwner> {
  const redis = getRedis();

  const normalized =
    normalizeVatNumber(vatNumber);

  if (!normalized) {
    throw new Error(
      "TPA_VAT_REQUIRED",
    );
  }

  const owner: VatOwner = {
    ownerType,
    ownerId: ownerId.trim(),
    vatNumber: normalized,
    createdAt:
      new Date().toISOString(),
  };

  const result = await redis.set(
    vatKey(normalized),
    owner,
    {
      nx: true,
    },
  );

  if (result !== "OK") {
    throw new Error(
      "TPA_VAT_ALREADY_EXISTS",
    );
  }

  return owner;
}