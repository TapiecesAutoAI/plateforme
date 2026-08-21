import {
  NextRequest,
  NextResponse,
} from "next/server";


export function proxy(
  request:
    NextRequest,
) {

  const pathname =
    request.nextUrl.pathname;


  /*
   * Routes publiques nécessaires
   */
  if (
    pathname === "/access" ||
    pathname.startsWith(
      "/api/access",
    ) ||
    pathname.startsWith(
      "/_next/",
    ) ||
    pathname ===
      "/favicon.ico"
  ) {

    return NextResponse.next();
  }


  const accessToken =
    process.env
      .PRIVATE_ACCESS_TOKEN;


  /*
   * En local, si aucune protection n'est configurée,
   * on laisse travailler normalement.
   */
  if (!accessToken) {

    return NextResponse.next();
  }


  const cookie =
    request.cookies.get(
      "tpa_private_access",
    );


  if (
    cookie?.value ===
    accessToken
  ) {

    return NextResponse.next();
  }


  const loginUrl =
    request.nextUrl.clone();

  loginUrl.pathname =
    "/access";

  loginUrl.search =
    "";

  loginUrl.searchParams.set(
    "next",
    pathname +
      request.nextUrl.search,
  );


  return NextResponse.redirect(
    loginUrl,
  );
}


export const config = {

  matcher: [
    "/((?!_next/static|_next/image).*)",
  ],

};
