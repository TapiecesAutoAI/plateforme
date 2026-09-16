import type { NextRequest } from "next/server";
import { getClientAccount } from "../client/ClientAccountStore";
import { verifyTpaSessionToken } from "../session/TpaSessionToken";
import type { CounterTicket } from "./CounterTicketStore";

// Reuses the existing signed session and active account, never a browser sellerId.
export async function getCounterSeller(request: NextRequest) {
  const token = request.cookies.get("tpa_session")?.value;
  const secret = process.env.TPA_SESSION_SECRET;
  const session = token && secret ? verifyTpaSessionToken(token, secret) : null;
  if (session?.accessRole !== "seller" || !session.customerId || !session.organizationId) return null;
  const account = await getClientAccount(session.customerId);
  if (!account || account.status !== "active" || account.role !== "seller" || account.organizationId !== session.organizationId) return null;
  const branches = new Set([account.sellerBranchAssignment?.primaryBranchId, ...(account.sellerBranchAssignment?.allowedBranchIds ?? [])].filter((id): id is string => Boolean(id)));
  return { session, account, customerId: session.customerId, organizationId: session.organizationId, branches };
}
export type CounterSeller = NonNullable<Awaited<ReturnType<typeof getCounterSeller>>>;
export function ticketInSellerScope(ticket: CounterTicket, seller: CounterSeller) {
  return ticket.storeId === seller.organizationId && (!ticket.branchId || seller.branches.has(ticket.branchId));
}
