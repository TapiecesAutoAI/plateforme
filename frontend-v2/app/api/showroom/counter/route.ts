import {
  NextRequest,
  NextResponse,
} from "next/server";

import { getCentralCustomer } from "../../../../lib/client/CentralCustomerStore";
import { getClientAccount } from "../../../../lib/client/ClientAccountStore";
import { acquireCounterAssignmentLock, listCounterTickets, releaseCounterAssignmentLock, saveCounterTicket } from "../../../../lib/counter/CounterTicketStore";
import { allocateCounterTicketNumber, getOrganization } from "../../../../lib/organization/OrganizationStore";
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
  terminalId: string;

  sellerId: string | null;
  sellerName: string | null;
};

export async function GET(
  request: NextRequest,
) {

  const allTickets = await listCounterTickets();

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
    return NextResponse.json(
      {
        ok: false,
        error: "SELLER_REQUIRED",
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
        error: "SELLER_REQUIRED",
      },
      {
        status: 403,
      },
    );
  }

  const account =
    await getClientAccount(
      session.customerId,
    );

  const assignment =
    account
      ?.sellerBranchAssignment;

  const allowedBranchIds =
    new Set(
      [
        assignment
          ?.primaryBranchId,
        ...(
          assignment
            ?.allowedBranchIds ??
          []
        ),
      ].filter(
        (
          branchId,
        ): branchId is string =>
          Boolean(branchId),
      ),
    );

  const sellerAlreadyBusy =
    allTickets.some(
      ticket =>
        ticket.sellerId === session.customerId &&
        (ticket.status === "called" ||
          ticket.status === "in-service"),
    );

  if (!sellerAlreadyBusy) {
    const scope = session.organizationId ?? "counter-global";
    const lockToken = await acquireCounterAssignmentLock(scope);

    if (lockToken) {
      try {
        const freshTickets = await listCounterTickets();
        const stillBusy = freshTickets.some(
          ticket =>
            ticket.sellerId === session.customerId &&
            (ticket.status === "called" ||
              ticket.status === "in-service"),
        );

        if (!stillBusy) {
          const nextTicket = freshTickets.find(
            ticket =>
              ticket.status === "waiting" &&
              (!ticket.branchId || allowedBranchIds.has(ticket.branchId)),
          );

          if (nextTicket) {
            const seller = await getCentralCustomer(session.customerId);
            const sellerName = seller
              ? `${seller.firstName} ${seller.lastName}`.trim()
              : session.displayName ?? "Vendeur";
            const assignedTicket = {
              ...nextTicket,
              status: "called" as const,
              sellerId: session.customerId,
              sellerName,
              calledAt: new Date().toISOString(),
              noShowAt: null,
            };

            await saveCounterTicket(assignedTicket);
            Object.assign(nextTicket, assignedTicket);
          }
        }
      } finally {
        await releaseCounterAssignmentLock(scope, lockToken);
      }
    }
  }

  const tickets =
    allTickets.filter(
      (ticket) =>
        !ticket.branchId ||
        allowedBranchIds.has(
          ticket.branchId,
        ),
    );

  const organization =
    session.organizationId
      ? await getOrganization(
          session.organizationId,
        )
      : null;

  const enrichedTickets =
    tickets.map((ticket) => {
      const branch =
        organization?.branches?.find(
          (candidate) =>
            candidate.branchId ===
            ticket.branchId,
        );

      const terminal =
        branch?.terminals?.find(
          (candidate) =>
            candidate.terminalId ===
            ticket.terminalId,
        );

      return {
        ...ticket,
        reason: ticket.reason ?? "counter-request",
        branchCode:
          branch?.branchCode ?? null,
        terminalCode:
          terminal?.deviceCode ?? null,
      };
    });

  return NextResponse.json({
    ok: true,
    tickets: enrichedTickets,
  });
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

      terminalId:
        String(
          body.terminalId ??
          "BORNE-01",
        ),

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

    await saveCounterTicket(updated);

    return NextResponse.json({
      ok: true,
      ticket: updated,
    });
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
