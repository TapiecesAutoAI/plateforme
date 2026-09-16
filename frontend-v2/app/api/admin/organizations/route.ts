import {
  randomBytes,
  randomUUID,
} from "node:crypto";

import { cookies } from "next/headers";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  assertPermission,
} from "../../../../lib/auth/TpaAccessControl";

import {
  findCentralCustomerByEmail,
  findCentralCustomerByPhone,
  saveCentralCustomer,
} from "../../../../lib/client/CentralCustomerStore";

import {
  findClientAccountByEmail,
  hashClientPassword,
  saveClientAccount,
} from "../../../../lib/client/ClientAccountStore";

import {
  saveOrganization,
  type OrganizationBranch,
} from "../../../../lib/organization/OrganizationStore";

import {
  findVatOwner,
  isBelgianVatFormatValid,
  isTpaFallbackVatNumber,
  normalizeVatNumber,
  registerVatNumber,
  releaseVatNumber,
} from "../../../../lib/organization/VatRegistry";

import {
  verifyTpaSessionToken,
} from "../../../../lib/session/TpaSessionToken";

function text(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

export async function POST(
  request: NextRequest,
) {
  const secret =
    process.env.TPA_SESSION_SECRET?.trim();

  if (!secret) {
    return NextResponse.json(
      {
        ok: false,
        error: "SESSION_NOT_CONFIGURED",
      },
      { status: 500 },
    );
  }

  const cookieStore =
    await cookies();

  const token =
    cookieStore.get("tpa_session")?.value;

  if (!token) {
    return NextResponse.json(
      {
        ok: false,
        error: "UNAUTHENTICATED",
      },
      { status: 401 },
    );
  }

  const session =
    verifyTpaSessionToken(
      token,
      secret,
    );

  if (
    !session ||
    session.accessRole !== "super_admin"
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "FORBIDDEN",
      },
      { status: 403 },
    );
  }

  try {
    assertPermission(
      session.accessRole,
      "organization.create",
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "FORBIDDEN",
      },
      { status: 403 },
    );
  }

  let body: Record<string, unknown>;

  try {
    body =
      await request.json() as Record<
        string,
        unknown
      >;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "INVALID_JSON",
      },
      { status: 400 },
    );
  }

  const name = text(body.name);
  const legalName = text(body.legalName);
  const vatNumber = text(body.vatNumber);

  const normalizedVatNumber =
    vatNumber
      ? normalizeVatNumber(vatNumber)
      : "";

  if (
    normalizedVatNumber &&
    !isTpaFallbackVatNumber(
      normalizedVatNumber,
    ) &&
    !isBelgianVatFormatValid(
      normalizedVatNumber,
    )
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "INVALID_BELGIAN_VAT_NUMBER",
      },
      { status: 400 },
    );
  }

  const registrationNumber =
    text(body.registrationNumber);

  const phone = text(body.phone);
  const email =
    text(body.email).toLowerCase();
  const website = text(body.website);

  const adminFirstName =
    text(body.adminFirstName);
  const adminLastName =
    text(body.adminLastName);
  const adminPhone =
    text(body.adminPhone);
  const adminEmail =
    text(body.adminEmail).toLowerCase();

  if (!name) {
    return NextResponse.json(
      {
        ok: false,
        error: "ORGANIZATION_NAME_REQUIRED",
      },
      { status: 400 },
    );
  }

  if (
    !adminFirstName ||
    !adminLastName ||
    !adminEmail ||
    !adminPhone
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "ADMIN_DETAILS_REQUIRED",
      },
      { status: 400 },
    );
  }

  const [
    existingAccount,
    existingCustomerEmail,
    existingCustomerPhone,
  ] = await Promise.all([
    findClientAccountByEmail(
      adminEmail,
    ),
    findCentralCustomerByEmail(
      adminEmail,
    ),
    findCentralCustomerByPhone(
      adminPhone,
    ),
  ]);

  if (
    existingAccount ||
    existingCustomerEmail
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "ADMIN_EMAIL_ALREADY_USED",
      },
      { status: 409 },
    );
  }

  if (existingCustomerPhone) {
    return NextResponse.json(
      {
        ok: false,
        error: "ADMIN_PHONE_ALREADY_USED",
      },
      { status: 409 },
    );
  }

  if (
    normalizedVatNumber &&
    !isTpaFallbackVatNumber(
      normalizedVatNumber,
    )
  ) {
    const existingVatOwner =
      await findVatOwner(
        normalizedVatNumber,
      );

    if (existingVatOwner) {
      return NextResponse.json(
        {
          ok: false,
          error: "VAT_NUMBER_ALREADY_USED",
        },
        { status: 409 },
      );
    }
  }

  const rawHeadOffice =
    typeof body.headOffice === "object" &&
    body.headOffice !== null
      ? body.headOffice as Record<
          string,
          unknown
        >
      : {};

  const headOffice = {
    street:
      text(rawHeadOffice.street),
    houseNumber:
      text(rawHeadOffice.houseNumber),
    box:
      text(rawHeadOffice.box),
    postalCode:
      text(rawHeadOffice.postalCode),
    city:
      text(rawHeadOffice.city),
    country:
      text(rawHeadOffice.country),
  };

  const rawBranches =
    Array.isArray(body.branches)
      ? body.branches
      : [];

  const branches:
    OrganizationBranch[] =
    rawBranches.map(
      (rawBranch) => {
        const branch =
          typeof rawBranch === "object" &&
          rawBranch !== null
            ? rawBranch as Record<
                string,
                unknown
              >
            : {};

        const rawAddress =
          typeof branch.address ===
            "object" &&
          branch.address !== null
            ? branch.address as Record<
                string,
                unknown
              >
            : {};

        return {
          branchId:
            `BR-${randomUUID()}`,

          name:
            text(branch.name) ||
            "Succursale",

          phone:
            text(branch.phone),

          email:
            text(
              branch.email,
            ).toLowerCase(),

          photoUrl:
            text(branch.photoUrl),

          status: "active",

          address: {
            street:
              text(rawAddress.street),
            houseNumber:
              text(
                rawAddress.houseNumber,
              ),
            box:
              text(rawAddress.box),
            postalCode:
              text(
                rawAddress.postalCode,
              ),
            city:
              text(rawAddress.city),
            country:
              text(rawAddress.country),
          },
        };
      },
    );

  const now =
    new Date().toISOString();

  const organizationId =
    `ORG-${randomUUID()}`;

  const customerId =
    `C-${randomUUID()}`;

  const temporaryPassword =
    `TPA-${randomBytes(9).toString(
      "base64url",
    )}-9!`;

  const password =
    await hashClientPassword(
      temporaryPassword,
    );

  if (
    normalizedVatNumber &&
    !isTpaFallbackVatNumber(
      normalizedVatNumber,
    )
  ) {
    try {
      await registerVatNumber(
        normalizedVatNumber,
        "organization",
        organizationId,
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "TPA_VAT_ALREADY_EXISTS"
      ) {
        return NextResponse.json(
          {
            ok: false,
            error: "VAT_NUMBER_ALREADY_USED",
          },
          { status: 409 },
        );
      }

      throw error;
    }
  }

  let organization;

  try {
    organization =
      await saveOrganization({
      organizationId,
      name,
      legalName:
        legalName || undefined,
      vatNumber:
        normalizedVatNumber ||
        undefined,
      registrationNumber:
        registrationNumber ||
        undefined,
      phone:
        phone || undefined,
      email:
        email || undefined,
      website:
        website || undefined,
      headOffice,
      branches,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    if (
      normalizedVatNumber &&
      !isTpaFallbackVatNumber(
        normalizedVatNumber,
      )
    ) {
      await releaseVatNumber(
        normalizedVatNumber,
        "organization",
        organizationId,
      );
    }

    throw error;
  }

  await saveCentralCustomer({
    customerId,
    firstName: adminFirstName,
    lastName: adminLastName,
    phone: adminPhone,
    email: adminEmail,

    marketingConsents: {
      email: {
        channel: "email",
        granted: false,
        recordedAt: now,
        source: "web",
        privacyVersion:
          "privacy-v1",
      },

      sms: {
        channel: "sms",
        granted: false,
        recordedAt: now,
        source: "web",
        privacyVersion:
          "privacy-v1",
      },
    },

    createdAt: now,
    updatedAt: now,
  });

  await saveClientAccount({
    customerId,
    role: "wholesaler_admin",
    organizationId,
    loginEmail: adminEmail,
    passwordHash:
      password.hash,
    passwordSalt:
      password.salt,
    passwordAlgorithm:
      "scrypt-v1",
    status: "active",
    verificationStatus:
      "verified",
    verificationSource:
      "web",
    verifiedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json(
    {
      ok: true,

      organization,

      administrator: {
        customerId,
        firstName:
          adminFirstName,
        lastName:
          adminLastName,
        loginEmail:
          adminEmail,
        role:
          "wholesaler_admin",
      },

      temporaryPassword,
    },
    { status: 201 },
  );
}