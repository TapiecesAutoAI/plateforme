import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

import {
  verifyTpaSessionToken,
} from "../../../../lib/session/TpaSessionToken";

export async function POST(request: NextRequest) {
  const token =
    request.cookies.get("tpa_session")?.value;

  const secret =
    process.env.TPA_SESSION_SECRET;

  if (!token || !secret) {
    return NextResponse.json(
      { ok: false, error: "UNAUTHORIZED" },
      { status: 401 },
    );
  }

  const session =
    verifyTpaSessionToken(token, secret);

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

  const formData =
    await request.formData();

  const file =
    formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "FILE_REQUIRED" },
      { status: 400 },
    );
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { ok: false, error: "IMAGE_REQUIRED" },
      { status: 400 },
    );
  }

  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json(
      { ok: false, error: "FILE_TOO_LARGE" },
      { status: 400 },
    );
  }

  const organizationId =
    formData.get("organizationId")?.toString().trim();

  const branchId =
    formData.get("branchId")?.toString().trim();

  if (!organizationId || !branchId) {
    return NextResponse.json(
      {
        ok: false,
        error: "ORGANIZATION_AND_BRANCH_REQUIRED",
      },
      { status: 400 },
    );
  }

  if (
    session.accessRole === "wholesaler_admin" &&
    session.organizationId !== organizationId
  ) {
    return NextResponse.json(
      { ok: false, error: "FORBIDDEN" },
      { status: 403 },
    );
  }

  const extension =
    file.name.includes(".")
      ? file.name.substring(
          file.name.lastIndexOf("."),
        )
      : ".jpg";

  const safeExtension =
    extension.toLowerCase() === ".png"
      ? ".png"
      : extension.toLowerCase() === ".webp"
        ? ".webp"
        : ".jpg";

  const pathname =
    `tpa/organizations/${organizationId}/branches/${branchId}${safeExtension}`;

  const blob =
    await put(pathname, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
    });

  return NextResponse.json({
    ok: true,
    url: blob.url,
  });
}
