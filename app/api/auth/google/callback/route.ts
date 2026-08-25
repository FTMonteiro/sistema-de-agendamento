import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    /*
    |--------------------------------------------------------------------------
    | DADOS RECEBIDOS DO GOOGLE
    |--------------------------------------------------------------------------
    */

    const code =
      request.nextUrl.searchParams.get("code");

    const googleError =
      request.nextUrl.searchParams.get("error");

    const mode =
      request.nextUrl.searchParams.get("state") || "login";

    /*
    |--------------------------------------------------------------------------
    | VALIDAR MODE
    |--------------------------------------------------------------------------
    */

    if (mode !== "login" && mode !== "register") {
      console.error(
        "GOOGLE CALLBACK: mode inválido:",
        mode
      );

      return NextResponse.redirect(
        new URL(
          "/login?error=google_mode",
          request.url
        )
      );
    }

    /*
    |--------------------------------------------------------------------------
    | GOOGLE CANCELADO
    |--------------------------------------------------------------------------
    */

    if (googleError) {
      console.log(
        "GOOGLE CALLBACK: operação cancelada:",
        googleError
      );

      const redirect =
        mode === "register"
          ? "/register?error=google_cancelled"
          : "/login?error=google_cancelled";

      return NextResponse.redirect(
        new URL(redirect, request.url)
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

      const redirect =
        mode === "register"
          ? "/register?error=google"
          : "/login?error=google";

      return NextResponse.redirect(
        new URL(redirect, request.url)
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

      const redirect =
        mode === "register"
          ? "/register?error=google_config"
          : "/login?error=google_config";

      return NextResponse.redirect(
        new URL(redirect, request.url)
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
    | TROCAR CODE POR TOKEN
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
        "GOOGLE CALLBACK: erro token:",
        tokenError
      );

      const redirect =
        mode === "register"
          ? "/register?error=google"
          : "/login?error=google";

      return NextResponse.redirect(
        new URL(redirect, request.url)
      );
    }

    const tokens =
      await tokenResponse.json();

    /*
    |--------------------------------------------------------------------------
    | OBTER PERFIL DO GOOGLE
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
        "GOOGLE CALLBACK: erro ao obter perfil."
      );

      const redirect =
        mode === "register"
          ? "/register?error=google"
          : "/login?error=google";

      return NextResponse.redirect(
        new URL(redirect, request.url)
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
        "GOOGLE CALLBACK: email não encontrado."
      );

      const redirect =
        mode === "register"
          ? "/register?error=google_email"
          : "/login?error=google_email";

      return NextResponse.redirect(
        new URL(redirect, request.url)
      );
    }

    console.log(
      "GOOGLE CALLBACK:",
      {
        mode,
        email: googleEmail,
        name: googleName,
      }
    );

    /*
    |--------------------------------------------------------------------------
    | PROCURAR CONTA EXISTENTE
    |--------------------------------------------------------------------------
    */

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email: googleEmail,
        },
      });

    /*
    |--------------------------------------------------------------------------
    | ================================================================
    | CADASTRO COM GOOGLE
    | ================================================================
    */

    if (mode === "register") {
      /*
      |--------------------------------------------------------------------------
      | EMAIL JÁ EXISTE
      |--------------------------------------------------------------------------
      |
      | NÃO PERMITIMOS criar outra conta.
      |
      */

      if (existingUser) {
        console.log(
          "GOOGLE REGISTER: conta já existe:",
          googleEmail
        );

        return NextResponse.redirect(
          new URL(
            "/register?error=google_account_exists",
            request.url
          )
        );
      }

      /*
      |--------------------------------------------------------------------------
      | CRIAR EMPRESA + UTILIZADOR
      |--------------------------------------------------------------------------
      */

      const result =
        await prisma.$transaction(
          async (transaction) => {
            const business =
              await transaction.business.create({
                data: {
                  name:
                    googleName ||
                    "Minha Empresa",
                  email: googleEmail,
                },
              });

            const user =
              await transaction.user.create({
                data: {
                  name:
                    googleName ||
                    "Utilizador",

                  email: googleEmail,

                  /*
                  | Conta Google não precisa
                  | de password.
                  */
                  password: null,

                  role: "OWNER",

                  /*
                  | Google já confirmou
                  | a posse do email.
                  */
                  emailVerified: true,

                  businessId: business.id,
                },
              });

            return {
              business,
              user,
            };
          }
        );

      console.log(
        "GOOGLE REGISTER: conta criada:",
        result.user.email
      );

      /*
      |--------------------------------------------------------------------------
      | CRIAR SESSÃO
      |--------------------------------------------------------------------------
      */

      await createSession(
        result.user.id
      );

      console.log(
        "GOOGLE REGISTER: sessão criada."
      );

      /*
      |--------------------------------------------------------------------------
      | ENTRAR DIRETAMENTE NO SISTEMA
      |--------------------------------------------------------------------------
      */

      return NextResponse.redirect(
        new URL(
          "/dashboard",
          request.url
        )
      );
    }

    /*
    |--------------------------------------------------------------------------
    | ================================================================
    | LOGIN COM GOOGLE
    | ================================================================
    */

    if (mode === "login") {
      /*
      |--------------------------------------------------------------------------
      | CONTA NÃO EXISTE
      |--------------------------------------------------------------------------
      */

      if (!existingUser) {
        console.log(
          "GOOGLE LOGIN: conta não encontrada:",
          googleEmail
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
      */

      console.log(
        "GOOGLE LOGIN: criando sessão:",
        existingUser.id
      );

      await createSession(
        existingUser.id
      );

      console.log(
        "GOOGLE LOGIN: sessão criada."
      );

      /*
      |--------------------------------------------------------------------------
      | DASHBOARD
      |--------------------------------------------------------------------------
      */

      return NextResponse.redirect(
        new URL(
          "/dashboard",
          request.url
        )
      );
    }

    /*
    |--------------------------------------------------------------------------
    | FALLBACK
    |--------------------------------------------------------------------------
    */

    return NextResponse.redirect(
      new URL(
        "/login?error=google",
        request.url
      )
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