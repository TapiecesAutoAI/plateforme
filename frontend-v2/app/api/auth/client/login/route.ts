import { changeCounterPresence } from "../../../../../lib/counter/CounterTicketStore";
import {
  createHmac,
} from "crypto";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  resolveAuthenticatedTpaSession,
} from "../../../../../lib/session";

import {
  findClientAccountByEmail,
  findClientAccountByUserCode,
  markClientLogin,
  verifyClientPassword,
} from "../../../../../lib/client/ClientAccountStore";

import {
  getCentralCustomer,
} from "../../../../../lib/client/CentralCustomerStore";


function sign(
  value: string,
  secret: string,
): string {

  return createHmac(
    "sha256",
    secret,
  )
    .update(
      value,
    )
    .digest(
      "hex",
    );
}


export async function POST(
  request:
    NextRequest,
) {

  const sessionSecret =
    process.env
      .TPA_SESSION_SECRET;


  if (!sessionSecret) {

    return NextResponse.json(
      {
        error:
          "Client authentication is not configured.",
      },
      {
        status:
          503,
      },
    );
  }


  const body =
    await request.json()
      .catch(
        () => null,
      );


  if (
    !body ||
    typeof body.email !== "string" ||
    typeof body.password !== "string"
  ) {

    return NextResponse.json(
      {
        ok:
          false,
      },
      {
        status:
          400,
      },
    );
  }


  const normalizedEmail =
    body.email
      .trim()
      .toLowerCase();


  const redisConfigured =
    Boolean(
      process.env
        .UPSTASH_REDIS_REST_URL
        ?.trim(),
    ) &&
    Boolean(
      process.env
        .UPSTASH_REDIS_REST_TOKEN
        ?.trim(),
    );

  let customerId:
    string;

  let displayName:
    string;

  let accountRole:
    | "client"
    | "seller"
    | "wholesaler_admin"
    | "super_admin" =
      "client";

  let organizationId:
    string | undefined;


  if (redisConfigured) {

    const redisHost = (() => {
      try {
        return new URL(process.env.UPSTASH_REDIS_REST_URL ?? "").hostname;
      } catch {
        return "invalid-url";
      }
    })();

    console.log("[TPA-AUTH-REDIS]", { redisHost });

    const account =
      normalizedEmail.includes("@")
        ? await findClientAccountByEmail(
            normalizedEmail,
          )
        : await findClientAccountByUserCode(
            normalizedEmail,
          );

    console.log("[TPA-AUTH-DIAG]", { userCode: normalizedEmail, accountFound: Boolean(account), status: account?.status ?? null });
    if (
      !account ||
      account.status !== "active"
    ) {

      return NextResponse.json(
        {
          ok:
            false,
        },
        {
          status:
            401,
        },
      );
    }


    const passwordIsValid =
      await verifyClientPassword(
        body.password,
        account,
      );

    console.log("[TPA-AUTH-DIAG]", { userCode: normalizedEmail, passwordValid: passwordIsValid });
    if (!passwordIsValid) {

      return NextResponse.json(
        {
          ok:
            false,
        },
        {
          status:
            401,
        },
      );
    }


    customerId =
      account.customerId;

    switch (account.role) {
      case "seller":
        accountRole = "seller";
        break;

      case "wholesaler_admin":
        accountRole = "wholesaler_admin";
        break;

      case "super_admin":
      case "admin":
        accountRole = "super_admin";
        break;

      default:
        accountRole = "client";
        break;
    }

    organizationId =
      account.organizationId?.trim() ||
      undefined;

    if (
      (
        accountRole === "seller" ||
        accountRole === "wholesaler_admin"
      ) &&
      !organizationId
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "ACCOUNT_ORGANIZATION_REQUIRED",
        },
        {
          status: 403,
        },
      );
    }

    const customer =
      await getCentralCustomer(
        customerId,
      );

    if (!customer) {

      return NextResponse.json(
        {
          ok:
            false,
        },
        {
          status:
            403,
        },
      );
    }

    displayName =
      `${customer.firstName} ${customer.lastName}`.trim();

  } else {

    if (
      process.env.NODE_ENV ===
      "production"
    ) {

      return NextResponse.json(
        {
          error:
            "Client authentication is not configured.",
        },
        {
          status:
            503,
        },
      );
    }


    const testEmail =
      process.env
        .TPA_TEST_CLIENT_EMAIL
        ?.trim()
        .toLowerCase();

    const testPassword =
      process.env
        .TPA_TEST_CLIENT_PASSWORD;

    if (
      !testEmail ||
      !testPassword ||
      normalizedEmail !==
        testEmail ||
      body.password !==
        testPassword
    ) {

      return NextResponse.json(
        {
          ok:
            false,
        },
        {
          status:
            401,
        },
      );
    }

    customerId =
      "C2";

    displayName =
      "Client TPA";
  }


  // Authentication has succeeded. Re-enable this seller in the existing queue.
  if (accountRole === "seller" && organizationId) {
    try { await changeCounterPresence(organizationId, customerId, "available", "", true); }
    catch { return NextResponse.json({ ok: false, error: "COUNTER_UNAVAILABLE" }, { status: 503 }); }
  }

  const session =
    resolveAuthenticatedTpaSession({
      userId:
        customerId,

      customerId,

      accountType:
        accountRole === "seller"
          ? "seller"
          : (
              accountRole === "wholesaler_admin" ||
              accountRole === "super_admin"
            )
            ? "administrator"
            : "customer",

      accessRole:
        accountRole,

      organizationId,

      displayName,
    });


  const payload =
    Buffer
      .from(
        JSON.stringify(
          session,
        ),
        "utf8",
      )
      .toString(
        "base64url",
      );

  const signature =
    sign(
      payload,
      sessionSecret,
    );

  const token =
    `${payload}.${signature}`;


  const response =
    NextResponse.json({
      ok:
        true,

      channel:
        session.channel,

      role:
        session.role,

      accessRole:
        session.accessRole,

      organizationId:
        session.organizationId,
    });


  response.cookies.set(
    "tpa_session",
    token,
    {
      httpOnly:
        true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite:
        "lax",

      path:
        "/",

      maxAge:
        60 * 60 * 24 * 30,
    },
  );


  if (redisConfigured) {
    await markClientLogin(
      customerId,
    );
  }

  return response;
}
