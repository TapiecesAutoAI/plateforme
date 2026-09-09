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
} from "../../../../../lib/auth/TpaAccessControl";

import {
  getOrganization,
  saveOrganization,
  type OrganizationStatus,
  type OrganizationTerminal,
} from "../../../../../lib/organization/OrganizationStore";

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

  if (
    !session ||
    session.accessRole !==
      "wholesaler_admin" ||
    !session.organizationId
  ) {
    return null;
  }

  assertPermission(
    session.accessRole,
    "organization.branch.manage",
  );

  const organization =
    await getOrganization(
      session.organizationId,
    );

  return organization ?? null;
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

function terminalSitePrefix(
  branchName: string,
): string {
  const normalized =
    branchName
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        "",
      )
      .replace(
        /[^A-Za-z]/g,
        "",
      )
      .toUpperCase();

  const knownPrefixes:
    Record<string, string> = {
      BRUXELLES: "BRU",
      NAMUR: "NAM",
      TOURNAI: "TOU",
    };

  return (
    knownPrefixes[normalized] ??
    normalized.slice(0, 3)
      .padEnd(3, "X")
  );
}



function normalizeLocationName(
  value: string,
): string {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .replace(
      /[^A-Za-z]/g,
      "",
    )
    .toUpperCase();
}

function terminalCityPrefix(
  branchName: string,
): string {
  const cityName =
    branchName
      .replace(
        /^.*?\bsuccursale\b[\s:-]*/i,
        "",
      )
      .trim();

  const normalized =
    normalizeLocationName(
      cityName || branchName,
    );

  const knownPrefixes:
    Record<string, string> = {
      BRUXELLES: "BRU",
      NAMUR: "NAM",
      TOURNAI: "TOU",
    };

  return (
    knownPrefixes[normalized] ??
    normalized
      .slice(0, 3)
      .padEnd(3, "X")
  );
}

function branchSiteCode(
  branchId: string,
  branchName: string,
  branches:
    Array<{
      branchId: string;
      name: string;
    }>,
): string {
  const prefix =
    terminalCityPrefix(
      branchName,
    );

  const samePrefixBranches =
    branches
      .filter(
        (branch) =>
          terminalCityPrefix(
            branch.name,
          ) === prefix,
      )
      .sort(
        (a, b) =>
          a.branchId.localeCompare(
            b.branchId,
          ),
      );

  const index =
    samePrefixBranches.findIndex(
      (branch) =>
        branch.branchId ===
        branchId,
    );

  return `${prefix}${Math.max(
    index + 1,
    1,
  )}`;
}

function nextTerminalDeviceCode(
  siteCode: string,
  terminals:
    OrganizationTerminal[],
): string {
  let highest = 0;

  for (const terminal of terminals) {
    const code =
      terminal.deviceCode
        ?.trim()
        .toUpperCase();

    if (!code) {
      continue;
    }

    const match =
      code.match(
        new RegExp(
          `^${siteCode}-B(\\d+)$`,
        ),
      );

    if (!match) {
      continue;
    }

    const number =
      Number(match[1]);

    if (
      Number.isInteger(number) &&
      number > highest
    ) {
      highest = number;
    }
  }

  return `${siteCode}-B${String(
    highest + 1,
  ).padStart(2, "0")}`;
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
        ok: false,
        error: "ACCESS_DENIED",
      },
      {
        status: 403,
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
        error: "INVALID_INPUT",
      },
      {
        status: 400,
      },
    );
  }

  const branchId =
    text(body.branchId);

  if (!branchId) {
    return NextResponse.json(
      {
        ok: false,
        error: "Site requis.",
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
        ok: false,
        error: "Site introuvable.",
      },
      {
        status: 404,
      },
    );
  }

  const siteCode =
    branch.branchCode
      ?.trim()
      .toUpperCase();

  if (!siteCode) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "BRANCH_CODE_REQUIRED",
      },
      {
        status: 409,
      },
    );
  }

  const deviceCode =
    nextTerminalDeviceCode(
      siteCode,
      branch.terminals ?? [],
    );

  const terminal:
    OrganizationTerminal = {
      terminalId:
        `BORNE-${randomUUID()}`,
      deviceCode,
      name: deviceCode,
      printerName: typeof body.printerName === "string" ? body.printerName.trim() || undefined : undefined,
      printerPath: typeof body.printerPath === "string" ? body.printerPath.trim() || undefined : undefined,
      status: "active",
    };

  const updatedBranches =
    branches.map(
      (item) =>
        item.branchId === branchId
          ? {
              ...item,
              terminals: [
                ...(item.terminals ?? []),
                terminal,
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
    siteCode,
    terminal,
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
        ok: false,
        error: "ACCESS_DENIED",
      },
      {
        status: 403,
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
        error: "INVALID_INPUT",
      },
      {
        status: 400,
      },
    );
  }

  const branchId =
    text(body.branchId);

  const terminalId =
    text(body.terminalId);

  if (
    !branchId ||
    !terminalId
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Site et borne requis.",
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
        ok: false,
        error: "Site introuvable.",
      },
      {
        status: 404,
      },
    );
  }

  const current =
    (branch.terminals ?? []).find(
      (terminal) =>
        terminal.terminalId ===
        terminalId,
    );

  if (!current) {
    return NextResponse.json(
      {
        ok: false,
        error: "Borne introuvable.",
      },
      {
        status: 404,
      },
    );
  }

  const updatedTerminal:
    OrganizationTerminal = {
      ...current,
      printerName:
        body.printerName === undefined
          ? current.printerName
          : typeof body.printerName === "string"
            ? body.printerName.trim() || undefined
            : current.printerName,
      printerPath:
        body.printerPath === undefined
          ? current.printerPath
          : typeof body.printerPath === "string"
            ? body.printerPath.trim() || undefined
            : current.printerPath,
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
              terminals:
                (
                  item.terminals ?? []
                ).map(
                  (terminal) =>
                    terminal.terminalId ===
                    terminalId
                      ? updatedTerminal
                      : terminal,
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
    terminal:
      updatedTerminal,
  });
}
