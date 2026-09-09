import { NextRequest, NextResponse } from "next/server";

import {
  getCentralCustomer,
  saveCentralCustomer,
} from "../../../../lib/client/CentralCustomerStore";

import { getOrganization } from "../../../../lib/organization/OrganizationStore";
import { verifyTpaSessionToken } from "../../../../lib/session/TpaSessionToken";

async function getSellerSession(request: NextRequest) {
  const secret = process.env.TPA_SESSION_SECRET;

  if (!secret) {
    return {
      error: NextResponse.json(
        { ok: false, error: "SESSION_NOT_CONFIGURED" },
        { status: 503 },
      ),
    };
  }

  const token = request.cookies.get("tpa_session")?.value;

  if (!token) {
    return {
      error: NextResponse.json(
        { ok: false, error: "UNAUTHENTICATED" },
        { status: 401 },
      ),
    };
  }

  const session = verifyTpaSessionToken(token, secret);

  if (
    !session ||
    session.accessRole !== "seller" ||
    !session.customerId ||
    !session.organizationId
  ) {
    return {
      error: NextResponse.json(
        { ok: false, error: "SELLER_REQUIRED" },
        { status: 403 },
      ),
    };
  }

  return { session };
}

export async function GET(request: NextRequest) {
  const auth = await getSellerSession(request);

  if ("error" in auth) {
    return auth.error;
  }

  const { session } = auth;

  const customerId = session.customerId;
  const organizationId = session.organizationId;

  if (!customerId || !organizationId) {
    return NextResponse.json(
      { ok: false, error: "SELLER_REQUIRED" },
      { status: 403 },
    );
  }

  const [customer, organization] = await Promise.all([
    getCentralCustomer(customerId),
    getOrganization(organizationId),
  ]);

  if (!customer) {
    return NextResponse.json(
      { ok: false, error: "CUSTOMER_NOT_FOUND" },
      { status: 404 },
    );
  }

  if (!organization) {
    return NextResponse.json(
      { ok: false, error: "ORGANIZATION_NOT_FOUND" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    profile: {
      customerId: customer.customerId,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      role: "seller",
      organizationId: organization.organizationId,
      organizationName: organization.name,
      logoUrl: organization.logoUrl ?? null,
    },
  });
}

export async function POST(request: NextRequest) {
  const auth = await getSellerSession(request);

  if ("error" in auth) {
    return auth.error;
  }

  const { session } = auth;

  const customerId = session.customerId;
  const organizationId = session.organizationId;

  if (!customerId || !organizationId) {
    return NextResponse.json(
      { ok: false, error: "SELLER_REQUIRED" },
      { status: 403 },
    );
  }

  let body: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "INVALID_BODY" },
      { status: 400 },
    );
  }

  const firstName =
    typeof body.firstName === "string"
      ? body.firstName.trim()
      : "";

  const lastName =
    typeof body.lastName === "string"
      ? body.lastName.trim()
      : "";

  const phone =
    typeof body.phone === "string"
      ? body.phone.trim()
      : "";

  if (!firstName || !lastName || !phone) {
    return NextResponse.json(
      { ok: false, error: "PROFILE_FIELDS_REQUIRED" },
      { status: 400 },
    );
  }

  const customer =
    await getCentralCustomer(customerId);

  if (!customer) {
    return NextResponse.json(
      { ok: false, error: "CUSTOMER_NOT_FOUND" },
      { status: 404 },
    );
  }

  try {
    const saved = await saveCentralCustomer({
      ...customer,

      // Email volontairement conservé :
      // le vendeur ne peut pas modifier son identifiant de connexion ici.
      email: customer.email,

      firstName,
      lastName,
      phone,
    });

    return NextResponse.json({
      ok: true,
      profile: {
        firstName: saved.firstName,
        lastName: saved.lastName,
        email: saved.email,
        phone: saved.phone,
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "CUSTOMER_PHONE_ALREADY_EXISTS"
    ) {
      return NextResponse.json(
        { ok: false, error: "PHONE_ALREADY_EXISTS" },
        { status: 409 },
      );
    }

    throw error;
  }
}