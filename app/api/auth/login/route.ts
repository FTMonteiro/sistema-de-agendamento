
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { createSession } from "@/lib/auth";

/*
|--------------------------------------------------------------------------
| LOGIN NORMAL — EMAIL + PALAVRA-PASSE
|--------------------------------------------------------------------------
|
| TEMPORARIAMENTE:
| A confirmação de email NÃO bloqueia o login.
|
|--------------------------------------------------------------------------
*/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    const password = String(body.password || "");

    /*
    |--------------------------------------------------------------------------
    | VALIDAR CAMPOS
    |--------------------------------------------------------------------------
    */

    if (!email || !password) {
      return NextResponse.json(
        {
          error: "Email e palavra-passe são obrigatórios.",
        },
        { status: 400 }
      );
    }

    console.log(
      "LOGIN: procurando utilizador:",
      email
    );

    /*
    |--------------------------------------------------------------------------
    | PROCURAR UTILIZADOR
    |--------------------------------------------------------------------------
    */

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      console.log(
        "LOGIN: utilizador não encontrado"
      );

      return NextResponse.json(
        {
          error: "Email ou palavra-passe incorretos.",
        },
        { status: 401 }
      );
    }

    console.log(
      "LOGIN: utilizador encontrado:",
      user.id
    );

    /*
    |--------------------------------------------------------------------------
    | VERIFICAR SE EXISTE PALAVRA-PASSE
    |--------------------------------------------------------------------------
    |
    | Contas criadas exclusivamente através do Google
    | podem não possuir uma palavra-passe.
    |
    */

    if (!user.password) {
      return NextResponse.json(
        {
          error:
            "Esta conta utiliza o login com Google. Entre com o Google.",
        },
        { status: 401 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | VERIFICAR PALAVRA-PASSE
    |--------------------------------------------------------------------------
    */

    const passwordCorrect = await compare(
      password,
      user.password
    );

    console.log(
      "LOGIN: palavra-passe correta:",
      passwordCorrect
    );

    if (!passwordCorrect) {
      return NextResponse.json(
        {
          error: "Email ou palavra-passe incorretos.",
        },
        { status: 401 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | VERIFICAÇÃO DE EMAIL DESATIVADA TEMPORARIAMENTE
    |--------------------------------------------------------------------------
    |
    | NÃO verificamos:
    |
    | user.emailVerified
    |
    | Portanto, o utilizador pode entrar mesmo que
    | ainda não tenha confirmado o email.
    |
    */

    console.log(
      "LOGIN: confirmação de email ignorada temporariamente:",
      user.emailVerified
    );

    /*
    |--------------------------------------------------------------------------
    | CRIAR SESSÃO
    |--------------------------------------------------------------------------
    */

    console.log(
      "LOGIN: criando sessão..."
    );

    await createSession(user.id);

    console.log(
      "LOGIN: sessão criada com sucesso"
    );

    /*
    |--------------------------------------------------------------------------
    | LOGIN CONCLUÍDO
    |--------------------------------------------------------------------------
    */

    return NextResponse.json({
      message: "Login realizado com sucesso.",

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    /*
    |--------------------------------------------------------------------------
    | ERRO
    |--------------------------------------------------------------------------
    */

    console.error(
      "LOGIN: ERRO COMPLETO"
    );

    if (error instanceof Error) {
      console.error(
        "Nome:",
        error.name
      );

      console.error(
        "Mensagem:",
        error.message
      );

      console.error(
        "Stack:",
        error.stack
      );
    } else {
      console.error(error);
    }

    return NextResponse.json(
      {
        error:
          "Não foi possível realizar o login.",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| LOGIN COM GOOGLE
|--------------------------------------------------------------------------
|
| O botão do Google chama:
|
| /api/auth/login?provider=google
|
|--------------------------------------------------------------------------
*/

export async function GET(
  request: NextRequest
) {
  try {
    /*
    |--------------------------------------------------------------------------
    | VERIFICAR PROVIDER
    |--------------------------------------------------------------------------
    */

    const provider =
      request.nextUrl.searchParams.get(
        "provider"
      );

    if (provider !== "google") {
      return NextResponse.json(
        {
          error:
            "Provider de autenticação inválido.",
        },
        { status: 400 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | GOOGLE CLIENT ID
    |--------------------------------------------------------------------------
    */

    const clientId =
      process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.error(
        "GOOGLE_CLIENT_ID não configurado."
      );

      return NextResponse.json(
        {
          error:
            "Login Google não configurado.",
        },
        { status: 500 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | REDIRECT URI
    |--------------------------------------------------------------------------
    |
    | Desenvolvimento:
    |
    | http://localhost:3000/api/auth/google/callback
    |
    | Produção:
    |
    | https://sistema-de-agendamento-livid.vercel.app/api/auth/google/callback
    |
    |
    | Usamos request.nextUrl.origin para funcionar
    | automaticamente nos dois ambientes.
    |
    */

    const origin =
      request.nextUrl.origin;

    const redirectUri =
      `${origin}/api/auth/google/callback`;

    console.log(
      "GOOGLE LOGIN CALLBACK:",
      redirectUri
    );

    /*
    |--------------------------------------------------------------------------
    | URL DO GOOGLE OAUTH
    |--------------------------------------------------------------------------
    */

    const googleUrl =
      new URL(
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
    | REDIRECIONAR PARA GOOGLE
    |--------------------------------------------------------------------------
    */

    console.log(
      "GOOGLE LOGIN: redirecionando..."
    );

    return NextResponse.redirect(
      googleUrl
    );
  } catch (error) {
    /*
    |--------------------------------------------------------------------------
    | ERRO GOOGLE
    |--------------------------------------------------------------------------
    */

    console.error(
      "GOOGLE LOGIN: erro:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível iniciar o login com Google.",
      },
      { status: 500 }
    );
  }
}

