import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.error("GOOGLE_CLIENT_ID não configurado.");

      return new NextResponse(
        "GOOGLE_CLIENT_ID não configurado.",
        {
          status: 500,
        }
      );
    }

    const requestUrl = new URL(request.url);

    /*
    |--------------------------------------------------------------------------
    | MODO
    |--------------------------------------------------------------------------
    |
    | login    = usuário já deve estar cadastrado com Google
    | register = criar uma nova conta usando Google
    |
    */

    const mode =
      requestUrl.searchParams.get("mode") === "register"
        ? "register"
        : "login";

    /*
    |--------------------------------------------------------------------------
    | STATE
    |--------------------------------------------------------------------------
    |
    | Usamos state para proteger o fluxo OAuth.
    |
    */

    const state = crypto.randomBytes(32).toString("hex");

    const cookieStore = await cookies();

    cookieStore.set("google_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10,
    });

    cookieStore.set("google_oauth_mode", mode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10,
    });

    /*
    |--------------------------------------------------------------------------
    | REDIRECT URI
    |--------------------------------------------------------------------------
    */

    const redirectUri =
      `${requestUrl.origin}/api/auth/google/callback`;

    console.log("=================================");
    console.log("🔵 GOOGLE OAUTH");
    console.log("Modo:", mode);
    console.log("Redirect URI:", redirectUri);
    console.log("=================================");

    /*
    |--------------------------------------------------------------------------
    | GOOGLE URL
    |--------------------------------------------------------------------------
    */

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

    googleUrl.searchParams.set(
      "state",
      state
    );

    return NextResponse.redirect(
      googleUrl.toString()
    );
  } catch (error) {
    console.error(
      "Erro ao iniciar login Google:",
      error
    );

    return new NextResponse(
      "Não foi possível iniciar o login com Google.",
      {
        status: 500,
      }
    );
  }
}