import {
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
  canAccessOrganization,
} from "../../../../lib/auth/TpaAccessControl";

import {
  allocateBranchCode,
  getOrganization,
  saveOrganization,
  type OrganizationBranch,
  type OrganizationStatus,
} from "../../../../lib/organization/OrganizationStore";

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

function text(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizeStatus(
  value: unknown,
): OrganizationStatus {
  return value === "disabled"
    ? "disabled"
    : "active";
}

export async function GET(
  request: NextRequest,
) {
  const session =
    await getSessionFromRequest(
      request,
    );
  if (!session || (session.accessRole !== "wholesaler_admin" && session.accessRole !== "super_admin")) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const requestedOrganizationId = request.nextUrl.searchParams.get("organizationId") ?? undefined;
  const targetOrganizationId = session.accessRole === "super_admin" ? requestedOrganizationId : session.organizationId;

  if (!targetOrganizationId || !canAccessOrganization({ role: session.accessRole, organizationId: session.organizationId }, targetOrganizationId)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  assertPermission(
    session.accessRole,
    "organization.branch.read",
  );

  const organization =
    await getOrganization(
      targetOrganizationId,
    );

  if (!organization) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "ORGANIZATION_NOT_FOUND",
      },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json({
    ok: true,
    organizationId:
      organization.organizationId,

    organizationCode:
      organization.organizationCode,

    organizationName:
      organization.name,
    storePhotoUrl:
      organization.storePhotoUrl ?? null,
    branches:
      organization.branches ?? [],
  });
}

export async function POST(
  request: NextRequest,
) {
  const session =
    await getSessionFromRequest(
      request,
    );
  if (!session || (session.accessRole !== "wholesaler_admin" && session.accessRole !== "super_admin")) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const requestedOrganizationId = request.nextUrl.searchParams.get("organizationId") ?? undefined;
  const targetOrganizationId = session.accessRole === "super_admin" ? requestedOrganizationId : session.organizationId;

  if (!targetOrganizationId || !canAccessOrganization({ role: session.accessRole, organizationId: session.organizationId }, targetOrganizationId)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  assertPermission(
    session.accessRole,
    "organization.branch.manage",
  );

  const organization =
    await getOrganization(
      targetOrganizationId,
    );

  if (!organization) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "ORGANIZATION_NOT_FOUND",
      },
      {
        status: 404,
      },
    );
  }

  const body =
    await request.json() as Record<
      string,
      unknown
    >;

  const name =
    text(body.name);

  if (!name) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "BRANCH_NAME_REQUIRED",
      },
      {
        status: 400,
      },
    );
  }

  const rawAddress =
    typeof body.address ===
      "object" &&
    body.address !== null
      ? body.address as Record<
          string,
          unknown
        >
      : {};

  const branch:
    OrganizationBranch = {
    branchId:
      `BR-${randomUUID()}`,

    branchCode:
      await allocateBranchCode(),

    name,

    photoUrl:
      text(body.photoUrl) ||
      undefined,

    phone:
      text(body.phone) ||
      undefined,

    email:
      text(
        body.email,
      ).toLowerCase() ||
      undefined,

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

    terminals: [],
    counters: [],

    status: "active",
  };

  const now =
    new Date().toISOString();

  const updated =
    await saveOrganization({
      ...organization,

      branches: [
        ...(organization.branches ??
          []),
        branch,
      ],

      updatedAt: now,
    });

  return NextResponse.json(
    {
      ok: true,
      branch,
      branches:
        updated.branches ?? [],
    },
    {
      status: 201,
    },
  );
}

export async function PATCH(
  request: NextRequest,
) {
  const session =
    await getSessionFromRequest(
      request,
    );
  if (!session || (session.accessRole !== "wholesaler_admin" && session.accessRole !== "super_admin")) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const requestedOrganizationId = request.nextUrl.searchParams.get("organizationId") ?? undefined;
  const targetOrganizationId = session.accessRole === "super_admin" ? requestedOrganizationId : session.organizationId;

  if (!targetOrganizationId || !canAccessOrganization({ role: session.accessRole, organizationId: session.organizationId }, targetOrganizationId)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  assertPermission(
    session.accessRole,
    "organization.branch.manage",
  );

  const organization =
    await getOrganization(
      targetOrganizationId,
    );

  if (!organization) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "ORGANIZATION_NOT_FOUND",
      },
      {
        status: 404,
      },
    );
  }

  const body =
    await request.json() as Record<
      string,
      unknown
    >;

  const branchId =
    text(body.branchId);

  if (!branchId) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "BRANCH_ID_REQUIRED",
      },
      {
        status: 400,
      },
    );
  }

  const branches =
    organization.branches ?? [];

  const current =
    branches.find(
      (branch) =>
        branch.branchId ===
        branchId,
    );

  if (!current) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "BRANCH_NOT_FOUND",
      },
      {
        status: 404,
      },
    );
  }

  const rawAddress =
    typeof body.address ===
      "object" &&
    body.address !== null
      ? body.address as Record<
          string,
          unknown
        >
      : null;

  const name =
    body.name === undefined
      ? current.name
      : text(body.name);

  if (!name) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "BRANCH_NAME_REQUIRED",
      },
      {
        status: 400,
      },
    );
  }

  const updatedBranch:
    OrganizationBranch = {
    ...current,

    name,

    photoUrl:
      body.photoUrl === undefined
        ? current.photoUrl
        : text(body.photoUrl) ||
          undefined,

    phone:
      body.phone === undefined
        ? current.phone
        : text(body.phone) ||
          undefined,

    email:
      body.email === undefined
        ? current.email
        : text(
            body.email,
          ).toLowerCase() ||
          undefined,

    status:
      body.status === undefined
        ? current.status
        : normalizeStatus(
            body.status,
          ),

    address:
      rawAddress === null
        ? current.address
        : {
            street:
              text(
                rawAddress.street,
              ),
            houseNumber:
              text(
                rawAddress.houseNumber,
              ),
            box:
              text(
                rawAddress.box,
              ),
            postalCode:
              text(
                rawAddress.postalCode,
              ),
            city:
              text(
                rawAddress.city,
              ),
            country:
              text(
                rawAddress.country,
              ),
          },
  };

  const updatedBranches =
    branches.map(
      (branch) =>
        branch.branchId ===
        branchId
          ? updatedBranch
          : branch,
    );

  await saveOrganization({
    ...organization,
    branches:
      updatedBranches,
    updatedAt:
      new Date().toISOString(),
  });

  return NextResponse.json({
    ok: true,
    branch:
      updatedBranch,
    branches:
      updatedBranches,
  });
}