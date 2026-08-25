import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

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

type PendingGoogleData = {
  googleId: string;
  email: string;
  name: string;
  expiresAt: number;
};

/*
|--------------------------------------------------------------------------
| GOOGLE PENDING SECRET
|--------------------------------------------------------------------------
*/

function getGooglePendingSecret() {
  const secret =
    process.env.GOOGLE_CLIENT_SECRET;

  if (!secret) {
    throw new Error(
      "GOOGLE_CLIENT_SECRET não configurado.",
    );
  }

  return secret;
}

/*
|--------------------------------------------------------------------------
| ASSINATURA DO REGISTRO GOOGLE PENDENTE
|--------------------------------------------------------------------------
*/

function createPendingGoogleSignature(
  data: string,
) {
  return crypto
    .createHmac(
      "sha256",
      getGooglePendingSecret(),
    )
    .update(data)
    .digest("hex");
}

/*
|--------------------------------------------------------------------------
| CRIAR VALOR TEMPORÁRIO
|--------------------------------------------------------------------------
*/

function createPendingGoogleValue(
  data: PendingGoogleData,
) {
  const payload = Buffer.from(
    JSON.stringify(data),
  ).toString("base64url");

  const signature =
    createPendingGoogleSignature(payload);

  return `${payload}.${signature}`;
}

/*
|--------------------------------------------------------------------------
| GOOGLE CALLBACK
|--------------------------------------------------------------------------
*/

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  try {
    /*
    |--------------------------------------------------------------------------
    | PARÂMETROS
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
    | ERRO GOOGLE
    |--------------------------------------------------------------------------
    */

    if (googleError) {
      console.error(
        "Google OAuth:",
        googleError,
      );

      return NextResponse.redirect(
        new URL(
          "/cadastro?error=google_cancelled",
          requestUrl.origin,
        ),
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
          "/cadastro?error=google_code_missing",
          requestUrl.origin,
        ),
      );
    }

    /*
    |--------------------------------------------------------------------------
    | COOKIES OAUTH
    |--------------------------------------------------------------------------
    */

    const cookieStore = await cookies();

    const savedState =
      cookieStore.get(
        "google_oauth_state",
      )?.value;

    const mode =
      cookieStore.get(
        "google_oauth_mode",
      )?.value || "login";

    /*
    |--------------------------------------------------------------------------
    | VALIDAR STATE
    |--------------------------------------------------------------------------
    */

    if (
      !state ||
      !savedState ||
      state !== savedState
    ) {
      console.error(
        "❌ Google OAuth state inválido.",
      );

      return NextResponse.redirect(
        new URL(
          "/cadastro?error=google_invalid_state",
          requestUrl.origin,
        ),
      );
    }

    /*
    |--------------------------------------------------------------------------
    | LIMPAR COOKIES OAUTH
    |--------------------------------------------------------------------------
    */

    cookieStore.delete(
      "google_oauth_state",
    );

    cookieStore.delete(
      "google_oauth_mode",
    );

    /*
    |--------------------------------------------------------------------------
    | GOOGLE CLIENT
    |--------------------------------------------------------------------------
    */

    const clientId =
      process.env.GOOGLE_CLIENT_ID;

    const clientSecret =
      process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId) {
      throw new Error(
        "GOOGLE_CLIENT_ID não configurado.",
      );
    }

    if (!clientSecret) {
      throw new Error(
        "GOOGLE_CLIENT_SECRET não configurado.",
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
        },
      );

    if (!tokenResponse.ok) {
      const errorText =
        await tokenResponse.text();

      console.error(
        "Erro ao trocar código Google:",
        errorText,
      );

      throw new Error(
        "Não foi possível obter o token do Google.",
      );
    }

    const tokenData =
      (await tokenResponse.json()) as GoogleTokenResponse;

    if (!tokenData.access_token) {
      throw new Error(
        "Google não retornou access_token.",
      );
    }

    /*
    |--------------------------------------------------------------------------
    | BUSCAR UTILIZADOR GOOGLE
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
        },
      );

    if (!googleUserResponse.ok) {
      throw new Error(
        "Não foi possível obter os dados do Google.",
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
        "Google não retornou o ID do usuário.",
      );
    }

    if (!googleUser.email) {
      throw new Error(
        "Google não retornou o email.",
      );
    }

    /*
    |--------------------------------------------------------------------------
    | EMAIL
    |--------------------------------------------------------------------------
    |
    | TEMPORARIAMENTE:
    | Não bloqueamos o fluxo com base em email_verified.
    |
    */

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
    */

    if (mode === "login") {
      console.log(
        "🔵 Login Google para:",
        email,
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
            emailVerified: true,
          },
        });

      /*
      |--------------------------------------------------------------------------
      | NÃO CADASTRADO
      |--------------------------------------------------------------------------
      */

      if (!user) {
        console.log(
          "❌ Conta Google não cadastrada:",
          email,
        );

        return NextResponse.redirect(
          new URL(
            "/login?error=google_not_registered",
            requestUrl.origin,
          ),
        );
      }

      /*
      |--------------------------------------------------------------------------
      | VERIFICAÇÃO TEMPORARIAMENTE DESATIVADA
      |--------------------------------------------------------------------------
      |
      | Não bloqueamos nem alteramos emailVerified aqui.
      |
      */

      console.log(
        "GOOGLE LOGIN: verificação de email temporariamente desativada:",
        user.emailVerified,
      );

      /*
      |--------------------------------------------------------------------------
      | CRIAR SESSÃO
      |--------------------------------------------------------------------------
      */

      await createSession(user.id);

      console.log(
        "✅ Login Google realizado:",
        user.email,
      );

      return NextResponse.redirect(
        new URL(
          "/dashboard",
          requestUrl.origin,
        ),
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
        email,
      );

      /*
      |--------------------------------------------------------------------------
      | GOOGLE ID JÁ EXISTE
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
            requestUrl.origin,
          ),
        );
      }

      /*
      |--------------------------------------------------------------------------
      | EMAIL JÁ EXISTE
      |--------------------------------------------------------------------------
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
          email,
        );

        return NextResponse.redirect(
          new URL(
            "/cadastro?error=email_already_registered",
            requestUrl.origin,
          ),
        );
      }

      /*
      |--------------------------------------------------------------------------
      | NÃO CRIAR A CONTA AINDA
      |--------------------------------------------------------------------------
      |
      | Precisamos primeiro saber o nome da empresa.
      |
      */

      const pendingGoogleData: PendingGoogleData = {
        googleId,
        email,
        name,
        expiresAt:
          Date.now() + 10 * 60 * 1000,
      };

      const pendingValue =
        createPendingGoogleValue(
          pendingGoogleData,
        );

      /*
      |--------------------------------------------------------------------------
      | COOKIE TEMPORÁRIO
      |--------------------------------------------------------------------------
      */

      cookieStore.set(
        "google_pending_registration",
        pendingValue,
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
      | IR PARA PÁGINA DE EMPRESA
      |--------------------------------------------------------------------------
      */

      return NextResponse.redirect(
        new URL(
          "/cadastro/google",
          requestUrl.origin,
        ),
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
        requestUrl.origin,
      ),
    );
  } catch (error) {
    console.error(
      "❌ Erro no login/cadastro Google:",
      error,
    );

    return NextResponse.redirect(
      new URL(
        "/login?error=google_auth_failed",
        requestUrl.origin,
      ),
    );
  }
}