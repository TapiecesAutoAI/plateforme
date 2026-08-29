import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  verifyTpaSessionToken,
} from "../../../../lib/session/TpaSessionToken";

export async function GET(
  request: NextRequest,
) {
  const secret =
    process.env.TPA_SESSION_SECRET;

  if (!secret) {
    return NextResponse.json(
      {
        authenticated: false,
      },
      {
        status: 503,
      },
    );
  }

  const token =
    request.cookies.get(
      "tpa_session",
    )?.value;

  if (!token) {
    return NextResponse.json(
      {
        authenticated: false,
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

  if (!session) {
    return NextResponse.json(
      {
        authenticated: false,
      },
      {
        status: 401,
      },
    );
  }

  return NextResponse.json({
    authenticated: true,

    customerId:
      session.customerId ??
      null,

    channel:
      session.channel,

    role:
      session.role,

    displayName:
      session.displayName ??
      null,
  });
}