import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.error("GOOGLE_CLIENT_ID não configurado.");

      return NextResponse.redirect(
        new URL("/login?error=google_config", request.url)
      );
    }

    /*
    |--------------------------------------------------------------------------
    | DEFINIR MODO
    |--------------------------------------------------------------------------
    |
    | /api/auth/google?mode=login
    | /api/auth/google?mode=register
    |
    */

    const mode =
      request.nextUrl.searchParams.get("mode") || "login";

    if (mode !== "login" && mode !== "register") {
      return NextResponse.redirect(
        new URL("/login?error=google_mode", request.url)
      );
    }

    const origin = request.nextUrl.origin;

    const redirectUri =
      `${origin}/api/auth/google/callback`;

    const googleUrl = new URL(
      "https://accounts.google.com/o/oauth2/v2/auth"
    );

    googleUrl.searchParams.set(
      "client_id",
      clientId
    );

    googleUrl.searchParams.set(
      "redirect_uri",
      redirectUri
    );

    googleUrl.searchParams.set(
      "response_type",
      "code"
    );

    googleUrl.searchParams.set(
      "scope",
      "openid email profile"
    );

    googleUrl.searchParams.set(
      "access_type",
      "offline"
    );

    googleUrl.searchParams.set(
      "prompt",
      "select_account"
    );

    /*
    |--------------------------------------------------------------------------
    | ENVIAR MODO PARA O CALLBACK
    |--------------------------------------------------------------------------
    */

    googleUrl.searchParams.set(
      "state",
      mode
    );

    console.log(
      "GOOGLE:",
      mode,
      "→",
      redirectUri
    );

    return NextResponse.redirect(googleUrl);
  } catch (error) {
    console.error(
      "GOOGLE LOGIN: erro:",
      error
    );

    return NextResponse.redirect(
      new URL("/login?error=google", request.url)
    );
  }
}