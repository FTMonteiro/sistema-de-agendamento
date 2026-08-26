import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { createSession } from "@/lib/auth";

/*
|--------------------------------------------------------------------------
| LOGIN NORMAL — EMAIL + PALAVRA-PASSE
|--------------------------------------------------------------------------
|
| Regras:
|
| 1. Email e palavra-passe são obrigatórios.
| 2. Conta inexistente → erro de credenciais.
| 3. Conta desativada → LOGIN BLOQUEADO.
| 4. Conta sem palavra-passe → login com Google.
| 5. Palavra-passe incorreta → erro de credenciais.
| 6. Email não verificado NÃO bloqueia temporariamente.
| 7. Somente contas ativas podem criar sessão.
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

    /*
    |--------------------------------------------------------------------------
    | UTILIZADOR NÃO EXISTE
    |--------------------------------------------------------------------------
    */

    if (!user) {
      console.log(
        "LOGIN: utilizador não encontrado"
      );

      return NextResponse.json(
        {
          error: "Email ou palavra-passe incorretos.",
          code: "INVALID_CREDENTIALS",
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
    | VERIFICAR SE A CONTA ESTÁ ATIVA
    |--------------------------------------------------------------------------
    |
    | IMPORTANTE:
    |
    | Esta verificação acontece ANTES de criar a sessão.
    |
    | Quando o proprietário desativa um funcionário:
    |
    | Professional.active = false
    | User.active = false
    |
    | Portanto, mesmo que o funcionário saiba a palavra-passe correta,
    | ele NÃO poderá entrar.
    |
    |--------------------------------------------------------------------------
    */

    if (!user.active) {
      console.log(
        "LOGIN: conta desativada:",
        user.email
      );

      return NextResponse.json(
        {
          error: "Esta conta está desativada.",
          code: "ACCOUNT_DISABLED",
        },
        { status: 403 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | VERIFICAR SE EXISTE PALAVRA-PASSE
    |--------------------------------------------------------------------------
    |
    | Contas criadas exclusivamente através do Google
    | podem não possuir uma palavra-passe.
    |
    |--------------------------------------------------------------------------
    */

    if (!user.password) {
      console.log(
        "LOGIN: conta sem palavra-passe."
      );

      return NextResponse.json(
        {
          error:
            "Esta conta utiliza o login com Google. Entre com o Google.",
          code: "GOOGLE_ACCOUNT",
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
          code: "INVALID_CREDENTIALS",
        },
        { status: 401 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | VERIFICAÇÃO DE EMAIL
    |--------------------------------------------------------------------------
    |
    | TEMPORARIAMENTE DESATIVADA.
    |
    | O utilizador pode entrar mesmo que:
    |
    | user.emailVerified === false
    |
    |--------------------------------------------------------------------------
    */

    console.log(
      "LOGIN: confirmação de email ignorada temporariamente:",
      user.emailVerified
    );

    /*
    |--------------------------------------------------------------------------
    | CRIAR SESSÃO
    |--------------------------------------------------------------------------
    |
    | ATENÇÃO:
    |
    | Só chegamos aqui se:
    |
    | - utilizador existe
    | - conta está ativa
    | - possui palavra-passe
    | - palavra-passe está correta
    |
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
        active: user.active,
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
    | request.nextUrl.origin funciona automaticamente
    | em desenvolvimento e produção.
    |
    |--------------------------------------------------------------------------
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