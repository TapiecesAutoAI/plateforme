import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

import { verifyTpaSessionToken } from "../../../../lib/session/TpaSessionToken";
import { canAccessOrganization } from "../../../../lib/auth/TpaAccessControl";
import { getOrganization, saveOrganization } from "../../../../lib/organization/OrganizationStore";

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

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "FILE_REQUIRED" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ ok: false, error: "IMAGE_REQUIRED" }, { status: 400 });
  }

  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ ok: false, error: "FILE_TOO_LARGE" }, { status: 400 });
  }

  const targetOrganizationId =
    session.accessRole === "super_admin"
      ? organizationId
      : session.organizationId;

  if (!targetOrganizationId || !canAccessOrganization(
    { role: session.accessRole, organizationId: session.organizationId },
    targetOrganizationId,
  )) {
    return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
  }

  const organization = await getOrganization(targetOrganizationId);

  if (!organization) {
    return NextResponse.json({ ok: false, error: "ORGANIZATION_NOT_FOUND" }, { status: 404 });
  }

  const extension = file.name.includes(".")
    ? file.name.substring(file.name.lastIndexOf(".")).toLowerCase()
    : ".jpg";

  const safeExtension =
    extension === ".png" ? ".png" :
    extension === ".webp" ? ".webp" :
    ".jpg";

  const blob = await put(
    `tpa/organizations/${targetOrganizationId}/organization${safeExtension}`,
    file,
    {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
    },
  );

  const updated = await saveOrganization({
    ...organization,
    storePhotoUrl: blob.url,
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json({
    ok: true,
    url: blob.url,
    storePhotoUrl: updated.storePhotoUrl,
  });
}