import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

import { verifyTpaSessionToken } from "../../../../lib/session/TpaSessionToken";
import { canAccessOrganization } from "../../../../lib/auth/TpaAccessControl";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("tpa_session")?.value;
  const secret = process.env.TPA_SESSION_SECRET;

  if (!token || !secret) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const session = verifyTpaSessionToken(token, secret);

  if (!session || (session.accessRole !== "wholesaler_admin" && session.accessRole !== "super_admin")) {
    return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const organizationId = formData.get("organizationId")?.toString().trim();
  const branchId = formData.get("branchId")?.toString().trim();
  const staffId = formData.get("staffId")?.toString().trim();

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "FILE_REQUIRED" }, { status: 400 });
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return NextResponse.json({ ok: false, error: "IMAGE_FORMAT_NOT_SUPPORTED" }, { status: 400 });
  }

  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ ok: false, error: "FILE_TOO_LARGE" }, { status: 400 });
  }

  const targetOrganizationId =
    session.accessRole === "super_admin"
      ? organizationId
      : session.organizationId;

  if (!targetOrganizationId || !branchId || !staffId || !canAccessOrganization(
    { role: session.accessRole, organizationId: session.organizationId },
    targetOrganizationId,
  )) {
    return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
  }

  const extension =
    file.type === "image/png"
      ? ".png"
      : file.type === "image/webp"
        ? ".webp"
        : ".jpg";

  const privateStoreId =
    process.env.TPA_PEOPLE_BLOB_STORE_ID?.trim();

  if (!privateStoreId) {
    return NextResponse.json(
      { ok: false, error: "PRIVATE_BLOB_STORE_NOT_CONFIGURED" },
      { status: 500 },
    );
  }

  const blob = await put(
    `tpa/organizations/${targetOrganizationId}/branches/${branchId}/staff/${staffId}${extension}`,
    file,
    {
      access: "private",
      addRandomSuffix: true,
      contentType: file.type,
      storeId: privateStoreId,
    },
  );

  return NextResponse.json({
    ok: true,
    url: blob.pathname,
  });
}