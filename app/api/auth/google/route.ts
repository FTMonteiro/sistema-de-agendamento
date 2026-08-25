import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.error(
        "GOOGLE_CLIENT_ID não configurado.",
      );

      return new NextResponse(
        "GOOGLE_CLIENT_ID não configurado.",
        {
          status: 500,
        },
      );
    }

    const requestUrl = new URL(request.url);

    /*
    |--------------------------------------------------------------------------
    | MODO
    |--------------------------------------------------------------------------
    |
    | login    = entrar com Google
    | register = criar conta com Google
    |
    */

    const mode =
      requestUrl.searchParams.get("mode") ===
      "register"
        ? "register"
        : "login";

    /*
    |--------------------------------------------------------------------------
    | NOME DA EMPRESA
    |--------------------------------------------------------------------------
    |
    | O Google não fornece o nome da empresa.
    |
    | Por isso, no cadastro, recebemos o nome que o
    | utilizador digitou no formulário e guardamos
    | temporariamente em cookie httpOnly.
    |
    */

    let company = "";

    if (mode === "register") {
      company =
        requestUrl.searchParams
          .get("company")
          ?.trim() || "";

      if (!company) {
        return NextResponse.redirect(
          new URL(
            "/cadastro?error=company_required",
            requestUrl.origin,
          ),
        );
      }

      if (company.length < 2) {
        return NextResponse.redirect(
          new URL(
            "/cadastro?error=company_invalid",
            requestUrl.origin,
          ),
        );
      }

      if (company.length > 120) {
        return NextResponse.redirect(
          new URL(
            "/cadastro?error=company_too_long",
            requestUrl.origin,
          ),
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | STATE
    |--------------------------------------------------------------------------
    |
    | Proteção contra ataques CSRF no OAuth.
    |
    */

    const state =
      crypto.randomBytes(32).toString("hex");

    const cookieStore = await cookies();

    /*
    |--------------------------------------------------------------------------
    | COOKIE STATE
    |--------------------------------------------------------------------------
    */

    cookieStore.set(
      "google_oauth_state",
      state,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 10,
      },
    );

    /*
    |--------------------------------------------------------------------------
    | COOKIE MODE
    |--------------------------------------------------------------------------
    */

    cookieStore.set(
      "google_oauth_mode",
      mode,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 10,
      },
    );

    /*
    |--------------------------------------------------------------------------
    | COOKIE EMPRESA
    |--------------------------------------------------------------------------
    */

    if (mode === "register") {
      cookieStore.set(
        "google_oauth_company",
        company,
        {
          httpOnly: true,
          secure:
            process.env.NODE_ENV ===
            "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 10,
        },
      );
    } else {
      cookieStore.delete(
        "google_oauth_company",
      );
    }

    /*
    |--------------------------------------------------------------------------
    | REDIRECT URI
    |--------------------------------------------------------------------------
    */

    const redirectUri =
      `${requestUrl.origin}/api/auth/google/callback`;

    console.log(
      "=================================",
    );

    console.log(
      "🔵 GOOGLE OAUTH",
    );

    console.log(
      "Modo:",
      mode,
    );

    if (mode === "register") {
      console.log(
        "Empresa:",
        company,
      );
    }

    console.log(
      "Redirect URI:",
      redirectUri,
    );

    console.log(
      "=================================",
    );

    /*
    |--------------------------------------------------------------------------
    | URL GOOGLE
    |--------------------------------------------------------------------------
    */

    const googleUrl = new URL(
      "https://accounts.google.com/o/oauth2/v2/auth",
    );

    googleUrl.searchParams.set(
      "client_id",
      clientId,
    );

    googleUrl.searchParams.set(
      "redirect_uri",
      redirectUri,
    );

    googleUrl.searchParams.set(
      "response_type",
      "code",
    );

    googleUrl.searchParams.set(
      "scope",
      "openid email profile",
    );

    googleUrl.searchParams.set(
      "access_type",
      "offline",
    );

    googleUrl.searchParams.set(
      "prompt",
      "select_account",
    );

    googleUrl.searchParams.set(
      "state",
      state,
    );

    /*
    |--------------------------------------------------------------------------
    | REDIRECIONAR PARA GOOGLE
    |--------------------------------------------------------------------------
    */

    return NextResponse.redirect(
      googleUrl.toString(),
    );
  } catch (error) {
    console.error(
      "Erro ao iniciar login Google:",
      error,
    );

    return new NextResponse(
      "Não foi possível iniciar o login com Google.",
      {
        status: 500,
      },
    );
  }
}