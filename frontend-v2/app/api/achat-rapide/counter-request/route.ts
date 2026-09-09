import {
  NextRequest,
  NextResponse,
} from "next/server";

import { verifyTpaSessionToken } from "../../../../lib/session/TpaSessionToken";
import type {
  QuickPurchaseRequest,
  QuickPurchaseRequestItem,
  QuickPurchaseRequestType,
} from "../../../../lib/counter/QuickPurchaseRequest";

declare global {
  var __tpaQuickPurchaseRequests:
    QuickPurchaseRequest[] | undefined;
}

function getRequests() {
  if (!globalThis.__tpaQuickPurchaseRequests) {
    globalThis.__tpaQuickPurchaseRequests = [];
  }

  return globalThis.__tpaQuickPurchaseRequests;
}

export async function GET(
  request: NextRequest,
) {
  const secret =
    process.env.TPA_SESSION_SECRET;

  if (!secret) {
    return NextResponse.json(
      {
        ok: false,
        error: "SESSION_SECRET_MISSING",
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
        error: "UNAUTHENTICATED",
      },
      {
        status: 401,
      },
    );
  }

  const session =
    await verifyTpaSessionToken(
      token,
      secret,
    );

  if (
    !session ||
    !session.customerId ||
    session.accessRole !== "seller"
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "SELLER_SESSION_REQUIRED",
      },
      {
        status: 403,
      },
    );
  }

  const requests =
    getRequests().filter(
      item =>
        !session.organizationId ||
        item.organizationId ===
          session.organizationId,
    );

  return NextResponse.json({
    ok: true,
    requests,
  });
}

export async function POST(
  request: NextRequest,
) {
  const secret =
    process.env.TPA_SESSION_SECRET;

  if (!secret) {
    return NextResponse.json(
      {
        ok: false,
        error: "SESSION_SECRET_MISSING",
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
        error: "UNAUTHENTICATED",
      },
      {
        status: 401,
      },
    );
  }

  const session =
    await verifyTpaSessionToken(
      token,
      secret,
    );

  const isClientSession =
    session?.accessRole === "client" ||
    (
      session?.accessRole === undefined &&
      session?.role === "customer" &&
      session?.channel === "customer-web"
    );

  if (
    !session ||
    !session.customerId ||
    !isClientSession
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "CLIENT_SESSION_REQUIRED",
      },
      {
        status: 403,
      },
    );
  }

  const body =
    await request.json();

  const type =
    String(
      body.type ?? "",
    ) as QuickPurchaseRequestType;

  if (
    type !== "order" &&
    type !== "advice"
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "INVALID_REQUEST_TYPE",
      },
      {
        status: 400,
      },
    );
  }

  if (
    !Array.isArray(body.items) ||
    body.items.length === 0
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "EMPTY_CART",
      },
      {
        status: 400,
      },
    );
  }

  const items: QuickPurchaseRequestItem[] =
    body.items.map(
      (item: Record<string, unknown>) => ({
        productId:
          String(item.productId ?? ""),
        supplierCode:
          String(item.supplierCode ?? ""),
        name:
          String(item.name ?? ""),
        unitPrice:
          typeof item.unitPrice === "number"
            ? item.unitPrice
            : null,
        quantity:
          Math.max(
            1,
            Math.floor(
              Number(
                item.quantity ?? 1,
              ),
            ),
          ),
      }),
    );

  const total =
    items.reduce(
      (sum, item) =>
        sum +
        (item.unitPrice ?? 0) *
          item.quantity,
      0,
    );

  const counterRequest:
    QuickPurchaseRequest = {
      id:
        "QPR-" +
        Date.now()
          .toString(36)
          .toUpperCase(),

      type,

      customerId:
        session.customerId,

      organizationId:
        session.organizationId,

      items,

      total,

      status: "waiting",

      createdAt:
        new Date()
          .toISOString(),
    };

  getRequests().push(
    counterRequest,
  );

  return NextResponse.json({
    ok: true,
    request: counterRequest,
  });
}