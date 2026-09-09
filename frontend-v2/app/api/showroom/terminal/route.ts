import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getOrganization,
} from "../../../../lib/organization/OrganizationStore";

export async function GET(
  request: NextRequest,
) {
  const organizationId =
    request.nextUrl.searchParams
      .get("organizationId")
      ?.trim();

  const branchId =
    request.nextUrl.searchParams
      .get("branchId")
      ?.trim();

  const terminalCode =
    request.nextUrl.searchParams
      .get("terminalCode")
      ?.trim()
      .toUpperCase();

  if (
    !organizationId ||
    !branchId ||
    !terminalCode
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "SHOWROOM_CONFIGURATION_REQUIRED",
      },
      {
        status: 400,
      },
    );
  }

  const organization =
    await getOrganization(
      organizationId,
    );

  if (
    !organization ||
    organization.status !==
      "active"
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "ORGANIZATION_NOT_AVAILABLE",
      },
      {
        status: 404,
      },
    );
  }

  const branch =
    organization.branches?.find(
      (candidate) =>
        candidate.branchId ===
        branchId,
    );

  if (
    !branch ||
    branch.status !==
      "active"
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "BRANCH_NOT_AVAILABLE",
      },
      {
        status: 404,
      },
    );
  }

  const terminal =
    branch.terminals?.find(
      (candidate) =>
        candidate.status ===
          "active" &&
        candidate.deviceCode
          ?.trim()
          .toUpperCase() ===
          terminalCode,
    );

  if (!terminal) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "TERMINAL_NOT_AVAILABLE",
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

    branch: {
      branchId:
        branch.branchId,
      name:
        branch.name,
    },

    terminal: {
      terminalId:
        terminal.terminalId,
      terminalCode:
        terminal.deviceCode,
      name:
        terminal.name,
      printerName:
        terminal.printerName ?? null,
      printerPath:
        terminal.printerPath ?? null,
    },
  });
}
