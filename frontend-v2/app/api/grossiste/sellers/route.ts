import {
  randomBytes,
  randomUUID,
} from "node:crypto";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  verifyTpaSessionToken,
} from "../../../../lib/session/TpaSessionToken";

import {
  assertPermission,
  canCreateAccountInOrganization,
} from "../../../../lib/auth/TpaAccessControl";

import {
  findCentralCustomerByEmail,
  findCentralCustomerByPhone,
  getCentralCustomer,
  saveCentralCustomer,
  type CustomerMarketingConsent,
} from "../../../../lib/client/CentralCustomerStore";

import {
  getOrganization,
} from "../../../../lib/organization/OrganizationStore";
import {
  findClientAccountByEmail,
  generateUserCode,
  getClientAccount,
  hashClientPassword,
  listOrganizationAccounts,
  saveClientAccount,
} from "../../../../lib/client/ClientAccountStore";

const PRIVACY_VERSION =
  "privacy-v1";

function createConsent(
  channel: "email" | "sms",
  recordedAt: string,
): CustomerMarketingConsent {
  return {
    channel,
    granted: false,
    recordedAt,
    source: "counter",
    privacyVersion:
      PRIVACY_VERSION,
  };
}

async function getSessionFromRequest(
  request: NextRequest,
) {
  const token =
    request.cookies.get(
      "tpa_session",
    )?.value;

  const secret =
    process.env
      .TPA_SESSION_SECRET;

  if (
    !token ||
    !secret
  ) {
    return null;
  }

  return verifyTpaSessionToken(
    token,
    secret,
  );
}

export async function GET(
  request: NextRequest,
) {
  const session =
    await getSessionFromRequest(
      request,
    );

  if (
    !session ||
    session.accessRole !==
      "wholesaler_admin" ||
    !session.organizationId
  ) {
    return NextResponse.json(
      {
        ok: false,
      },
      {
        status: 403,
      },
    );
  }

  assertPermission(
    session.accessRole,
    "organization.seller.read",
  );

  const accounts =
    await listOrganizationAccounts(
      session.organizationId,
    );

  const sellers =
    accounts.filter(
      (account) =>
        account.role === "seller",
    );

  const sellerCustomers =
    await Promise.all(
      sellers.map(
        (seller) =>
          getCentralCustomer(
            seller.customerId,
          ),
      ),
    );

  const customerById =
    new Map(
      sellerCustomers
        .filter(
          (
            customer,
          ): customer is NonNullable<
            typeof customer
          > =>
            customer !== null,
        )
        .map(
          (customer) => [
            customer.customerId,
            customer,
          ],
        ),
    );

  return NextResponse.json({
    ok: true,
    organizationId:
      session.organizationId,
    sellers: sellers.map(
      (seller) => ({
        customerId:
          seller.customerId,

        firstName:
          customerById.get(
            seller.customerId,
          )?.firstName,

        lastName:
          customerById.get(
            seller.customerId,
          )?.lastName,

        loginEmail:
          seller.loginEmail,
        userCode:
          seller.userCode,
        status:
          seller.status,
        createdAt:
          seller.createdAt,
        lastLoginAt:
          seller.lastLoginAt,

        sellerBranchAssignment:
          seller.sellerBranchAssignment ?? {
            primaryBranchId: undefined,
            allowedBranchIds: [],
          },

        sellerCounterSettings:
          seller.sellerCounterSettings ?? {
            capabilities: {
              generalAdvice: true,
              partsOrder: true,
              quickPurchase: true,
              pickup: false,
              merchandiseReturn: false,
              refund: false,
              diagnostic: true,
              professionalCustomer: false,
            },
            permissions: {
              manualTicketSelection: false,
              viewFullQueue: false,
              counterSupervisor: false,
        deputySupervisor: false,
            },
          },
      }),
    ),
  });
}

export async function POST(
  request: NextRequest,
) {
  const session =
    await getSessionFromRequest(
      request,
    );

  if (
    !session ||
    session.accessRole !==
      "wholesaler_admin" ||
    !session.organizationId
  ) {
    return NextResponse.json(
      {
        ok: false,
      },
      {
        status: 403,
      },
    );
  }

  assertPermission(
    session.accessRole,
    "organization.seller.create",
  );

  if (
    !canCreateAccountInOrganization(
      {
        role:
          session.accessRole,
        organizationId:
          session.organizationId,
      },
      "seller",
      session.organizationId,
    )
  ) {
    return NextResponse.json(
      {
        ok: false,
      },
      {
        status: 403,
      },
    );
  }

  const body =
    await request.json()
      .catch(
        () => null,
      );

  if (
    !body ||
    typeof body.firstName !==
      "string" ||
    typeof body.lastName !==
      "string" ||
    typeof body.email !==
      "string" ||
    typeof body.phone !==
      "string"
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "INVALID_INPUT",
      },
      {
        status: 400,
      },
    );
  }

  const firstName =
    body.firstName.trim();

  const lastName =
    body.lastName.trim();

  const email =
    body.email
      .trim()
      .toLowerCase();

  const phone =
    body.phone.trim();

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "MISSING_FIELDS",
      },
      {
        status: 400,
      },
    );
  }

  const [
    existingAccount,
    existingCustomer,
    existingPhoneCustomer,
  ] = await Promise.all([
    findClientAccountByEmail(
      email,
    ),
    findCentralCustomerByEmail(
      email,
    ),
    findCentralCustomerByPhone(
      phone,
    ),
  ]);

  if (
    existingAccount ||
    existingCustomer
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "EMAIL_ALREADY_EXISTS",
      },
      {
        status: 409,
      },
    );
  }

  if (existingPhoneCustomer) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "PHONE_ALREADY_EXISTS",
      },
      {
        status: 409,
      },
    );
  }

  const temporaryPassword =
    `TPA-${randomBytes(9).toString(
      "base64url",
    )}-9!`;

  const passwordData =
    await hashClientPassword(
      temporaryPassword,
    );

  const customerId =
    `C-${randomUUID()}`;

  const now =
    new Date().toISOString();

  await saveCentralCustomer({
    customerId,
    firstName,
    lastName,
    phone,
    email,

    marketingConsents: {
      email: createConsent(
        "email",
        now,
      ),

      sms: createConsent(
        "sms",
        now,
      ),
    },

    createdAt: now,
    updatedAt: now,
  });

  const userCode =
    await generateUserCode(
      firstName,
      lastName,
    );

  await saveClientAccount({
    customerId,
    userCode,

    role:
      "seller",

    organizationId:
      session.organizationId,

    loginEmail:
      email,

    passwordHash:
      passwordData.hash,

    passwordSalt:
      passwordData.salt,

    passwordAlgorithm:
      "scrypt-v1",

    status:
      "active",

    verificationStatus:
      "verified",

    verificationSource:
      "counter",

    verifiedAt:
      now,

    createdAt:
      now,

    updatedAt:
      now,
  });

  return NextResponse.json({
    ok: true,
    seller: {
      customerId,
      loginEmail:
        email,
      userCode,
      organizationId:
        session.organizationId,
      role:
        "seller",
    },

    temporaryPassword,
  });
}

export async function PATCH(
  request: NextRequest,
) {
  const session =
    await getSessionFromRequest(
      request,
    );

  if (
    !session ||
    session.accessRole !==
      "wholesaler_admin" ||
    !session.organizationId
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "FORBIDDEN",
      },
      {
        status: 403,
      },
    );
  }

  assertPermission(
    session.accessRole,
    "organization.seller.create",
  );

  const body =
    await request.json()
      .catch(() => null);

  if (
    !body ||
    typeof body.customerId !== "string" ||
    (
      (
        !body.sellerCounterSettings ||
        typeof body.sellerCounterSettings !== "object"
      ) &&
      (
        !body.sellerBranchAssignment ||
        typeof body.sellerBranchAssignment !== "object"
      ) &&
      (
        !body.identity ||
        typeof body.identity !== "object"
      )
      && typeof body.newPassword !== "string"
    )
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "INVALID_INPUT",
      },
      {
        status: 400,
      },
    );
  }

  const seller =
    await getClientAccount(
      body.customerId,
    );

  if (
    !seller ||
    seller.role !== "seller" ||
    seller.organizationId !==
      session.organizationId
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "SELLER_NOT_FOUND",
      },
      {
        status: 404,
      },
    );
  }

  if (typeof body.newPassword === "string") {
    const newPassword =
      body.newPassword.trim();

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          ok: false,
          error: "PASSWORD_TOO_SHORT",
        },
        {
          status: 400,
        },
      );
    }

    const passwordData =
      await hashClientPassword(
        newPassword,
      );

    await saveClientAccount({
      ...seller,
      passwordHash:
        passwordData.hash,
      passwordSalt:
        passwordData.salt,
      passwordAlgorithm:
        "scrypt-v1",
      updatedAt:
        new Date().toISOString(),
    });

    return NextResponse.json({
      ok: true,
      passwordReset: true,
    });
  }

  const identity =
    body.identity &&
    typeof body.identity === "object"
      ? body.identity
      : null;

  if (identity) {
    const customer =
      await getCentralCustomer(
        seller.customerId,
      );

    if (!customer) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "CUSTOMER_NOT_FOUND",
        },
        {
          status: 404,
        },
      );
    }

    const firstName =
      typeof identity.firstName === "string"
        ? identity.firstName.trim()
        : customer.firstName;

    const lastName =
      typeof identity.lastName === "string"
        ? identity.lastName.trim()
        : customer.lastName;

    if (
      !firstName ||
      !lastName
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "SELLER_NAME_REQUIRED",
        },
        {
          status: 400,
        },
      );
    }

    await saveCentralCustomer({
      ...customer,
      firstName,
      lastName,
      updatedAt:
        new Date().toISOString(),
    });
  }

  const capabilities =
    body.sellerCounterSettings
      ?.capabilities ??
    seller.sellerCounterSettings
      ?.capabilities ??
    {};

  const permissions =
    body.sellerCounterSettings
      ?.permissions ??
    seller.sellerCounterSettings
      ?.permissions ??
    {};

  const sellerCounterSettings = {
    capabilities: {
      generalAdvice:
        capabilities.generalAdvice === true,
      partsOrder:
        capabilities.partsOrder === true,
      quickPurchase:
        capabilities.quickPurchase === true,
      pickup:
        capabilities.pickup === true,
      merchandiseReturn:
        capabilities.merchandiseReturn === true,
      refund:
        capabilities.refund === true,
      diagnostic:
        capabilities.diagnostic === true,
      professionalCustomer:
        capabilities.professionalCustomer === true,
    },

    permissions: {
      manualTicketSelection:
        permissions.manualTicketSelection === true,
      viewFullQueue:
        permissions.viewFullQueue === true,
      counterSupervisor:
        permissions.counterSupervisor === true,
          deputySupervisor:
            permissions.deputySupervisor === true,
    },
  };

  const organization =
    await getOrganization(
      session.organizationId,
    );

  if (!organization) {
    return NextResponse.json(
      {
        ok: false,
        error: "ORGANIZATION_NOT_FOUND",
      },
      {
        status: 404,
      },
    );
  }

  const validBranchIds =
    new Set(
      (organization.branches ?? [])
        .map((branch) => branch.branchId),
    );

  const rawBranchAssignment =
    body.sellerBranchAssignment &&
    typeof body.sellerBranchAssignment === "object"
      ? body.sellerBranchAssignment
      : null;

  let sellerBranchAssignment =
    seller.sellerBranchAssignment;

  if (rawBranchAssignment) {
    const requestedPrimary =
      typeof rawBranchAssignment.primaryBranchId === "string"
        ? rawBranchAssignment.primaryBranchId.trim()
        : "";

    const requestedAllowed =
      Array.isArray(rawBranchAssignment.allowedBranchIds)
        ? rawBranchAssignment.allowedBranchIds
            .filter(
              (value: unknown): value is string =>
                typeof value === "string",
            )
            .map((value: string) => value.trim())
            .filter(
              (value: string) =>
                Boolean(value) &&
                validBranchIds.has(value),
            )
        : [];

    if (
      requestedPrimary &&
      !validBranchIds.has(requestedPrimary)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "INVALID_PRIMARY_BRANCH",
        },
        {
          status: 400,
        },
      );
    }

    const allowedBranchIds =
      Array.from(
        new Set([
          ...requestedAllowed,
          ...(requestedPrimary
            ? [requestedPrimary]
            : []),
        ]),
      );

    sellerBranchAssignment = {
      primaryBranchId:
        requestedPrimary || undefined,
      allowedBranchIds,
    };
  }

  const isSupervisor =
    sellerCounterSettings
      .permissions
      .counterSupervisor === true;

  const isDeputy =
    sellerCounterSettings
      .permissions
      .deputySupervisor === true;

  if (
    isSupervisor &&
    isDeputy
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "SELLER_ROLE_CONFLICT",
        message:
          "Un vendeur ne peut pas être à la fois Responsable et Adjoint.",
      },
      {
        status: 409,
      },
    );
  }

  const primaryBranchId =
    sellerBranchAssignment
      ?.primaryBranchId;

  if (
    primaryBranchId &&
    (
      isSupervisor ||
      isDeputy
    )
  ) {
    const organizationAccounts =
      await listOrganizationAccounts(
        session.organizationId,
      );

    const otherBranchSellers =
      organizationAccounts.filter(
        (account) =>
          account.role === "seller" &&
          account.customerId !==
            seller.customerId &&
          account
            .sellerBranchAssignment
            ?.primaryBranchId ===
            primaryBranchId,
      );

    if (isSupervisor) {
      const existingSupervisor =
        otherBranchSellers.find(
          (account) =>
            account
              .sellerCounterSettings
              ?.permissions
              .counterSupervisor ===
            true,
        );

      if (existingSupervisor) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "BRANCH_SUPERVISOR_ALREADY_ASSIGNED",
            message:
              "Ce magasin possède déjà un Responsable.",
          },
          {
            status: 409,
          },
        );
      }
    }

    if (isDeputy) {
      const existingDeputy =
        otherBranchSellers.find(
          (account) =>
            account
              .sellerCounterSettings
              ?.permissions
              .deputySupervisor ===
            true,
        );

      if (existingDeputy) {
        const existingDeputyName =
          existingDeputy.userCode ||
          existingDeputy.customerId;

        console.log(
          "[TPA] ADJOINT EXISTANT",
          {
            primaryBranchId,
            customerId:
              existingDeputy.customerId,
            userCode:
              existingDeputy.userCode,
            name:
              existingDeputyName,
          },
        );

        return NextResponse.json(
          {
            ok: false,
            error:
              "BRANCH_DEPUTY_ALREADY_ASSIGNED",
            message:
              `Ce magasin possède déjà un Adjoint : ${existingDeputyName}.`,
          },
          {
            status: 409,
          },
        );
      }
    }
  }

  const updated =
    await saveClientAccount({
      ...seller,
      sellerCounterSettings,
      sellerBranchAssignment,
      updatedAt:
        new Date().toISOString(),
    });

  return NextResponse.json({
    ok: true,

    seller: {
      customerId:
        updated.customerId,

      sellerCounterSettings:
        updated.sellerCounterSettings,

      sellerBranchAssignment:
        updated.sellerBranchAssignment,
    },
  });
}
