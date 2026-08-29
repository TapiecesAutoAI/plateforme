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
  resolveCustomerIdByLoginEmail,
} from "../../../../../lib/client/ClientIdentityResolver";


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

  const expectedEmail =
    process.env
      .TPA_TEST_CLIENT_EMAIL;

  const expectedPassword =
    process.env
      .TPA_TEST_CLIENT_PASSWORD;

  const sessionSecret =
    process.env
      .TPA_SESSION_SECRET;


  if (
    !expectedEmail ||
    !expectedPassword ||
    !sessionSecret
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


  if (
    normalizedEmail !==
      expectedEmail
        .trim()
        .toLowerCase() ||
    body.password !==
      expectedPassword
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


  const customerId =
    resolveCustomerIdByLoginEmail(
      normalizedEmail,
    );

  if (!customerId) {
    return NextResponse.json(
      {
        ok: false,
      },
      {
        status: 403,
      },
    );
  }


  const session =
    resolveAuthenticatedTpaSession({
      userId:
        "client-test-001",

      customerId,

      accountType:
        "customer",

      displayName:
        "Client TPA",
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


  return response;
}