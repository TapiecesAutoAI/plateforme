import {
  NextResponse,
} from "next/server";

type TicketStatus =
  | "waiting"
  | "called"
  | "in-service"
  | "completed"
  | "cancelled";

type CounterTicket = {
  id: string;
  number: string;

  createdAt: string;
  calledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;

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

  storeId: string;
  terminalId: string;

  sellerId: string | null;
};

type CounterState = {
  sequence: number;
  tickets: CounterTicket[];
};

declare global {
  var __tapiecesautoCounterState:
    CounterState | undefined;
}

function getState(): CounterState {

  if (!globalThis.__tapiecesautoCounterState) {

    globalThis.__tapiecesautoCounterState = {
      sequence: 0,
      tickets: [],
    };
  }

  return globalThis.__tapiecesautoCounterState;
}

export async function GET() {

  const state = getState();

  return NextResponse.json({
    ok: true,
    tickets: state.tickets,
  });
}

export async function POST(
  request: Request,
) {

  const body =
    await request.json();

  const action =
    String(
      body.action ?? "",
    );

  const state =
    getState();

  if (
    action ===
    "create"
  ) {

    if (
      !body.customer ||
      !body.vehicle
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

    state.sequence += 1;

    const ticket:
      CounterTicket = {

      id:
        "CT-" +
        Date.now()
          .toString(36)
          .toUpperCase(),

      number:
        "A" +
        String(
          state.sequence,
        ).padStart(
          3,
          "0",
        ),

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
            body.customer.id ?? "",
          ),

        firstName:
          String(
            body.customer.firstName ?? "",
          ),

        lastName:
          String(
            body.customer.lastName ?? "",
          ),

        phone:
          String(
            body.customer.phone ?? "",
          ),

        email:
          String(
            body.customer.email ?? "",
          ),
      },

      vehicle: {
        id:
          String(
            body.vehicle.id ?? "",
          ),

        vin:
          body.vehicle.vin
            ? String(
                body.vehicle.vin,
              )
            : null,

        brand:
          String(
            body.vehicle.brand ?? "",
          ),

        model:
          String(
            body.vehicle.model ?? "",
          ),

        year:
          body.vehicle.year
            ? Number(
                body.vehicle.year,
              )
            : null,

        engine:
          String(
            body.vehicle.engine ?? "",
          ),

        label:
          String(
            body.vehicle.label ?? "",
          ),
      },

      profile:
        String(
          body.profile ??
          "particulier",
        ),

      storeId:
        String(
          body.storeId ??
          "GROSSISTE-DEMO",
        ),

      terminalId:
        String(
          body.terminalId ??
          "BORNE-01",
        ),

      sellerId:
        null,
    };

    state.tickets.push(
      ticket,
    );

    return NextResponse.json({
      ok: true,
      ticket,
    });
  }

  if (
    action ===
    "status"
  ) {

    const index =
      state.tickets
        .findIndex(
          ticket =>
            ticket.id ===
              body.ticketId ||
            ticket.number ===
              body.ticketId,
        );

    if (
      index < 0
    ) {

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

    const current =
      state.tickets[index];

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

    const timestamp =
      new Date()
        .toISOString();

    const updated:
      CounterTicket = {
      ...current,

      status,

      sellerId:
        body.sellerId ??
        current.sellerId,

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
    };

    state.tickets[index] =
      updated;

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
