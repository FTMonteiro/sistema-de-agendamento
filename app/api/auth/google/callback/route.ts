
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

    const code = request.nextUrl.searchParams.get("code");

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
        mode,
      );

      return NextResponse.redirect(
        new URL(
          "/login?error=google_mode",
          request.url,
        ),
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
        googleError,
      );

      const redirect =
        mode === "register"
          ? "/register?error=google_cancelled"
          : "/login?error=google_cancelled";

      return NextResponse.redirect(
        new URL(redirect, request.url),
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CODE AUSENTE
    |--------------------------------------------------------------------------
    */

    if (!code) {
      console.error(
        "GOOGLE CALLBACK: code não encontrado.",
      );

      const redirect =
        mode === "register"
          ? "/register?error=google"
          : "/login?error=google";

      return NextResponse.redirect(
        new URL(redirect, request.url),
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CONFIGURAÇÃO GOOGLE
    |--------------------------------------------------------------------------
    */

    const clientId =
      process.env.GOOGLE_CLIENT_ID;

    const clientSecret =
      process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error(
        "GOOGLE CALLBACK: GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET não configurado.",
      );

      const redirect =
        mode === "register"
          ? "/register?error=google_config"
          : "/login?error=google_config";

      return NextResponse.redirect(
        new URL(redirect, request.url),
      );
    }

    /*
    |--------------------------------------------------------------------------
    | REDIRECT URI
    |--------------------------------------------------------------------------
    */

    const origin = request.nextUrl.origin;

    const redirectUri =
      `${origin}/api/auth/google/callback`;

    console.log(
      "GOOGLE CALLBACK REDIRECT URI:",
      redirectUri,
    );

    /*
    |--------------------------------------------------------------------------
    | TROCAR CODE POR TOKEN
    |--------------------------------------------------------------------------
    */

    const tokenResponse = await fetch(
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
          grant_type: "authorization_code",
        }),
      },
    );

    if (!tokenResponse.ok) {
      const tokenError =
        await tokenResponse.text();

      console.error(
        "GOOGLE CALLBACK: erro ao trocar code por token:",
        tokenError,
      );

      const redirect =
        mode === "register"
          ? "/register?error=google"
          : "/login?error=google";

      return NextResponse.redirect(
        new URL(redirect, request.url),
      );
    }

    const tokens =
      await tokenResponse.json();

    /*
    |--------------------------------------------------------------------------
    | VALIDAR ACCESS TOKEN
    |--------------------------------------------------------------------------
    */

    if (!tokens.access_token) {
      console.error(
        "GOOGLE CALLBACK: access_token não recebido.",
      );

      const redirect =
        mode === "register"
          ? "/register?error=google"
          : "/login?error=google";

      return NextResponse.redirect(
        new URL(redirect, request.url),
      );
    }

    /*
    |--------------------------------------------------------------------------
    | OBTER PERFIL GOOGLE
    |--------------------------------------------------------------------------
    */

    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization:
            `Bearer ${tokens.access_token}`,
        },
      },
    );

    if (!userResponse.ok) {
      const googleProfileError =
        await userResponse.text();

      console.error(
        "GOOGLE CALLBACK: erro ao obter perfil:",
        googleProfileError,
      );

      const redirect =
        mode === "register"
          ? "/register?error=google"
          : "/login?error=google";

      return NextResponse.redirect(
        new URL(redirect, request.url),
      );
    }

    const googleUser =
      await userResponse.json();

    /*
    |--------------------------------------------------------------------------
    | DADOS GOOGLE
    |--------------------------------------------------------------------------
    */

    const googleEmail =
      String(googleUser.email || "")
        .trim()
        .toLowerCase();

    const googleName =
      String(
        googleUser.name ||
          googleUser.given_name ||
          "",
      ).trim();

    const googleId =
      String(
        googleUser.sub || "",
      ).trim();

    /*
    |--------------------------------------------------------------------------
    | VALIDAR EMAIL
    |--------------------------------------------------------------------------
    */

    if (!googleEmail) {
      console.error(
        "GOOGLE CALLBACK: email não encontrado.",
      );

      const redirect =
        mode === "register"
          ? "/register?error=google_email"
          : "/login?error=google_email";

      return NextResponse.redirect(
        new URL(redirect, request.url),
      );
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDAR GOOGLE ID
    |--------------------------------------------------------------------------
    */

    if (!googleId) {
      console.error(
        "GOOGLE CALLBACK: Google ID não encontrado.",
      );

      return NextResponse.redirect(
        new URL(
          "/login?error=google",
          request.url,
        ),
      );
    }

    console.log(
      "GOOGLE CALLBACK:",
      {
        mode,
        email: googleEmail,
        name: googleName,
        googleId,
      },
    );

    /*
    |--------------------------------------------------------------------------
    | PROCURAR CONTA
    |--------------------------------------------------------------------------
    |
    | Primeiro procuramos pelo email.
    |
    */

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email: googleEmail,
        },
      });

    /*
    |--------------------------------------------------------------------------
    | CADASTRO COM GOOGLE
    |--------------------------------------------------------------------------
    */

    if (mode === "register") {
      /*
      |--------------------------------------------------------------------------
      | EMAIL JÁ EXISTE
      |--------------------------------------------------------------------------
      */

      if (existingUser) {
        console.log(
          "GOOGLE REGISTER: conta já existe:",
          googleEmail,
        );

        return NextResponse.redirect(
          new URL(
            "/register?error=google_account_exists",
            request.url,
          ),
        );
      }

      /*
      |--------------------------------------------------------------------------
      | CRIAR EMPRESA + OWNER
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

                  password: null,

                  googleId,

                  role: "OWNER",

                  /*
                  | Google confirmou o email.
                  */
                  emailVerified: true,

                  /*
                  | Conta criada ativa.
                  */
                  active: true,

                  businessId:
                    business.id,
                },
              });

            return {
              business,
              user,
            };
          },
        );

      console.log(
        "GOOGLE REGISTER: conta criada:",
        result.user.email,
      );

      /*
      |--------------------------------------------------------------------------
      | CRIAR SESSÃO
      |--------------------------------------------------------------------------
      */

      await createSession(
        result.user.id,
      );

      console.log(
        "GOOGLE REGISTER: sessão criada.",
      );

      /*
      |--------------------------------------------------------------------------
      | ENTRAR NO DASHBOARD
      |--------------------------------------------------------------------------
      */

      return NextResponse.redirect(
        new URL(
          "/dashboard",
          request.url,
        ),
      );
    }

    /*
    |--------------------------------------------------------------------------
    | LOGIN COM GOOGLE
    |--------------------------------------------------------------------------
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
          googleEmail,
        );

        return NextResponse.redirect(
          new URL(
            "/login?error=google_not_registered",
            request.url,
          ),
        );
      }

      /*
      |--------------------------------------------------------------------------
      | CONTA DESATIVADA
      |--------------------------------------------------------------------------
      |
      | MUITO IMPORTANTE:
      |
      | NÃO criar sessão.
      |
      */

      if (!existingUser.active) {
        console.log(
          "GOOGLE LOGIN: conta desativada:",
          existingUser.email,
        );

        return NextResponse.redirect(
          new URL(
            "/login?error=account_disabled",
            request.url,
          ),
        );
      }

      /*
      |--------------------------------------------------------------------------
      | ATUALIZAR GOOGLE ID
      |--------------------------------------------------------------------------
      |
      | Se a conta foi criada anteriormente
      | com email/password e agora entra pelo
      | Google, associamos o Google ID.
      |
      */

      if (
        existingUser.googleId !== googleId
      ) {
        /*
        | Verificar se este Google ID já pertence
        | a outra conta.
        */

        const googleAccount =
          await prisma.user.findUnique({
            where: {
              googleId,
            },

            select: {
              id: true,
            },
          });

        if (
          googleAccount &&
          googleAccount.id !== existingUser.id
        ) {
          console.error(
            "GOOGLE LOGIN: Google ID já associado a outra conta.",
          );

          return NextResponse.redirect(
            new URL(
              "/login?error=google_account_conflict",
              request.url,
            ),
          );
        }

        /*
        | Associar Google à conta existente.
        */

        await prisma.user.update({
          where: {
            id: existingUser.id,
          },

          data: {
            googleId,

            /*
            | O Google confirmou a posse
            | do email.
            */
            emailVerified: true,
          },
        });
      }

      /*
      |--------------------------------------------------------------------------
      | CRIAR SESSÃO
      |--------------------------------------------------------------------------
      */

      console.log(
        "GOOGLE LOGIN: criando sessão:",
        existingUser.id,
      );

      await createSession(
        existingUser.id,
      );

      console.log(
        "GOOGLE LOGIN: sessão criada.",
      );

      /*
      |--------------------------------------------------------------------------
      | DASHBOARD
      |--------------------------------------------------------------------------
      */

      return NextResponse.redirect(
        new URL(
          "/dashboard",
          request.url,
        ),
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
        request.url,
      ),
    );
  } catch (error) {
    /*
    |--------------------------------------------------------------------------
    | ERRO COMPLETO
    |--------------------------------------------------------------------------
    */

    console.error(
      "GOOGLE CALLBACK: erro completo:",
      error,
    );

    if (error instanceof Error) {
      console.error(
        "GOOGLE CALLBACK: nome:",
        error.name,
      );

      console.error(
        "GOOGLE CALLBACK: mensagem:",
        error.message,
      );

      console.error(
        "GOOGLE CALLBACK: stack:",
        error.stack,
      );
    }

    return NextResponse.redirect(
      new URL(
        "/login?error=google",
        request.url,
      ),
    );
  }
}

