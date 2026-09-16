import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { verifyTpaSessionToken } from "../../../../lib/session/TpaSessionToken";
import { canAccessOrganization } from "../../../../lib/auth/TpaAccessControl";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("tpa_session")?.value;
  const secret = process.env.TPA_SESSION_SECRET;

  if (!token || !secret) {
    return NextResponse.json(
      { ok: false, error: "UNAUTHORIZED" },
      { status: 401 },
    );
  }

  const session = verifyTpaSessionToken(token, secret);

  if (
    !session ||
    (
      session.accessRole !== "wholesaler_admin" &&
      session.accessRole !== "super_admin"
    )
  ) {
    return NextResponse.json(
      { ok: false, error: "FORBIDDEN" },
      { status: 403 },
    );
  }

  const pathname =
    request.nextUrl.searchParams.get("pathname")?.trim();

  const organizationId =
    request.nextUrl.searchParams.get("organizationId")?.trim();

  if (!pathname || !organizationId) {
    return NextResponse.json(
      { ok: false, error: "INVALID_INPUT" },
      { status: 400 },
    );
  }

  const expectedPrefix =
    `tpa/organizations/${organizationId}/`;

  if (!pathname.startsWith(expectedPrefix)) {
    return NextResponse.json(
      { ok: false, error: "FORBIDDEN" },
      { status: 403 },
    );
  }

  const targetOrganizationId =
    session.accessRole === "super_admin"
      ? organizationId
      : session.organizationId;

  if (
    !targetOrganizationId ||
    targetOrganizationId !== organizationId ||
    !canAccessOrganization(
      {
        role: session.accessRole,
        organizationId: session.organizationId,
      },
      targetOrganizationId,
    )
  ) {
    return NextResponse.json(
      { ok: false, error: "FORBIDDEN" },
      { status: 403 },
    );
  }

  const privateStoreId =
    process.env.TPA_PEOPLE_BLOB_STORE_ID?.trim();

  if (!privateStoreId) {
    return NextResponse.json(
      {
        ok: false,
        error: "PRIVATE_BLOB_STORE_NOT_CONFIGURED",
      },
      { status: 500 },
    );
  }

  const blob = await get(pathname, {
    access: "private",
    storeId: privateStoreId,
  });

  if (!blob) {
    return NextResponse.json(
      { ok: false, error: "PHOTO_NOT_FOUND" },
      { status: 404 },
    );
  }

  return new NextResponse(blob.stream, {
    status: 200,
    headers: {
      "Content-Type":
        blob.blob.contentType || "application/octet-stream",
      "Cache-Control": "private, no-store",
    },
  });
}