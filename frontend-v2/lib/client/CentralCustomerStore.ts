import { Redis } from "@upstash/redis";

export type CustomerConsentChannel =
  | "email"
  | "sms";

export type CustomerConsentSource =
  | "web"
  | "showroom"
  | "counter";

export type CustomerMarketingConsent = {
  channel: CustomerConsentChannel;
  granted: boolean;
  recordedAt: string;
  source: CustomerConsentSource;
  privacyVersion: string;
  withdrawnAt?: string;
};

export type CustomerDiagnosticProfile =
  | "particulier"
  | "bricoleur"
  | "vendeur-pieces-auto"
  | "mecanicien-garage";
export type CustomerAddress = {
  street?: string;
  houseNumber?: string;
  box?: string;
  postalCode?: string;
  city?: string;
  country?: string;
};

export type CustomerCompany = {
  customerType?:
    | "individual"
    | "company";

  companyName?: string;
  vatNumber?: string;
  registrationNumber?: string;
};

export type CustomerPreferences = {
  language?: string;
  preferredContactChannel?:
    | "email"
    | "sms"
    | "phone";
};

export type CustomerProfile = {
  diagnosticProfile?: CustomerDiagnosticProfile;
  birthDate?: string;

  address?: CustomerAddress;

  billingAddress?: CustomerAddress;

  company?: CustomerCompany;

  preferences?: CustomerPreferences;
};
export type CentralCustomer = {
  customerId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;

  marketingConsents: {
    email: CustomerMarketingConsent;
    sms: CustomerMarketingConsent;
  };

  /**
   * Données complémentaires facultatives.
   * Utilisées par le web, showroom et comptoir
   * via le même customerId central.
   */
  profile?: CustomerProfile;

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
      "TPA Redis customer persistence is not configured.",
    );
  }

  redisInstance = new Redis({
    url,
    token,
  });

  return redisInstance;
}

function normalizeEmail(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase();
}

function normalizePhone(
  value: string,
): string {
  return value
    .replace(/[^\d+]/g, "")
    .trim();
}

function customerKey(
  customerId: string,
): string {
  return `tpa:customer:${customerId}`;
}

function emailIndexKey(
  email: string,
): string {
  return `tpa:customer-email:${normalizeEmail(email)}`;
}

function phoneIndexKey(
  phone: string,
): string {
  return `tpa:customer-phone:${normalizePhone(phone)}`;
}

export async function saveCentralCustomer(
  customer: CentralCustomer,
): Promise<CentralCustomer> {
  const redis = getRedis();

  const normalized: CentralCustomer = {
    ...customer,
    customerId:
      customer.customerId.trim(),
    firstName:
      customer.firstName.trim(),
    lastName:
      customer.lastName.trim(),
    phone:
      normalizePhone(customer.phone),
    email:
      normalizeEmail(customer.email),
    updatedAt:
      new Date().toISOString(),
  };

  const [
    emailOwner,
    phoneOwner,
    existingCustomer,
  ] = await Promise.all([
    redis.get<string>(
      emailIndexKey(normalized.email),
    ),
    redis.get<string>(
      phoneIndexKey(normalized.phone),
    ),
    redis.get<CentralCustomer>(
      customerKey(normalized.customerId),
    ),
  ]);

  if (
    emailOwner &&
    emailOwner !== normalized.customerId
  ) {
    throw new Error(
      "CUSTOMER_EMAIL_ALREADY_EXISTS",
    );
  }

  if (
    phoneOwner &&
    phoneOwner !== normalized.customerId
  ) {
    throw new Error(
      "CUSTOMER_PHONE_ALREADY_EXISTS",
    );
  }

  if (
    existingCustomer &&
    existingCustomer.email !==
      normalized.email
  ) {
    await redis.del(
      emailIndexKey(
        existingCustomer.email,
      ),
    );
  }

  if (
    existingCustomer &&
    existingCustomer.phone !==
      normalized.phone
  ) {
    await redis.del(
      phoneIndexKey(
        existingCustomer.phone,
      ),
    );
  }

  await Promise.all([
    redis.set(
      customerKey(normalized.customerId),
      normalized,
    ),

    redis.set(
      emailIndexKey(normalized.email),
      normalized.customerId,
    ),

    redis.set(
      phoneIndexKey(normalized.phone),
      normalized.customerId,
    ),
  ]);

  return normalized;
}

export async function getCentralCustomer(
  customerId: string,
): Promise<CentralCustomer | null> {
  return getRedis().get<CentralCustomer>(
    customerKey(customerId.trim()),
  );
}

export async function findCentralCustomerByEmail(
  email: string,
): Promise<CentralCustomer | null> {
  const redis = getRedis();

  const customerId =
    await redis.get<string>(
      emailIndexKey(email),
    );

  if (!customerId) {
    return null;
  }

  return getCentralCustomer(customerId);
}

export async function findCentralCustomerByPhone(
  phone: string,
): Promise<CentralCustomer | null> {
  const redis = getRedis();

  const customerId =
    await redis.get<string>(
      phoneIndexKey(phone),
    );

  if (!customerId) {
    return null;
  }

  return getCentralCustomer(customerId);
}