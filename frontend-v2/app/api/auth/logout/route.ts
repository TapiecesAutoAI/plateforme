import {
  NextResponse,
} from "next/server";

export async function POST() {
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