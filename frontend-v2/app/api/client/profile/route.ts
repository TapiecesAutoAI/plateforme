import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  verifyTpaSessionToken,
} from "../../../../lib/session/TpaSessionToken";

import {
  getCentralCustomer,
  saveCentralCustomer,
  type CentralCustomer,
  type CustomerMarketingConsent,
  type CustomerAddress,
  type CustomerCompany,
  type CustomerPreferences,
  type CustomerDiagnosticProfile,
} from "../../../../lib/client/CentralCustomerStore";

import {
  authorizeDiagnosticProfile,
} from "../../../../lib/client/CustomerDiagnosticProfilePolicy";


function getAuthenticatedSession(
  request: NextRequest,
) {
  const secret =
    process.env.TPA_SESSION_SECRET;

  if (!secret) {
    return null;
  }

  const token =
    request.cookies.get(
      "tpa_session",
    )?.value;

  if (!token) {
    return null;
  }

  const session =
    verifyTpaSessionToken(
      token,
      secret,
    );

  if (
    !session ||
    typeof session.customerId !== "string"
  ) {
    return null;
  }

  return session;
}

function optionalText(
  value: unknown,
): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized =
    value.trim();

  return normalized || undefined;
}


function cleanAddress(
  value: unknown,
): CustomerAddress | undefined {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return undefined;
  }

  const source =
    value as Record<string, unknown>;

  const address: CustomerAddress = {
    street:
      optionalText(source.street),

    houseNumber:
      optionalText(source.houseNumber),

    box:
      optionalText(source.box),

    postalCode:
      optionalText(source.postalCode),

    city:
      optionalText(source.city),

    country:
      optionalText(source.country),
  };

  const hasValue =
    Object.values(address).some(Boolean);

  return hasValue
    ? address
    : undefined;
}


function cleanCompany(
  value: unknown,
): CustomerCompany | undefined {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return undefined;
  }

  const source =
    value as Record<string, unknown>;

  const customerType =
    source.customerType === "individual" ||
    source.customerType === "company"
      ? source.customerType
      : undefined;

  const company: CustomerCompany = {
    customerType,

    companyName:
      optionalText(
        source.companyName,
      ),

    vatNumber:
      optionalText(
        source.vatNumber,
      ),

    registrationNumber:
      optionalText(
        source.registrationNumber,
      ),
  };

  const hasValue =
    Object.values(company).some(Boolean);

  return hasValue
    ? company
    : undefined;
}


function cleanPreferences(
  value: unknown,
): CustomerPreferences | undefined {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return undefined;
  }

  const source =
    value as Record<string, unknown>;

  const preferredContactChannel =
    source.preferredContactChannel === "email" ||
    source.preferredContactChannel === "sms" ||
    source.preferredContactChannel === "phone"
      ? source.preferredContactChannel
      : undefined;

  const preferences: CustomerPreferences = {
    language:
      optionalText(source.language),

    preferredContactChannel,
  };

  const hasValue =
    Object.values(preferences).some(Boolean);

  return hasValue
    ? preferences
    : undefined;
}


function publicCustomer(
  customer: CentralCustomer,
) {
  return {
    customerId:
      customer.customerId,

    firstName:
      customer.firstName,

    lastName:
      customer.lastName,

    phone:
      customer.phone,

    email:
      customer.email,

    diagnosticProfile:
      customer.profile?.diagnosticProfile ?? null,

    birthDate:
      customer.profile?.birthDate ?? "",

    address:
      customer.profile?.address ?? {},

    billingAddress:
      customer.profile?.billingAddress ?? {},

    company:
      customer.profile?.company ?? {},

    preferences:
      customer.profile?.preferences ?? {},

    marketingEmail:
      customer.marketingConsents.email.granted,

    marketingSms:
      customer.marketingConsents.sms.granted,

    createdAt:
      customer.createdAt,

    updatedAt:
      customer.updatedAt,
  };
}


export async function GET(
  request: NextRequest,
) {
  if (!process.env.TPA_SESSION_SECRET) {
    return NextResponse.json(
      {
        ok: false,
        error: "SESSION_NOT_CONFIGURED",
      },
      {
        status: 503,
      },
    );
  }

  const session =
    getAuthenticatedSession(request);

  if (!session) {
    return NextResponse.json(
      {
        ok: false,
        error: "UNAUTHENTICATED",
      },
      {
        status: 401,
      },
    );
  }

  const customerId =
    session.customerId as string;

  const customer =
    await getCentralCustomer(customerId);

  if (!customer) {
    return NextResponse.json(
      {
        ok: false,
        error: "CUSTOMER_NOT_FOUND",
      },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json({
    ok: true,
    customer:
      publicCustomer(customer),
  });
}


export async function PATCH(
  request: NextRequest,
) {
  if (!process.env.TPA_SESSION_SECRET) {
    return NextResponse.json(
      {
        ok: false,
        error: "SESSION_NOT_CONFIGURED",
      },
      {
        status: 503,
      },
    );
  }

  const session =
    getAuthenticatedSession(request);

  if (!session) {
    return NextResponse.json(
      {
        ok: false,
        error: "UNAUTHENTICATED",
      },
      {
        status: 401,
      },
    );
  }

  const customerId =
    session.customerId as string;

  const existing =
    await getCentralCustomer(customerId);

  if (!existing) {
    return NextResponse.json(
      {
        ok: false,
        error: "CUSTOMER_NOT_FOUND",
      },
      {
        status: 404,
      },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "INVALID_JSON",
      },
      {
        status: 400,
      },
    );
  }

  if (
    !body ||
    typeof body !== "object"
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "INVALID_PROFILE",
      },
      {
        status: 400,
      },
    );
  }

  const data =
    body as Record<string, unknown>;

  const firstName =
    typeof data.firstName === "string"
      ? data.firstName.trim()
      : "";

  const lastName =
    typeof data.lastName === "string"
      ? data.lastName.trim()
      : "";

  const phone =
    typeof data.phone === "string"
      ? data.phone.trim()
      : "";

  if (
    !firstName ||
    !lastName ||
    !phone
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "PROFILE_FIELDS_REQUIRED",
      },
      {
        status: 400,
      },
    );
  }


  const birthDate =
    optionalText(
      data.birthDate,
    );

  const address =
    cleanAddress(
      data.address,
    );

  const billingAddress =
    cleanAddress(
      data.billingAddress,
    );

  const company =
    cleanCompany(
      data.company,
    );

  const preferences =
    cleanPreferences(
      data.preferences,
    );


  const requestedDiagnosticProfile =
    data.diagnosticProfile === "particulier" ||
    data.diagnosticProfile === "bricoleur" ||
    data.diagnosticProfile === "mecanicien-garage" ||
    data.diagnosticProfile === "vendeur-pieces-auto"
      ? data.diagnosticProfile as CustomerDiagnosticProfile
      : existing.profile?.diagnosticProfile;

  let diagnosticProfile =
    existing.profile?.diagnosticProfile;

  if (requestedDiagnosticProfile) {
    const authorization =
      authorizeDiagnosticProfile({
        requestedProfile:
          requestedDiagnosticProfile,
        company,
        sessionRole:
          session.role,
      });

    if (!authorization.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error:
            authorization.error,
          message:
            authorization.message,
        },
        {
          status: 403,
        },
      );
    }

    diagnosticProfile =
      authorization.profile;
  }


  const marketingEmail =
    data.marketingEmail === true;

  const marketingSms =
    data.marketingSms === true;

  const now =
    new Date().toISOString();


  function consent(
    previous: CustomerMarketingConsent,
    granted: boolean,
  ): CustomerMarketingConsent {
    if (
      previous.granted === granted
    ) {
      return previous;
    }

    return {
      channel:
        previous.channel,

      granted,

      recordedAt:
        now,

      source:
        "web",

      privacyVersion:
        previous.privacyVersion,

      ...(granted
        ? {}
        : {
            withdrawnAt: now,
          }),
    };
  }


  try {
    const saved =
      await saveCentralCustomer({
        ...existing,

        firstName,
        lastName,
        phone,

        profile: {
          diagnosticProfile,
          birthDate,
          address,
          billingAddress,
          company,
          preferences,
        },

        marketingConsents: {
          email:
            consent(
              existing.marketingConsents.email,
              marketingEmail,
            ),

          sms:
            consent(
              existing.marketingConsents.sms,
              marketingSms,
            ),
        },
      });

    return NextResponse.json({
      ok: true,
      customer:
        publicCustomer(saved),
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "CUSTOMER_PHONE_ALREADY_EXISTS"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "PHONE_ALREADY_USED",
        },
        {
          status: 409,
        },
      );
    }

    console.error(
      "TPA client profile update failed",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error: "PROFILE_UPDATE_FAILED",
      },
      {
        status: 500,
      },
    );
  }
}