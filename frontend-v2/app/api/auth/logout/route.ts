import { NextRequest } from "next/server";
import { getCounterSeller } from "../../../../lib/counter/CounterSellerAccess";
import { changeCounterPresence } from "../../../../lib/counter/CounterTicketStore";
import {
  NextResponse,
} from "next/server";

export async function POST(request: NextRequest) {
  // Do not clear the cookie until ticket assignment is stopped atomically.
  const seller = await getCounterSeller(request);
  if (seller) {
    try { await changeCounterPresence(seller.organizationId, seller.customerId, "offline"); }
    catch (error) {
      const active = error instanceof Error && error.message === "ACTIVE_TICKET_BLOCKS_PRESENCE";
      return NextResponse.json({ ok: false, error: active ? "ACTIVE_TICKET_BLOCKS_PRESENCE" : "COUNTER_UNAVAILABLE" }, { status: active ? 409 : 503 });
    }
  }
  const response =
    NextResponse.json({
      ok: true,
    });

  const cookieOptions = {
    httpOnly: true,
    secure:
      process.env.NODE_ENV ===
      "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  };

  response.cookies.set(
    "tpa_session",
    "",
    cookieOptions,
  );

  response.cookies.set(
    "tpa_private_access",
    "",
    cookieOptions,
  );

  return response;
}