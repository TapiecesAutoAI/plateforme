import {
  NextRequest,
  NextResponse,
} from "next/server";


export async function POST(
  request:
    NextRequest,
) {

  const expectedPassword =
    process.env
      .PRIVATE_ACCESS_PASSWORD;

  const accessToken =
    process.env
      .PRIVATE_ACCESS_TOKEN;


  if (
    !expectedPassword ||
    !accessToken
  ) {

    return NextResponse.json(
      {
        error:
          "Access gate is not configured.",
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
    typeof body.password !==
      "string" ||
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


  const response =
    NextResponse.json({
      ok:
        true,
    });


  response.cookies.set(
    "tpa_private_access",
    accessToken,
    {
      httpOnly:
        true,

      secure:
        process.env
          .NODE_ENV ===
        "production",

      sameSite:
        "lax",

      path:
        "/",

      maxAge:
        60 * 60 * 24 * 7,
    },
  );


  return response;
}
