import { NextRequest, NextResponse } from "next/server";

import { getCentralCustomer } from "../../../../lib/client/CentralCustomerStore";
import { getClientAccount } from "../../../../lib/client/ClientAccountStore";
import { getOrganization } from "../../../../lib/organization/OrganizationStore";
import { verifyTpaSessionToken } from "../../../../lib/session/TpaSessionToken";

export async function GET(request: NextRequest) {
  const secret = process.env.TPA_SESSION_SECRET;

  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "SESSION_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  const token = request.cookies.get("tpa_session")?.value;

  if (!token) {
    return NextResponse.json(
      { ok: false, error: "UNAUTHENTICATED" },
      { status: 401 },
    );
  }

  const session = verifyTpaSessionToken(token, secret);

  if (
    !session ||
    session.accessRole !== "seller" ||
    !session.customerId ||
    !session.organizationId
  ) {
    return NextResponse.json(
      { ok: false, error: "SELLER_REQUIRED" },
      { status: 403 },
    );
  }

  const [organization, customer, account] = await Promise.all([
    getOrganization(session.organizationId),
    getCentralCustomer(session.customerId),
    getClientAccount(session.customerId),
  ]);

  if (!organization) {
    return NextResponse.json(
      { ok: false, error: "ORGANIZATION_NOT_FOUND" },
      { status: 404 },
    );
  }

  if (!customer) {
    return NextResponse.json(
      { ok: false, error: "CUSTOMER_NOT_FOUND" },
      { status: 404 },
    );
  }

  const displayName =
    `${customer.firstName} ${customer.lastName}`.trim() ||
    session.displayName ||
    "Vendeur";

  const primaryBranch =
    organization.branches?.find(
      (branch) =>
        branch.branchId ===
        account?.sellerBranchAssignment?.primaryBranchId,
    );

  return NextResponse.json({
    ok: true,

    seller: {
      customerId: customer.customerId,
      displayName,
      firstName: customer.firstName,
      userCode: account?.userCode ?? null,
      permissions: account?.sellerCounterSettings?.permissions ?? null,
      branchCode:
        primaryBranch?.branchCode ?? null,
    },

    organization: {
      organizationId: organization.organizationId,
      name: organization.name,
      logoUrl: organization.logoUrl ?? null,
    },
  });
}