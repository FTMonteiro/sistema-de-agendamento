import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const code =
      request.nextUrl.searchParams.get("code");

    const googleError =
      request.nextUrl.searchParams.get("error");

    /*
    |--------------------------------------------------------------------------
    | GOOGLE CANCELADO
    |--------------------------------------------------------------------------
    */

    if (googleError) {
      console.log(
        "GOOGLE CALLBACK: login cancelado:",
        googleError
      );

      return NextResponse.redirect(
        new URL(
          "/login?error=google_cancelled",
          request.url
        )
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CODE AUSENTE
    |--------------------------------------------------------------------------
    */

    if (!code) {
      console.error(
        "GOOGLE CALLBACK: code não encontrado."
      );

      return NextResponse.redirect(
        new URL(
          "/login?error=google",
          request.url
        )
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CONFIGURAÇÃO
    |--------------------------------------------------------------------------
    */

    const clientId =
      process.env.GOOGLE_CLIENT_ID;

    const clientSecret =
      process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error(
        "GOOGLE CALLBACK: configuração incompleta."
      );

      return NextResponse.redirect(
        new URL(
          "/login?error=google_config",
          request.url
        )
      );
    }

    /*
    |--------------------------------------------------------------------------
    | REDIRECT URI
    |--------------------------------------------------------------------------
    */

    const origin =
      request.nextUrl.origin;

    const redirectUri =
      `${origin}/api/auth/google/callback`;

    /*
    |--------------------------------------------------------------------------
    | TROCAR CODE PELO ACCESS TOKEN
    |--------------------------------------------------------------------------
    */

    const tokenResponse =
      await fetch(
        "https://oauth2.googleapis.com/token",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },

          body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type:
              "authorization_code",
          }),
        }
      );

    if (!tokenResponse.ok) {
      const tokenError =
        await tokenResponse.text();

      console.error(
        "GOOGLE CALLBACK: erro ao obter token:",
        tokenError
      );

      return NextResponse.redirect(
        new URL(
          "/login?error=google",
          request.url
        )
      );
    }

    const tokens =
      await tokenResponse.json();

    /*
    |--------------------------------------------------------------------------
    | OBTER DADOS DO UTILIZADOR
    |--------------------------------------------------------------------------
    */

    const userResponse =
      await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization:
              `Bearer ${tokens.access_token}`,
          },
        }
      );

    if (!userResponse.ok) {
      console.error(
        "GOOGLE CALLBACK: não foi possível obter perfil."
      );

      return NextResponse.redirect(
        new URL(
          "/login?error=google",
          request.url
        )
      );
    }

    const googleUser =
      await userResponse.json();

    const googleEmail =
      String(googleUser.email || "")
        .trim()
        .toLowerCase();

    const googleName =
      String(
        googleUser.name ||
        googleUser.given_name ||
        ""
      ).trim();

    /*
    |--------------------------------------------------------------------------
    | VALIDAR EMAIL
    |--------------------------------------------------------------------------
    */

    if (!googleEmail) {
      console.error(
        "GOOGLE CALLBACK: Google não devolveu email."
      );

      return NextResponse.redirect(
        new URL(
          "/login?error=google",
          request.url
        )
      );
    }

    console.log(
      "GOOGLE CALLBACK: email:",
      googleEmail
    );

    /*
    |--------------------------------------------------------------------------
    | PROCURAR UTILIZADOR
    |--------------------------------------------------------------------------
    |
    | mode=login:
    |
    | NÃO criar uma conta automaticamente.
    |
    | Só entra quem já possui conta NEVRIX.
    |
    */

    const user =
      await prisma.user.findUnique({
        where: {
          email: googleEmail,
        },
      });

    if (!user) {
      console.log(
        "GOOGLE CALLBACK: utilizador não cadastrado."
      );

      return NextResponse.redirect(
        new URL(
          "/login?error=google_not_registered",
          request.url
        )
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CRIAR SESSÃO
    |--------------------------------------------------------------------------
    |
    | EXATAMENTE COMO NO LOGIN NORMAL
    |
    */

    console.log(
      "GOOGLE CALLBACK: criando sessão:",
      user.id
    );

    await createSession(user.id);

    console.log(
      "GOOGLE CALLBACK: sessão criada."
    );

    /*
    |--------------------------------------------------------------------------
    | IR PARA O DASHBOARD
    |--------------------------------------------------------------------------
    */

    return NextResponse.redirect(
      new URL("/dashboard", request.url)
    );
  } catch (error) {
    console.error(
      "GOOGLE CALLBACK: erro completo:",
      error
    );

    return NextResponse.redirect(
      new URL(
        "/login?error=google",
        request.url
      )
    );
  }
}