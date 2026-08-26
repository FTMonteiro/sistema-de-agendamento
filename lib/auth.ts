
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

import { prisma } from "@/lib/prisma";

/*
|--------------------------------------------------------------------------
| CONFIGURAÇÃO
|--------------------------------------------------------------------------
*/

const SESSION_COOKIE = "nevrix_session";

const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 dias

/*
|--------------------------------------------------------------------------
| TIPOS
|--------------------------------------------------------------------------
*/

export type AuthRole =
  | "OWNER"
  | "EMPLOYEE";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  businessId: string;
};

/*
|--------------------------------------------------------------------------
| SECRET
|--------------------------------------------------------------------------
*/

function getSecretKey() {
  const secret =
    process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error(
      "AUTH_SECRET não configurado no arquivo .env.",
    );
  }

  if (secret.length < 32) {
    throw new Error(
      "AUTH_SECRET deve possuir pelo menos 32 caracteres.",
    );
  }

  return new TextEncoder().encode(secret);
}

/*
|--------------------------------------------------------------------------
| VALIDAR ROLE
|--------------------------------------------------------------------------
*/

function isValidRole(
  role: string,
): role is AuthRole {
  return (
    role === "OWNER" ||
    role === "EMPLOYEE"
  );
}

/*
|--------------------------------------------------------------------------
| CRIAR SESSÃO
|--------------------------------------------------------------------------
*/

export async function createSession(
  userId: string,
) {
  if (!userId) {
    throw new Error(
      "ID do utilizador não informado.",
    );
  }

  /*
  |--------------------------------------------------------------------------
  | CONFIRMAR UTILIZADOR
  |--------------------------------------------------------------------------
  */

  const user =
    await prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
        businessId: true,
        active: true,
      },
    });

  if (!user) {
    throw new Error(
      "Utilizador não encontrado.",
    );
  }

  /*
  |--------------------------------------------------------------------------
  | NÃO CRIAR SESSÃO PARA CONTA DESATIVADA
  |--------------------------------------------------------------------------
  */

  if (!user.active) {
    throw new Error(
      "ACCOUNT_DISABLED",
    );
  }

  /*
  |--------------------------------------------------------------------------
  | CONFIRMAR EMPRESA
  |--------------------------------------------------------------------------
  */

  if (!user.businessId) {
    throw new Error(
      "O utilizador não está associado a uma empresa.",
    );
  }

  /*
  |--------------------------------------------------------------------------
  | CRIAR JWT
  |--------------------------------------------------------------------------
  |
  | Guardamos somente o ID do utilizador.
  |
  */

  const token =
    await new SignJWT({
      userId: user.id,
    })
      .setProtectedHeader({
        alg: "HS256",
        typ: "JWT",
      })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(getSecretKey());

  /*
  |--------------------------------------------------------------------------
  | COOKIE
  |--------------------------------------------------------------------------
  */

  const cookieStore =
    await cookies();

  cookieStore.set({
    name: SESSION_COOKIE,

    value: token,

    httpOnly: true,

    secure:
      process.env.NODE_ENV ===
      "production",

    sameSite: "lax",

    path: "/",

    maxAge: SESSION_DURATION,
  });

  console.log(
    "✅ Sessão criada:",
    user.id,
  );

  return token;
}

/*
|--------------------------------------------------------------------------
| PEGAR ID DO UTILIZADOR DA SESSÃO
|--------------------------------------------------------------------------
*/

export async function getSessionUserId(): Promise<
  string | null
> {
  try {
    const cookieStore =
      await cookies();

    const token =
      cookieStore.get(
        SESSION_COOKIE,
      )?.value;

    /*
    |--------------------------------------------------------------------------
    | SEM COOKIE
    |--------------------------------------------------------------------------
    */

    if (!token) {
      return null;
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDAR JWT
    |--------------------------------------------------------------------------
    */

    const { payload } =
      await jwtVerify(
        token,
        getSecretKey(),
        {
          algorithms: ["HS256"],
        },
      );

    /*
    |--------------------------------------------------------------------------
    | VALIDAR USER ID
    |--------------------------------------------------------------------------
    */

    if (
      !payload.userId ||
      typeof payload.userId !==
        "string"
    ) {
      return null;
    }

    return payload.userId;
  } catch (error) {
    console.error(
      "❌ Erro ao validar sessão:",
      error,
    );

    return null;
  }
}

/*
|--------------------------------------------------------------------------
| UTILIZADOR AUTENTICADO
|--------------------------------------------------------------------------
|
| IMPORTANTE:
|
| Todas as informações importantes vêm do banco.
|
| NÃO confiamos em:
|
| - role dentro do frontend
| - businessId dentro do frontend
| - active dentro do frontend
| - dados antigos da sessão
|
|--------------------------------------------------------------------------
*/

export async function getCurrentUser(): Promise<
  AuthUser | null
> {
  const userId =
    await getSessionUserId();

  if (!userId) {
    return null;
  }

  try {
    const user =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          businessId: true,

          /*
          |--------------------------------------------------------------------------
          | IMPORTANTE
          |--------------------------------------------------------------------------
          |
          | Consultamos o active diretamente no banco.
          |
          */
          active: true,
        },
      });

    /*
    |--------------------------------------------------------------------------
    | UTILIZADOR NÃO EXISTE
    |--------------------------------------------------------------------------
    |
    | Isto acontece, por exemplo, quando a conta User
    | foi realmente excluída.
    |
    */

    if (!user) {
      console.log(
        "🔒 Sessão inválida: utilizador não existe.",
      );

      /*
      |--------------------------------------------------------------------------
      | APAGAR COOKIE INVÁLIDO
      |--------------------------------------------------------------------------
      */

      await destroySession();

      return null;
    }

    /*
    |--------------------------------------------------------------------------
    | CONTA DESATIVADA
    |--------------------------------------------------------------------------
    |
    | Mesmo que o funcionário já tivesse uma sessão,
    | a sessão deixa de funcionar imediatamente.
    |
    */

    if (!user.active) {
      console.log(
        "🔒 Sessão bloqueada: conta desativada:",
        user.email,
      );

      /*
      |--------------------------------------------------------------------------
      | DESTRUIR SESSÃO
      |--------------------------------------------------------------------------
      */

      await destroySession();

      return null;
    }

    /*
    |--------------------------------------------------------------------------
    | EMPRESA OBRIGATÓRIA
    |--------------------------------------------------------------------------
    */

    if (!user.businessId) {
      console.error(
        "❌ Utilizador sem empresa:",
        user.id,
      );

      await destroySession();

      return null;
    }

    /*
    |--------------------------------------------------------------------------
    | ROLE VÁLIDO
    |--------------------------------------------------------------------------
    */

    if (!isValidRole(user.role)) {
      console.error(
        "❌ Role inválido para utilizador:",
        user.id,
      );

      await destroySession();

      return null;
    }

    /*
    |--------------------------------------------------------------------------
    | RETORNAR UTILIZADOR SEGURO
    |--------------------------------------------------------------------------
    */

    return {
      id: user.id,

      name: user.name,

      email: user.email,

      role: user.role,

      businessId:
        user.businessId,
    };
  } catch (error) {
    console.error(
      "❌ Erro ao buscar utilizador:",
      error,
    );

    return null;
  }
}

/*
|--------------------------------------------------------------------------
| EXIGIR AUTENTICAÇÃO
|--------------------------------------------------------------------------
|
| OWNER + EMPLOYEE
|--------------------------------------------------------------------------
*/

export async function requireAuth(): Promise<AuthUser> {
  const user =
    await getCurrentUser();

  if (!user) {
    throw new Error(
      "UNAUTHORIZED",
    );
  }

  return user;
}

/*
|--------------------------------------------------------------------------
| EXIGIR OWNER
|--------------------------------------------------------------------------
|
| Somente OWNER.
|
|--------------------------------------------------------------------------
*/

export async function requireOwner(): Promise<AuthUser> {
  const user =
    await requireAuth();

  if (user.role !== "OWNER") {
    throw new Error(
      "FORBIDDEN",
    );
  }

  return user;
}

/*
|--------------------------------------------------------------------------
| EXIGIR STAFF
|--------------------------------------------------------------------------
|
| OWNER + EMPLOYEE
|--------------------------------------------------------------------------
*/

export async function requireStaff(): Promise<AuthUser> {
  const user =
    await requireAuth();

  if (
    user.role !== "OWNER" &&
    user.role !== "EMPLOYEE"
  ) {
    throw new Error(
      "FORBIDDEN",
    );
  }

  return user;
}

/*
|--------------------------------------------------------------------------
| VERIFICAR OWNER
|--------------------------------------------------------------------------
*/

export function isOwner(
  user: AuthUser,
): boolean {
  return (
    user.role === "OWNER"
  );
}

/*
|--------------------------------------------------------------------------
| VERIFICAR EMPLOYEE
|--------------------------------------------------------------------------
*/

export function isEmployee(
  user: AuthUser,
): boolean {
  return (
    user.role === "EMPLOYEE"
  );
}

/*
|--------------------------------------------------------------------------
| VERIFICAR SE PERTENCE À EMPRESA
|--------------------------------------------------------------------------
*/

export function belongsToBusiness(
  user: AuthUser,
  businessId: string,
): boolean {
  return (
    user.businessId ===
    businessId
  );
}

/*
|--------------------------------------------------------------------------
| EXIGIR QUE O RECURSO PERTENÇA À EMPRESA
|--------------------------------------------------------------------------
*/

export function requireBusinessResource(
  user: AuthUser,
  businessId: string,
): void {
  if (
    !businessId ||
    user.businessId !==
      businessId
  ) {
    throw new Error(
      "FORBIDDEN",
    );
  }
}

/*
|--------------------------------------------------------------------------
| DESTRUIR SESSÃO
|--------------------------------------------------------------------------
*/

export async function destroySession() {
  const cookieStore =
    await cookies();

  cookieStore.set({
    name: SESSION_COOKIE,

    value: "",

    httpOnly: true,

    secure:
      process.env.NODE_ENV ===
      "production",

    sameSite: "lax",

    path: "/",

    maxAge: 0,
  });

  console.log(
    "✅ Sessão destruída.",
  );
}

