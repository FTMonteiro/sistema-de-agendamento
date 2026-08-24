import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "nevrix_session";

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error(
      "AUTH_SECRET não configurado no arquivo .env"
    );
  }

  return new TextEncoder().encode(secret);
}

/*
|--------------------------------------------------------------------------
| CRIAR SESSÃO
|--------------------------------------------------------------------------
*/

export async function createSession(userId: string) {
  if (!userId) {
    throw new Error("ID do utilizador não informado.");
  }

  const token = await new SignJWT({
    userId,
  })
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());

  const cookieStore = await cookies();

  cookieStore.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  console.log(
    "✅ Sessão criada para utilizador:",
    userId
  );

  return token;
}

/*
|--------------------------------------------------------------------------
| PEGAR ID DO UTILIZADOR DA SESSÃO
|--------------------------------------------------------------------------
*/

export async function getSessionUserId() {
  try {
    const cookieStore = await cookies();

    const token =
      cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) {
      console.log("❌ Cookie de sessão não encontrado.");
      return null;
    }

    const { payload } = await jwtVerify(
      token,
      getSecretKey(),
      {
        algorithms: ["HS256"],
      }
    );

    if (
      !payload.userId ||
      typeof payload.userId !== "string"
    ) {
      console.log(
        "❌ userId não encontrado dentro do token."
      );

      return null;
    }

    return payload.userId;
  } catch (error) {
    console.error(
      "❌ Erro ao validar sessão:",
      error
    );

    return null;
  }
}

/*
|--------------------------------------------------------------------------
| PEGAR UTILIZADOR AUTENTICADO
|--------------------------------------------------------------------------
*/

export async function getCurrentUser() {
  const userId = await getSessionUserId();

  if (!userId) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        businessId: true,
      },
    });

    if (!user) {
      console.log(
        "❌ Utilizador da sessão não existe:",
        userId
      );

      return null;
    }

    return user;
  } catch (error) {
    console.error(
      "❌ Erro ao buscar utilizador da sessão:",
      error
    );

    return null;
  }
}

/*
|--------------------------------------------------------------------------
| DESTRUIR SESSÃO
|--------------------------------------------------------------------------
*/

export async function destroySession() {
  const cookieStore = await cookies();

  cookieStore.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}