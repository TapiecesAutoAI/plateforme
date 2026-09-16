import { NextRequest, NextResponse } from "next/server";
import { getCounterSeller } from "../../../../lib/counter/CounterSellerAccess";
import { changeCounterPresence, getCounterPresence } from "../../../../lib/counter/CounterTicketStore";

export async function GET(request: NextRequest) {
  const seller = await getCounterSeller(request);
  if (!seller) return NextResponse.json({ ok: false, error: "SELLER_REQUIRED" }, { status: 401 });
  return NextResponse.json({ ok: true, presence: await getCounterPresence(seller.organizationId, seller.customerId) }, { headers: { "Cache-Control": "no-store" } });
}
export async function POST(request: NextRequest) {
  const seller = await getCounterSeller(request);
  if (!seller) return NextResponse.json({ ok: false, error: "SELLER_REQUIRED" }, { status: 401 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 }); }
  if (!body || !["available", "pause", "mission"].includes(body.status) || (body.reason !== undefined && typeof body.reason !== "string")) return NextResponse.json({ ok: false, error: "INVALID_PRESENCE" }, { status: 400 });
  try {
    const current = await getCounterPresence(seller.organizationId, seller.customerId);
    if (current.status === "offline") return NextResponse.json({ ok: false, error: "LOGIN_REQUIRED" }, { status: 401 });
    return NextResponse.json({ ok: true, presence: await changeCounterPresence(seller.organizationId, seller.customerId, body.status, body.reason ?? "") });
  } catch (error) {
    const code = error instanceof Error ? error.message : "COUNTER_UNAVAILABLE";
    return NextResponse.json({ ok: false, error: code.startsWith("COUNTER_") || code === "ACTIVE_TICKET_BLOCKS_PRESENCE" ? code : "COUNTER_UNAVAILABLE" }, { status: code === "ACTIVE_TICKET_BLOCKS_PRESENCE" ? 409 : 503 });
  }
}
