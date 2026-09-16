import { getCounterSeller, ticketInSellerScope } from "../../../../lib/counter/CounterSellerAccess";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import { getCentralCustomer } from "../../../../lib/client/CentralCustomerStore";
import { acquireCounterAssignmentLock, listCounterTickets, releaseCounterAssignmentLock, saveCounterTicket, saveCounterTicketLocked, getCounterPresence } from "../../../../lib/counter/CounterTicketStore";
import { allocateCounterTicketNumber } from "../../../../lib/organization/OrganizationStore";
import { verifyTpaSessionToken } from "../../../../lib/session/TpaSessionToken";

type TicketStatus =
  | "waiting"
  | "called"
  | "in-service"
  | "completed"
  | "cancelled"
  | "no-show";

type CounterTicket = {
  id: string;
  number: string;

  createdAt: string;
  calledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  noShowAt?: string | null;

  status: TicketStatus;

  customer: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };

  vehicle: {
    id: string;
    vin: string | null;
    brand: string;
    model: string;
    year: number | null;
    engine: string;
    label: string;
  };

  profile: string;
  reason: string;

  storeId: string;
  branchId?: string;
  branchCode?: string | null;
  terminalId: string;
  terminalCode?: string | null;

  sellerId: string | null;
  sellerName: string | null;
};

export async function GET(request: NextRequest) {
  const seller = await getCounterSeller(request);
  if (!seller) return NextResponse.json({ ok: false, error: "SELLER_REQUIRED" }, { status: 401 });
  const scope = seller.organizationId;

  if (request.nextUrl.searchParams.get("mode") === "active-ticket") {
    try {
      const allTickets = await listCounterTickets();
      const activeTicket =
        allTickets.find(
          (ticket) =>
            ticketInSellerScope(ticket, seller) &&
            ticket.sellerId === seller.customerId &&
            (
              ticket.status === "called" ||
              ticket.status === "in-service"
            ),
        ) ?? null;

      return NextResponse.json(
        { ok: true, activeTicket },
        { headers: { "Cache-Control": "no-store" } },
      );
    } catch {
      return NextResponse.json(
        { ok: false, error: "COUNTER_UNAVAILABLE" },
        { status: 503 },
      );
    }
  }

  try {
    let presence = await getCounterPresence(scope, seller.customerId);
    if (presence.status === "offline") return NextResponse.json({ ok: false, error: "LOGIN_REQUIRED" }, { status: 401 });

    let allTickets = await listCounterTickets();
    let scoped = allTickets.filter(t => ticketInSellerScope(t, seller));
    let busy = allTickets.some(t => t.storeId === scope && t.sellerId === seller.customerId && (t.status === "called" || t.status === "in-service"));

    const needsAssignment =
      !busy &&
      presence.status === "available" &&
      scoped.some(t => t.status === "waiting");

    if (needsAssignment) {
      const lockToken = await acquireCounterAssignmentLock(scope);

      if (lockToken) {
        try {
          presence = await getCounterPresence(scope, seller.customerId);
          allTickets = await listCounterTickets();
          scoped = allTickets.filter(t => ticketInSellerScope(t, seller));
          busy = allTickets.some(t => t.storeId === scope && t.sellerId === seller.customerId && (t.status === "called" || t.status === "in-service"));

          if (!busy && presence.status === "available") {
            const nextTicket = scoped.find(t => t.status === "waiting");

            if (nextTicket) {
              const customer = await getCentralCustomer(seller.customerId);
              const assigned = {
                ...nextTicket,
                status: "called" as const,
                sellerId: seller.customerId,
                sellerName: customer
                  ? [customer.firstName, customer.lastName].join(" ").trim()
                  : seller.session.displayName ?? "Vendeur",
                calledAt: new Date().toISOString(),
                noShowAt: null,
              };

              await saveCounterTicketLocked(scope, lockToken, assigned);
              Object.assign(nextTicket, assigned);
            }
          }
        } finally {
          await releaseCounterAssignmentLock(scope, lockToken);
        }
      }
    }

    const canViewQueue = seller.account.sellerCounterSettings?.permissions.viewFullQueue === true;
    const tickets = scoped
      .filter(t => canViewQueue || t.sellerId === seller.customerId)
      .map(ticket => ({
        ...ticket,
        branchCode: ticket.branchCode ?? null,
        terminalCode: ticket.terminalCode ?? null,
      }));

    return NextResponse.json({ ok: true, tickets, presence, waitingCount: canViewQueue ? scoped.filter(t => t.status === "waiting").length : null }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false, error: "COUNTER_UNAVAILABLE" }, { status: 503 });
  }
}

export async function POST(
  request: NextRequest,
) {

  const body =
    await request.json();

  const action =
    String(
      body.action ?? "",
    );
  if (
    action ===
    "create"
  ) {

    const isAnonymous =
      body.reason ===
      "general-information";

    if (
      !isAnonymous &&
      (
        !body.customer ||
        !body.vehicle
      )
    ) {

      return NextResponse.json(
        {
          ok: false,
          error:
            "CLIENT_OR_VEHICLE_MISSING",
        },
        {
          status: 400,
        },
      );
    }

    const ticketNumber = await allocateCounterTicketNumber();

    const ticket:
      CounterTicket = {

      id:
        "CT-" +
        Date.now()
          .toString(36)
          .toUpperCase(),

      number: ticketNumber,

      createdAt:
        new Date()
          .toISOString(),

      calledAt:
        null,

      startedAt:
        null,

      completedAt:
        null,

      status:
        "waiting",

      customer: {
        id:
          String(
            body.customer?.id ?? "",
          ),

        firstName:
          String(
            body.customer?.firstName ?? "",
          ),

        lastName:
          String(
            body.customer?.lastName ?? "",
          ),

        phone:
          String(
            body.customer?.phone ?? "",
          ),

        email:
          String(
            body.customer?.email ?? "",
          ),
      },

      vehicle: {
        id:
          String(
            body.vehicle?.id ?? "",
          ),

        vin:
          body.vehicle?.vin
            ? String(
                body.vehicle?.vin,
              )
            : null,

        brand:
          String(
            body.vehicle?.brand ?? "",
          ),

        model:
          String(
            body.vehicle?.model ?? "",
          ),

        year:
          body.vehicle?.year
            ? Number(
                body.vehicle?.year,
              )
            : null,

        engine:
          String(
            body.vehicle?.engine ?? "",
          ),

        label:
          String(
            body.vehicle?.label ?? "",
          ),
      },

      profile:
        isAnonymous
          ? "anonymous"
          : String(
              body.profile ??
              "particulier",
            ),

      reason:
        String(
          body.reason ??
          "counter-request",
        ),

      storeId:
        String(
          body.storeId ??
          "GROSSISTE-DEMO",
        ),

      branchId:
        body.branchId
          ? String(body.branchId)
          : undefined,

      branchCode:
        body.branchCode
          ? String(body.branchCode)
          : null,

      terminalId:
        String(
          body.terminalId ??
          "BORNE-01",
        ),

      terminalCode:
        body.terminalCode
          ? String(body.terminalCode)
          : null,

      sellerId:
        null,

      sellerName:
        null,

    };
    await saveCounterTicket(ticket);

    return NextResponse.json({
      ok: true,
      ticket,
    });
  }

  if (
    action ===
    "status"
  ) {
    const secret =
      process.env.TPA_SESSION_SECRET;

    if (!secret) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "SESSION_NOT_CONFIGURED",
        },
        {
          status: 503,
        },
      );
    }

    const token =
      request.cookies
        .get("tpa_session")
        ?.value;

    if (!token) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "UNAUTHENTICATED",
        },
        {
          status: 401,
        },
      );
    }

    const session =
      verifyTpaSessionToken(
        token,
        secret,
      );

    if (
      !session ||
      session.accessRole !==
        "seller" ||
      !session.customerId
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "SELLER_REQUIRED",
        },
        {
          status: 403,
        },
      );
    }

    const sellerId =
      session.customerId;

    const seller =
      await getCentralCustomer(
        sellerId,
      );

    const sellerName =
      seller
        ? `${seller.firstName} ${seller.lastName}`.trim()
        : session.displayName ??
          "Vendeur";

    const sellerAccess = await getCounterSeller(request);
    if (!sellerAccess) return NextResponse.json({ ok: false, error: "SELLER_REQUIRED" }, { status: 401 });
    const scope = sellerAccess.organizationId;
    const lockToken = await acquireCounterAssignmentLock(scope);
    if (!lockToken) return NextResponse.json({ ok: false, error: "COUNTER_BUSY_RETRY" }, { status: 503 });
    try {
    const current =
      (await listCounterTickets()).find(
        (ticket) =>
          ticket.id === body.ticketId ||
          ticket.number === body.ticketId,
      );

    if (!current) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "TICKET_NOT_FOUND",
        },
        {
          status: 404,
        },
      );
    }

    if (!ticketInSellerScope(current, sellerAccess)) return NextResponse.json({ ok: false, error: "TICKET_FORBIDDEN" }, { status: 403 });
    const presence = await getCounterPresence(scope, sellerId);
    if (presence.status === "offline") return NextResponse.json({ ok: false, error: "LOGIN_REQUIRED" }, { status: 401 });
    if (current.sellerId && current.sellerId !== sellerId) return NextResponse.json({ ok: false, error: "TICKET_NOT_OWNED_BY_SELLER" }, { status: 409 });
    if (body.status === "called") {
      if (presence.status !== "available") return NextResponse.json({ ok: false, error: "SELLER_UNAVAILABLE" }, { status: 409 });
      if (current.status === "waiting" && sellerAccess.account.sellerCounterSettings?.permissions.manualTicketSelection !== true) return NextResponse.json({ ok: false, error: "AUTOMATIC_ASSIGNMENT_REQUIRED" }, { status: 403 });
      const busy = (await listCounterTickets()).some(t => t.storeId === scope && t.sellerId === sellerId && t.id !== current.id && (t.status === "called" || t.status === "in-service"));
      if (busy) return NextResponse.json({ ok: false, error: "SELLER_ALREADY_BUSY" }, { status: 409 });
    }
    const status =
      body.status as
        TicketStatus;

    const allowedStatuses:
      TicketStatus[] = [
        "waiting",
        "called",
        "in-service",
        "completed",
        "cancelled",
        "no-show",
      ];

    if (
      !allowedStatuses.includes(
        status,
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "INVALID_STATUS",
        },
        {
          status: 400,
        },
      );
    }

    if (
      (
        status ===
          "called" ||
        status ===
          "in-service"
      ) &&
      current.sellerId &&
      current.sellerId !==
        sellerId
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "TICKET_ALREADY_CLAIMED",
          sellerId:
            current.sellerId,
          sellerName:
            current.sellerName,
        },
        {
          status: 409,
        },
      );
    }

    if (
      status ===
        "completed" &&
      current.sellerId !==
        sellerId
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "TICKET_NOT_OWNED_BY_SELLER",
        },
        {
          status: 409,
        },
      );
    }

    if (
      status ===
        "called" &&
      current.status !==
        "waiting" &&
      current.status !==
        "no-show"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "INVALID_TICKET_TRANSITION",
        },
        {
          status: 409,
        },
      );
    }

    if (
      status ===
        "in-service" &&
      current.status !==
        "called"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "INVALID_TICKET_TRANSITION",
        },
        {
          status: 409,
        },
      );
    }

    if (
      status ===
        "completed" &&
      current.status !==
        "in-service"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "INVALID_TICKET_TRANSITION",
        },
        {
          status: 409,
        },
      );
    }

    if (
      status === "no-show" &&
      (current.status !== "called" || current.sellerId !== sellerId)
    ) {
      return NextResponse.json({ ok: false, error: "INVALID_TICKET_TRANSITION" }, { status: 409 });
    }

    const timestamp =
      new Date()
        .toISOString();

    const updated:
      CounterTicket = {
      ...current,

      status,

      sellerId:
        status ===
          "called" ||
        status ===
          "in-service" ||
        status ===
          "completed"
          ? sellerId
          : current.sellerId,

      sellerName:
        status ===
          "called" ||
        status ===
          "in-service" ||
        status ===
          "completed"
          ? sellerName
          : current.sellerName,

      calledAt:
        status ===
        "called"
          ? timestamp
          : current.calledAt,

      startedAt:
        status ===
        "in-service"
          ? timestamp
          : current.startedAt,

      completedAt:
        status ===
        "completed"
          ? timestamp
          : current.completedAt,

      noShowAt:
        status === "no-show"
          ? timestamp
          : status === "called"
            ? null
            : current.noShowAt,
    };

    await saveCounterTicketLocked(scope, lockToken, updated);

    return NextResponse.json({
      ok: true,
      ticket: updated,
    });
    } catch { return NextResponse.json({ ok: false, error: "COUNTER_UNAVAILABLE" }, { status: 503 }); }
    finally { await releaseCounterAssignmentLock(scope, lockToken); }
  }
  return NextResponse.json(
    {
      ok: false,
      error:
        "UNKNOWN_ACTION",
    },
    {
      status: 400,
    },
  );
}
