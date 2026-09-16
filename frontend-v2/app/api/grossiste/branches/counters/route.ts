import {
  NextRequest,
  NextResponse,
} from "next/server";

import { randomUUID } from "crypto";

import {
  getOrganization,
  saveOrganization,
  type OrganizationCounter,
  type OrganizationStatus,
} from "../../../../../lib/organization/OrganizationStore";

import {
  verifyTpaSessionToken,
} from "../../../../../lib/session/TpaSessionToken";

import {
  assertPermission,
  canAccessOrganization,
} from "../../../../../lib/auth/TpaAccessControl";

function normalizeStatus(
  value: unknown,
): OrganizationStatus {
  return value === "disabled"
    ? "disabled"
    : "active";
}

async function getAuthorizedOrganization(
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

  const session =
    await verifyTpaSessionToken(
      token,
      secret,
    );

  if (!session || (session.accessRole !== "wholesaler_admin" && session.accessRole !== "super_admin")) {
    return null;
  }

  const requestedOrganizationId = request.nextUrl.searchParams.get("organizationId") ?? undefined;
  const targetOrganizationId = session.accessRole === "super_admin" ? requestedOrganizationId : session.organizationId;

  if (!targetOrganizationId || !canAccessOrganization({ role: session.accessRole, organizationId: session.organizationId }, targetOrganizationId)) {
    return null;
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
    return null;
  }

  return organization;
}

export async function POST(
  request: NextRequest,
) {
  const organization =
    await getAuthorizedOrganization(
      request,
    );

  if (!organization) {
    return NextResponse.json(
      {
        error: "Accès refusé.",
      },
      {
        status: 403,
      },
    );
  }

  const body =
    await request.json();

  const branchId =
    typeof body.branchId === "string"
      ? body.branchId.trim()
      : "";

  const number =
    Number(body.number);

  const name =
    typeof body.name === "string"
      ? body.name.trim()
      : "";

  if (
    !branchId ||
    !Number.isInteger(number) ||
    number <= 0
  ) {
    return NextResponse.json(
      {
        error:
          "Site et numéro de comptoir requis.",
      },
      {
        status: 400,
      },
    );
  }

  const branches =
    organization.branches ?? [];

  const branch =
    branches.find(
      (item) =>
        item.branchId === branchId,
    );

  if (!branch) {
    return NextResponse.json(
      {
        error: "Site introuvable.",
      },
      {
        status: 404,
      },
    );
  }

  const counters =
    branch.counters ?? [];

  if (
    counters.some(
      (counter) =>
        counter.number === number,
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Ce numéro de comptoir existe déjà sur ce site.",
      },
      {
        status: 409,
      },
    );
  }

  const counter: OrganizationCounter = {
    counterId:
      `COUNTER-${randomUUID()}`,
    number,
    name:
      name || `Comptoir ${number}`,
    status: "active",
  };

  const updatedBranches =
    branches.map(
      (item) =>
        item.branchId === branchId
          ? {
              ...item,
              counters: [
                ...(item.counters ?? []),
                counter,
              ],
            }
          : item,
    );

  await saveOrganization({
    ...organization,
    branches: updatedBranches,
    updatedAt:
      new Date().toISOString(),
  });

  return NextResponse.json({
    ok: true,
    counter,
  });
}

export async function PATCH(
  request: NextRequest,
) {
  const organization =
    await getAuthorizedOrganization(
      request,
    );

  if (!organization) {
    return NextResponse.json(
      {
        error: "Accès refusé.",
      },
      {
        status: 403,
      },
    );
  }

  const body =
    await request.json();

  const branchId =
    typeof body.branchId === "string"
      ? body.branchId.trim()
      : "";

  const counterId =
    typeof body.counterId === "string"
      ? body.counterId.trim()
      : "";

  if (!branchId || !counterId) {
    return NextResponse.json(
      {
        error:
          "Site et comptoir requis.",
      },
      {
        status: 400,
      },
    );
  }

  const branches =
    organization.branches ?? [];

  const branch =
    branches.find(
      (item) =>
        item.branchId === branchId,
    );

  if (!branch) {
    return NextResponse.json(
      {
        error: "Site introuvable.",
      },
      {
        status: 404,
      },
    );
  }

  const current =
    (branch.counters ?? []).find(
      (counter) =>
        counter.counterId ===
        counterId,
    );

  if (!current) {
    return NextResponse.json(
      {
        error:
          "Comptoir introuvable.",
      },
      {
        status: 404,
      },
    );
  }

  const nextNumber =
    body.number === undefined
      ? current.number
      : Number(body.number);

  if (
    !Number.isInteger(nextNumber) ||
    nextNumber <= 0
  ) {
    return NextResponse.json(
      {
        error:
          "Numéro de comptoir invalide.",
      },
      {
        status: 400,
      },
    );
  }

  const duplicate =
    (branch.counters ?? []).some(
      (counter) =>
        counter.counterId !==
          counterId &&
        counter.number ===
          nextNumber,
    );

  if (duplicate) {
    return NextResponse.json(
      {
        error:
          "Ce numéro de comptoir existe déjà sur ce site.",
      },
      {
        status: 409,
      },
    );
  }

  const updatedCounter:
    OrganizationCounter = {
      ...current,
      number: nextNumber,
      name:
        typeof body.name === "string"
          ? body.name.trim() ||
            `Comptoir ${nextNumber}`
          : current.name,
      status:
        body.status === undefined
          ? current.status
          : normalizeStatus(
              body.status,
            ),
    };

  const updatedBranches =
    branches.map(
      (item) =>
        item.branchId === branchId
          ? {
              ...item,
              counters:
                (
                  item.counters ?? []
                ).map(
                  (counter) =>
                    counter.counterId ===
                    counterId
                      ? updatedCounter
                      : counter,
                ),
            }
          : item,
    );

  await saveOrganization({
    ...organization,
    branches: updatedBranches,
    updatedAt:
      new Date().toISOString(),
  });

  return NextResponse.json({
    ok: true,
    counter: updatedCounter,
  });
}