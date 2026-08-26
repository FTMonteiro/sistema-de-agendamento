
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    /*
    |--------------------------------------------------------------------------
    | GOOGLE CLIENT ID
    |--------------------------------------------------------------------------
    */

    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.error(
        "GOOGLE OAUTH: GOOGLE_CLIENT_ID não configurado.",
      );

      return NextResponse.redirect(
        new URL(
          "/login?error=google_config",
          request.url,
        ),
      );
    }

    /*
    |--------------------------------------------------------------------------
    | MODO
    |--------------------------------------------------------------------------
    |
    | Login:
    | /api/auth/google?mode=login
    |
    | Cadastro:
    | /api/auth/google?mode=register
    |
    */

    const requestedMode =
      request.nextUrl.searchParams.get("mode");

    const mode =
      requestedMode === "register"
        ? "register"
        : "login";

    /*
    |--------------------------------------------------------------------------
    | ORIGEM
    |--------------------------------------------------------------------------
    |
    | Em produção usamos a URL oficial do sistema.
    |
    | Isso evita que o redirect_uri mude dependendo
    | de como a aplicação foi acessada.
    |
    */

    const productionUrl =
      process.env.NEXT_PUBLIC_APP_URL;

    const origin =
      productionUrl ||
      request.nextUrl.origin;

    const cleanOrigin =
      origin.replace(/\/$/, "");

    const redirectUri =
      `${cleanOrigin}/api/auth/google/callback`;

    /*
    |--------------------------------------------------------------------------
    | LOGS
    |--------------------------------------------------------------------------
    */

    console.log(
      "==================================================",
    );

    console.log(
      "GOOGLE OAUTH: INICIANDO",
    );

    console.log(
      "MODE:",
      mode,
    );

    console.log(
      "ORIGIN:",
      cleanOrigin,
    );

    console.log(
      "REDIRECT URI:",
      redirectUri,
    );

    console.log(
      "==================================================",
    );

    /*
    |--------------------------------------------------------------------------
    | GOOGLE OAUTH URL
    |--------------------------------------------------------------------------
    */

    const googleUrl =
      new URL(
        "https://accounts.google.com/o/oauth2/v2/auth",
      );

    /*
    |--------------------------------------------------------------------------
    | PARÂMETROS
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | ACCESS TYPE
    |--------------------------------------------------------------------------
    */

    googleUrl.searchParams.set(
      "access_type",
      "offline",
    );

    /*
    |--------------------------------------------------------------------------
    | ESCOLHER CONTA
    |--------------------------------------------------------------------------
    */

    googleUrl.searchParams.set(
      "prompt",
      "select_account",
    );

    /*
    |--------------------------------------------------------------------------
    | STATE
    |--------------------------------------------------------------------------
    |
    | O callback usa este valor para saber se
    | estamos fazendo login ou cadastro.
    |
    */

    googleUrl.searchParams.set(
      "state",
      mode,
    );

    /*
    |--------------------------------------------------------------------------
    | REDIRECIONAR PARA GOOGLE
    |--------------------------------------------------------------------------
    */

    console.log(
      "GOOGLE OAUTH: redirecionando para Google...",
    );

    return NextResponse.redirect(
      googleUrl,
    );
  } catch (error) {
    console.error(
      "GOOGLE OAUTH: erro ao iniciar:",
      error,
    );

    return NextResponse.redirect(
      new URL(
        "/login?error=google",
        request.url,
      ),
    );
  }
}

