import {
  randomUUID,
} from "node:crypto";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  verifyTpaSessionToken,
} from "../../../../../lib/session/TpaSessionToken";

import {
  assertPermission,
  canAccessOrganization,
} from "../../../../../lib/auth/TpaAccessControl";

import {
  getOrganization,
  saveOrganization,
  type OrganizationBranchStaff,
  type OrganizationBranchStaffRole,
  type OrganizationStatus,
} from "../../../../../lib/organization/OrganizationStore";

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

function normalizeRole(
  value: unknown,
): OrganizationBranchStaffRole | null {
  if (
    value === "secretary" ||
    value === "sales_representative" ||
    value === "driver" ||
    value === "custom"
  ) {
    return value;
  }

  return null;
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
    await request.json()
      .catch(() => null);

  if (
    !body ||
    typeof body !== "object"
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

  const branchId =
    text(body.branchId);

  const firstName =
    text(body.firstName);

  const lastName =
    text(body.lastName);

  const role =
    normalizeRole(body.role);

  if (
    !branchId ||
    !firstName ||
    !lastName ||
    !role
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

  const branches =
    organization.branches ?? [];

  const branch =
    branches.find(
      (item) =>
        item.branchId ===
        branchId,
    );

  if (!branch) {
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

  const staff:
    OrganizationBranchStaff = {
    staffId:
      `STAFF-${randomUUID()}`,

    firstName,
    lastName,
    photoUrl:
      text(body.photoUrl) || undefined,

    role,

    customRoleLabel:
      role === "custom"
        ? text(body.customRoleLabel)
        : undefined,

    phone:
      text(body.phone) ||
      undefined,

    email:
      text(body.email)
        .toLowerCase() ||
      undefined,

    status:
      "active",

    hrProfile: {
      jobTitle: text(body.jobTitle) || undefined,
      employmentStartDate: text(body.employmentStartDate) || undefined,
      familyStatus: text(body.familyStatus) || undefined,
      bankAccountHolder: text(body.bankAccountHolder) || undefined,
      iban: text(body.iban) || undefined,
      emergencyContactName: text(body.emergencyContactName) || undefined,
      emergencyContactPhone: text(body.emergencyContactPhone) || undefined,
    },
    assignments: Array.isArray(body.assignments)
      ? body.assignments.filter((item: unknown) => typeof item === "string")
      : [],
  };

  const updatedBranches =
    branches.map(
      (item) =>
        item.branchId ===
        branchId
          ? {
              ...item,
              staff: [
                ...(item.staff ?? []),
                staff,
              ],
            }
          : item,
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
    staff,
  });
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
    await request.json()
      .catch(() => null);

  if (
    !body ||
    typeof body !== "object"
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

  const branchId =
    text(body.branchId);

  const staffId =
    text(body.staffId);

  if (
    !branchId ||
    !staffId
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "MISSING_IDS",
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
        item.branchId ===
        branchId,
    );

  if (!branch) {
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

  const current =
    (branch.staff ?? [])
      .find(
        (member) =>
          member.staffId ===
          staffId,
      );

  if (!current) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "STAFF_NOT_FOUND",
      },
      {
        status: 404,
      },
    );
  }

  const role =
    body.role === undefined
      ? current.role
      : normalizeRole(
          body.role,
        );

  if (!role) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "INVALID_ROLE",
      },
      {
        status: 400,
      },
    );
  }

  const firstName =
    body.firstName === undefined
      ? current.firstName
      : text(body.firstName);

  const lastName =
    body.lastName === undefined
      ? current.lastName
      : text(body.lastName);

  if (
    !firstName ||
    !lastName
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "NAME_REQUIRED",
      },
      {
        status: 400,
      },
    );
  }

  const updatedStaff:
    OrganizationBranchStaff = {
    ...current,

    firstName,
    lastName,
    photoUrl:
      body.photoUrl === undefined
        ? current.photoUrl
        : text(body.photoUrl) || undefined,

    role,

    customRoleLabel:
      role === "custom"
        ? (
            body.customRoleLabel === undefined
              ? current.customRoleLabel
              : text(body.customRoleLabel)
          )
        : undefined,

    phone:
      body.phone === undefined
        ? current.phone
        : text(body.phone) ||
          undefined,

    email:
      body.email === undefined
        ? current.email
        : text(body.email)
            .toLowerCase() ||
          undefined,

    status:
      body.status === undefined
        ? current.status
        : normalizeStatus(
            body.status,
          ),

    hrProfile:
      body.hrProfile === undefined &&
      body.jobTitle === undefined &&
      body.employmentStartDate === undefined &&
      body.familyStatus === undefined &&
      body.bankAccountHolder === undefined &&
      body.iban === undefined &&
      body.emergencyContactName === undefined &&
      body.emergencyContactPhone === undefined
        ? current.hrProfile
        : {
            jobTitle: text(body.jobTitle) || current.hrProfile?.jobTitle,
            employmentStartDate: text(body.employmentStartDate) || current.hrProfile?.employmentStartDate,
            familyStatus: text(body.familyStatus) || current.hrProfile?.familyStatus,
            bankAccountHolder: text(body.bankAccountHolder) || current.hrProfile?.bankAccountHolder,
            iban: text(body.iban) || current.hrProfile?.iban,
            emergencyContactName: text(body.emergencyContactName) || current.hrProfile?.emergencyContactName,
            emergencyContactPhone: text(body.emergencyContactPhone) || current.hrProfile?.emergencyContactPhone,
          },

    assignments:
      body.assignments === undefined
        ? current.assignments
        : Array.isArray(body.assignments)
          ? body.assignments.filter((item: unknown) => typeof item === "string")
          : [],
  };

  const updatedBranches =
    branches.map(
      (item) =>
        item.branchId ===
        branchId
          ? {
              ...item,
              staff:
                (item.staff ?? [])
                  .map(
                    (member) =>
                      member.staffId ===
                      staffId
                        ? updatedStaff
                        : member,
                  ),
            }
          : item,
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
    staff:
      updatedStaff,
  });
}