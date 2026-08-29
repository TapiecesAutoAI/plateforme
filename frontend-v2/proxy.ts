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
   * =========================================================
   * RESSOURCES ET ROUTES PUBLIQUES
   * =========================================================
   */

  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/access" ||
    pathname === "/client/login" ||
    pathname.startsWith(
      "/api/access",
    ) ||
    pathname.startsWith(
      "/api/auth/client/login",
    ) ||
    pathname.startsWith(
      "/api/auth/session",
    ) ||
    pathname.startsWith(
      "/api/showroom/counter",
    ) ||
    pathname.startsWith(
      "/api/diagnostic-v2",
    ) ||
    pathname.startsWith(
      "/_next/",
    ) ||
    pathname.startsWith(
      "/brands/",
    ) ||
    pathname.startsWith(
      "/media/",
    ) ||
    pathname.startsWith(
      "/parts/",
    ) ||
    pathname ===
      "/zt-consult-logo.png" ||
    pathname ===
      "/favicon.ico"
  ) {

    return NextResponse.next();
  }


  /*
   * =========================================================
   * ESPACE CLIENT WEB
   * =========================================================
   *
   * Le login client crée le cookie :
   *
   * tpa_session
   *
   * Si ce cookie existe, le client peut accéder à /client.
   */

  if (
    pathname === "/client" ||
    pathname.startsWith(
      "/client/",
    )
  ) {

    const clientSession =
      request.cookies.get(
        "tpa_session",
      );


    if (
      clientSession?.value
    ) {

      return NextResponse.next();
    }


    const loginUrl =
      request.nextUrl.clone();

    loginUrl.pathname =
      "/login";

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


  /*
   * =========================================================
   * CLIENT TPA - API SHOWROOM PARTICULIER
   * =========================================================
   *
   * Le client connecté peut utiliser le pipeline
   * identification / compatibilité / offre.
   *
   * Sans session client, on laisse l'ancienne
   * protection privée continuer son travail.
   */

  if (
    pathname.startsWith(
      "/api/showroom/particulier",
    )
  ) {

    const clientSession =
      request.cookies.get(
        "tpa_session",
      );

    if (
      clientSession?.value
    ) {
      return NextResponse.next();
    }
  }


  /*
   * =========================================================
   * CLIENT TPA - PARCOURS
   * =========================================================
   *
   * Un client connecté doit pouvoir continuer vers
   * le diagnostic et la recherche pièce sans refaire
   * l'ancien login privé.
   */

  if (
    pathname === "/showroom/particulier" ||
    pathname.startsWith(
      "/showroom/particulier/",
    ) ||
    pathname === "/piece" ||
    pathname.startsWith(
      "/piece/",
    )
  ) {

    const tpaSession =
      request.cookies.get(
        "tpa_session",
      );

    if (
      tpaSession?.value
    ) {
      return NextResponse.next();
    }

    const loginUrl =
      request.nextUrl.clone();

    loginUrl.pathname =
      "/login";

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


  /*
   * =========================================================
   * ANCIENNE PROTECTION PRIVEE
   * =========================================================
   *
   * Conservée temporairement pour les zones qui ne sont
   * pas encore migrées vers les nouvelles sessions TPA.
   */

  const accessToken =
    process.env
      .PRIVATE_ACCESS_TOKEN;


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
    "/login";

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