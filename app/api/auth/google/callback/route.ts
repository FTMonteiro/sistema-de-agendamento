import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
  id_token?: string;
}

interface GoogleUser {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
  email_verified?: boolean;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  try {
    /*
    |--------------------------------------------------------------------------
    | PEGAR PARÂMETROS
    |--------------------------------------------------------------------------
    */

    const code =
      requestUrl.searchParams.get("code");

    const state =
      requestUrl.searchParams.get("state");

    const googleError =
      requestUrl.searchParams.get("error");

    /*
    |--------------------------------------------------------------------------
    | ERRO DO GOOGLE
    |--------------------------------------------------------------------------
    */

    if (googleError) {
      console.error(
        "Google OAuth:",
        googleError
      );

      return NextResponse.redirect(
        new URL(
          "/login?error=google_cancelled",
          requestUrl.origin
        )
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CODE
    |--------------------------------------------------------------------------
    */

    if (!code) {
      return NextResponse.redirect(
        new URL(
          "/login?error=google_code_missing",
          requestUrl.origin
        )
      );
    }

    /*
    |--------------------------------------------------------------------------
    | STATE
    |--------------------------------------------------------------------------
    */

    const cookieStore = await cookies();

    const savedState =
      cookieStore.get(
        "google_oauth_state"
      )?.value;

    const mode =
      cookieStore.get(
        "google_oauth_mode"
      )?.value || "login";

    if (
      !state ||
      !savedState ||
      state !== savedState
    ) {
      console.error(
        "❌ Google OAuth state inválido."
      );

      return NextResponse.redirect(
        new URL(
          "/login?error=google_invalid_state",
          requestUrl.origin
        )
      );
    }

    /*
    |--------------------------------------------------------------------------
    | LIMPAR COOKIES OAUTH
    |--------------------------------------------------------------------------
    */

    cookieStore.delete(
      "google_oauth_state"
    );

    cookieStore.delete(
      "google_oauth_mode"
    );

    /*
    |--------------------------------------------------------------------------
    | VARIÁVEIS
    |--------------------------------------------------------------------------
    */

    const clientId =
      process.env.GOOGLE_CLIENT_ID;

    const clientSecret =
      process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId) {
      throw new Error(
        "GOOGLE_CLIENT_ID não configurado."
      );
    }

    if (!clientSecret) {
      throw new Error(
        "GOOGLE_CLIENT_SECRET não configurado."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | REDIRECT URI
    |--------------------------------------------------------------------------
    */

    const redirectUri =
      `${requestUrl.origin}/api/auth/google/callback`;

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
      const errorText =
        await tokenResponse.text();

      console.error(
        "Erro ao trocar código Google:",
        errorText
      );

      throw new Error(
        "Não foi possível obter o token do Google."
      );
    }

    const tokenData =
      (await tokenResponse.json()) as GoogleTokenResponse;

    if (!tokenData.access_token) {
      throw new Error(
        "Google não retornou access_token."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | PEGAR UTILIZADOR GOOGLE
    |--------------------------------------------------------------------------
    */

    const googleUserResponse =
      await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization:
              `Bearer ${tokenData.access_token}`,
          },
        }
      );

    if (!googleUserResponse.ok) {
      throw new Error(
        "Não foi possível obter os dados do Google."
      );
    }

    const googleUser =
      (await googleUserResponse.json()) as GoogleUser;

    /*
    |--------------------------------------------------------------------------
    | VALIDAR GOOGLE USER
    |--------------------------------------------------------------------------
    */

    if (!googleUser.sub) {
      throw new Error(
        "Google não retornou o ID do usuário."
      );
    }

    if (!googleUser.email) {
      throw new Error(
        "Google não retornou o email."
      );
    }

    if (
      googleUser.email_verified === false
    ) {
      return NextResponse.redirect(
        new URL(
          "/login?error=google_email_not_verified",
          requestUrl.origin
        )
      );
    }

    const email =
      googleUser.email
        .trim()
        .toLowerCase();

    const name =
      googleUser.name?.trim() ||
      email.split("@")[0];

    const googleId =
      googleUser.sub;

    /*
    |--------------------------------------------------------------------------
    | LOGIN COM GOOGLE
    |--------------------------------------------------------------------------
    |
    | IMPORTANTE:
    |
    | No login NÃO procuramos somente pelo email.
    |
    | Procuramos especificamente pelo googleId.
    |
    | Isso significa que a conta precisa ter sido
    | cadastrada anteriormente usando Google.
    |
    */

    if (mode === "login") {
      console.log(
        "🔵 Login Google para:",
        email
      );

      const user =
        await prisma.user.findUnique({
          where: {
            googleId,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            businessId: true,
            googleId: true,
          },
        });

      /*
      |--------------------------------------------------------------------------
      | GOOGLE NÃO CADASTRADO
      |--------------------------------------------------------------------------
      */

      if (!user) {
        console.log(
          "❌ Conta Google não cadastrada:",
          email
        );

        return NextResponse.redirect(
          new URL(
            "/login?error=google_not_registered",
            requestUrl.origin
          )
        );
      }

      /*
      |--------------------------------------------------------------------------
      | CRIAR SESSÃO
      |--------------------------------------------------------------------------
      */

      await createSession(user.id);

      console.log(
        "✅ Login Google realizado:",
        user.email
      );

      return NextResponse.redirect(
        new URL(
          "/dashboard",
          requestUrl.origin
        )
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CADASTRO COM GOOGLE
    |--------------------------------------------------------------------------
    */

    if (mode === "register") {
      console.log(
        "🟢 Cadastro Google para:",
        email
      );

      /*
      |--------------------------------------------------------------------------
      | VERIFICAR SE GOOGLE ID JÁ EXISTE
      |--------------------------------------------------------------------------
      */

      const googleUserExists =
        await prisma.user.findUnique({
          where: {
            googleId,
          },
        });

      if (googleUserExists) {
        return NextResponse.redirect(
          new URL(
            "/login?error=google_already_registered",
            requestUrl.origin
          )
        );
      }

      /*
      |--------------------------------------------------------------------------
      | VERIFICAR EMAIL
      |--------------------------------------------------------------------------
      |
      | Não associamos automaticamente Google
      | a uma conta de email/senha.
      |
      */

      const emailUser =
        await prisma.user.findUnique({
          where: {
            email,
          },
        });

      if (emailUser) {
        console.log(
          "⚠️ Email já cadastrado:",
          email
        );

        return NextResponse.redirect(
          new URL(
            "/cadastro?error=email_already_registered",
            requestUrl.origin
          )
        );
      }

      /*
      |--------------------------------------------------------------------------
      | CRIAR BUSINESS + USER
      |--------------------------------------------------------------------------
      */

      const user =
        await prisma.$transaction(
          async (tx) => {
            /*
            |--------------------------------------------------------------------------
            | BUSINESS
            |--------------------------------------------------------------------------
            */

            const business =
              await tx.business.create({
                data: {
                  name: `${name} - NEVRIX`,
                  email,
                },
              });

            /*
            |--------------------------------------------------------------------------
            | USER
            |--------------------------------------------------------------------------
            */

            const createdUser =
              await tx.user.create({
                data: {
                  name,
                  email,
                  password: null,
                  googleId,
                  role: "OWNER",
                  businessId:
                    business.id,
                },
              });

            return createdUser;
          }
        );

      /*
      |--------------------------------------------------------------------------
      | CRIAR SESSÃO
      |--------------------------------------------------------------------------
      */

      await createSession(user.id);

      console.log(
        "✅ Cadastro Google realizado:",
        user.email
      );

      /*
      |--------------------------------------------------------------------------
      | DASHBOARD
      |--------------------------------------------------------------------------
      */

      return NextResponse.redirect(
        new URL(
          "/dashboard",
          requestUrl.origin
        )
      );
    }

    /*
    |--------------------------------------------------------------------------
    | MODO INVÁLIDO
    |--------------------------------------------------------------------------
    */

    return NextResponse.redirect(
      new URL(
        "/login?error=google_invalid_mode",
        requestUrl.origin
      )
    );
  } catch (error) {
    console.error(
      "❌ Erro no login/cadastro Google:",
      error
    );

    return NextResponse.redirect(
      new URL(
        "/login?error=google_auth_failed",
        requestUrl.origin
      )
    );
  }
}