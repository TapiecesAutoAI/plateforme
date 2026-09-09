import { NextRequest, NextResponse } from "next/server";

import {
  getClientAccount,
  hashClientPassword,
  saveClientAccount,
  verifyClientPassword,
} from "../../../../lib/client/ClientAccountStore";

import { verifyTpaSessionToken } from "../../../../lib/session/TpaSessionToken";

export async function POST(request: NextRequest) {
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
    !session.customerId
  ) {
    return NextResponse.json(
      { ok: false, error: "SELLER_REQUIRED" },
      { status: 403 },
    );
  }

  let body: {
    currentPassword?: string;
    newPassword?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "INVALID_BODY" },
      { status: 400 },
    );
  }

  const currentPassword =
    typeof body.currentPassword === "string"
      ? body.currentPassword
      : "";

  const newPassword =
    typeof body.newPassword === "string"
      ? body.newPassword
      : "";

  if (!currentPassword) {
    return NextResponse.json(
      { ok: false, error: "CURRENT_PASSWORD_REQUIRED" },
      { status: 400 },
    );
  }

  if (newPassword.length < 10) {
    return NextResponse.json(
      { ok: false, error: "PASSWORD_TOO_SHORT" },
      { status: 400 },
    );
  }

  const account =
    await getClientAccount(session.customerId);

  if (
    !account ||
    account.status !== "active" ||
    account.role !== "seller"
  ) {
    return NextResponse.json(
      { ok: false, error: "ACCOUNT_NOT_FOUND" },
      { status: 404 },
    );
  }

  const validCurrentPassword =
    await verifyClientPassword(
      currentPassword,
      account,
    );

  if (!validCurrentPassword) {
    return NextResponse.json(
      { ok: false, error: "CURRENT_PASSWORD_INVALID" },
      { status: 400 },
    );
  }

  const { hash, salt } =
    await hashClientPassword(newPassword);

  const now = new Date().toISOString();

  await saveClientAccount({
    ...account,
    passwordHash: hash,
    passwordSalt: salt,
    updatedAt: now,
  });

  return NextResponse.json({
    ok: true,
  });
}